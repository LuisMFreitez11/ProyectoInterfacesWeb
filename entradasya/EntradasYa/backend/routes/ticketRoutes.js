const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

// ==================== OBTENER TIPOS DE ENTRADA POR EVENTO ====================
router.get('/evento/:id_evento', async (req, res) => {
    try {
        const pool = getDB();
        const { id_evento } = req.params;
        
        const [rows] = await pool.query(
            'SELECT * FROM tiposentrada WHERE id_evento = ? ORDER BY precio DESC',
            [id_evento]
        );
        
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error obteniendo tipos de entrada:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener tipos de entrada', 
            error: err.message 
        });
    }
});

// ==================== CREAR NUEVO TIPO DE ENTRADA (ZONA) ====================
router.post('/', async (req, res) => {
    try {
        const pool = getDB();
        const { 
            id_evento, 
            nombre_tipo, 
            precio, 
            filas, 
            asientos_por_fila, 
            color 
        } = req.body;
        
        console.log('Creando zona con datos:', req.body);
        
        // Validaciones
        if (!id_evento || !nombre_tipo || precio === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos requeridos: id_evento, nombre_tipo, precio' 
            });
        }
        
        const cantidad_total = (filas || 10) * (asientos_por_fila || 10);
        
        const [result] = await pool.query(
            `INSERT INTO tiposentrada 
             (id_evento, nombre_tipo, precio, filas, asientos_por_fila, color, cantidad_total, cantidad_disponible) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_evento, 
                nombre_tipo, 
                precio, 
                filas || 10, 
                asientos_por_fila || 10, 
                color || '#007BFF', 
                cantidad_total, 
                cantidad_total
            ]
        );
        
        res.json({ 
            success: true, 
            message: 'Zona creada exitosamente',
            id_tipo: result.insertId 
        });
        
    } catch (err) {
        console.error('Error creando zona:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear zona', 
            error: err.message 
        });
    }
});

// ==================== ACTUALIZAR TIPO DE ENTRADA ====================
router.put('/:id_tipo', async (req, res) => {
    try {
        const pool = getDB();
        const { id_tipo } = req.params;
        const { 
            nombre_tipo, 
            precio, 
            filas, 
            asientos_por_fila, 
            color 
        } = req.body;
        
        console.log('Actualizando zona:', id_tipo, req.body);
        
        const cantidad_total = (filas || 10) * (asientos_por_fila || 10);
        
        await pool.query(
            `UPDATE tiposentrada 
             SET nombre_tipo = ?, precio = ?, filas = ?, asientos_por_fila = ?, color = ?, cantidad_total = ?
             WHERE id_tipo = ?`,
            [
                nombre_tipo, 
                precio, 
                filas || 10, 
                asientos_por_fila || 10, 
                color || '#007BFF', 
                cantidad_total,
                id_tipo
            ]
        );
        
        res.json({ 
            success: true, 
            message: 'Zona actualizada exitosamente'
        });
        
    } catch (err) {
        console.error('Error actualizando zona:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar zona', 
            error: err.message 
        });
    }
});

// ==================== ELIMINAR TIPO DE ENTRADA ====================
router.delete('/:id_tipo', async (req, res) => {
    try {
        const pool = getDB();
        const { id_tipo } = req.params;
        
        console.log('Eliminando zona:', id_tipo);
        
        // Verificar si hay asientos ocupados
        const [asientosOcupados] = await pool.query(
            'SELECT COUNT(*) as count FROM asientos WHERE id_tipo = ? AND ocupado = 1',
            [id_tipo]
        );
        
        if (asientosOcupados[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar, hay asientos ocupados en esta zona'
            });
        }
        
        // Eliminar asientos asociados
        await pool.query('DELETE FROM asientos WHERE id_tipo = ?', [id_tipo]);
        
        // Eliminar tipo de entrada
        await pool.query('DELETE FROM tiposentrada WHERE id_tipo = ?', [id_tipo]);
        
        res.json({ 
            success: true, 
            message: 'Zona eliminada exitosamente'
        });
        
    } catch (err) {
        console.error('Error eliminando zona:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar zona', 
            error: err.message 
        });
    }
});

// ==================== GENERAR ASIENTOS AUTOMÁTICAMENTE ====================
router.post('/:id_tipo/generar-asientos', async (req, res) => {
    try {
        const pool = getDB();
        const { id_tipo } = req.params;
        
        // Obtener información de la zona
        const [zona] = await pool.query(
            'SELECT * FROM tiposentrada WHERE id_tipo = ?',
            [id_tipo]
        );
        
        if (zona.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Zona no encontrada' 
            });
        }
        
        const tipoEntrada = zona[0];
        
        // Eliminar asientos existentes (opcional - comentar si no quieres regenerar)
        await pool.query('DELETE FROM asientos WHERE id_tipo = ?', [id_tipo]);
        
        // Generar asientos
        const asientos = [];
        for (let fila = 1; fila <= tipoEntrada.filas; fila++) {
            for (let numero = 1; numero <= tipoEntrada.asientos_por_fila; numero++) {
                asientos.push([id_tipo, fila, numero, 0]); // 0 = no ocupado
            }
        }
        
        // Insertar todos los asientos
        if (asientos.length > 0) {
            await pool.query(
                'INSERT INTO asientos (id_tipo, fila, numero, ocupado) VALUES ?',
                [asientos]
            );
        }
        
        res.json({ 
            success: true, 
            message: `Se generaron ${asientos.length} asientos`,
            asientos_generados: asientos.length
        });
        
    } catch (err) {
        console.error('Error generando asientos:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al generar asientos', 
            error: err.message 
        });
    }
});

module.exports = router;