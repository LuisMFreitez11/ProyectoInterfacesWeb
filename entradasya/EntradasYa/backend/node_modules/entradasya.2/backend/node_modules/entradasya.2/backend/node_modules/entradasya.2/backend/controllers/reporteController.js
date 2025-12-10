// reporteController.js

const moment = require("moment");
const { queryDB } = require("../config/db");

// --------------------------------------------------------------------------
// --- FUNCIONES DE UTILIDAD ---
// --------------------------------------------------------------------------

// Función de ayuda para calcular el cambio porcentual
const calculateChange = (current, previous) => {
  const curr = parseFloat(current) || 0;
  const prev = parseFloat(previous) || 0;
  if (prev === 0) return curr > 0 ? 100.0 : 0.0;
  return (Math.round(((curr - prev) / prev) * 10000) / 100).toFixed(2);
};

// Función CRÍTICA para manejar TIMESTAMP/DATETIME en MySQL.
// Asegura que el rango BETWEEN incluya 00:00:00 del inicio y 23:59:59 del final.
const formatDatesForQuery = (startDate, endDate) => {
  // START: Inicio del día a las 00:00:00
  const start = moment(startDate).format("YYYY-MM-DD 00:00:00"); // END: Final del día a las 23:59:59 (para incluir todo el último día)
  const end = moment(endDate).format("YYYY-MM-DD 23:59:59"); // Para columnas tipo DATE (gastos)

  const dateOnlyStart = moment(startDate).format("YYYY-MM-DD");
  const dateOnlyEnd = moment(endDate).format("YYYY-MM-DD");

  return { start, end, dateOnlyStart, dateOnlyEnd };
};

// --------------------------------------------------------------------------
// RUTA 1: /api/reports/summary (Resumen General) - CORREGIDO totalEvents
// --------------------------------------------------------------------------
async function getSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const { start, end, dateOnlyStart, dateOnlyEnd } = formatDatesForQuery(
      startDate,
      endDate
    ); // 1. Calcular el RANGO DE FECHAS del Período Anterior

    const startM = moment(startDate);
    const endM = moment(endDate);
    const duration = endM.diff(startM, "days") + 1;
    const previousEndDate = startM
      .clone()
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    const previousStartDate = startM
      .clone()
      .subtract(duration, "days")
      .format("YYYY-MM-DD"); // Obtener rangos del período anterior

    const {
      start: prevStart,
      end: prevEnd,
      dateOnlyStart: prevDateOnlyStart,
      dateOnlyEnd: prevDateOnlyEnd,
    } = formatDatesForQuery(previousStartDate, previousEndDate); // --- Consultas SQL Base (Periodo Actual y Anterior) --- // Ingresos y Tickets (Filtra por fecha_pago y estado='confirmado')

    const sqlRevenueBase = `SELECT
COALESCE(SUM(p.monto), 0) AS totalRevenue,
COALESCE(COUNT(t.id_ticket), 0) AS totalTicketsSold
FROM pagos p
LEFT JOIN tickets t ON p.id_pago = t.id_pago
WHERE p.fecha_pago BETWEEN ? AND ? AND p.estado = 'confirmado'`.trim(); // Gastos

    const sqlExpensesBase = `SELECT
COALESCE(SUM(g.monto), 0) AS totalExpenses
FROM gastos g
WHERE g.fecha_gasto BETWEEN ? AND ?`.trim(); // **MODIFICACIÓN CLAVE PARA totalEvents:** // Contar eventos publicados por su FECHA DE INICIO, no por fecha de pago.

    const sqlEventsBase = `SELECT
COALESCE(COUNT(e.id_evento), 0) AS totalEvents
FROM eventos e
WHERE e.fecha_inicio BETWEEN ? AND ? AND e.estado = 'publicado'`.trim(); // ---------------------------------------------------- // 2. Ejecutar consultas para el PERIODO ACTUAL
    const revenueCurrentP = queryDB(sqlRevenueBase, [start, end]);
    const expensesCurrentP = queryDB(sqlExpensesBase, [
      dateOnlyStart,
      dateOnlyEnd,
    ]); // CLAVE: Usar [start, end] para la fecha de inicio del evento
    const eventsCurrentP = queryDB(sqlEventsBase, [start, end]); // 3. Ejecutar consultas para el PERIODO ANTERIOR

    const revenuePreviousP = queryDB(sqlRevenueBase, [prevStart, prevEnd]);
    const expensesPreviousP = queryDB(sqlExpensesBase, [
      prevDateOnlyStart,
      prevDateOnlyEnd,
    ]); // CLAVE: Usar [prevStart, prevEnd] para la fecha de inicio del evento
    const eventsPreviousP = queryDB(sqlEventsBase, [prevStart, prevEnd]); // Esperar todas las promesas

    const [
      revenueCurrentResult,
      expensesCurrentResult,
      eventsCurrentResult,
      revenuePreviousResult,
      expensesPreviousResult,
      eventsPreviousResult,
    ] = await Promise.all([
      revenueCurrentP,
      expensesCurrentP,
      eventsCurrentP,
      revenuePreviousP,
      expensesPreviousP,
      eventsPreviousP,
    ]); // --- Extracción y Cálculo ---

    const currentR = revenueCurrentResult[0];
    const currentE = expensesCurrentResult[0];
    const currentEv = eventsCurrentResult[0];
    const previousR = revenuePreviousResult[0];
    const previousE = expensesPreviousResult[0];
    const previousEv = eventsPreviousResult[0];

    const totalRevenue = parseFloat(currentR.totalRevenue);
    const totalExpenses = parseFloat(currentE.totalExpenses);
    const totalTicketsSold = parseInt(currentR.totalTicketsSold);
    const totalEvents = parseInt(currentEv.totalEvents); // Cálculo de cambios porcentuales

    const revenueChange = calculateChange(
      totalRevenue,
      parseFloat(previousR.totalRevenue)
    );
    const ticketsChange = calculateChange(
      totalTicketsSold,
      parseInt(previousR.totalTicketsSold)
    );
    const eventsChange = calculateChange(
      totalEvents,
      parseInt(previousEv.totalEvents)
    );
    const expensesChange = calculateChange(
      totalExpenses,
      parseFloat(previousE.totalExpenses)
    ); // Objeto de datos final

    const responseData = {
      totalRevenue: totalRevenue.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      totalTicketsSold: totalTicketsSold,
      totalEvents: totalEvents,
      revenueChange: revenueChange,
      ticketsChange: ticketsChange,
      eventsChange: eventsChange,
      expensesChange: expensesChange,
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error en getSummary:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen.",
      error: error.message,
    });
  }
}

