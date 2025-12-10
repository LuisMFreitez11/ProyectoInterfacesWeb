const crypto = require('crypto'); // Usamos crypto para generar UUIDs si es necesario

function generarTokenDeCompra(datos, esTokenFinal = false) {
    const jsonString = JSON.stringify(datos);
    
    // Codificar a Base64
    const base64Token = Buffer.from(jsonString).toString('base64');
    
    if (esTokenFinal) {
        // Token final para el QR (codificación limpia)
        return base64Token;
    } else {
        // Token para el campo 'qr_token' en la tabla 'compra_detalle'
        // Es mejor usar un UUID único para la BD.
        return crypto.randomUUID(); 
    }
}

module.exports = {
    generarTokenDeCompra
};