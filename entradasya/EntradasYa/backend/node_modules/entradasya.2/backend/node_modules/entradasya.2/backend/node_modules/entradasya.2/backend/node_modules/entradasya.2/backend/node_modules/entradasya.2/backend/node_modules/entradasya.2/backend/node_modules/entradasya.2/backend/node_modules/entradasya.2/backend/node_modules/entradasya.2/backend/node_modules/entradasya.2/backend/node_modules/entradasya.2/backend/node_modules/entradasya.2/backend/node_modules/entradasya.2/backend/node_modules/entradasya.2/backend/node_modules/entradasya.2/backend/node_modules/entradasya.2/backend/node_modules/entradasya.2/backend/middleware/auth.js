const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token de acceso requerido" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: "Token inválido" });
    }
    req.user = user;
    next();
  });
};

/// Authorization Middleware (CORREGIDO)
const authorizeRoles = (...roles) => {
    
    // 💥 CORRECCIÓN CRUCIAL: Usamos .flat() para aplanar el array de roles.
    // Esto convierte [[1, 2, 3, 5]] en [1, 2, 3, 5].
    const allowedRoles = roles.flat().map((role) => parseInt(role));

  return (req, res, next) => {
    // 1. Obtener el rol (del JWT: "role": 5)
    const userRoleValue = req.user.role;

    // 2. Convertir el rol del usuario a un número entero
    const userRole = parseInt(userRoleValue, 10);

    // 3. Verificar si el rol es válido y si está en la lista permitida
    if (!req.user || isNaN(userRole) || !allowedRoles.includes(userRole)) {
      
      // --- BLOQUE DE DEBUGGING (puedes quitarlo cuando funcione) ---
      console.error("--- Error de Autorización [FIXED CHECK] ---");
      console.error("Roles Permitidos (Aplanados):", allowedRoles);
      console.error("Rol del Usuario (Convertido a Int):", userRole);
      // -----------------------------------------------------------
      
      return res
        .status(403)
        .json({
          success: false,
          message: "Acceso denegado: rol insuficiente. Rol requerido: " + allowedRoles.join(', '),
        });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles, JWT_SECRET };