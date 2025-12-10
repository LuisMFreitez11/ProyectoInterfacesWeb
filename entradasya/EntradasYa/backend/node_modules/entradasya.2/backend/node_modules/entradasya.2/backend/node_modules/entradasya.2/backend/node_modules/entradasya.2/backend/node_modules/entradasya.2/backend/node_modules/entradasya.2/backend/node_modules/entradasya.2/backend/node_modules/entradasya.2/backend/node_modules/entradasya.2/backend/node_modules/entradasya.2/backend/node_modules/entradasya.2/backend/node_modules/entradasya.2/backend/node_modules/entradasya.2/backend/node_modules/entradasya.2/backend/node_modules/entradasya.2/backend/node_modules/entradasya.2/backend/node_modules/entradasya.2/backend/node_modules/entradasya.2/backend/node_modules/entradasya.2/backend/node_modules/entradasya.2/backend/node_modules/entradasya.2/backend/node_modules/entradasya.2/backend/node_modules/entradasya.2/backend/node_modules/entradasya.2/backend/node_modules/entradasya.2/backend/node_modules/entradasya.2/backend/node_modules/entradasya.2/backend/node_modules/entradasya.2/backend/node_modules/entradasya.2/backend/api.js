// api.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

// Import modular routes
const loginRoutes = require('./routes/loginRoutes');
const entradasRoutes = require('./routes/entradasRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const compraRoutes = require('./routes/compraRoutes');
const pagosRoutes = require('./routes/pagosRoutes');
const gastosRoutes = require('./routes/gastosRoutes');
const movimientosContablesRoutes = require('./routes/movimientosContablesRoutes');
const conciliacionesBancariasRoutes = require('./routes/conciliacionesBancariasRoutes');
const adminRoutes = require('./routes/adminRoutes');
const usersRoutes = require('./routes/usersRoutes');
const contadorRoutes = require('./routes/contadorRoutes');
const placesRoutes = require('./routes/placesRoutes');
const artistsRoutes = require('./routes/artistsRoutes');
const ticketsRoutes = require('./routes/ticketRoutes');
const authRoutes = require('./routes/authRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
// 🔑 IMPORTACIÓN CRÍTICA AÑADIDA
const tiposEntradaRoutes = require('./routes/tiposEntradaRoutes'); 


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:8080', 
        'http://192.168.31.99:8080' 
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// 🟢 CORRECCIÓN PARA SERVIR ARCHIVOS SUBIDOS (UPLOADS)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// -------------------------------------------------------------

// 🔹 MOUNT ROUTES (Configuración Corregida)
app.use('/api/auth', loginRoutes);
app.use('/api/entradas', entradasRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/compras', compraRoutes);

// ✅ Montura principal y única para pagos
app.use('/api/pagos', pagosRoutes); 

app.use('/api/gastos', gastosRoutes);
app.use('/api/movimientos-contables', movimientosContablesRoutes);
app.use('/api/conciliaciones-bancarias', conciliacionesBancariasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/contador', contadorRoutes);
app.use('/api/tickets', ticketsRoutes);

// 🔑 MONTAJE CRÍTICO AÑADIDO (Esto soluciona el error 404)
app.use('/api/tiposEntrada', tiposEntradaRoutes);

app.use('/api/auth', authRoutes); 

// Rutas adicionales que montan routers existentes en nuevos prefijos (se mantienen las que no duplican)
app.use('/api/places', placesRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/ticket-types', entradasRoutes);
app.use('/api/expense-categories', gastosRoutes);

// 🔑 RUTA PARA REPORTES
app.use('/api/reports', reportesRoutes); 


// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'EntradasYA API - Backend Funcionando!' });
});

// 🔹 START SERVER
async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Archivos estáticos servidos desde: /uploads`);
    });
}

startServer().catch(console.error);