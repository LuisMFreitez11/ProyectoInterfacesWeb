// routes/tiposEntradaRoutes.js
const express = require('express');
const router = express.Router();

// VERSION SIMPLIFICADA Y FUNCIONAL
// Importar mysql2 directamente
const mysql = require('mysql2');

// Configuración de conexión (AJUSTA ESTOS VALORES)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // tu usuario de MySQL
  password: '', // tu contraseña de MySQL
  database: 'entradasya',
  port: 3306 // puerto por defecto de MySQL
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL para tiposEntradaRoutes');
});

// Función helper para ejecutar consultas
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// Obtener tipos de entrada por evento
router.get('/evento/:id_evento', async (req, res) => {
  try {
    const { id_evento } = req.params;
    const sql = `
      SELECT * FROM tiposentrada 
      WHERE id_evento = ? 
      ORDER BY precio DESC
    `;
    
    const rows = await query(sql, [id_evento]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error("Error obteniendo tipos entrada:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo zonas del evento"
    });
  }
});

// Obtener todos los tipos de entrada
router.get('/', async (req, res) => {
  try {
    const sql = 'SELECT * FROM tiposentrada ORDER BY id_evento, precio DESC';
    const rows = await query(sql);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error("Error obteniendo tipos entrada:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo tipos de entrada"
    });
  }
});

// Obtener un tipo de entrada por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT * FROM tiposentrada WHERE id_tipo = ?';
    
    const rows = await query(sql, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de entrada no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
    
  } catch (error) {
    console.error("Error obteniendo tipo entrada:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo tipo de entrada"
    });
  }
});

// Crear tipo de entrada
router.post('/', async (req, res) => {
  try {
    const {
      id_evento,
      nombre_tipo,
      precio,
      filas = 10,
      asientos_por_fila = 10,
      color = '#007BFF',
      zona = 'General'
    } = req.body;

    // Validaciones básicas
    if (!id_evento || !nombre_tipo || precio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: id_evento, nombre_tipo y precio son obligatorios'
      });
    }

    const cantidad_total = filas * asientos_por_fila;
    
    const sql = `
      INSERT INTO tiposentrada 
      (id_evento, nombre_tipo, precio, filas, asientos_por_fila, color, zona, cantidad_total, cantidad_disponible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      id_evento,
      nombre_tipo,
      precio,
      filas,
      asientos_por_fila,
      color,
      zona,
      cantidad_total,
      cantidad_total  // Inicialmente todos disponibles
    ]);

    // Obtener el tipo de entrada recién creado
    const newRow = await query(
      'SELECT * FROM tiposentrada WHERE id_tipo = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Zona creada exitosamente',
      data: newRow[0]
    });

  } catch (error) {
    console.error("Error creando tipo de entrada:", error);
    res.status(500).json({
      success: false,
      message: "Error creando zona: " + error.message
    });
  }
});

// Actualizar tipo de entrada
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_tipo,
      precio,
      filas,
      asientos_por_fila,
      color,
      zona
    } = req.body;

    // Verificar si existe
    const existing = await query(
      'SELECT * FROM tiposentrada WHERE id_tipo = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Zona no encontrada'
      });
    }

    const tipoActual = existing[0];
    
    // Calcular nueva cantidad total si cambian filas o asientos_por_fila
    const nuevasFilas = filas || tipoActual.filas;
    const nuevosAsientosPorFila = asientos_por_fila || tipoActual.asientos_por_fila;
    const nuevaCantidadTotal = nuevasFilas * nuevosAsientosPorFila;
    
    // Ajustar cantidad_disponible si cambia la capacidad
    let nuevaCantidadDisponible = tipoActual.cantidad_disponible;
    if (nuevaCantidadTotal !== tipoActual.cantidad_total) {
      const diferencia = nuevaCantidadTotal - tipoActual.cantidad_total;
      nuevaCantidadDisponible = Math.max(0, tipoActual.cantidad_disponible + diferencia);
    }

    const sql = `
      UPDATE tiposentrada SET
        nombre_tipo = ?,
        precio = ?,
        filas = ?,
        asientos_por_fila = ?,
        color = ?,
        zona = ?,
        cantidad_total = ?,
        cantidad_disponible = ?
      WHERE id_tipo = ?
    `;
    
    await query(sql, [
      nombre_tipo || tipoActual.nombre_tipo,
      precio !== undefined ? precio : tipoActual.precio,
      nuevasFilas,
      nuevosAsientosPorFila,
      color || tipoActual.color,
      zona || tipoActual.zona,
      nuevaCantidadTotal,
      nuevaCantidadDisponible,
      id
    ]);

    // Obtener el tipo de entrada actualizado
    const updated = await query(
      'SELECT * FROM tiposentrada WHERE id_tipo = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Zona actualizada exitosamente',
      data: updated[0]
    });

  } catch (error) {
    console.error("Error actualizando tipo de entrada:", error);
    res.status(500).json({
      success: false,
      message: "Error actualizando zona: " + error.message
    });
  }
});

// Eliminar tipo de entrada
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const existing = await query(
      'SELECT * FROM tiposentrada WHERE id_tipo = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Zona no encontrada'
      });
    }

    // Primero verificar si hay asientos ocupados
    const asientosOcupados = await query(
      'SELECT COUNT(*) as count FROM asientos WHERE id_tipo = ? AND ocupado = 1',
      [id]
    );

    if (asientosOcupados[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la zona porque tiene asientos ocupados'
      });
    }

    // Eliminar asientos relacionados
    await query('DELETE FROM asientos WHERE id_tipo = ?', [id]);

    // Luego eliminar el tipo de entrada
    await query('DELETE FROM tiposentrada WHERE id_tipo = ?', [id]);

    res.json({
      success: true,
      message: 'Zona eliminada exitosamente'
    });

  } catch (error) {
    console.error("Error eliminando tipo de entrada:", error);
    res.status(500).json({
      success: false,
      message: "Error eliminando zona: " + error.message
    });
  }
});

// Generar asientos para un tipo de entrada
router.post('/:id/generar-asientos', async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.body;

    // Obtener información del tipo de entrada
    const tipoRows = await query(
      'SELECT * FROM tiposentrada WHERE id_tipo = ?',
      [id]
    );

    if (tipoRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Zona no encontrada'
      });
    }

    const tipo = tipoRows[0];

    // Verificar si ya existen asientos
    const asientosExistentes = await query(
      'SELECT COUNT(*) as count FROM asientos WHERE id_tipo = ?',
      [id]
    );

    if (asientosExistentes[0].count > 0 && !force) {
      return res.status(400).json({
        success: false,
        message: 'Ya existen asientos para esta zona. Use force=true para regenerar.'
      });
    }

    // Eliminar asientos existentes si se fuerza
    if (force && asientosExistentes[0].count > 0) {
      await query('DELETE FROM asientos WHERE id_tipo = ?', [id]);
    }

    // Generar nuevos asientos
    const asientos = [];
    for (let fila = 1; fila <= tipo.filas; fila++) {
      for (let numero = 1; numero <= tipo.asientos_por_fila; numero++) {
        // Insertar cada asiento individualmente
        await query(
          'INSERT INTO asientos (id_tipo, fila, numero, ocupado) VALUES (?, ?, ?, ?)',
          [id, fila, numero, 0]
        );
      }
    }

    // Contar cuántos asientos se generaron
    const totalAsientos = tipo.filas * tipo.asientos_por_fila;

    res.json({
      success: true,
      message: `Se generaron ${totalAsientos} asientos`,
      generated: totalAsientos
    });

  } catch (error) {
    console.error("Error generando asientos:", error);
    res.status(500).json({
      success: false,
      message: "Error generando asientos: " + error.message
    });
  }
});

// Obtener asientos por tipo de entrada
router.get('/:id/asientos', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT * FROM asientos 
      WHERE id_tipo = ? 
      ORDER BY fila, numero
    `;
    
    const rows = await query(sql, [id]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error("Error obteniendo asientos:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo asientos"
    });
  }
});

