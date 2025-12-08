const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// ==================== OBTENER TODOS LOS EVENTOS ====================
router.get('/', async (req, res) => {
    try {
        const pool = getDB();
        
        const [rows] = await pool.query(`
            SELECT 
                e.*,
                l.nombre_lugar AS lugar_nombre,
                GROUP_CONCAT(CONCAT(a.id_artista, '|', a.nombre, '|', IFNULL(a.apellido,'')) SEPARATOR '||') AS artistas_info_str 
            FROM eventos e
            LEFT JOIN lugares l ON e.id_lugar = l.id_lugar
            LEFT JOIN artistas_eventos ae ON ae.id_evento = e.id_evento
            LEFT JOIN artistas a ON a.id_artista = ae.id_artista
            GROUP BY e.id_evento
            ORDER BY e.fecha_inicio DESC
        `);

        // Procesar artistas
        const eventos = rows.map(e => {
            let artistasArray = [];
            if (e.artistas_info_str) {
                const artistasStr = e.artistas_info_str.split('||');
                artistasArray = artistasStr.map(info => {
                    const [id, nombre, apellido] = info.split('|');
                    return {
                        id_artista: parseInt(id),
                        nombre: nombre ? nombre.trim() : '',
                        apellido: apellido ? apellido.trim() : ''
                    };
                });
            }
            
            // Convertir artistas a array de IDs para el frontend
            const artistas_ids = artistasArray.map(a => a.id_artista);
            const artistas_nombres = artistasArray.map(a => `${a.nombre} ${a.apellido}`).join(', ');
            
            return { 
                ...e, 
                artistas: artistasArray,
                artistas_ids: artistas_ids,
                artistas_nombres: artistas_nombres
            };
        });

        res.json({ success: true, data: eventos });
    } catch (err) {
        console.error('Error al obtener eventos:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener eventos', 
            error: err.message 
        });
    }
});

