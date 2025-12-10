<template>
    <div class="compra-asientos-container p-4 shadow-lg rounded-3">

        <div class="d-flex justify-content-between align-items-center mb-4">
            <button class="btn btn-sm btn-outline-secondary" @click="prevStep" v-if="step > 1">
                <i class="bi bi-arrow-left"></i> Anterior
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="$emit('volver-seleccion')" v-else>
                <i class="bi bi-arrow-left"></i> Modificar Asientos
            </button>
        </div>

        <div class="stepper-container mb-5">
            <div class="step" :class="{ 'active': step >= 1, 'completed': step > 1 }">
                <span class="circle"><i class="bi bi-check-lg" v-if="step > 1"></i><span v-else>1</span></span>
                <span class="label">Entradas</span>
            </div>
            <div class="line" :class="{ 'active': step > 1 }"></div>
            <div class="step" :class="{ 'active': step >= 2, 'completed': step > 2 }">
                <span class="circle"><i class="bi bi-check-lg" v-if="step > 2"></i><span v-else>2</span></span>
                <span class="label">Pago</span>
            </div>
            <div class="line" :class="{ 'active': step > 2 }"></div>
            <div class="step" :class="{ 'active': step >= 3 }">
                <span class="circle">3</span>
                <span class="label">Confirmación</span>
            </div>
        </div>

        <div class="row">

            <div class="col-lg-8">

                <div v-if="step === 1" class="step-content">
                    <h4 class="step-heading mb-4"><i class="bi bi-ticket-perforated me-2"></i> Detalles de tu Reserva
                    </h4>

                    <div class="seat-list">
                        <div v-if="!zonaSeleccionada || asientosSeleccionados.length === 0" class="alert alert-danger">
                            No hay entradas o zona seleccionada. Por favor, vuelva atrás.
                        </div>
                        <div class="seat-item p-3 mb-2 rounded border" v-for="(asiento, index) in asientosSeleccionados"
                            :key="index">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <p class="mb-0 fw-bold">Entrada #{{ index + 1 }}</p>
                                    <small class="text-muted">{{ zonaSeleccionada.nombre || 'Zona Desconocida' }} - Fila
                                        {{ asiento.fila }},
                                        Asiento {{ asiento.numero }}</small>
                                </div>
                                <span class="fw-bold price-detail">{{ formatPrice(zonaSeleccionada.precio) }} VES</span>
                            </div>
                        </div>
                    </div>

                    <div class="d-grid gap-2 mt-4">
                        <button class="btn btn-lg btn-details" @click="nextStep"
                            :disabled="!zonaSeleccionada || asientosSeleccionados.length === 0"
                            style="background-color: #ff6b00 !important; color: white !important;">
                            Continuar al Pago <i class="bi bi-credit-card-2-front-fill ms-2"></i>
                        </button>
                    </div>
                </div>

                <div v-else-if="step === 2" class="step-content">
                    <h4 class="step-heading mb-4"><i class="bi bi-credit-card-fill me-2"></i> Selecciona tu Método de
                        Pago</h4>

                    <div class="payment-methods-grid">
                        <label v-for="method in paymentMethods" :key="method.id" :for="`method-${method.id}`"
                            class="payment-card p-4 rounded shadow-sm"
                            :class="{ 'selected-method': selectedMethod === method.id }">
                            <input type="radio" :id="`method-${method.id}`" :value="method.id" v-model="selectedMethod"
                                class="form-check-input me-3">
                            <div>
                                <i :class="['bi', method.icon, 'me-2 icon-lg']"></i>
                                <span class="fw-bold method-name">{{ method.name }}</span>
                                <p class="method-details mb-0 mt-1">{{ method.details }}</p>
                            </div>
                        </label>
                    </div>

                    <div v-if="selectedMethodData" class="payment-form-details mt-4 p-4 rounded shadow-sm"
                        :class="{ 'border border-warning': selectedMethodData.id !== 3, 'bg-light': selectedMethodData.id !== 3 }">

                        <div v-if="selectedMethodData.receptor && selectedMethodData.receptor.tipo !== 'tarjeta'"
                            class="mb-4 p-3 bg-white rounded border">
                            <h5 class="mb-3 text-primary"><i class="bi bi-person-badge me-2"></i> Datos del Receptor
                            </h5>
                            <div v-if="selectedMethodData.receptor.tipo === 'transferencia'">
                                <p class="mb-1">Banco: **{{ selectedMethodData.receptor.banco }}**</p>
                                <p class="mb-1">Cédula/RUC: **{{ selectedMethodData.receptor.cedula }}**</p>
                                <p class="mb-0">N° Cuenta: <span class="fw-bold text-danger">{{
                                    selectedMethodData.receptor.cuenta }}</span></p>
                            </div>
                            <div v-else-if="selectedMethodData.receptor.tipo === 'pago_movil'">
                                <p class="mb-1">Banco: **{{ selectedMethodData.receptor.banco }}**</p>
                                <p class="mb-1">Cédula/RUC: **{{ selectedMethodData.receptor.cedula }}**</p>
                                <p class="mb-0">Teléfono PM: <span class="fw-bold text-danger">{{
                                    selectedMethodData.receptor.telefono }}</span></p>
                            </div>

                            <small class="text-danger fw-bold mt-2 d-block">¡IMPORTANTE! Transferir {{
                                formatPrice(totalPagar) }} VES antes de continuar.</small>
                        </div>

                        <h5 class="mb-3 text-success" v-if="selectedMethodData.id === 1 || selectedMethodData.id === 2">
                            <i class="bi bi-pencil-square me-2"></i> Ingresa tus Datos de Pago
                        </h5>

                        <div v-if="selectedMethodData.id === 1 || selectedMethodData.id === 2" class="row g-3">
                            <div class="col-12">
                                <label for="refTransferencia" class="form-label">Referencia Bancaria/N° Operación <span
                                        class="text-danger">*</span></label>
                                <input type="text" id="refTransferencia" v-model="paymentDetails.referencia"
                                    class="form-control" placeholder="Ej: 00012345" required>
                            </div>

                            <template v-if="selectedMethodData.id === 2">
                                <div class="col-md-6">
                                    <label for="pmTelefono" class="form-label">Teléfono Remitente <span
                                            class="text-danger">*</span></label>
                                    <input type="tel" id="pmTelefono" v-model="paymentDetails.telefonoRemitente"
                                        class="form-control" placeholder="04xx-xxxxxxx" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="pmCedula" class="form-label">Cédula Remitente <span
                                            class="text-danger">*</span></label>
                                    <input type="text" id="pmCedula" v-model="paymentDetails.cedulaRemitente"
                                        class="form-control" required>
                                </div>
                            </template>

                            <div class="col-12" v-else-if="selectedMethodData.id === 1">
                                <label for="bancoOrigen" class="form-label">Banco de Origen (Opcional)</label>
                                <input type="text" id="bancoOrigen" v-model="paymentDetails.bancoOrigen"
                                    class="form-control" placeholder="Ej: Banesco">
                            </div>
                        </div>

                        <div v-else-if="selectedMethodData.id === 3">
                            <p class="lead text-muted text-center">Serás redirigido a una pasarela segura para la
                                tarjeta.</p>
                        </div>
                    </div>

                    <div class="d-grid gap-2 mt-4">
                        <button class="btn btn-lg btn-details" @click="processTransaction"
                            :disabled="!selectedMethod || paymentProcessing || !isPaymentFormValid"
                            style="background-color: #ff6b00 !important; color: white !important;">
                            <span v-if="paymentProcessing">Procesando y Validando... <i
                                    class="bi bi-arrow-clockwise spin"></i></span>
                            <span v-else>
                                Pagar y Confirmar ({{ formatPrice(totalPagar) }} VES)
                            </span>
                        </button>
                    </div>
                </div>

                <div v-else-if="step === 3" class="step-content text-center confirmation-step">
                    <h4 class="step-heading text-success mb-4"><i class="bi bi-check-circle-fill me-2"></i> ¡Compra
                        Registrada!</h4>
                    <p class="lead text-muted mb-4">Tu orden **{{ transactionId }}** ha sido registrada. La validación
                        del pago está **pendiente**.</p>

                    <div class="ticket-container p-5 mx-auto rounded shadow-lg">
                        <div class="qr-section">
                            <div
                                class="qr-code-placeholder mx-auto p-3 mb-3 bg-white d-flex flex-column align-items-center justify-content-center rounded">

                                <a :href="qrUrl" target="_blank" title="Escanear para ver ticket digital"
                                    v-if="qrUrl !== 'ERROR'">
                                    <QrcodeVue :value="qrUrl" :size="120" level="H" class="mb-2" />
                                </a>
                                <i class="bi bi-qr-code-scan display-4 text-dark" v-else></i>

                                <small class="text-secondary mt-1">Token: **{{ qrToken ? qrToken.substring(0, 15) +
                                    '...' :
                                    'Generando...' }}**</small>
                            </div>
                        </div>

                        <h5 class="ticket-event-title mt-3">{{ evento.titulo }}</h5>
                        <p class="text-muted mb-4 small">Referencia de Pago: **{{ paymentDetails.referencia || 'N/A'
                        }}**</p>

                        <div class="ticket-summary p-3 rounded-3 mb-4">
                            <p class="mb-1 fw-bold">{{ asientosSeleccionados.length }} Entradas</p>
                            <p class="mb-0 small text-muted">{{ zonaSeleccionada.nombre || 'Zona no disponible' }} ({{
                                asientosSeleccionados.map(a => `F${a.fila}A${a.numero}`).join(', ')}})</p>
                        </div>

                        <p class="total-price-final mb-4">Monto Pagado: {{ formatPrice(totalPagar) }} VES</p>

                        <button class="btn btn-success btn-lg me-2" @click="generateTicketPDF">
                            <i class="bi bi-download"></i> Descargar Comprobante PDF
                        </button>
                        <button class="btn btn-outline-secondary mt-2 mt-lg-0" @click="$emit('compra-finalizada')">
                            Finalizar y Volver
                        </button>
                    </div>
                </div>
            </div>

            <div class="col-lg-4 d-none d-lg-block">
                <div class="summary-card p-4 sticky-top rounded-3 shadow-sm border">
                    <h5 class="fw-bold mb-3"><i class="bi bi-cart4 me-2"></i> Resumen del Pedido</h5>
                    <hr>

                    <p class="fw-bold mb-1">{{ evento.titulo }}</p>
                    <p class="text-muted small mb-3">{{ evento.estadio }}</p>

                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Entradas (x{{ asientosSeleccionados.length }})</span>
                        <span class="fw-bold">{{ formatPrice(totalPagar) }} VES</span>
                    </div>

                    <div class="d-flex justify-content-between mb-4">
                        <span class="text-muted small">Cargos por Servicio</span>
                        <span class="small">Gratis!</span>
                    </div>

                    <hr>

                    <div class="d-flex justify-content-between final-total">
                        <span class="fw-bold fs-5">TOTAL</span>
                        <span class="fw-bold fs-5 total-price-summary">{{ formatPrice(totalPagar) }} VES</span>
                    </div>

                    <div v-if="step === 2" class="mt-3 payment-info-summary">
                        <p class="mb-1 fw-bold">Método:</p>
                        <p class="mb-0 small text-muted">{{ getSelectedMethodName() }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// 🚨 CONFIGURACIÓN CRÍTICA
const API_HOST = 'http://192.168.31.99:3000';
const VUE_HOST = 'http://192.168.31.99:8080';

// ------------------------- Utilidad Auxiliar Corregida -------------------------
/**
 * Obtiene el ID de usuario del token JWT almacenado.
 * @returns {number|null} El ID del usuario o null si no hay token o es inválido.
 */
const getUserIdFromToken = () => {
    const token = localStorage.getItem('userToken');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);

        // 🚨 CORRECCIÓN CLAVE: Buscar 'id' en lugar de 'id_usuario'
        return decoded.id || null;

    } catch (e) {
        console.error("Error al decodificar el token:", e);
        return null;
    }
};
// -------------------------------------------------------------------------------