// --------------------------------------------------------------------------
// RUTA 2: /api/reports/sales (Reporte de Ventas Detallado) - SIN CAMBIOS
// --------------------------------------------------------------------------
async function getSalesReport(req, res) {
    try {
        const { startDate, endDate } = req.query;
        const { start, end } = formatDatesForQuery(startDate, endDate);
        
        // La consulta se ha limpiado de CUALQUIER espacio o caracter invisible.
        // Se mantiene la lógica de GROUP_CONCAT para mostrar el nombre del evento correcto.
        const sql = `SELECT
DATE(p.fecha_pago) AS fecha,
GROUP_CONCAT(DISTINCT e.nombre SEPARATOR ', ') AS evento, 
COUNT(t.id_ticket) AS total_tickets, 
p.monto AS ingresos,
m.nombre AS metodo_pago
FROM pagos p
LEFT JOIN tickets t ON p.id_pago = t.id_pago
LEFT JOIN metodospago m ON p.id_metodo = m.id_metodo
LEFT JOIN tiposentrada te ON t.id_tipo = te.id_tipo
LEFT JOIN eventos e ON te.id_evento = e.id_evento
WHERE p.fecha_pago BETWEEN ? AND ? AND p.estado = 'confirmado'
GROUP BY p.id_pago, p.fecha_pago, p.monto, m.id_metodo, m.nombre
ORDER BY p.fecha_pago DESC;`.trim();
        
        const sales = await queryDB(sql, [start, end]);

        res.json({ success: true, data: sales });
    } catch (error) {
        console.error("Error en getSalesReport:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener reporte de ventas.",
            error: error.message,
        });
    }
}

