// Este archivo contiene tu lógica de peticiones HTTP (fetch)

/**
 * Función base para realizar peticiones fetch con autenticación.
 * Asegura que el token JWT sea incluido en la cabecera Authorization.
 */
export async function authFetch(path, options = {}) {
    // 🚨 ÚNICO CAMBIO: Usar la clave 'userToken' que sabemos que funciona en otros módulos 🚨
    const token = localStorage.getItem('userToken'); 
    
    // 1. Inicializa las cabeceras con las opciones que vienen del exterior
    const headers = options.headers ? { ...options.headers } : {};

    // 2. 🔑 Añade el Token JWT si existe
    if (token) {
        // Formato esperado por el middleware de Express: "Bearer <token>"
        headers['Authorization'] = `Bearer ${token}`; 
    }
    
    // 3. 📝 Asegura Content-Type: application/json si se envía un cuerpo JSON
    if (options.body && typeof options.body === 'object' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
        // Si el cuerpo es un objeto, lo serializamos a JSON string
        options.body = JSON.stringify(options.body); 
    }

    try {
        // La URL base (http://localhost:3000) es necesaria para que funcione
        const res = await fetch(`http://localhost:3000${path}`, { 
            ...options, 
            headers 
        });
        return res;
    } catch (error) {
        // Captura errores de red (ej. servidor apagado)
        console.error("Error de red al conectar con el backend:", error);
        return { 
            ok: false, 
            status: 503, 
            json: async () => ({ 
                success: false, 
                message: "Fallo en la conexión con el servidor (503 Service Unavailable)" 
            }) 
        };
    }
}

/**
 * Realiza una petición usando autenticación y parsea la respuesta JSON.
 */
export async function fetchJson(path, options = {}) {
    const res = await authFetch(path, options);
    
    // Si la respuesta es 204 No Content, o similar, devolvemos sin JSON
    if (res.status === 204 || res.headers.get('content-length') === '0') {
        return { ok: res.ok, status: res.status, success: true, message: "Operación exitosa sin contenido." };
    }

    try {
        // Intentamos leer el cuerpo JSON
        const json = await res.json().catch(() => ({}));
        
        // Si la respuesta no es OK (ej. 401, 500) pero tiene JSON, lo devolvemos
        if (!res.ok) {
            console.error(`Error ${res.status} al procesar ${path}:`, json);
        }
        
        return { ok: res.ok, status: res.status, ...json };
        
    } catch (e) {
        // Esto captura errores si el servidor no devuelve JSON válido (raro, pero sucede)
        console.error("Error al parsear la respuesta del servidor:", e);
        return { ok: res.ok, status: res.status, success: false, message: `Error ${res.status}: Respuesta no válida.` };
    }
}