// ==================== CREAR NUEVO EVENTO ====================
router.post('/', async (req, res) => {
    try {
        const pool = getDB();
        
        const { 
            nombre, 
            descripcion, 
            fecha_inicio, 
            fecha_fin, 
            capacidad_total, 
            estado, 
            id_lugar, 
            artistas_ids,
            imagen
        } = req.body;

        // Validaciones básicas
        if (!nombre || !fecha_inicio || !id_lugar) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos requeridos: nombre, fecha_inicio, id_lugar' 
            });
        }

        console.log('Creando evento con datos:', req.body);

        const [result] = await pool.query(
            `INSERT INTO eventos 
             (nombre, descripcion, fecha_inicio, fecha_fin, capacidad_total, estado, id_lugar, imagen, id_organizador)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre, 
                descripcion || '', 
                fecha_inicio, 
                fecha_fin || null, 
                capacidad_total || 1000, 
                estado || 'borrador', 
                id_lugar,
                imagen || null,
                1 // id_organizador (puedes obtener del usuario autenticado)
            ]
        );

        const id_evento = result.insertId;

        // Asignar artistas si se proporcionaron
        if (artistas_ids && artistas_ids.length > 0) {
            const values = artistas_ids.map(id => [id_evento, id]);
            await pool.query('INSERT INTO artistas_eventos (id_evento, id_artista) VALUES ?', [values]);
        }

        res.status(201).json({ 
            success: true, 
            message: 'Evento creado exitosamente',
            data: { id_evento } 
        });

    } catch (err) {
        console.error('Error al crear evento:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear evento', 
            error: err.message 
        });
    }
});

// ==================== OBTENER UN EVENTO POR ID ====================
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const pool = getDB();
        const { id } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                e.*,
                l.nombre_lugar AS lugar_nombre,
                GROUP_CONCAT(DISTINCT a.id_artista) AS artistas_ids
            FROM eventos e
            LEFT JOIN lugares l ON e.id_lugar = l.id_lugar
            LEFT JOIN artistas_eventos ae ON ae.id_evento = e.id_evento
            LEFT JOIN artistas a ON a.id_artista = ae.id_artista
            WHERE e.id_evento = ?
            GROUP BY e.id_evento
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Evento no encontrado' 
            });
        }

        const evento = rows[0];
        
        // Convertir artistas_ids de string a array
        if (evento.artistas_ids) {
            evento.artistas_ids = evento.artistas_ids.split(',').map(id => parseInt(id));
        } else {
            evento.artistas_ids = [];
        }

        res.json({ success: true, data: evento });

    } catch (err) {
        console.error('Error al obtener evento:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener evento', 
            error: err.message 
        });
    }
});

// ==================== ACTUALIZAR EVENTO ====================
router.put('/:id', async (req, res) => {
    try {
        const pool = getDB();
        const { id } = req.params;
        const { 
            nombre, 
            descripcion, 
            fecha_inicio, 
            fecha_fin, 
            capacidad_total, 
            estado, 
            id_lugar, 
            artistas_ids,
            imagen
        } = req.body;

        console.log('Actualizando evento', id, 'con datos:', req.body);

        // Actualizar evento
        await pool.query(
            `UPDATE eventos 
             SET nombre=?, descripcion=?, fecha_inicio=?, fecha_fin=?, capacidad_total=?, estado=?, id_lugar=?, imagen=?
             WHERE id_evento=?`,
            [
                nombre, 
                descripcion || '', 
                fecha_inicio, 
                fecha_fin || null, 
                capacidad_total || 1000, 
                estado || 'borrador', 
                id_lugar,
                imagen || null,
                id
            ]
        );

        // Actualizar artistas: eliminar antiguos y agregar nuevos
        await pool.query('DELETE FROM artistas_eventos WHERE id_evento = ?', [id]);
        
        if (artistas_ids && artistas_ids.length > 0) {
            const values = artistas_ids.map(aid => [id, aid]);
            await pool.query('INSERT INTO artistas_eventos (id_evento, id_artista) VALUES ?', [values]);
        }

        res.json({ 
            success: true, 
            message: 'Evento actualizado correctamente' 
        });

    } catch (err) {
        console.error('Error al actualizar evento:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar evento', 
            error: err.message 
        });
    }
});

// ==================== OBTENER ARTISTAS DE UN EVENTO ====================
router.get('/:id/artists', async (req, res) => {
    try {
        const pool = getDB();
        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT
                a.id_artista,
                a.nombre,
                a.apellido,
                a.pais_origen,
                a.genero,
                a.descripcion,
                a.imagen_url
            FROM artistas a
            INNER JOIN artistas_eventos ae ON a.id_artista = ae.id_artista
            WHERE ae.id_evento = ?
            ORDER BY a.nombre ASC
        `, [id]);

        res.json(rows);

    } catch (err) {
        console.error('Error al obtener artistas del evento:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener artistas del evento',
            error: err.message
        });
    }
});

// ==================== ELIMINAR EVENTO ====================
router.delete('/:id', async (req, res) => {
    try {
        const pool = getDB();
        const { id } = req.params;

        console.log('Eliminando evento:', id);

        // Verificar si tiene tipos de entrada (zonas)
        const [tipos] = await pool.query(
            'SELECT COUNT(*) as count FROM tiposentrada WHERE id_evento = ?',
            [id]
        );

        if (tipos[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el evento porque tiene zonas/entradas asociadas. Elimina las zonas primero.'
            });
        }

        // Eliminar asociaciones con artistas primero
        await pool.query('DELETE FROM artistas_eventos WHERE id_evento = ?', [id]);

        // Eliminar evento
        await pool.query('DELETE FROM eventos WHERE id_evento = ?', [id]);

        res.json({
            success: true,
            message: 'Evento eliminado correctamente'
        });

    } catch (err) {
        console.error('Error al eliminar evento:', err);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar evento',
            error: err.message
        });
    }
});

module.exports = router;