// --------------------------------------------------------------------------
// RUTA 3: /api/reports/expenses (Reporte de Gastos Detallado) - SIN CAMBIOS
// --------------------------------------------------------------------------
async function getExpensesReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const { dateOnlyStart, dateOnlyEnd } = formatDatesForQuery(
      startDate,
      endDate
    ); // Usar rango sin horas
    const sql = `SELECT
g.fecha_gasto AS fecha,
gc.nombre AS categoria,
g.descripcion,
g.monto,
CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS usuario
FROM gastos g
LEFT JOIN usuarios u ON g.registrado_por = u.id_usuario
LEFT JOIN categoriasgasto gc ON g.id_categoria = gc.id_categoria
WHERE g.fecha_gasto BETWEEN ? AND ?
ORDER BY g.fecha_gasto DESC;`.trim();
    const expenses = await queryDB(sql, [dateOnlyStart, dateOnlyEnd]); // CLAVE: Pasar [dateOnlyStart, dateOnlyEnd]

    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error("Error en getExpensesReport (SQL FAILED):", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener reporte de gastos.",
      error: error.message,
    });
  }
}

// --------------------------------------------------------------------------
// RUTA 4: /api/reports/events (Reporte de Eventos) - SIN CAMBIOS (Lógica de HAVING ya es robusta)
// --------------------------------------------------------------------------
async function getEventsReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = formatDatesForQuery(startDate, endDate); // Usar rango con horas // La sintaxis se ha limpiado de espacios extraños al inicio de cada línea.
    const sql = `SELECT
e.id_evento AS id,
e.nombre,
e.fecha_inicio AS fecha,
e.capacidad_total AS capacidad,
COALESCE(SUM(CASE WHEN p.estado = 'confirmado' AND p.fecha_pago BETWEEN ? AND ? THEN 1 ELSE 0 END), 0) AS tickets_vendidos,
COALESCE(SUM(CASE WHEN p.estado = 'confirmado' AND p.fecha_pago BETWEEN ? AND ? THEN p.monto ELSE 0 END), 0) AS ingresos,
(COALESCE(SUM(CASE WHEN p.estado = 'confirmado' AND p.fecha_pago BETWEEN ? AND ? THEN 1 ELSE 0 END), 0) * 100.0 / e.capacidad_total) AS ocupacion
FROM eventos e
LEFT JOIN tiposentrada te ON e.id_evento = te.id_evento
LEFT JOIN tickets t ON te.id_tipo = t.id_tipo
LEFT JOIN pagos p ON t.id_pago = p.id_pago
WHERE e.estado = 'publicado'
GROUP BY e.id_evento, e.nombre, e.fecha_inicio, e.capacidad_total
HAVING tickets_vendidos > 0 OR (e.fecha_inicio BETWEEN ? AND ?)
ORDER BY e.fecha_inicio DESC;`.trim(); // El array de parámetros debe contener 4 veces el rango [start, end]

    const params = [
      start,
      end, // tickets_vendidos
      start,
      end, // ingresos
      start,
      end, // ocupacion
      start,
      end, // HAVING (fecha_inicio)
    ];
    const events = await queryDB(sql, params); // ----------------------------------------------------
    const formattedEvents = events.map((event) => ({
      ...event,
      ocupacion:
        event.ocupacion === null || event.capacidad === 0
          ? "0.00"
          : parseFloat(event.ocupacion).toFixed(2),
    }));

    res.json({ success: true, data: formattedEvents });
  } catch (error) {
    console.error("Error en getEventsReport:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener reporte de eventos.",
      error: error.message,
    });
  }
}

