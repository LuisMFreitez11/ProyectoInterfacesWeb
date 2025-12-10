// controllers/pagosController.js
const { getDB } = require("../config/db");

/**
 * Controlador de Pagos, Gastos y Métodos de Pago
 */

// ------------------------- Utilidades -------------------------
const generarQRToken = (id_pago, index) => {
  const baseToken = `PAY${id_pago}TIC${index}`;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  // Usa Buffer.from para Base64 URL-safe (sin necesidad de atob en frontend si usas esta versión)
  const tokenString = `${baseToken}-${timestamp}${random}`;
  return Buffer.from(tokenString).toString('base64url').toUpperCase(); 
};

const mapDbStateToVue = (dbState) => {
  const map = {
    iniciado: "pendiente",
    confirmado: "completado",
    fallido: "fallido",
    reversado: "reembolsado",
  };
  return map[dbState] || dbState;
};

const mapVueStateToDb = (vueState) => {
  const map = {
    pendiente: "iniciado",
    completado: "confirmado",
    fallido: "fallido",
    reembolsado: "reversado",
  };
  return map[vueState] || vueState;
};

// ------------------------- PAGOS -------------------------
const getAllPayments = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`
      SELECT 
        p.id_pago, 
        p.id_compra, 
        p.id_usuario, 
        p.id_metodo, 
        p.fecha_pago, 
        p.monto, 
        p.moneda_codigo, 
        p.simbolo_moneda, 
        p.referencia_proveedor, 
        p.estado, 
        p.comision,
        m.nombre AS metodo_pago,
        CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS usuario,
        c.total AS total_compra
      FROM pagos p
      LEFT JOIN metodospago m ON m.id_metodo = p.id_metodo
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN compras c ON p.id_compra = c.id_compra
      ORDER BY p.fecha_pago DESC
    `);

    const mappedRows = rows.map((row) => ({
      id_pago: row.id_pago,
      id_compra: row.id_compra,
      id_usuario: row.id_usuario,
      id_metodo_pago: row.id_metodo,
      monto: row.monto,
      fecha_pago: row.fecha_pago,
      estado: mapDbStateToVue(row.estado),
      referencia: row.referencia_proveedor,
      metodo_pago: row.metodo_pago,
      usuario: row.usuario,
      comision: row.comision,
      moneda_codigo: row.moneda_codigo,
      simbolo_moneda: row.simbolo_moneda,
      total_compra: row.total_compra,
    }));

    return res.json({ ok: true, data: mappedRows });
  } catch (error) {
    console.error("getAllPayments error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener pagos",
      error: error.message,
    });
  }
};

const getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDB();
    const [payments] = await db.execute(
      `SELECT 
        p.*,
        CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS usuario,
        m.nombre AS metodo_pago
      FROM pagos p
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN metodospago m ON p.id_metodo = m.id_metodo
      WHERE p.id_pago = ?`,
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ ok: false, message: "Pago no encontrado" });
    }

    const payment = payments[0];
    payment.estado = mapDbStateToVue(payment.estado);
    payment.id_metodo_pago = payment.id_metodo; // Obtener tickets asociados

    const [tickets] = await db.execute(
      `SELECT t.*, te.nombre_tipo AS tipo_entrada
      FROM tickets t
      LEFT JOIN tiposentrada te ON t.id_tipo = te.id_tipo
      WHERE t.id_pago = ?`,
      [id]
    );

    payment.tickets = tickets;

    return res.json({ ok: true, data: payment });
  } catch (error) {
    console.error("getPaymentById error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener pago",
      error: error.message,
    });
  }
};

