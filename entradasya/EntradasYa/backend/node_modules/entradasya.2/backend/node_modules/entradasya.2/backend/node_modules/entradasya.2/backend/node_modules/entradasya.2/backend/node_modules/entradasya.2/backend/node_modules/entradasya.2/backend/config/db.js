// db.js (CORREGIDO)
const mysql = require('mysql2/promise');
require('dotenv').config(); // Asegura la carga de variables de entorno

let pool;

async function connectDB() {
    console.log("--- DEBUG DE CONEXIÓN DB ---");
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
    console.log("DB_DATABASE:", process.env.DB_DATABASE);
    console.log("----------------------------");

    try {
        // ⭐ ESTA SECCIÓN FALTABA Y CAUSABA EL ERROR DE ACCESO DENEGADO
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        // ⭐ Test de conexión: obtenemos una conexión para asegurar que funciona
        const connection = await pool.getConnection();
        connection.release(); 

        console.log('✅ Connected to MySQL database (POOL)');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        // El error 1045 es Access denied. Lo manejamos específicamente.
        if (error.errno === 1045) {
            console.error('Causa probable: Credenciales (Usuario/Contraseña) incorrectas. Verifique su archivo .env y la configuración de MySQL en XAMPP.');
        }
        process.exit(1);
    }
}

function getDB() {
    if (!pool) throw new Error("Database pool not initialized");
    return pool;
}

// 🔑 NUEVA FUNCIÓN: Envuelve la llamada pool.query
async function queryDB(sql, params) {
    if (!pool) throw new Error("Database pool not initialized. Call connectDB first.");
    
    // Ejecuta la consulta y retorna solo el resultado de las filas
    const [rows] = await pool.query(sql, params); 
    return rows;
}

// 🔑 MODIFICACIÓN DEL EXPORT
module.exports = { getDB, connectDB, queryDB };