// --------------------------------------------------------------------------
// RUTA 5: /api/reports/trend (Tendencia Diaria) - SIN CAMBIOS
// --------------------------------------------------------------------------
async function getTrendData(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const { start, end, dateOnlyStart, dateOnlyEnd } = formatDatesForQuery(
      startDate,
      endDate
    ); // Obtener rangos // Pagos (TIMESTAMP)

    const revenueSql =
      `SELECT DATE(fecha_pago) AS date, SUM(monto) AS value FROM pagos WHERE fecha_pago BETWEEN ? AND ? AND estado = 'confirmado' GROUP BY date ORDER BY date;`.trim(); // Gastos (DATE)

    const expenseSql =
      `SELECT fecha_gasto AS date, SUM(monto) AS value FROM gastos WHERE fecha_gasto BETWEEN ? AND ? GROUP BY date ORDER BY date;`.trim();

    const revenues = await queryDB(revenueSql, [start, end]); // CLAVE: Pasar [start, end]
    const expenses = await queryDB(expenseSql, [dateOnlyStart, dateOnlyEnd]); // CLAVE: Pasar [dateOnlyStart, dateOnlyEnd] // Lógica de Consolidación de Fechas

    const revenueMap = new Map(
      revenues.map((item) => [
        moment(item.date).format("YYYY-MM-DD"),
        item.value,
      ])
    );
    const expenseMap = new Map(
      expenses.map((item) => [
        moment(item.date).format("YYYY-MM-DD"),
        item.value,
      ])
    );
    let currentDate = moment(startDate);
    const endM = moment(endDate);
    const dates = [];
    const finalRevenue = [];
    const finalExpenses = [];

    while (currentDate.isSameOrBefore(endM, "day")) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      dates.push(dateStr);
      finalRevenue.push(revenueMap.get(dateStr) || 0);
      finalExpenses.push(expenseMap.get(dateStr) || 0);
      currentDate.add(1, "days");
    }

    res.json({
      success: true,
      data: { dates, revenue: finalRevenue, expenses: finalExpenses },
    });
  } catch (error) {
    console.error("Error en getTrendData:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener datos de tendencia.",
      error: error.message,
    });
  }
}

// --------------------------------------------------------------------------
// RUTA 6: /api/reports/payment-distribution (Distribución por Método de Pago) - SIN CAMBIOS
// --------------------------------------------------------------------------
async function getPaymentDistribution(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = formatDatesForQuery(startDate, endDate); // Usar rango con horas

    const sql = `SELECT
m.nombre AS method,
SUM(p.monto) AS total
FROM pagos p
JOIN metodospago m ON p.id_metodo = m.id_metodo
WHERE p.fecha_pago BETWEEN ? AND ? AND p.estado = 'confirmado'
GROUP BY m.nombre
ORDER BY total DESC;`.trim();
    const distribution = await queryDB(sql, [start, end]); // CLAVE: Pasar [start, end] // Formatear para el frontend

    const methods = distribution.map((item) => item.method);
    const totals = distribution.map((item) =>
      parseFloat(item.total).toFixed(2)
    );

    res.json({ success: true, data: { methods, totals } });
  } catch (error) {
    console.error("Error en getPaymentDistribution:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener distribución de pagos.",
      error: error.message,
    });
  }
}

// --------------------------------------------------------------------------
// RUTAS ADICIONALES (Sin cambios)
// --------------------------------------------------------------------------

async function getArtistsPerformance(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = formatDatesForQuery(startDate, endDate);

    const sql = `SELECT
a.nombre,
COUNT(DISTINCT e.id_evento) AS total_eventos,
COALESCE(SUM(CASE WHEN p.estado = 'confirmado' THEN 1 ELSE 0 END), 0) AS tickets_vendidos,
COALESCE(SUM(CASE WHEN p.estado = 'confirmado' THEN p.monto ELSE 0 END), 0) AS ingresos_generados,
MAX(e.fecha_inicio) AS ultima_presentacion
FROM artistas a
LEFT JOIN eventos e ON a.id_artista = e.id_artista
LEFT JOIN tiposentrada te ON e.id_evento = te.id_evento
LEFT JOIN tickets t ON te.id_tipo = t.id_tipo
LEFT JOIN pagos p ON t.id_pago = p.id_pago
WHERE e.fecha_inicio BETWEEN ? AND ? AND e.estado = 'publicado'
GROUP BY a.id_artista, a.nombre
ORDER BY ingresos_generados DESC;`.trim();

    const artists = await queryDB(sql, [start, end]);

    res.json({ success: true, data: artists });
  } catch (error) {
    console.error("Error en getArtistsPerformance:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener rendimiento de artistas.",
      error: error.message,
    });
  }
}

