<template>
    <div class="event-detail-page pt-5 pb-5">
        <div class="container">
            
            <template v-if="currentView === 'mapa'">
                
                <div class="row mb-4">
                    <div class="col-12">
                        <button @click="$emit('volver')" class="btn btn-outline-secondary mb-3 back-btn">
                            <i class="bi bi-arrow-left"></i> Volver a Eventos
                        </button>
                        <div class="d-flex align-items-center mb-4 event-header">
                            <img :src="getEventoImagen(eventoMapeado)" :alt="eventoMapeado.titulo" class="event-detail-img shadow-lg me-4" @error="handleImageError">
                            
                            <div>
                                <h1 class="event-title">{{ eventoMapeado.titulo }}</h1>
                                <p class="event-desc">{{ eventoMapeado.descripcion }}</p>
                                <p class="event-meta">
                                    <i class="bi bi-calendar-event me-2"></i> Fecha: <span class="fw-bold">{{ eventoMapeado.fecha }}</span> |
                                    <i class="bi bi-geo-alt-fill me-2"></i> Lugar: <span class="fw-bold">{{ eventoMapeado.estadio }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="section-divider">

                <div class="row mb-5">
                    <div class="col-12">
                        <h2 class="section-heading mb-4"><i class="bi bi-ticket-perforated-fill me-2"></i> Zonas y Precios</h2>
                        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                            <div class="col" v-for="zona in zonas" :key="zona.id">
                                <div class="card zone-card shadow-sm h-100" 
                                    :class="{'selected-zone': zona.nombre === zonaSeleccionada.nombre}" 
                                    @click="seleccionarZona(zona)">
                                    <div class="card-body">
                                        <h5 class="card-title zone-title">{{ zona.nombre }}</h5>
                                        <p class="card-text zone-price">{{ formatPrice(zona.precio) }} VES</p>
                                        <p class="card-text zone-avail">{{ zona.disponibles }} asientos disponibles</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="section-divider">

                <div class="row">
                    <div class="col-12">
                        <h2 class="section-heading mb-4"><i class="bi bi-grid-fill me-2"></i> Selecciona tu Asiento</h2>
                        
                        <MapaAsientos 
                            :todasZonas="zonas"
                            :zonaSeleccionada="zonaSeleccionada"
                            :asientosOcupadosExternos="asientosOcupados"
                            :asientosSeleccionadosExternos="asientosSeleccionados"
                            @asiento-seleccionado="manejarSeleccionAsiento"
                            @seleccionar-zona-externa="seleccionarZona" 
                        />
                        
                        <div class="purchase-summary p-3 mt-4 text-center shadow-lg" v-if="asientosSeleccionados.length > 0">
                            <h4 class="mb-3">Resumen de tu Compra</h4>
                            <p class="mb-1">Zona: <span class="fw-bold">{{ zonaSeleccionada.nombre }}</span></p>
                            <p class="mb-1">Asientos: <span class="fw-bold">{{ asientosSeleccionados.map(a => `F${a.fila}A${a.numero}`).join(', ') }}</span></p>
                            <p class="total-price mb-3">Total: {{ formatPrice(totalPagar) }} VES</p>
                            
                            <button class="btn btn-lg btn-details" @click="iniciarPago">
                                Proceder al Pago
                            </button>
                        </div>
                    </div>
                </div>
            </template>

            <template v-else-if="currentView === 'compra'">
                <CompraAsientos
                    :evento="eventoMapeado" :zonaSeleccionada="zonaSeleccionada"
                    :asientosSeleccionados="asientosSeleccionados"
                    :totalPagar="totalPagar"
                    :formatPrice="formatPrice"
                    @volver-seleccion="volverASeleccion"
                    @compra-finalizada="manejarCompraFinalizada"
                />
            </template>

        </div>
    </div>
</template>

<script>
import MapaAsientos from './MapaAsientos.vue';
import CompraAsientos from './CompraAsientos.vue'; 
// Importar imágenes de fallback (necesarias para la lógica de getEventoImagen)
import evento1Img from '@/assets/Evento1.jpg';
import evento2Img from '@/assets/Evento2.jpg';
import evento3Img from '@/assets/Evento3.jpg';
import evento4Img from '@/assets/Evento4.jpg';
import evento5Img from '@/assets/Evento5.jpg';
import evento6Img from '@/assets/Evento6.jpg';

// URL base de la API (Asegúrate de que sea la misma que en InicioPagina)
const UPLOADS_BASE_URL = 'http://localhost:3000/uploads/eventos/';

export default {
    name: 'EventoDetalle',
    components: {
        MapaAsientos,
        CompraAsientos,
    },
    props: {
        evento: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            currentView: 'mapa',
            zonas: [
                { id: 'vip', nombre: 'VIP', precio: 10000.00, color: '#ffc107', disponibles: 100, filas: 10, asientosXFila: 10, id_tipo: 1 },
                { id: 'central', nombre: 'Central', precio: 7000.00, color: '#007bff', disponibles: 200, filas: 10, asientosXFila: 20, id_tipo: 2 },
                { id: 'laterales', nombre: 'Laterales', precio: 4500.00, color: '#17a2b8', disponibles: 300, filas: 15, asientosXFila: 20, id_tipo: 3 },
                { id: 'general', nombre: 'General', precio: 2500.00, color: '#28a745', disponibles: 400, filas: 20, asientosXFila: 20, id_tipo: 4 }
            ],
            zonaSeleccionada: {}, 
            asientosSeleccionados: [],
            asientosOcupados: [],
            
            // 🟢 AGREGADO: Variables para la lógica de imagen/fallback
            evento1Img, evento2Img, evento3Img, evento4Img, evento5Img, evento6Img,
            fallbackImg: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23ccc"%3E%3C/rect%3E%3Ctext x="50" y="55" font-size="12" text-anchor="middle" fill="%23fff"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
        };
    },
    computed: {
        eventoMapeado() {
            if (!this.evento) return { titulo: 'Cargando...', estadio: 'Cargando...' };
            
            const titulo = this.evento.nombre || this.evento.titulo || 'Evento Desconocido'; 
            
            const lugar = (this.evento.lugar && this.evento.lugar.nombre_lugar) || 
                          this.evento.estadio || 
                          'Estadio Principal';

            // 🟢 CLAVE: El objeto 'evento' que viene de InicioPagina contiene 'imagen' si viene de BD
            // Usamos 'imagen' (nombre BD) o 'imagen_db' (si fue mapeado en InicioPagina)
            const imagenDB = this.evento.imagen || this.evento.imagen_db || null;

            return {
                ...this.evento, 
                titulo: titulo, 
                estadio: lugar, 
                nombre: titulo, 
                // 🟢 AGREGADO: Pasamos el nombre del archivo al objeto mapeado con el campo que usamos en la función
                imagen_db: imagenDB, 
            };
        },
        
        totalPagar() {
            if (this.zonaSeleccionada && this.zonaSeleccionada.precio) {
                return this.asientosSeleccionados.length * this.zonaSeleccionada.precio;
            }
            return 0;
        }
    },
    methods: {
        // 🟢 AGREGADO: Función auxiliar para manejar el fallback cíclico (COPIADA de InicioPagina)
        getFallbackImage(id) {
            const defaultImages = [
                this.evento1Img, this.evento2Img, this.evento3Img,
                this.evento4Img, this.evento5Img, this.evento6Img
            ];
            // Usamos el id_evento para el ciclo, si no existe usamos 1.
            const eventId = id || 1; 
            const index = (eventId - 1) % defaultImages.length;
            return defaultImages[index] || this.evento1Img;
        },

        // 🟢 AGREGADO: Función para obtener la URL de la imagen (COPIADA de InicioPagina)
        getEventoImagen(evento) {
            const imageName = evento.imagen_db;

            if (!imageName) {
                return this.getFallbackImage(evento.id_evento);
            }

            // Detección de imagen dinámica (subida por Multer)
            const isUploadedFile = imageName.includes('-') || imageName.length > 20 || imageName.startsWith('http');
            
            if (isUploadedFile) {
                // Usa la URL del backend para archivos subidos
                return `${UPLOADS_BASE_URL}${imageName}`;
            } else {
                // Intenta cargar desde assets (imágenes estáticas como Evento1.jpg)
                try {
                    // require() solo funciona con nombres estáticos en Vue CLI / Webpack
                    return require(`@/assets/${imageName}`);
                } catch (error) {
                    // Si el require falla, usa el fallback cíclico
                    console.warn(`[Asset Fallback] No se pudo cargar ${imageName} de assets. Usando fallback local.`, error);
                    return this.getFallbackImage(evento.id_evento);
                }
            }
        },

        // 🟢 AGREGADO: Función para manejar error de imagen (COPIADA de InicioPagina)
        handleImageError(event) {
            const imgElement = event.target;
            if (imgElement.src !== this.fallbackImg) {
                imgElement.src = this.fallbackImg;
                imgElement.style.objectFit = 'contain';
            }
        },

        formatPrice(value) {
            return value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },
        seleccionarZona(zona) {
            if (!zona || !zona.nombre) {
                this.zonaSeleccionada = {};
                this.asientosSeleccionados = [];
                return;
            }

            if (this.zonaSeleccionada.nombre !== zona.nombre) {
                this.zonaSeleccionada = zona;
                this.asientosSeleccionados = [];
            }
            const mapSection = document.querySelector('.section-heading');
            if (mapSection) {
                window.scrollTo({ top: mapSection.offsetTop - 20, behavior: 'smooth' });
            }
        },
        manejarSeleccionAsiento(asiento) {
            if (!asiento || asiento.fila === undefined || asiento.numero === undefined) {
                console.error("Error: Se recibió un asiento inválido o incompleto.", asiento);
                return;
            }

            const index = this.asientosSeleccionados.findIndex(a => 
                a.fila === asiento.fila && a.numero === asiento.numero
            );

            if (index > -1) {
                this.asientosSeleccionados.splice(index, 1);
            } else {
                this.asientosSeleccionados.push(asiento);
            }
        },
        
        iniciarPago() {
            if (this.asientosSeleccionados.length > 0) {
                if (!this.zonaSeleccionada.id_tipo) {
                     alert("Error: No se pudo obtener el ID de la tarifa (id_tipo). Por favor, re-selecciona la zona.");
                     return;
                }
                this.currentView = 'compra';
                window.scrollTo(0, 0); 
            } else {
                alert("Por favor, selecciona al menos un asiento antes de continuar.");
            }
        },
        
        volverASeleccion() {
            this.currentView = 'mapa';
        },

        manejarCompraFinalizada() {
            // Simulación de bloqueo de asientos comprados
            this.asientosOcupados = [...this.asientosOcupados, ...this.asientosSeleccionados.map(a => ({ 
                fila: a.fila,
                numero: a.numero,
                zona: this.zonaSeleccionada.nombre
            }))];
            
            this.asientosSeleccionados = [];
            this.zonaSeleccionada = {};
            this.currentView = 'mapa';
            alert("¡Compra Exitosa! Revisar tu email para los tickets.");
        }
    }
};
</script>

