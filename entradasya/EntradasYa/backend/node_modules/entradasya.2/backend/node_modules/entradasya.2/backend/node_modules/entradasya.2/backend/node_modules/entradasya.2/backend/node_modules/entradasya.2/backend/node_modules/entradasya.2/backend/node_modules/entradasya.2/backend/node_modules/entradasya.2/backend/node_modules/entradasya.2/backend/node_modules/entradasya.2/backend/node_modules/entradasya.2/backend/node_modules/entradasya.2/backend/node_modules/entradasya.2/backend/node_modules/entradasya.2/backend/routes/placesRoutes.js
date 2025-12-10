const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ==================== OBTENER TODOS LOS LUGARES ====================
router.get('/', async (req, res) => {
    try {
        const pool = getDB();
        const [rows] = await pool.query(`
            SELECT 
                l.*, 
                COUNT(e.id_evento) as eventos_count
            FROM lugares l
            LEFT JOIN eventos e ON l.id_lugar = e.id_lugar
            GROUP BY l.id_lugar
            ORDER BY l.nombre_lugar ASC
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener lugares', 
            error: err.message 
        });
    }
});

// ==================== CREAR NUEVO LUGAR ====================
router.post('/', async (req, res) => {
    try {
        const pool = getDB();
        const { nombre_lugar, direccion, ciudad, pais, tipo_lugar, capacidad } = req.body;
        
        if (!nombre_lugar || !capacidad) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nombre y capacidad son requeridos' 
            });
        }

        const [result] = await pool.query(
            `INSERT INTO lugares (nombre_lugar, direccion, ciudad, pais, tipo_lugar, capacidad) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre_lugar, direccion || null, ciudad || null, pais || null, tipo_lugar || null, capacidad]
        );

        res.status(201).json({ 
            success: true, 
            id_lugar: result.insertId, 
            message: 'Lugar creado exitosamente' 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear lugar', 
            error: err.message 
        });
    }
});

// ==================== ACTUALIZAR LUGAR ====================
router.put('/:id', async (req, res) => {
    try {
        const pool = getDB();
        const { id } = req.params;
        const { nombre_lugar, direccion, ciudad, pais, tipo_lugar, capacidad } = req.body;

        await pool.query(
            `UPDATE lugares 
             SET nombre_lugar=?, direccion=?, ciudad=?, pais=?, tipo_lugar=?, capacidad=?
             WHERE id_lugar=?`,
            [nombre_lugar, direccion || null, ciudad || null, pais || null, tipo_lugar || null, capacidad, id]
        );

        res.json({ 
            success: true, 
            message: 'Lugar actualizado correctamente' 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar lugar', 
            error: err.message 
        });
    }
});

// ==================== ELIMINAR LUGAR ====================
router.delete('/:id', async (req, res) => {
    try {
        const pool = getDB();
        const { id } = req.params;

        // Verificar si el lugar está asociado a eventos
        const [eventos] = await pool.query(
            'SELECT COUNT(*) as count FROM eventos WHERE id_lugar = ?',
            [id]
        );

        if (eventos[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar el lugar porque está asociado a eventos' 
            });
        }

        await pool.query('DELETE FROM lugares WHERE id_lugar = ?', [id]);

        res.json({ 
            success: true, 
            message: 'Lugar eliminado correctamente' 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar lugar', 
            error: err.message 
        });
    }
});

module.exports = router;