async function getPayroll(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const { dateOnlyStart, dateOnlyEnd } = formatDatesForQuery(
      startDate,
      endDate
    );

    const sql = `SELECT
a.nombre AS artista,
e.nombre AS evento,
g.fecha_gasto AS fecha_pago,
g.monto AS monto_pagado,
g.estado AS estado_pago
FROM gastos g
JOIN eventos e ON g.id_evento = e.id_evento
JOIN artistas a ON e.id_artista = a.id_artista
WHERE g.fecha_gasto BETWEEN ? AND ? AND g.id_categoria = 1
ORDER BY g.fecha_gasto DESC;`.trim();

    const payroll = await queryDB(sql, [dateOnlyStart, dateOnlyEnd]);

    res.json({ success: true, data: payroll });
  } catch (error) {
    console.error("Error en getPayroll:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener nómina de artistas.",
      error: error.message,
    });
  }
}

async function getReconciliation(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const { dateOnlyStart, dateOnlyEnd } = formatDatesForQuery(
      startDate,
      endDate
    );

    const sql = `SELECT
b.nombre AS banco,
c.fecha_inicio,
c.fecha_fin,
c.saldo_banco_inicial,
c.saldo_banco_final,
CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS creado_por
FROM conciliacionesbancarias c
JOIN bancos b ON c.id_banco = b.id_banco
LEFT JOIN usuarios u ON c.creado_por = u.id_usuario
WHERE c.fecha_inicio >= ? AND c.fecha_fin <= ?
ORDER BY c.fecha_inicio DESC;`.trim();

    const reconciliation = await queryDB(sql, [dateOnlyStart, dateOnlyEnd]);

    res.json({ success: true, data: reconciliation });
  } catch (error) {
    console.error("Error en getReconciliation:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener conciliación bancaria.",
      error: error.message,
    });
  }
}

async function getFinancialSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const { start, end, dateOnlyStart, dateOnlyEnd } = formatDatesForQuery(
      startDate,
      endDate
    ); // Calcular período anterior

    const startM = moment(startDate);
    const endM = moment(endDate);
    const duration = endM.diff(startM, "days") + 1;
    const previousEndDate = startM
      .clone()
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    const previousStartDate = startM
      .clone()
      .subtract(duration, "days")
      .format("YYYY-MM-DD");

    const {
      start: prevStart,
      end: prevEnd,
      dateOnlyStart: prevDateOnlyStart,
      dateOnlyEnd: prevDateOnlyEnd,
    } = formatDatesForQuery(previousStartDate, previousEndDate); // Consultas para período actual

    const revenueSql = `SELECT COALESCE(SUM(monto), 0) AS total FROM pagos WHERE fecha_pago BETWEEN ? AND ? AND estado = 'confirmado'`;
    const expensesSql = `SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE fecha_gasto BETWEEN ? AND ?`;

    const [revenueResult] = await queryDB(revenueSql, [start, end]);
    const [expensesResult] = await queryDB(expensesSql, [
      dateOnlyStart,
      dateOnlyEnd,
    ]);

    const currentRevenue = parseFloat(revenueResult.total);
    const currentExpenses = parseFloat(expensesResult.total);
    const currentNetProfit = currentRevenue - currentExpenses; // Consultas para período anterior

    const [prevRevenueResult] = await queryDB(revenueSql, [prevStart, prevEnd]);
    const [prevExpensesResult] = await queryDB(expensesSql, [
      prevDateOnlyStart,
      prevDateOnlyEnd,
    ]);

    const prevRevenue = parseFloat(prevRevenueResult.total);
    const prevExpenses = parseFloat(prevExpensesResult.total);
    const prevNetProfit = prevRevenue - prevExpenses;

    const netProfitChange = calculateChange(currentNetProfit, prevNetProfit);

    res.json({
      success: true,
      data: {
        netProfit: currentNetProfit.toFixed(2),
        netProfitChange: netProfitChange,
      },
    });
  } catch (error) {
    console.error("Error en getFinancialSummary:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen financiero.",
      error: error.message,
    });
  }
}

module.exports = {
  getSummary,
  getSalesReport,
  getExpensesReport,
  getEventsReport,
  getTrendData,
  getPaymentDistribution,
  getArtistsPerformance,
  getPayroll,
  getReconciliation,
  getFinancialSummary,
};
