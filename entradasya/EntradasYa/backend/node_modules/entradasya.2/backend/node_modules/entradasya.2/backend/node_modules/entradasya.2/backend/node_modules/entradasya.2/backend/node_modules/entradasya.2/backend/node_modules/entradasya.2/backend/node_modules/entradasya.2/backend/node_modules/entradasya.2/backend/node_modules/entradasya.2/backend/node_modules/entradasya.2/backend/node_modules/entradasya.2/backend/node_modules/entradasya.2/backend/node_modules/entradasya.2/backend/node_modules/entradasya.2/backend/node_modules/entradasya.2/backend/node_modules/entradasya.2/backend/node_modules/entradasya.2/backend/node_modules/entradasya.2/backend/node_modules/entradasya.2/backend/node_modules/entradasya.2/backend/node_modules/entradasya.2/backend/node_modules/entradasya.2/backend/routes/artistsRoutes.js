const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ==================== OBTENER TODOS LOS ARTISTAS ====================
router.get('/', async (req, res) => {
    try {
        const pool = getDB();
        const [rows] = await pool.query(`
            SELECT 
                a.*, 
                COUNT(ae.id_evento) as eventos_count
            FROM artistas a
            LEFT JOIN artistas_eventos ae ON a.id_artista = ae.id_artista
            GROUP BY a.id_artista
            ORDER BY a.nombre ASC
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener artistas', 
            error: err.message 
        });
    }
});

// ==================== CREAR NUEVO ARTISTA ====================
router.post('/', async (req, res) => {
    try {
        const pool = getDB();
        const { nombre, apellido, pais_origen, descripcion, genero, imagen_url } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ 
                success: false, 
                message: 'El nombre es requerido' 
            });
        }

        const [result] = await pool.query(
            `INSERT INTO artistas (nombre, apellido, pais_origen, descripcion, genero, imagen_url) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, apellido || null, pais_origen || null, descripcion || null, genero || null, imagen_url || null]
        );

        res.status(201).json({ 
            success: true, 
            id_artista: result.insertId, 
            message: 'Artista creado exitosamente' 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear artista', 
            error: err.message 
        });
    }
});

// ==================== ACTUALIZAR ARTISTA ====================
router.put('/:id', async (req, res) => {
    try {
        const pool = getDB();
        const { id } = req.params;
        const { nombre, apellido, pais_origen, descripcion, genero, imagen_url } = req.body;

        await pool.query(
            `UPDATE artistas 
             SET nombre=?, apellido=?, pais_origen=?, descripcion=?, genero=?, imagen_url=?
             WHERE id_artista=?`,
            [nombre, apellido || null, pais_origen || null, descripcion || null, genero || null, imagen_url || null, id]
        );

        res.json({ 
            success: true, 
            message: 'Artista actualizado correctamente' 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar artista', 
            error: err.message 
        });
    }
});

// ==================== ELIMINAR ARTISTA ====================
router.delete('/:id', async (req, res) => {
    try {
        const pool = getDB();
        const { id } = req.params;

        // Verificar si el artista está asociado a eventos
        const [eventos] = await pool.query(
            'SELECT COUNT(*) as count FROM artistas_eventos WHERE id_artista = ?',
            [id]
        );

        if (eventos[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar el artista porque está asociado a eventos' 
            });
        }

        await pool.query('DELETE FROM artistas WHERE id_artista = ?', [id]);

        res.json({ 
            success: true, 
            message: 'Artista eliminado correctamente' 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar artista', 
            error: err.message 
        });
    }
});

module.exports = router;