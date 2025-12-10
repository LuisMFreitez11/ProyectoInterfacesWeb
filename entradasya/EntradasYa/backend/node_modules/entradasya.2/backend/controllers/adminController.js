const { getDB } = require('../config/db');

// --- User Management Controllers ---

const getAllUsers = async (req, res) => {
  try {
    const db = getDB();
    // Se agrega el campo id_rol de usuario_roles para ser enviado al frontend
    const [rows] = await db.execute(`
        SELECT u.*, ur.id_role as id_rol 
        FROM usuarios u
        LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
        ORDER BY u.fecha_registro DESC
    `);
    res.json({ success: true, data: rows, message: 'Usuarios obtenidos exitosamente' });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [rows] = await db.execute(`
        SELECT u.*, ur.id_role as id_rol 
        FROM usuarios u
        LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
        WHERE u.id_usuario = ?
    `, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: rows[0], message: 'Usuario obtenido exitosamente' });
  } catch (error) {
    console.error('Error getting user by id:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuario', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const db = getDB();
    const bcrypt = require('bcryptjs');
    // Nota: El campo id_rol viene de Vue como '5' (Usuario por defecto)
    const { nombre, apellido, email, password, telefono, id_rol, activo = true } = req.body; 

    if (!nombre || !email || !password) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: nombre, email, password' });
    }

    // Validación de email único
    const [existing] = await db.execute('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'El email ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Insertar en tabla usuarios
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, apellido, email, contraseña_hash, telefono, activo, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [nombre, apellido, email, hashedPassword, telefono, activo]
    );

    const userId = result.insertId;

    // 2. Insertar en tabla usuario_roles (usando el campo id_role, no id_rol)
    const roleId = id_rol || 5; // Asegura un valor por defecto si no viene
    await db.execute('INSERT INTO usuario_roles (id_usuario, id_role) VALUES (?, ?)', [userId, roleId]);

    res.status(201).json({
      success: true,
      data: { id_usuario: userId, nombre, apellido, email, telefono, id_rol: roleId, activo },
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    // Captura errores de DB que no sean UNIQUE (ej. NOT NULL)
    res.status(500).json({ success: false, message: 'Error al crear usuario', error: error.message });
  }
};

const updateUser = async (req, res) => {
    try {
        const db = getDB();
        const userId = req.params.id;
        let { nombre, apellido, email, telefono, id_rol, activo } = req.body; // id_rol es el que viene de Vue

        // 🛑 CRÍTICO: LIMPIEZA DE DATOS PARA EVITAR EL ERROR 500 🛑
        
        // 1. Eliminar email del cuerpo. Si el email se actualiza, debe hacerse en una ruta separada con validación.
        // Si el campo 'email' está en el body, y es UNIQUE, causará un 500 si no se maneja en el servidor.
        // Lo excluimos del update de la tabla `usuarios` ya que Vue no lo hace editable.
        // También aseguramos que el password no se intente actualizar accidentalmente.
        delete req.body.email;
        delete req.body.password; 

        // 2. Manejo de valores opcionales nulos
        apellido = apellido === '' ? null : apellido;
        telefono = telefono === '' ? null : telefono;
        
        // 3. Conversión de tipos (Vue los envía como string '1'/'0' o '5'/'2', los convertimos a números)
        id_rol = Number(id_rol);
        activo = Number(activo); 

        // 4. Actualizar tabla usuarios (sin email)
        const [userResult] = await db.execute(
          'UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, activo = ? WHERE id_usuario = ?',
          [nombre, apellido, telefono, activo, userId]
        );

        // 5. Actualizar tabla usuario_roles
        // Usamos ON DUPLICATE KEY UPDATE o un REPLACE para asegurar la unicidad del rol.
        // Si la tabla es solo (id_usuario, id_role) y (id_usuario) es UNIQUE/PK, un REPLACE es más simple.
        
        // Borramos el rol existente y lo insertamos de nuevo
        await db.execute('DELETE FROM usuario_roles WHERE id_usuario = ?', [userId]);
        await db.execute('INSERT INTO usuario_roles (id_usuario, id_role) VALUES (?, ?)', [userId, id_rol]);
        
        // Opcional: Si solo tienes un campo de rol en la tabla, puedes usar REPLACE INTO
        // await db.execute('REPLACE INTO usuario_roles (id_usuario, id_role) VALUES (?, ?)', [userId, id_rol]);

        if (userResult.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.json({ success: true, message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating user:', error); // 🚨 Revisar este log en el servidor
        res.status(500).json({ success: false, message: 'Error al actualizar usuario. Revise los logs del servidor.', error: error.message });
    }
};

const deleteUser = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    // Primero eliminamos la referencia del rol (si la tabla usuario_roles no tiene ON DELETE CASCADE)
    await db.execute('DELETE FROM usuario_roles WHERE id_usuario = ?', [id]);
    
    // Luego eliminamos al usuario
    const [result] = await db.execute('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario', error: error.message });
  }
};


// --- Event Management Controllers ---
const getAllEvents = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`
      SELECT e.*, l.nombre as lugar_nombre, a.nombre as artista_nombre
      FROM eventos e
      LEFT JOIN lugares l ON e.id_lugar = l.id_lugar
      LEFT JOIN artistas a ON e.id_artista = a.id_artista
      ORDER BY e.fecha DESC
    `);
    res.json({ success: true, data: rows, message: 'Eventos obtenidos exitosamente' });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ success: false, message: 'Error al obtener eventos', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT e.*, l.nombre as lugar_nombre, a.nombre as artista_nombre
      FROM eventos e
      LEFT JOIN lugares l ON e.id_lugar = l.id_lugar
      LEFT JOIN artistas a ON e.id_artista = a.id_artista
      WHERE e.id_evento = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }

    res.json({ success: true, data: rows[0], message: 'Evento obtenido exitosamente' });
  } catch (error) {
    console.error('Error getting event by id:', error);
    res.status(500).json({ success: false, message: 'Error al obtener evento', error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const db = getDB();
    const { nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado = 'activo' } = req.body;
    if (!nombre || !fecha || !id_lugar || !id_artista || !capacidad || !precio_base) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: nombre, fecha, id_lugar, id_artista, capacidad, precio_base' });
    }

    const [result] = await db.execute(
      'INSERT INTO eventos (nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado]
    );

    res.status(201).json({
      success: true,
      data: { id_evento: result.insertId, ...req.body },
      message: 'Evento creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Error al crear evento', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado } = req.body;

    const [result] = await db.execute(
      'UPDATE eventos SET nombre = ?, descripcion = ?, fecha = ?, hora = ?, id_lugar = ?, id_artista = ?, capacidad = ?, precio_base = ?, estado = ? WHERE id_evento = ?',
      [nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }

    res.json({ success: true, message: 'Evento actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar evento', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM eventos WHERE id_evento = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }
    res.json({ success: true, message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar evento', error: error.message });
  }
};

// --- Payment Management Controllers ---
const getAllPayments = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`
      SELECT p.*, pm.nombre as metodo_pago, c.total as compra_total
      FROM pagos p
      LEFT JOIN metodos_pago pm ON p.id_metodo_pago = pm.id_metodo_pago
      LEFT JOIN compras c ON p.id_compra = c.id_compra
      ORDER BY p.fecha_pago DESC
    `);
    res.json({ success: true, data: rows, message: 'Pagos obtenidos exitosamente' });
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pagos', error: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT p.*, pm.nombre as metodo_pago, c.total as compra_total
      FROM pagos p
      LEFT JOIN metodos_pago pm ON p.id_metodo_pago = pm.id_metodo_pago
      LEFT JOIN compras c ON p.id_compra = c.id_compra
      WHERE p.id_pago = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }

    res.json({ success: true, data: rows[0], message: 'Pago obtenido exitosamente' });
  } catch (error) {
    console.error('Error getting payment by id:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pago', error: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const db = getDB();
    const { id_compra, id_metodo_pago, monto, estado = 'pendiente', referencia } = req.body;
    if (!id_compra || !id_metodo_pago || !monto) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: id_compra, id_metodo_pago, monto' });
    }

    const [result] = await db.execute(
      'INSERT INTO pagos (id_compra, id_metodo_pago, monto, estado, referencia, fecha_pago, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [id_compra, id_metodo_pago, monto, estado, referencia]
    );

    res.status(201).json({
      success: true,
      data: { id_pago: result.insertId, ...req.body },
      message: 'Pago creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: 'Error al crear pago', error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { id_compra, id_metodo_pago, monto, estado, referencia } = req.body;

    const [result] = await db.execute(
      'UPDATE pagos SET id_compra = ?, id_metodo_pago = ?, monto = ?, estado = ?, referencia = ? WHERE id_pago = ?',
      [id_compra, id_metodo_pago, monto, estado, referencia, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }

    res.json({ success: true, message: 'Pago actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar pago', error: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM pagos WHERE id_pago = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }
    res.json({ success: true, message: 'Pago eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar pago', error: error.message });
  }
};

// --- Expense Management Controllers ---
const getAllExpenses = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`
      SELECT g.*, cg.nombre as categoria_nombre, u.nombre as usuario_nombre
      FROM gastos g
      LEFT JOIN categorias_gasto cg ON g.id_categoria_gasto = cg.id_categoria_gasto
      LEFT JOIN usuarios u ON g.id_usuario = u.id_usuario
      ORDER BY g.fecha_gasto DESC
    `);
    res.json({ success: true, data: rows, message: 'Gastos obtenidos exitosamente' });
  } catch (error) {
    console.error('Error getting expenses:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gastos', error: error.message });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT g.*, cg.nombre as categoria_nombre, u.nombre as usuario_nombre
      FROM gastos g
      LEFT JOIN categorias_gasto cg ON g.id_categoria_gasto = cg.id_categoria_gasto
      LEFT JOIN usuarios u ON g.id_usuario = u.id_usuario
      WHERE g.id_gasto = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    }

    res.json({ success: true, data: rows[0], message: 'Gasto obtenido exitosamente' });
  } catch (error) {
    console.error('Error getting expense by id:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gasto', error: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const db = getDB();
    const { id_categoria_gasto, descripcion, monto, fecha_gasto, id_usuario } = req.body;
    if (!id_categoria_gasto || !descripcion || !monto || !id_usuario) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: id_categoria_gasto, descripcion, monto, id_usuario' });
    }

    const [result] = await db.execute(
      'INSERT INTO gastos (id_categoria_gasto, descripcion, monto, fecha_gasto, id_usuario, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW())',
      [id_categoria_gasto, descripcion, monto, fecha_gasto, id_usuario]
    );

    res.status(201).json({
      success: true,
      data: { id_gasto: result.insertId, ...req.body },
      message: 'Gasto creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, message: 'Error al crear gasto', error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { id_categoria_gasto, descripcion, monto, fecha_gasto, id_usuario } = req.body;

    const [result] = await db.execute(
      'UPDATE gastos SET id_categoria_gasto = ?, descripcion = ?, monto = ?, fecha_gasto = ?, id_usuario = ? WHERE id_gasto = ?',
      [id_categoria_gasto, descripcion, monto, fecha_gasto, id_usuario, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    }

    res.json({ success: true, message: 'Gasto actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar gasto', error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM gastos WHERE id_gasto = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    }
    res.json({ success: true, message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar gasto', error: error.message });
  }
};

// --- Dashboard Stats Controller ---
const getDashboardStats = async (req, res) => {
  try {
    const db = getDB();
    // Get total events
    const [eventsResult] = await db.execute('SELECT COUNT(*) as total FROM eventos');
    const totalEvents = eventsResult[0].total;

    // Get total tickets sold
    const [ticketsResult] = await db.execute('SELECT COUNT(*) as total FROM tickets WHERE estado = "usado"');
    const totalTickets = ticketsResult[0].total;

    // Get total revenue
    const [revenueResult] = await db.execute('SELECT SUM(monto) as total FROM pagos WHERE estado = "completado"');
    const totalRevenue = revenueResult[0].total || 0;

    // Get total users
    const [usersResult] = await db.execute('SELECT COUNT(*) as total FROM usuarios WHERE activo = 1');
    const totalUsers = usersResult[0].total;

    res.json({
      success: true,
      data: {
        totalEvents,
        totalTickets,
        totalRevenue,
        totalUsers
      },
      message: 'Estadísticas del dashboard obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas del dashboard', error: error.message });
  }
};

// --- Reports Controller ---
const getReports = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    let query = '';
    let params = [];

    switch (type) {
      case 'sales':
        query = `
          SELECT
            DATE(p.fecha_pago) as fecha,
            e.nombre as evento,
            COUNT(t.id_ticket) as tickets,
            SUM(p.monto) as ingresos,
            pm.nombre as metodo_pago
          FROM pagos p
          LEFT JOIN compras c ON p.id_compra = c.id_compra
          LEFT JOIN detallescompra dc ON c.id_compra = dc.id_compra
          LEFT JOIN tickets t ON dc.id_detalle = t.id_detalle
          LEFT JOIN eventos e ON dc.id_tipo_entrada = e.id_evento
          LEFT JOIN metodos_pago pm ON p.id_metodo_pago = pm.id_metodo_pago
          WHERE p.estado = 'completado'
          ${startDate && endDate ? 'AND DATE(p.fecha_pago) BETWEEN ? AND ?' : ''}
          GROUP BY DATE(p.fecha_pago), e.nombre, pm.nombre
          ORDER BY fecha DESC
        `;
        if (startDate && endDate) params = [startDate, endDate];
        break;

      case 'expenses':
        query = `
          SELECT
            DATE(g.fecha_gasto) as fecha,
            cg.nombre as categoria,
            g.descripcion,
            g.monto,
            u.nombre as usuario
          FROM gastos g
          LEFT JOIN categorias_gasto cg ON g.id_categoria_gasto = cg.id_categoria_gasto
          LEFT JOIN usuarios u ON g.id_usuario = u.id_usuario
          ${startDate && endDate ? 'WHERE DATE(g.fecha_gasto) BETWEEN ? AND ?' : ''}
          ORDER BY g.fecha_gasto DESC
        `;
        if (startDate && endDate) params = [startDate, endDate];
        break;

      case 'events':
        query = `
          SELECT
            e.nombre,
            DATE(e.fecha) as fecha,
            e.capacidad,
            COUNT(t.id_ticket) as tickets_vendidos,
            ROUND((COUNT(t.id_ticket) / e.capacidad) * 100, 2) as ocupacion,
            COALESCE(SUM(p.monto), 0) as ingresos
          FROM eventos e
          LEFT JOIN detallescompra dc ON e.id_evento = dc.id_tipo_entrada
          LEFT JOIN tickets t ON dc.id_detalle = t.id_detalle AND t.estado = 'usado'
          LEFT JOIN compras c ON dc.id_compra = c.id_compra
          LEFT JOIN pagos p ON c.id_compra = p.id_compra AND p.estado = 'completado'
          ${startDate && endDate ? 'WHERE DATE(e.fecha) BETWEEN ? AND ?' : ''}
          GROUP BY e.id_evento, e.nombre, e.fecha, e.capacidad
          ORDER BY e.fecha DESC
        `;
        if (startDate && endDate) params = [startDate, endDate];
        break;

      default:
        return res.status(400).json({ success: false, message: 'Tipo de reporte no válido' });
    }

    const db = getDB();
    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows, message: 'Reporte generado exitosamente' });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboardStats,
  getReports
};