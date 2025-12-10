const { Event } = require('../models/eventosModel');

// Obtener todos los eventos
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Obtener evento por ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Crear evento
const createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);
    res.status(201).json({ success: true, data: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Actualizar evento
const updateEvent = async (req, res) => {
  try {
    const updated = await Event.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    res.json({ success: true, message: 'Evento actualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Eliminar evento
const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    res.json({ success: true, message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
