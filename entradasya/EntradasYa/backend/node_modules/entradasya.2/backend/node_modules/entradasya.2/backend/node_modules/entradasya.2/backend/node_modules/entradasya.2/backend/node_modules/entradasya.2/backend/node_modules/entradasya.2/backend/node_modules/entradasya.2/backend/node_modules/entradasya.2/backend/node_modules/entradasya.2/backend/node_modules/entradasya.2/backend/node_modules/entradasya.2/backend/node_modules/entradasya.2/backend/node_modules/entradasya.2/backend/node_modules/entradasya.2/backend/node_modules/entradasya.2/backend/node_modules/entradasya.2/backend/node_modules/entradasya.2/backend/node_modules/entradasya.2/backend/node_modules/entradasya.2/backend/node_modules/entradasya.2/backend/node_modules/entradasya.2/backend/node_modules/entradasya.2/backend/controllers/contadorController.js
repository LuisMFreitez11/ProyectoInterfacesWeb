const { db } = require('../config/db');

// Controladores para el módulo de Contador

// Dashboard - Resumen Financiero
const getFinancialSummary = async (req, res) => {
  try {
    // Ingresos totales
    const [revenueResult] = await db.execute(`
      SELECT
        SUM(p.monto) as total_revenue,
        COUNT(DISTINCT c.id_compra) as total_sales,
        AVG(p.monto) as avg_sale
      FROM pagos p
      JOIN compras c ON p.id_compra = c.id_compra
      WHERE p.estado = 'completado'
    `);

    // Gastos totales
    const [expensesResult] = await db.execute(`
      SELECT
        SUM(monto) as total_expenses,
        COUNT(*) as total_expenses_count
      FROM gastos
    `);

    // Balance
    const totalRevenue = revenueResult[0].total_revenue || 0;
    const totalExpenses = expensesResult[0].total_expenses || 0;
    const balance = totalRevenue - totalExpenses;

    // Movimientos pendientes de conciliación
    const [pendingMovements] = await db.execute(`
      SELECT COUNT(*) as pending_count
      FROM movimientos_contables
      WHERE conciliado = 0
    `);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalSales: revenueResult[0].total_sales || 0,
        avgSale: revenueResult[0].avg_sale || 0,
        totalExpenses,
        totalExpensesCount: expensesResult[0].total_expenses_count || 0,
        balance,
        pendingMovements: pendingMovements[0].pending_count || 0
      },
      message: 'Resumen financiero obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error getting financial summary:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen financiero', error: error.message });
  }
};

// Ingresos y Ventas
const getSalesRevenue = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    let query = '';
    let params = [];

    switch (type) {
      case 'summary':
        query = `
          SELECT
            DATE(p.fecha_pago) as fecha,
            SUM(p.monto) as ingresos,
            COUNT(DISTINCT c.id_compra) as ventas,
            SUM(p.comision) as comisiones
          FROM pagos p
          JOIN compras c ON p.id_compra = c.id_compra
          WHERE p.estado = 'completado'
          ${startDate && endDate ? 'AND DATE(p.fecha_pago) BETWEEN ? AND ?' : ''}
          GROUP BY DATE(p.fecha_pago)
          ORDER BY fecha DESC
        `;
        if (startDate && endDate) params = [startDate, endDate];
        break;

      case 'by_event':
        query = `
          SELECT
            e.nombre as evento,
            SUM(p.monto) as ingresos,
            COUNT(DISTINCT c.id_compra) as ventas,
            COUNT(t.id_ticket) as tickets_vendidos
          FROM eventos e
          LEFT JOIN detallescompra dc ON e.id_evento = dc.id_tipo_entrada
          LEFT JOIN compras c ON dc.id_compra = c.id_compra
          LEFT JOIN pagos p ON c.id_compra = p.id_compra AND p.estado = 'completado'
          LEFT JOIN tickets t ON dc.id_detalle = t.id_detalle AND t.estado = 'usado'
          ${startDate && endDate ? 'WHERE DATE(e.fecha) BETWEEN ? AND ?' : ''}
          GROUP BY e.id_evento, e.nombre
          ORDER BY ingresos DESC
        `;
        if (startDate && endDate) params = [startDate, endDate];
        break;

      case 'by_payment_method':
        query = `
          SELECT
            pm.nombre as metodo_pago,
            SUM(p.monto) as ingresos,
            COUNT(*) as transacciones,
            SUM(p.comision) as comisiones
          FROM pagos p
          JOIN metodos_pago pm ON p.id_metodo_pago = pm.id_metodo_pago
          WHERE p.estado = 'completado'
          ${startDate && endDate ? 'AND DATE(p.fecha_pago) BETWEEN ? AND ?' : ''}
          GROUP BY pm.id_metodo_pago, pm.nombre
          ORDER BY ingresos DESC
        `;
        if (startDate && endDate) params = [startDate, endDate];
        break;

      default:
        return res.status(400).json({ success: false, message: 'Tipo de reporte no válido' });
    }

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows, message: 'Datos de ingresos obtenidos exitosamente' });
  } catch (error) {
    console.error('Error getting sales revenue:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos de ingresos', error: error.message });
  }
};

