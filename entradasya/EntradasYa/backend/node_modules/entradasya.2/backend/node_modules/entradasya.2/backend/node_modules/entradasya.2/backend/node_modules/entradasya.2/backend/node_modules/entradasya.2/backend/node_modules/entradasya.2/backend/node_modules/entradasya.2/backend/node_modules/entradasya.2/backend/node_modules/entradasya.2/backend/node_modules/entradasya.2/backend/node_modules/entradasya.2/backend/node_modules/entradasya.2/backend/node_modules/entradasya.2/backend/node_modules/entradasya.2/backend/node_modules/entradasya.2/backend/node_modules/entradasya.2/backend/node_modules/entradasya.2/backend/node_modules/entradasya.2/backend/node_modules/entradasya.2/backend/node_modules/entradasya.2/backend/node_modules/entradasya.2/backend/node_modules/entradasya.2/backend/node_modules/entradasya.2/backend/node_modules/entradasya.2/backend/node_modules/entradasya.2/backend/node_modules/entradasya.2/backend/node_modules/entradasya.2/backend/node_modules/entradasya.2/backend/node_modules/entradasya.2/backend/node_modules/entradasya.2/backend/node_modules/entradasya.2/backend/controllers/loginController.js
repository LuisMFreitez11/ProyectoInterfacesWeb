const { User } = require('../models/loginModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { Admin } = require('../models/adminModel');
const { getDB } = require('../config/db');

// Roles ID's
const ADMIN_ROLE_ID = 2;
const CONTADOR_ROLE_ID = 4;
const CLIENTE_ROLE_ID = 5; 

// ----------------------------------------------------------------------
// 1. REGISTER USUARIO NORMAL
// ----------------------------------------------------------------------
const register = async (req, res) => {
    try {
        const { nombre, email, password, apellido, telefono } = req.body;
        if (!nombre || !email || !password) {
            return res.status(400).json({ success: false, message: "Campos requeridos: nombre, email, password" });
        }

        const existing = await User.findByEmail(email);
        if (existing) return res.status(400).json({ success: false, message: "El email ya está registrado" });

        const hashed = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            nombre,
            apellido: apellido || null,
            email,
            contrasena_hash: hashed,
            telefono: telefono || null
        });

        res.json({ success: true, message: "Usuario registrado", data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al registrar", error: error.message });
    }
};

// ----------------------------------------------------------------------
// 2. LOGIN
// ----------------------------------------------------------------------
const login = async (req, res) => {
 try {
 const { email, password } = req.body;
 const user = await User.findByEmail(email); 

 if (!user) return res.status(401).json({ success: false, message: "Credenciales inválidas" });

 const valid = await user.comparePassword(password);
 if (!valid) return res.status(401).json({ success: false, message: "Credenciales inválidas" });

 // ⭐ CAMBIO CLAVE: SIEMPRE consulta la tabla de roles para obtener el más alto (menor ID)
 const db = getDB();
 const [rolesResult] = await db.execute(
`SELECT id_role FROM usuario_roles WHERE id_usuario = ? ORDER BY id_role ASC LIMIT 1`,
 [user.id_usuario]
 );

        let finalRoleId = null;
        if (rolesResult.length > 0) {
            // Aseguramos que el ID de rol sea un NÚMERO
            finalRoleId = parseInt(rolesResult[0].id_role, 10);
        } else {
            // Si el usuario no tiene roles asignados, usamos el id_rol de la tabla principal (con el id más bajo)
            finalRoleId = parseInt(user.id_rol, 10);
        }

        // Si finalRoleId es NaN o falla, lo manejamos.
        if (!finalRoleId) {
             console.error(`Usuario ${user.id_usuario} - ${user.email} sin rol asignado.`);
             return res.status(403).json({ success: false, message: "Usuario sin rol de acceso válido" });
        }
 const token = jwt.sign(
 { id: user.id_usuario, email: user.email, role: finalRoleId }, 
 JWT_SECRET, 
 { expiresIn: "24h" }
);
        
        // ... (El resto del código de respuesta es el mismo) ...

        res.json({
            success: true,
            message: "Login exitoso",
            data: {
                token,
                user: {
                    id: user.id_usuario,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    telefono: user.telefono,
                    email: user.email,
                    id_rol: finalRoleId 
                }
            }
        });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ success: false, message: "Error al iniciar sesión", error: error.message });
    }
};

