// controllers/compraController.js

const { getDB } = require('../config/db'); 
const Compra = require('../models/CompraModel');
const CompraDetalle = require('../models/CompraDetalleModel');

// Función auxiliar: Genera un token QR único
const generarQRToken = (id_compra, index) => {
    const baseToken = `ORD${id_compra}DET${index}`;
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${baseToken}-${timestamp}${random}`.toUpperCase();
};

/**
 * Registra la Compra, el Pago y el Detalle en una única transacción de BD.
 */
exports.registrarCompraCompleta = async (req, res) => {
    const { 
        id_usuario, 
        entradas_detalle, 
        pago,          
        total_compra,    
        notas = null
    } = req.body;
    
    let connection; 
    
    try {
        // 1. OBTENER EL POOL DE CONEXIONES Y LA CONEXIÓN
        const dbPool = getDB(); 
        connection = await dbPool.getConnection(); 

        await connection.beginTransaction(); 
        
        // --- PASO A: REGISTRAR EN LA TABLA 'compras' ---
        const compraData = {
            id_usuario: id_usuario,
            total: total_compra,
            estado: 'pendiente', 
            notas: notas
        };
        const nuevaCompra = await Compra.create(compraData, connection);
        const id_compra = nuevaCompra.id_compra;
        
        // --- PASO B: REGISTRAR EN LA TABLA 'pagos' ---
        const estadoPago = (pago.id_metodo === 3) ? 'confirmado' : 'iniciado'; 
        
        await connection.execute(
            'INSERT INTO pagos (id_compra, id_metodo, monto, estado, referencia_proveedor) VALUES (?, ?, ?, ?, ?)',
            [id_compra, pago.id_metodo, total_compra, estadoPago, pago.referencia_proveedor || null]
        );

        // --- PASO C: REGISTRAR EN LA TABLA 'compra_detalle' ---
        let primerQrToken = null; 
        
        const detallesParaInsertar = entradas_detalle.map((detalle, index) => {
            const qr_token = generarQRToken(id_compra, index + 1);
            if (index === 0) primerQrToken = qr_token;
            
            return {
                id_compra: id_compra,
                id_tipo: detalle.id_tipo, 
                // 🚀 CORRECCIÓN: Se fija la cantidad a 1, ya que cada objeto representa una entrada individual.
                cantidad: 1, 
                // Se eliminaron los '|| null' de las propiedades obligatorias
                precio_unit: detalle.precio_unit,
                subtotal: detalle.subtotal, 
                qr_token: qr_token
            };
        });
        
        // Aquí estaba el error en el log, ahora se enviará la 'cantidad' correcta.
        await CompraDetalle.bulkCreate(detallesParaInsertar, connection); 

        // 2. CONFIRMAR TRANSACCIÓN
        await connection.commit(); 
        
        // 3. Respuesta de éxito
        res.status(201).json({ 
            success: true, 
            message: 'Transacción completada.',
            transactionId: id_compra,
            qrToken: primerQrToken 
        });

    } catch (error) {
        // 4. REVERTIR TRANSACCIÓN EN CASO DE ERROR
        if (connection) {
            await connection.rollback(); 
        }
        
        console.error('Error durante la transacción de compra:', error);
        // Si el error es una violación de NOT NULL, puedes manejarlo específicamente
        let errorMessage = 'Error al registrar la compra. Los datos fueron revertidos.';
        if (error.code === 'ER_BAD_NULL_ERROR' || error.errno === 1048) {
             errorMessage = "Error de datos: una columna obligatoria no fue proporcionada (ej. id_tipo, precio_unit).";
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage, 
            error: error.message 
        });
    } finally {
        // 5. Liberar la conexión
        if (connection) {
            connection.release();
        }
    }
};