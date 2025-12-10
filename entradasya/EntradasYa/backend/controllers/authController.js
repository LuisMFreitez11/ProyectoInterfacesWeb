// controllers/authController.js

const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db'); // Para acceder a la base de datos
// Asegúrate de que tienes bcrypt para verificar contraseñas si las estás hasheando

/**
 * Función para generar el Token Web JSON (JWT)
 */
const generateAccessToken = (user) => {
    // ⚠️ Usa la misma clave secreta definida en tu .env para JWT_SECRET
    return jwt.sign(
        user, 
        process.env.JWT_SECRET, // ¡DEBE SER LA CLAVE CORRECTA!
        { expiresIn: '1h' } // Token válido por 1 hora
    );
};

/**
 * Lógica para verificar credenciales y generar el token.
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    const dbPool = getDB();
    let connection;

    try {
        connection = await dbPool.getConnection();

        // 1. Buscar al usuario por email
        const [users] = await connection.execute(
            `SELECT id_usuario, email, password, rol FROM usuarios WHERE email = ?`, 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas: Usuario no encontrado.' });
        }

        const user = users[0];

        // 2. Verificar la contraseña
        // 🚨 SI USAS HASHING (bcrypt), aquí deberías usar una función de comparación:
        // const passwordMatch = await bcrypt.compare(password, user.password);
        
        // 🚨 TEMPORAL: Si NO usas hashing, verifica directamente:
        const passwordMatch = (password === user.password); 

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas: Contraseña incorrecta.' });
        }

        // 3. Generar el payload (información mínima del usuario en el token)
        const payload = { 
            id: user.id_usuario, 
            email: user.email, 
            rol: user.rol 
        };

        const token = generateAccessToken(payload);

        // 4. Éxito: Enviar el token y la información básica
        res.json({
            success: true,
            message: 'Inicio de sesión exitoso.',
            token: token,
            user: payload
        });

    } catch (error) {
        console.error('Error durante el proceso de login:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    login
};