<style scoped>
/* Estilos sin cambios */
.event-detail-page {
    background-color: #f8f9fa;
    min-height: 100vh;
}
.event-header {
    align-items: flex-start !important; /* Asegura que el texto comience arriba */
}
.event-detail-img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 10px;
}
.event-title {
    color: #212122ff;
    font-weight: 700;
    margin-bottom: 5px;
}
.event-desc {
    color: #6c757d;
    font-size: 1.1rem;
}
.event-meta {
    font-weight: 500;
    color: #343a40;
}
.section-divider {
    border-color: rgba(0, 0, 0, 0.1);
    margin: 3rem 0;
}
.section-heading {
    color: #ff6b00;
    font-weight: 600;
}
.zone-card {
    cursor: pointer;
    transition: transform 0.2s, border 0.2s, box-shadow 0.2s;
    border: 2px solid transparent;
}
.zone-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}
.selected-zone {
    border-color: #ff6b00;
    background-color: #fff3e6;
}
.zone-title {
    font-weight: 700;
    color: #212122ff;
}
.zone-price {
    font-size: 1.4rem;
    font-weight: 700;
    color: #ff6b00;
}
.zone-avail {
    font-size: 0.9rem;
    color: #6c757d;
}
.purchase-summary {
    background-color: #ffffff;
    border-radius: 10px;
    border: 1px solid #ff6b00;
}
.total-price {
    font-size: 1.5rem;
    color: #ff6b00;
    font-weight: 700;
}
.back-btn {
    color: #495057;
    border-color: #495057;
}
.back-btn:hover {
    background-color: #495057;
    color: white;
}
.btn-details {
    background-color: #ff6b00; 
    color: white; 
    border: 1px solid #ff6b00;
    font-weight: 500;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* El estado hover se mantiene más oscuro para el efecto visual */
.btn-details:hover {
    background-color: #e65c00;
    border-color: #e65c00;
    color: white;
}
</style>