// Gastos y Costos Operacionales
const getExpensesCosts = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    let query = '';
    let params = [];

    switch (type) {
      case 'by_category':
        query = `
          SELECT
            cg.nombre as categoria,
            SUM(g.monto) as total_gastos,
            COUNT(*) as cantidad_gastos,
            AVG(g.monto) as promedio_gasto
          FROM gastos g
          JOIN categorias_gasto cg ON g.id_categoria_gasto = cg.id_categoria_gasto
          ${startDate && endDate ? 'WHERE DATE(g.fecha_gasto) BETWEEN ? AND ?' : ''}
          GROUP BY cg.id_categoria_gasto, cg.nombre
          ORDER BY total_gastos DESC
        `;
        if (startDate && endDate) params = [startDate, endDate];
        break;

      case 'by_event':
        query = `
          SELECT
            e.nombre as evento,
            SUM(ep.precio) as costo_proveedores,
            SUM(g.monto) as gastos_adicionales,
            (SUM(ep.precio) + SUM(g.monto)) as costo_total
          FROM eventos e
          LEFT JOIN eventos_proveedores ep ON e.id_evento = ep.id_evento
          LEFT JOIN gastos g ON g.descripcion LIKE CONCAT('%', e.nombre, '%')
          ${startDate && endDate ? 'WHERE DATE(e.fecha) BETWEEN ? AND ?' : ''}
          GROUP BY e.id_evento, e.nombre
          ORDER BY costo_total DESC
        `;
        if (startDate && endDate) params = [startDate, endDate];
        break;

      case 'timeline':
        query = `
          SELECT
            DATE(g.fecha_gasto) as fecha,
            SUM(g.monto) as gastos_diarios,
            COUNT(*) as cantidad_gastos
          FROM gastos g
          ${startDate && endDate ? 'WHERE DATE(g.fecha_gasto) BETWEEN ? AND ?' : ''}
          GROUP BY DATE(g.fecha_gasto)
          ORDER BY fecha DESC
        `;
        if (startDate && endDate) params = [startDate, endDate];
        break;

      default:
        return res.status(400).json({ success: false, message: 'Tipo de reporte no válido' });
    }

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows, message: 'Datos de gastos obtenidos exitosamente' });
  } catch (error) {
    console.error('Error getting expenses costs:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos de gastos', error: error.message });
  }
};

