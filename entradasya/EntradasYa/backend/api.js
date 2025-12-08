const express = require('express');
const cors = require('cors');
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
const reportesRoutes = require('./routes/reportesRoutes'); // Importar el archivo de reportes
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:8080', // Para cuando trabajas directamente en el PC
        'http://192.168.31.99:8080' // Para cuando accedes desde el iPhone o la IP de la red
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// 🔹 MOUNT ROUTES
app.use('/api/auth', loginRoutes); // Usamos loginRoutes para /api/auth (debe tener el /login, /register, etc)
app.use('/api/entradas', entradasRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/pagos', pagosRoutes); // ÚNICA INSTANCIA
app.use('/api/gastos', gastosRoutes);
app.use('/api/movimientos-contables', movimientosContablesRoutes);
app.use('/api/conciliaciones-bancarias', conciliacionesBancariasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/contador', contadorRoutes);
app.use('/api/tickets', ticketsRoutes);

// Montar pagosRoutes también en /api para que las rutas definidas como '/payments' y '/payment-methods'
// queden disponibles en /api/payments y /api/payment-methods (coincide con el frontend)
app.use('/api', pagosRoutes);

// Usamos authRoutes para otros endpoints de autenticación, si son diferentes a loginRoutes
app.use('/api/auth', authRoutes); 

// Rutas adicionales que montan routers existentes en nuevos prefijos
app.use('/api/places', placesRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/ticket-types', entradasRoutes);
app.use('/api/payment-methods', pagosRoutes);
app.use('/api/expense-categories', gastosRoutes);

// 🔑 NUEVA RUTA PARA REPORTES, usando el mismo prefijo que en Vue: /api/reports
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
    });
}

startServer().catch(console.error);