// ----------------------------------------------------------------------
// 3. REGISTER ADMIN
// ----------------------------------------------------------------------
const registerAdminSecret = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const existing = await User.findByEmail(email);
        if (existing) return res.status(400).json({ success: false, message: "El email ya existe" });

        const hashed = await bcrypt.hash(password, 10);

        // 1. Crea el usuario principal
        const newUser = await User.create({ nombre, apellido: null, email, contrasena_hash: hashed, telefono: null });

        // 2. Asigna el Rol de Admin (2) a través de usuario_roles
        const db = getDB();
        await db.execute(`INSERT INTO usuario_roles (id_usuario, id_role) VALUES (?, ?)`, [newUser.id_usuario, ADMIN_ROLE_ID]);
        
        // 3. Asigna la tabla de admins (si es necesaria)
        await Admin.create({ id_usuario: newUser.id_usuario, nivel_acceso: 10 });

        res.json({ success: true, message: "Admin creado correctamente" });
    } catch (error) {
        console.error("Error al crear admin:", error);
        res.status(500).json({ success: false, message: "Error al crear admin", error: error.message });
    }
};

// ----------------------------------------------------------------------
// 4. REGISTER CONTADOR 
// ----------------------------------------------------------------------
const registerContadorSecret = async (req, res) => {
    try {
        const { nombre, apellido, email, password, telefono } = req.body;
        const existing = await User.findByEmail(email);
        if (existing) return res.status(400).json({ success: false, message: "El email ya existe" });

        const hashed = await bcrypt.hash(password, 10);

        // 1. Crea el usuario principal
        const newUser = await User.create({ nombre, apellido: apellido || null, email, contrasena_hash: hashed, telefono: telefono || null });

        // 2. Asigna el Rol de Contador (4) a través de usuario_roles
        const db = getDB();
        await db.execute(`INSERT INTO usuario_roles (id_usuario, id_role) VALUES (?, ?)`, [newUser.id_usuario, CONTADOR_ROLE_ID]);

        res.json({ success: true, message: "Contador creado correctamente" });
    } catch (error) {
        console.error("Error al crear contador:", error);
        res.status(500).json({ success: false, message: "Error al crear contador", error: error.message });
    }
};


// ----------------------------------------------------------------------
// 5. NUEVA FUNCIÓN: Crear Usuario por el Administrador (Soporta Múltiples Roles)
// ----------------------------------------------------------------------
const createUser = async (req, res) => {
    try {
        // Obtenemos id_rol del body, que puede ser 2, 3, 4, o 5
        const { nombre, email, password, apellido, telefono, id_rol } = req.body; 

        if (!nombre || !email || !password) {
            return res.status(400).json({ success: false, message: "Campos requeridos: nombre, email, password" });
        }

        const existing = await User.findByEmail(email);
        if (existing) return res.status(400).json({ success: false, message: "El email ya está registrado" });

        const hashed = await bcrypt.hash(password, 10);
        
        // 1. Crear el usuario en la tabla principal
        const newUser = await User.create({
            nombre,
            apellido: apellido || null,
            email,
            contrasena_hash: hashed,
            telefono: telefono || null,
            // Asigna el rol elegido (2, 3, 4, 5)
            id_rol: id_rol || CLIENTE_ROLE_ID 
        });

        // 2. Si se especificó un rol, lo guardamos en usuario_roles
        if (id_rol) {
             const db = getDB();
             // Borramos roles anteriores si existen (aunque debería ser un usuario nuevo)
             await db.execute(`DELETE FROM usuario_roles WHERE id_usuario = ?`, [newUser.id_usuario]);
             
             // Insertamos el nuevo rol asignado
             await db.execute(`INSERT INTO usuario_roles (id_usuario, id_role) VALUES (?, ?)`, 
                [newUser.id_usuario, id_rol]
             );
        }

        const { contrasena_hash, ...userSafeData } = newUser;

        res.json({ 
            success: true, 
            message: "Usuario creado exitosamente por el Administrador", 
            data: userSafeData
        });

    } catch (error) {
        console.error("Error al crear usuario desde el panel admin:", error);
        res.status(500).json({ success: false, message: "Error al crear usuario", error: error.message });
    }
};

module.exports = {
    register,
    login,
    registerAdminSecret,
    registerContadorSecret,
    createUser, 
};