// Conciliación Bancaria y Movimientos Contables
const getBankReconciliation = async (req, res) => {
  try {
    const { type } = req.query;

    let query = '';
    let params = [];

    switch (type) {
      case 'pending_movements':
        query = `
          SELECT
            mc.*,
            tm.nombre as tipo_movimiento
          FROM movimientos_contables mc
          LEFT JOIN tipos_movimiento tm ON mc.id_tipo_movimiento = tm.id_tipo_movimiento
          WHERE mc.conciliado = 0
          ORDER BY mc.fecha_movimiento DESC
        `;
        break;

      case 'reconciled_summary':
        query = `
          SELECT
            cb.fecha_conciliacion,
            cb.saldo_inicial,
            cb.saldo_final,
            COUNT(cm.id_movimiento) as movimientos_conciliados
          FROM conciliacion_bancaria cb
          LEFT JOIN conciliacion_movimientos cm ON cb.id_conciliacion = cm.id_conciliacion
          GROUP BY cb.id_conciliacion, cb.fecha_conciliacion, cb.saldo_inicial, cb.saldo_final
          ORDER BY cb.fecha_conciliacion DESC
          LIMIT 10
        `;
        break;

      case 'movements_by_type':
        query = `
          SELECT
            tm.nombre as tipo_movimiento,
            COUNT(*) as cantidad,
            SUM(mc.monto) as total_monto,
            AVG(mc.monto) as promedio_monto
          FROM movimientos_contables mc
          JOIN tipos_movimiento tm ON mc.id_tipo_movimiento = tm.id_tipo_movimiento
          GROUP BY tm.id_tipo_movimiento, tm.nombre
          ORDER BY total_monto DESC
        `;
        break;

      default:
        return res.status(400).json({ success: false, message: 'Tipo de consulta no válido' });
    }

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows, message: 'Datos de conciliación obtenidos exitosamente' });
  } catch (error) {
    console.error('Error getting bank reconciliation:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos de conciliación', error: error.message });
  }
};

// Reportes y Documentación
const generateFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.body;

    let reportData = {};

    // Estado de Resultados
    if (reportType === 'income_statement' || reportType === 'all') {
      const [incomeData] = await db.execute(`
        SELECT
          SUM(p.monto) as total_ingresos,
          SUM(p.comision) as total_comisiones
        FROM pagos p
        WHERE p.estado = 'completado'
        AND DATE(p.fecha_pago) BETWEEN ? AND ?
      `, [startDate, endDate]);

      const [expenseData] = await db.execute(`
        SELECT SUM(monto) as total_gastos FROM gastos
        WHERE DATE(fecha_gasto) BETWEEN ? AND ?
      `, [startDate, endDate]);

      reportData.incomeStatement = {
        ingresos: incomeData[0].total_ingresos || 0,
        comisiones: incomeData[0].total_comisiones || 0,
        gastos: expenseData[0].total_gastos || 0,
        utilidad_neta: (incomeData[0].total_ingresos || 0) - (expenseData[0].total_gastos || 0)
      };
    }

    // Reporte de Compras y Pagos
    if (reportType === 'sales_payments' || reportType === 'all') {
      const [salesData] = await db.execute(`
        SELECT
          c.id_compra,
          c.total,
          c.fecha_compra,
          p.monto as monto_pagado,
          p.estado as estado_pago,
          pm.nombre as metodo_pago,
          u.nombre as cliente
        FROM compras c
        LEFT JOIN pagos p ON c.id_compra = p.id_compra
        LEFT JOIN metodos_pago pm ON p.id_metodo_pago = pm.id_metodo_pago
        LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE DATE(c.fecha_compra) BETWEEN ? AND ?
        ORDER BY c.fecha_compra DESC
      `, [startDate, endDate]);

      reportData.salesPayments = salesData;
    }

    // Reporte de Gastos Detallado
    if (reportType === 'detailed_expenses' || reportType === 'all') {
      const [expensesData] = await db.execute(`
        SELECT
          g.*,
          cg.nombre as categoria,
          u.nombre as usuario_registro
        FROM gastos g
        JOIN categorias_gasto cg ON g.id_categoria_gasto = cg.id_categoria_gasto
        LEFT JOIN usuarios u ON g.id_usuario = u.id_usuario
        WHERE DATE(g.fecha_gasto) BETWEEN ? AND ?
        ORDER BY g.fecha_gasto DESC
      `, [startDate, endDate]);

      reportData.detailedExpenses = expensesData;
    }

    res.json({
      success: true,
      data: reportData,
      message: 'Reporte financiero generado exitosamente'
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte financiero', error: error.message });
  }
};

module.exports = {
  getFinancialSummary,
  getSalesRevenue,
  getExpensesCosts,
  getBankReconciliation,
  generateFinancialReport
};