const createPayment = async (req, res) => {
  const db = getDB();
  try {
    const {
      id_compra,
      id_usuario,
      id_metodo_pago,
      monto,
      referencia,
      estado = "pendiente",
      comision = 0,
      moneda_codigo = "USD",
      simbolo_moneda = "$",
    } = req.body;

    if (!id_usuario || !id_metodo_pago || !monto) {
      return res
        .status(400)
        .json({ ok: false, message: "Faltan campos requeridos" });
    }

    const estadoDb = mapVueStateToDb(estado);

    const [result] = await db.execute(
      `INSERT INTO pagos 
        (id_compra, id_usuario, id_metodo, monto, moneda_codigo, simbolo_moneda, 
        referencia_proveedor, estado, comision, fecha_pago)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id_compra || null,
        id_usuario,
        id_metodo_pago,
        monto,
        moneda_codigo,
        simbolo_moneda,
        referencia || null,
        estadoDb,
        comision,
      ]
    );

    const [newPayment] = await db.execute(
      `SELECT p.*, m.nombre AS metodo_pago 
      FROM pagos p
      LEFT JOIN metodospago m ON p.id_metodo = m.id_metodo
      WHERE p.id_pago = ?`,
      [result.insertId]
    );

    if (newPayment.length > 0) {
      newPayment[0].estado = mapDbStateToVue(newPayment[0].estado);
      newPayment[0].id_metodo_pago = newPayment[0].id_metodo;
    }

    return res.status(201).json({
      ok: true,
      data: newPayment[0],
      message: "Pago creado correctamente",
    });
  } catch (error) {
    console.error("createPayment error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al crear pago",
      error: error.message,
    });
  }
};

const updatePayment = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDB();

  try {
    const allowedFields = [
      "estado",
      "monto",
      "referencia",
      "id_metodo_pago",
      "comision",
    ];
    const setClauses = [];
    const values = [];

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        let dbCol = key;
        let value = updates[key];

        if (key === "referencia") dbCol = "referencia_proveedor";
        if (key === "id_metodo_pago") dbCol = "id_metodo";
        if (key === "estado") value = mapVueStateToDb(value);

        setClauses.push(`${dbCol} = ?`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) {
      return res
        .status(400)
        .json({ ok: false, message: "No hay campos válidos para actualizar" });
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE pagos SET ${setClauses.join(", ")} WHERE id_pago = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Pago no encontrado" });
    } // Obtener pago actualizado

    const [updatedPayment] = await db.execute(
      `SELECT p.*, m.nombre AS metodo_pago 
      FROM pagos p
      LEFT JOIN metodospago m ON p.id_metodo = m.id_metodo
      WHERE p.id_pago = ?`,
      [id]
    );

    if (updatedPayment.length > 0) {
      updatedPayment[0].estado = mapDbStateToVue(updatedPayment[0].estado);
      updatedPayment[0].id_metodo_pago = updatedPayment[0].id_metodo;
    }

    return res.json({
      ok: true,
      data: updatedPayment[0],
      message: "Pago actualizado correctamente",
    });
  } catch (error) {
    console.error("updatePayment error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar pago",
      error: error.message,
    });
  }
};

const deletePayment = async (req, res) => {
  const { id } = req.params;
  const db = getDB();

  try {
    // Verificar si tiene tickets asociados
    const [tickets] = await db.execute(
      `SELECT COUNT(*) as count FROM tickets WHERE id_pago = ?`,
      [id]
    );

    if (tickets[0].count > 0) {
      return res.status(400).json({
        ok: false,
        message: "No se puede eliminar el pago porque tiene tickets asociados",
      });
    }

    const [result] = await db.execute("DELETE FROM pagos WHERE id_pago = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Pago no encontrado" });
    }

    return res.json({ ok: true, message: "Pago eliminado correctamente" });
  } catch (error) {
    console.error("deletePayment error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar pago",
      error: error.message,
    });
  }
};

// ------------------------- GASTOS -------------------------
const getAllExpenses = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`
      SELECT 
        g.*,
        cg.nombre AS categoria_nombre,
        e.nombre AS evento_nombre,
        CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS registrado_por_nombre
      FROM gastos g
      LEFT JOIN categoriasgasto cg ON g.id_categoria = cg.id_categoria
      LEFT JOIN eventos e ON g.id_evento = e.id_evento
      LEFT JOIN usuarios u ON g.registrado_por = u.id_usuario
      ORDER BY g.fecha_gasto DESC, g.id_gasto DESC
    `);

    return res.json({ ok: true, data: rows });
  } catch (error) {
    console.error("getAllExpenses error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener gastos",
      error: error.message,
    });
  }
};

const getExpenseById = async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDB();
    const [expenses] = await db.execute(
      `SELECT 
        g.*,
        cg.nombre AS categoria_nombre,
        e.nombre AS evento_nombre,
        CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS registrado_por_nombre
      FROM gastos g
      LEFT JOIN categoriasgasto cg ON g.id_categoria = cg.id_categoria
      LEFT JOIN eventos e ON g.id_evento = e.id_evento
      LEFT JOIN usuarios u ON g.registrado_por = u.id_usuario
      WHERE g.id_gasto = ?`,
      [id]
    );

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Gasto no encontrado" });
    }

    return res.json({ ok: true, data: expenses[0] });
  } catch (error) {
    console.error("getExpenseById error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener gasto",
      error: error.message,
    });
  }
};

const createExpense = async (req, res) => {
  const db = getDB();
  try {
    const {
      id_evento,
      id_categoria,
      descripcion,
      fecha_gasto,
      monto,
      moneda_codigo = "USD",
      simbolo_moneda = "$",
      receptor,
      referencia_pago,
      comprobante_url,
      registrado_por,
    } = req.body;

    if (!id_categoria || !descripcion || !fecha_gasto || !monto) {
      return res
        .status(400)
        .json({ ok: false, message: "Faltan campos requeridos" });
    }

    const [result] = await db.execute(
      `INSERT INTO gastos 
        (id_evento, id_categoria, descripcion, fecha_gasto, monto, moneda_codigo, 
        simbolo_moneda, receptor, referencia_pago, comprobante_url, registrado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_evento || null,
        id_categoria,
        descripcion,
        fecha_gasto,
        monto,
        moneda_codigo,
        simbolo_moneda,
        receptor || null,
        referencia_pago || null,
        comprobante_url || null,
        registrado_por || null,
      ]
    );

    const [newExpense] = await db.execute(
      `SELECT g.*, cg.nombre AS categoria_nombre
      FROM gastos g
      LEFT JOIN categoriasgasto cg ON g.id_categoria = cg.id_categoria
      WHERE g.id_gasto = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      data: newExpense[0],
      message: "Gasto creado correctamente",
    });
  } catch (error) {
    console.error("createExpense error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al crear gasto",
      error: error.message,
    });
  }
};

const updateExpense = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDB();

  try {
    const allowedFields = [
      "id_evento",
      "id_categoria",
      "descripcion",
      "fecha_gasto",
      "monto",
      "receptor",
      "referencia_pago",
      "comprobante_url",
    ];
    const setClauses = [];
    const values = [];

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) {
      return res
        .status(400)
        .json({ ok: false, message: "No hay campos válidos para actualizar" });
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE gastos SET ${setClauses.join(", ")} WHERE id_gasto = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Gasto no encontrado" });
    }

    const [updatedExpense] = await db.execute(
      `SELECT g.*, cg.nombre AS categoria_nombre
      FROM gastos g
      LEFT JOIN categoriasgasto cg ON g.id_categoria = cg.id_categoria
      WHERE g.id_gasto = ?`,
      [id]
    );

    return res.json({
      ok: true,
      data: updatedExpense[0],
      message: "Gasto actualizado correctamente",
    });
  } catch (error) {
    console.error("updateExpense error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar gasto",
      error: error.message,
    });
  }
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const db = getDB();

  try {
    const [result] = await db.execute("DELETE FROM gastos WHERE id_gasto = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Gasto no encontrado" });
    }

    return res.json({ ok: true, message: "Gasto eliminado correctamente" });
  } catch (error) {
    console.error("deleteExpense error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar gasto",
      error: error.message,
    });
  }
};

// ------------------------- MÉTODOS DE PAGO -------------------------
const getAllPaymentMethods = async (req, res) => {
  try {
    const db = getDB();
    // ✅ Consulta de métodos de pago CORRECTA
    const [rows] = await db.execute(`
      SELECT 
        id_metodo AS id_metodo_pago, 
        nombre, 
        detalles_receptor AS descripcion
      FROM 
        metodospago
      ORDER BY nombre ASC
    `);
    return res.json({ ok: true, data: rows });
  } catch (error) {
    console.error("getAllPaymentMethods error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener métodos de pago",
      error: error.message,
    });
  }
};

const getPaymentMethodById = async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDB();
    const [rows] = await db.execute(
      `SELECT 
        id_metodo AS id_metodo_pago, 
        nombre, 
        detalles_receptor AS descripcion
      FROM metodospago 
      WHERE id_metodo = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Método de pago no encontrado" });
    }

    return res.json({ ok: true, data: rows[0] });
  } catch (error) {
    console.error("getPaymentMethodById error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener método de pago",
      error: error.message,
    });
  }
};