export default {
    name: 'CompraAsientos',
    components: { QrcodeVue },
    props: {
        // VITAL: Se ha cambiado el valor por defecto para evitar el nombre de prueba 'Concierto Estelar'
        evento: {
            type: Object,
            default: () => ({
                titulo: 'Evento No Seleccionado 🚨',
                estadio: 'Verifique Ruta',
                fecha: 'N/A',
                id: 0
            })
        },
        zonaSeleccionada: { type: Object, default: null },
        asientosSeleccionados: { type: Array, default: () => [] },
        totalPagar: { type: Number, default: 0 },
        formatPrice: { type: Function, default: (val) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(val) }
    },
    data() {
        return {
            step: 1,
            selectedMethod: null,
            transactionId: null,
            qrToken: null,

            paymentDetails: {
                referencia: '',
                bancoOrigen: '',
                telefonoRemitente: '',
                cedulaRemitente: '',
            },
            paymentProcessing: false,

            paymentMethods: [],
            selectedMethodData: null,
        };
    },
    computed: {
        isPaymentFormValid() {
            if (!this.selectedMethod) return false;

            const method = this.paymentMethods.find(m => m.id === this.selectedMethod);
            if (!method) return false;

            // Para Pago con Tarjeta (ID 3), se asume que la redirección lo valida
            if (this.selectedMethod === 3) return true;

            // Validación mínima para Transferencia/Pago Móvil (ID 1 y 2)
            if (!this.paymentDetails.referencia || this.paymentDetails.referencia.length < 5) return false;

            // Validación específica para Pago Móvil (ID 2)
            if (this.selectedMethod === 2 && (!this.paymentDetails.telefonoRemitente || !this.paymentDetails.cedulaRemitente)) return false;

            return true;
        },

        qrUrl() {
            if (!this.qrToken || !this.transactionId) return 'ERROR';

            // Usar Buffer.from en entornos Node/Webpack si btoa no está disponible en el navegador (aunque es raro en front-end)
            const rawEncodedToken = (typeof btoa !== 'undefined' ? btoa(this.qrToken) : this.qrToken);
            const encodedToken = encodeURIComponent(rawEncodedToken);

            return `${VUE_HOST}/ticket-viewer?token=${encodedToken}`;
        },

        userId() {
            return getUserIdFromToken();
        }
    },
    watch: {
        selectedMethod(newVal) {
            this.selectedMethodData = this.paymentMethods.find(m => m.id === newVal) || null;
            this.paymentDetails = { referencia: '', bancoOrigen: '', telefonoRemitente: '', cedulaRemitente: '', };
        }
    },
    async mounted() {
        await this.loadPaymentMethods();
    },
    methods: {
        async loadPaymentMethods() {
            this.paymentMethods = [];
            const token = localStorage.getItem('userToken');

            if (!token) {
                console.warn("⚠️ Advertencia: No se encontró token de usuario.");
            }

            try {
                // LLAMADA AL ENDPOINT: /api/pagos/metodos
                const response = await axios.get(`${API_HOST}/api/pagos/metodos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = response.data.data;

                this.paymentMethods = data.map(m => ({
                    id: m.id_metodo_pago,
                    name: m.nombre,
                    // Se asegura de que icon exista antes de acceder
                    icon: m.descripcion && m.descripcion.icon ? m.descripcion.icon : 'bi-cash',
                    details: m.nombre.includes('Transferencia') || m.nombre.includes('Móvil') ? 'Pago por confirmación bancaria.' : 'Pago instantáneo por pasarela.',
                    receptor: m.descripcion || null
                }));

                console.log(`✅ ${this.paymentMethods.length} métodos de pago cargados.`);

            } catch (error) {
                let errorMessage = 'Verifique la conexión al servidor.';

                if (error.response) {
                    const status = error.response.status;

                    if (status === 404) {
                        errorMessage = `❌ Error 404: El endpoint /api/pagos/metodos no existe en el servidor. (Revisar rutas del Backend)`;
                    } else if (status === 403 || status === 401) {
                        errorMessage = `❌ Error de Acceso (${status}): Token inválido o expirado. Por favor, inicie sesión.`;
                    } else {
                        errorMessage = `❌ Error del servidor (${status}): ${error.response.data.message || error.response.data.error || 'Intento fallido.'}`;
                    }
                } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                    errorMessage = `❌ Error de Red: Servidor apagado o IP/Puerto incorrecto: ${API_HOST}`;
                } else {
                    errorMessage = `Error interno: ${error.message}`;
                }

                console.error('Error cargando métodos de pago:', errorMessage, error.response || error);
                alert(`Error al cargar métodos de pago: ${errorMessage}`);
            }
        },
        getSelectedMethodName() {
            const method = this.paymentMethods.find(m => m.id === this.selectedMethod);
            return method ? method.name : 'No seleccionado';
        },
        nextStep() {
            if (this.step === 1) {
                if (!this.zonaSeleccionada || this.asientosSeleccionados.length === 0 || !this.zonaSeleccionada.id_tipo) {
                    alert('🚨 Error: La información del Tipo de Entrada no está disponible. Verifique la selección.');
                    this.$emit('volver-seleccion');
                    return;
                }
                this.step++;
            }
        },
        prevStep() {
            if (this.step === 1) {
                this.$emit('volver-seleccion');
            } else {
                this.step--;
            }
        },

        async processTransaction() {
            if (this.step !== 2 || !this.isPaymentFormValid) return;

            const idTipo = this.zonaSeleccionada ? this.zonaSeleccionada.id_tipo : null;
            const idUsuario = this.userId;

            if (!this.zonaSeleccionada || !idTipo) {
                alert('🚨 Error Crítico: La información del Tipo de Entrada (id_tipo) no está disponible.');
                return;
            }

            if (!idUsuario) {
                alert('🚨 Error de Autenticación: Debe iniciar sesión para completar la compra.');
                return;
            }

            this.paymentProcessing = true;

            try {
                const token = localStorage.getItem('userToken');

                const precioUnit = this.zonaSeleccionada.precio;
                const totalCompra = this.totalPagar;

                const itemsTicketPayload = this.asientosSeleccionados.map(asiento => ({
                    id_asiento: asiento.id_asiento || null,
                    id_tipo: idTipo,
                    precio_unit: precioUnit,
                    // Se asegura de que el índice sea numérico
                    index: asiento.index || 1,
                }));

                const datosAdicionales = JSON.stringify({
                    bancoOrigen: this.paymentDetails.bancoOrigen,
                    telefonoRemitente: this.paymentDetails.telefonoRemitente,
                    cedulaRemitente: this.paymentDetails.cedulaRemitente,
                    metodo_nombre: this.getSelectedMethodName(),
                });

                const registro = {
                    id_usuario: idUsuario,
                    total_transaccion: totalCompra,
                    items_ticket: itemsTicketPayload,

                    pago: {
                        id_metodo: this.selectedMethod,
                        referencia_proveedor: this.paymentDetails.referencia || null,
                        notas: datosAdicionales,
                        moneda_codigo: 'USD',
                        simbolo_moneda: '$',
                    },
                };

                // LLAMADA AL ENDPOINT: /api/pagos/transaccion-completa
                const response = await axios.post(`${API_HOST}/api/pagos/transaccion-completa`, registro, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                this.paymentProcessing = false;

                const responseData = response.data;

                const isSuccessful = responseData.ok === true && !!responseData.transactionId;

                if (isSuccessful) {
                    this.transactionId = responseData.transactionId;
                    this.qrToken = responseData.qrToken;

                    this.step++;
                } else {
                    alert(`Error de servidor al registrar la compra: ${responseData.message || 'Faltan datos de confirmación.'}`);
                }

            } catch (error) {
                this.paymentProcessing = false;

                console.error('Error FATAL al procesar la transacción:', error.response ? error.response.data : error.message);

                let errorMessage = 'Ocurrió un error en el servidor. La transacción fue revertida.';

                if (error.response) {
                    const status = error.response.status;
                    const data = error.response.data;

                    if (status === 403 || status === 401) {
                        errorMessage = `❌ Acceso Prohibido (${status}): El token es inválido o expiró. ${data.message || 'Por favor, inicie sesión nuevamente.'}`;
                    } else if (data.message || data.error) {
                        errorMessage = `Error del servidor (${status}): ${data.message || data.error}`;
                    }
                } else if (error.message.includes('No se encontró el token')) {
                    errorMessage = 'Debe iniciar sesión para completar la compra.';
                }

                alert(errorMessage);
            }
        },

        generateTicketPDF() {
            if (!this.transactionId || !this.qrToken || !this.zonaSeleccionada || this.asientosSeleccionados.length === 0) {
                alert('Faltan datos para generar el PDF.');
                return;
            }
            const doc = new jsPDF();
            let y = 15;
            const margin = 15;
            const pageWidth = doc.internal.pageSize.getWidth();
            const primaryColor = [255, 107, 0];
            const grayColor = [108, 117, 125];

            // ----------------------------------------------------------------------
            // ✅ CORRECCIÓN CRÍTICA: Definición de variables seguras del Evento/Lugar
            // ----------------------------------------------------------------------

            // Intenta obtener el título (titulo o nombre)
            const tituloEvento = String(
                this.evento.titulo ||
                this.evento.nombre ||
                'Título del Evento (BD no disponible)'
            );

            // Intenta obtener el lugar (estadio o nombre_lugar o dirección)
            const lugarEvento = String(
                this.evento.estadio ||
                (this.evento.lugar ? this.evento.lugar.nombre_lugar : null) ||
                (this.evento.lugar ? this.evento.lugar.direccion : null) ||
                'Lugar Desconocido'
            );

            // Intenta obtener la Referencia de Pago de forma segura
            const refPago = this.paymentDetails.referencia ? String(this.paymentDetails.referencia) : 'N/A';


            // ----------------------------------------------------------------------
            // ✅ APLICACIÓN EN JS PDF
            // ----------------------------------------------------------------------

            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, pageWidth, 10, 'F');
            y = 20;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(...primaryColor);
            doc.text("COMPROBANTE DE COMPRA", margin, y);
            y += 8;

            doc.setFontSize(16);
            doc.setTextColor(52, 58, 64);
            doc.text(tituloEvento, margin, y); // <-- USA TÍTULO SEGURO
            y += 5;

            doc.setFontSize(10);
            doc.setTextColor(...grayColor);
            doc.text(`ID Transacción: ${this.transactionId}`, margin, y);
            y += 5;
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, y);
            y += 10;

            doc.setFillColor(248, 249, 250);
            doc.rect(margin, y - 5, pageWidth - margin * 2, 30, 'F');
            doc.setTextColor(0, 0, 0);

            doc.setFontSize(12);
            doc.text(`Lugar: ${lugarEvento}`, margin + 5, y + 5); // <-- USA LUGAR SEGURO

            doc.setFontSize(14);
            doc.text(`TOTAL PAGADO: ${this.formatPrice(this.totalPagar)} VES`, margin + 5, y + 20);

            doc.setFontSize(10);
            doc.text(`Método: ${this.getSelectedMethodName()}`, pageWidth - margin - 5, y + 5, null, null, 'right');
            doc.text(`Ref. Pago: ${refPago}`, pageWidth - margin - 5, y + 10, null, null, 'right'); // <-- USA REF. PAGO SEGURO

            y += 35;

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(52, 58, 64);
            doc.text("Detalle de Entradas", margin, y);
            y += 7;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);

            doc.text("Zona", margin + 5, y, { maxWidth: 30 });
            doc.text("Asiento", margin + 60, y, { maxWidth: 30 });
            doc.text("Precio", margin + 110, y, { maxWidth: 30 });
            y += 2;
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;

            this.asientosSeleccionados.forEach(asiento => {
                doc.text(this.zonaSeleccionada.nombre || 'N/A', margin + 5, y);

                const fila = asiento.fila || '?';
                const numero = asiento.numero || '?';
                doc.text(`Fila ${fila}, Asiento ${numero}`, margin + 60, y);

                doc.text(this.formatPrice(this.zonaSeleccionada.precio) + ' VES', margin + 110, y);
                y += 6;
            });

            y += 10;

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...primaryColor);
            doc.text("CÓDIGO DE ACCESO ÚNICO", margin, y);
            y += 5;

            doc.setFontSize(8);
            doc.setTextColor(...grayColor);
            doc.text("Este código contiene la URL del ticket digital.", margin, y);
            y += 5;

            doc.setFontSize(7);
            doc.text(`Token Seg.: ${this.qrToken ? this.qrToken.substring(0, 150) + '...' : 'Generando...'}`, margin, y);
            y += 15;

            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("Gracias por su compra. Este comprobante no es válido como entrada, debe ser canjeado por el ticket oficial.", margin, doc.internal.pageSize.getHeight() - 10);

            doc.save(`Comprobante-Compra-${this.transactionId}.pdf`);
        },
    }
};
</script>

<style scoped>
/*
 * Aquí puedes agregar o revisar tus estilos
 * para el stepper y las tarjetas de pago, etc.
 */

.compra-asientos-container {
    background-color: #ffffff;
}

.stepper-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 0 10%;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    z-index: 2;
    width: 30%;
}

.circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #ccc;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    margin-bottom: 5px;
    transition: background-color 0.3s, border-color 0.3s;
}

.step.active .circle,
.step.completed .circle {
    background-color: #ff6b00;
}

.step.completed .circle {
    background-color: #28a745;
}

.line {
    position: absolute;
    top: 15px;
    left: 15%;
    right: 15%;
    height: 2px;
    background-color: #ccc;
    z-index: 1;
    transition: background-color 0.3s;
}

.line.active {
    background-color: #ff6b00;
}

.label {
    font-size: 0.9em;
    color: #6c757d;
}

.step.active .label {
    color: #343a40;
    font-weight: bold;
}

.payment-methods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 15px;
}

.payment-card {
    cursor: pointer;
    border: 2px solid #ddd;
    transition: all 0.2s;
    display: flex;
    align-items: center;
}

.payment-card:hover {
    border-color: #ff6b00;
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.2);
}

.selected-method {
    border-color: #ff6b00 !important;
    background-color: #fff3e0;
}

.icon-lg {
    font-size: 1.5rem;
    color: #007bff;
}

.method-name {
    display: block;
    font-size: 1.1em;
}

.method-details {
    font-size: 0.8em;
    color: #6c757d;
}

.payment-form-details .form-label {
    font-weight: 500;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.confirmation-step .ticket-container {
    max-width: 450px;
    background-color: #f8f9fa;
    border: 1px dashed #ced4da;
}

.summary-card {
    top: 20px;
}
</style>

<style scoped>
/* Estilos necesarios para el diseño visual */
:root {
    --primary-color: #ff6b00;
}

.compra-asientos-container {
    background-color: #ffffff;
    border: 1px solid #e9ecef;
    min-height: 700px;
}

.step-heading {
    color: #343a40;
    font-weight: 600;
}

.btn-details {
    border: 1px solid var(--primary-color);
    box-shadow: 0 4px 6px rgba(255, 107, 0, 0.3);
    transition: all 0.25s ease-out;
}

.btn-details:hover:not(:disabled) {
    background-color: #e65c00 !important;
    border-color: #e65c00 !important;
    box-shadow: 0 6px 10px rgba(255, 107, 0, 0.4);
    transform: translateY(-2px);
}

.btn-details:disabled {
    background-color: #cccccc !important;
    border-color: #cccccc !important;
    color: #666666 !important;
    opacity: 1 !important;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

/* --- RESUMEN (COLUMNA DERECHA) --- */
.summary-card {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef !important;
}

.sticky-top {
    top: 20px;
}

.final-total {
    color: var(--primary-color);
}

.total-price-summary {
    font-size: 1.6rem !important;
}

/* --- STEPPER (BARRA DE PROGRESO) --- */
.stepper-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    max-width: 650px;
    margin: 0 auto 3rem;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
    color: #adb5bd;
}

.circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #fff;
    border: 2px solid #adb5bd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #adb5bd;
    margin-bottom: 5px;
    transition: all 0.3s ease;
}

.line {
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: #e9ecef;
    top: 20px;
    transform: translateY(-50%);
    z-index: 5;
}

.line.active {
    background-color: var(--primary-color);
}

.step.active .circle,
.step.completed .circle {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.step.completed .circle {
    background-color: var(--primary-color);
    color: white;
}

.step.active .label {
    color: #343a40;
    font-weight: 600;
}

/* --- MÉTODOS DE PAGO --- */
.payment-methods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.payment-card {
    border: 2px solid #e9ecef;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: flex-start;
}

.payment-card:hover {
    border-color: var(--primary-color);
}

.selected-method {
    border-color: var(--primary-color);
    background-color: #fff8f5;
    box-shadow: 0 4px 12px rgba(255, 107, 0, 0.1);
}

.icon-lg {
    font-size: 1.5rem;
    color: var(--primary-color);
}

.method-name {
    display: block;
}

.method-details {
    font-size: 0.85rem;
    color: #6c757d;
}

.form-check-input {
    transform: scale(1.4);
    margin-top: 5px;
}

/* --- CONFIRMACIÓN / TICKET --- */
.ticket-container {
    max-width: 500px;
    border: 3px solid var(--primary-color);
    border-style: dashed;
    background-color: #ffffff;
}

.qr-code-placeholder {
    width: 150px;
    height: 150px;
    border: 1px solid #ddd;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.ticket-event-title {
    font-weight: 800;
    color: #343a40;
}

.ticket-summary {
    background-color: #f0f0f0;
}

.total-price-final {
    font-size: 1.8rem;
    color: var(--primary-color);
    font-weight: 700;
}
</style>