// Obtener estadísticas de ocupación por evento
router.get('/evento/:id_evento/ocupacion', async (req, res) => {
  try {
    const { id_evento } = req.params;
    
    // Obtener todos los tipos de entrada del evento
    const tipos = await query(
      'SELECT * FROM tiposentrada WHERE id_evento = ?',
      [id_evento]
    );
    
    const estadisticas = [];
    let totalAsientos = 0;
    let totalDisponibles = 0;
    
    for (const tipo of tipos) {
      // Contar asientos ocupados para este tipo
      const ocupados = await query(
        'SELECT COUNT(*) as count FROM asientos WHERE id_tipo = ? AND ocupado = 1',
        [tipo.id_tipo]
      );
      
      const total = tipo.filas * tipo.asientos_por_fila;
      const ocupadosCount = ocupados[0].count;
      const disponibles = total - ocupadosCount;
      
      estadisticas.push({
        id_tipo: tipo.id_tipo,
        nombre_tipo: tipo.nombre_tipo,
        color: tipo.color,
        total_asientos: total,
        asientos_ocupados: ocupadosCount,
        asientos_disponibles: disponibles,
        porcentaje_ocupacion: total > 0 ? (ocupadosCount / total * 100).toFixed(2) : 0
      });
      
      totalAsientos += total;
      totalDisponibles += disponibles;
    }
    
    res.json({
      success: true,
      data: estadisticas,
      resumen: {
        total_asientos: totalAsientos,
        total_disponibles: totalDisponibles,
        total_ocupados: totalAsientos - totalDisponibles,
        porcentaje_ocupacion_total: totalAsientos > 0 ? 
          ((totalAsientos - totalDisponibles) / totalAsientos * 100).toFixed(2) : 0
      }
    });
    
  } catch (error) {
    console.error("Error obteniendo estadísticas de ocupación:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas de ocupación"
    });
  }
});

module.exports = router;