const createPaymentMethod = async (req, res) => {
  const db = getDB();
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ ok: false, message: "El nombre es requerido" });
    }

    const [result] = await db.execute(
      `INSERT INTO metodospago (nombre, detalles_receptor) VALUES (?, ?)`,
      [nombre, descripcion || null]
    );

    const [newMethod] = await db.execute(
      `SELECT id_metodo AS id_metodo_pago, nombre, detalles_receptor AS descripcion
      FROM metodospago WHERE id_metodo = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      data: newMethod[0],
      message: "Método de pago creado correctamente",
    });
  } catch (error) {
    console.error("createPaymentMethod error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al crear método de pago",
      error: error.message,
    });
  }
};

const updatePaymentMethod = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDB();

  try {
    const allowedFields = ["nombre", "descripcion"];
    const setClauses = [];
    const values = [];

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        let dbCol = key === "descripcion" ? "detalles_receptor" : key;
        setClauses.push(`${dbCol} = ?`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) {
      return res
        .status(400)
        .json({ ok: false, message: "No hay campos válidos para actualizar" });
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE metodospago SET ${setClauses.join(", ")} WHERE id_metodo = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Método de pago no encontrado" });
    }

    const [updatedMethod] = await db.execute(
      `SELECT id_metodo AS id_metodo_pago, nombre, detalles_receptor AS descripcion
      FROM metodospago WHERE id_metodo = ?`,
      [id]
    );

    return res.json({
      ok: true,
      data: updatedMethod[0],
      message: "Método de pago actualizado correctamente",
    });
  } catch (error) {
    console.error("updatePaymentMethod error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar método de pago",
      error: error.message,
    });
  }
};

const deletePaymentMethod = async (req, res) => {
  const { id } = req.params;
  const db = getDB();

  try {
    // Verificar si hay pagos usando este método
    const [payments] = await db.execute(
      `SELECT COUNT(*) as count FROM pagos WHERE id_metodo = ?`,
      [id]
    );

    if (payments[0].count > 0) {
      return res.status(400).json({
        ok: false,
        message: "No se puede eliminar el método porque tiene pagos asociados",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM metodospago WHERE id_metodo = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Método de pago no encontrado" });
    }

    return res.json({
      ok: true,
      message: "Método de pago eliminado correctamente",
    });
  } catch (error) {
    console.error("deletePaymentMethod error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar método de pago",
      error: error.message,
    });
  }
};

// ------------------------- CATEGORÍAS DE GASTO -------------------------
const getAllExpenseCategories = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(
      `SELECT * FROM categoriasgasto ORDER BY nombre ASC`
    );

    return res.json({ ok: true, data: rows });
  } catch (error) {
    console.error("getAllExpenseCategories error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener categorías",
      error: error.message,
    });
  }
};

// ------------------------- TRANSACCIÓN COMPLETA -------------------------
const registrarTransaccionCompleta = async (req, res) => {
  const {
    id_usuario,
    items_ticket = [],
    pago = {},
    total_transaccion,
    id_compra = null,
  } = req.body;

  const db = getDB();
  let connection;
  let primerQrToken = null;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    if (!id_usuario || !pago.id_metodo || total_transaccion == null) {
      throw new Error("Faltan campos requeridos");
    }

    // Si el id_metodo es 3 (pago en efectivo/cash) se confirma inmediatamente.
    const estadoInicial = pago.id_metodo === 3 ? "confirmado" : "iniciado";

    // INSERCIÓN DE PAGO
    const [resultPago] = await connection.execute(
      `INSERT INTO pagos (
          id_compra, id_usuario, id_metodo, monto, moneda_codigo, simbolo_moneda, 
          referencia_proveedor, estado, comision, fecha_pago
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id_compra,
        id_usuario,
        pago.id_metodo,
        total_transaccion,
        pago.moneda_codigo || "USD",
        pago.simbolo_moneda || "$",
        pago.referencia_proveedor || null,
        estadoInicial,
        pago.comision || 0,
      ]
    );

    const id_pago = resultPago.insertId; // Insertar tickets

    if (items_ticket.length > 0) {
      for (let i = 0; i < items_ticket.length; i++) {
        const item = items_ticket[i];
        // ⚠️ Generar QR Token basado en el ID de Pago e índice (i+1)
        const qr_token = generarQRToken(id_pago, i + 1); 
        
        if (!primerQrToken) {
          primerQrToken = qr_token;
        }

        // INSERCIÓN DE TICKETS
        await connection.execute(
          `INSERT INTO tickets (
              id_pago, id_detalle, id_asiento, id_tipo, precio_unit, codigo, estado, fecha_emitido
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`, 
          [
            id_pago,
            item.id_detalle || null,
            item.id_asiento || null,
            item.id_tipo,
            item.precio_unit,
            qr_token,
            "valido", // Estado inicial del ticket
          ]
        );
        
        // 🚨 Posible mejora: Marcar asiento como ocupado si id_asiento está presente
        if (item.id_asiento) {
            await connection.execute(
                `UPDATE asientos SET ocupado = 1 WHERE id_asiento = ?`,
                [item.id_asiento]
            );
        }
        // 🚨 Posible mejora: Decrementar cantidad_disponible en tiposentrada
        if (item.id_tipo) {
            await connection.execute(
                `UPDATE tiposentrada SET cantidad_disponible = cantidad_disponible - 1 WHERE id_tipo = ?`,
                [item.id_tipo]
            );
        }
        
      }
    }

    await connection.commit();

    return res.status(201).json({
      ok: true,
      success: true,
      transactionId: id_pago,
      qrToken: primerQrToken,
      id_pago: id_pago,
      message: "Transacción completada exitosamente",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("registrarTransaccionCompleta error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al registrar transacción",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  // Pagos
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,

  // Gastos
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,

  // Métodos de Pago
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,

  // Categorías de Gasto
  getAllExpenseCategories,

  // Transacción Completa
  registrarTransaccionCompleta,
};