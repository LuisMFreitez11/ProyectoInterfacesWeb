const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Authorization Middleware
const authorizeRoles = (...roles) => {
return (req, res, next) => {
    // 💥 APLICAR CORRECCIÓN: Parsear el rol a entero antes de comparar
    const userRole = parseInt(req.user.role);

if (!req.user || !roles.includes(userRole)) {
 return res.status(403).json({ success: false, message: 'Acceso denegado: rol insuficiente' });
 }
 next();
};
}

module.exports = { authenticateToken, authorizeRoles, JWT_SECRET };
