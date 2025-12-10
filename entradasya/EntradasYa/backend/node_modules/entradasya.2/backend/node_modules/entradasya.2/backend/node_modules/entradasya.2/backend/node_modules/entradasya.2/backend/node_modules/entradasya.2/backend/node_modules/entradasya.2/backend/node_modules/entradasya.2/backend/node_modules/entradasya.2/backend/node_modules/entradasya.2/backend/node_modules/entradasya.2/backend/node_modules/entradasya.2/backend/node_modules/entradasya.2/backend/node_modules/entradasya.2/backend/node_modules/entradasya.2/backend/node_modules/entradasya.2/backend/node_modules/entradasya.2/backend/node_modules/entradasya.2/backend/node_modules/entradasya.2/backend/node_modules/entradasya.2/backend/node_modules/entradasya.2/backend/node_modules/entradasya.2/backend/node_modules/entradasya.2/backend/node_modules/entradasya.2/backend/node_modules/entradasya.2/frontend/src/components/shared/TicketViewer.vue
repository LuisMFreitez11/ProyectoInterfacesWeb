<template>
    <div class="ticket-viewer-container container my-5">
        <div class="card p-5 shadow-lg mx-auto" style="max-width: 500px; border-top: 5px solid #ff6b00;">
            <h1 class="text-center text-primary mb-4">Ticket Digital</h1>
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Verificando token de seguridad...</p>
            </div>
            <div v-else-if="error" class="alert alert-danger text-center">
                <h4>Token Inválido</h4>
                <p>{{ error }}</p>
                <p class="mt-3 small">Asegúrese de que el QR fue escaneado correctamente.</p>
            </div>
            <div v-else-if="ticketData" class="ticket-details">
                <h2 class="mb-3">{{ ticketData.nombre_evento }}</h2>
                <hr>
                <p><strong>ID Transacción:</strong> <span class="text-success">{{ ticketData.id_pago }}</span></p>
                <p><strong>Zona:</strong> {{ ticketData.tipo_entrada }}</p>
                <p><strong>Monto Unitario:</strong> {{ formatPrice(ticketData.precio_unit) }} VES</p>
                <p><strong>Asientos:</strong> {{ ticketData.asiento }}</p>
                <p><strong>Monto Total Transacción:</strong> <span class="text-success">{{ formatPrice(ticketData.monto_total) }} VES</span></p>
                <hr>
                <div class="text-center mt-4 p-3 bg-light rounded">
                    <h5 class="text-warning">ESTADO: VALIDACIÓN PENDIENTE</h5>
                    <p class="small mb-0">Presente este código para el canje.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TicketViewer',
    data() {
        return {
            ticketData: null,
            loading: true,
            error: null,
        };
    },
    mounted() {
        this.loadTicketFromToken();
    },
    methods: {
        loadTicketFromToken() {
            const tokenBase64 = this.$route.query.token;

            if (!tokenBase64) {
                this.error = "No se encontró el token de seguridad en la URL.";
                this.loading = false;
                return;
            }

            try {
                // 1. Limpieza y preparación para Base64 (maneja URL-Safe y relleno)
                let safeBase64 = tokenBase64.replace(/-/g, '+').replace(/_/g, '/');
                while (safeBase64.length % 4) {
                    safeBase64 += '=';
                }

                // 2. Decodificar el Base64
                const qrTokenSimple = atob(safeBase64);
                console.log("Token Decodificado (simple):", qrTokenSimple);

                // 3. Llamar al método fetchTicketDetails
                this.fetchTicketDetails(qrTokenSimple);

            } catch (e) {
                console.error("Error al decodificar el token:", e);
                this.error = "Error Crítico: El token QR no tiene el formato Base64 esperado. Contacte a soporte.";
                this.loading = false;
            }
        },
        
        async fetchTicketDetails(token) {
            this.loading = true;
            this.error = null;
            
            // 🚀 CORRECCIÓN CLAVE: La URL apunta explícitamente al puerto 5000 del backend
            const BACKEND_URL = 'http://192.168.31.99:3000'; 
            const API_ENDPOINT = `${BACKEND_URL}/api/tickets/details?qr_token=${token}`;
            
            console.log("Intentando llamar a:", API_ENDPOINT);

            try {
                const response = await fetch(API_ENDPOINT); 

                if (!response.ok) {
                    // Si el estado HTTP no es 200, intentamos leer el JSON de error
                    const errorData = await response.json().catch(() => ({ 
                        message: 'Error de red o servidor no responde correctamente. (Verifique que Express esté activo en 5000)' 
                    }));
                    throw new Error(errorData.message || 'Error al buscar el ticket.');
                }
                
                this.ticketData = await response.json(); 
                console.log("Ticket cargado con éxito:", this.ticketData);

            } catch (e) {
                console.error("Error al obtener los detalles del ticket:", e);
                this.error = e.message || "Error de red: Verifique que el servidor Node.js esté activo en el puerto 5000.";
            } finally {
                this.loading = false;
            }
        },
        
        formatPrice(val) {
            if (val === undefined || val === null) return 'N/A';
            return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(val);
        }
    }
};
</script>