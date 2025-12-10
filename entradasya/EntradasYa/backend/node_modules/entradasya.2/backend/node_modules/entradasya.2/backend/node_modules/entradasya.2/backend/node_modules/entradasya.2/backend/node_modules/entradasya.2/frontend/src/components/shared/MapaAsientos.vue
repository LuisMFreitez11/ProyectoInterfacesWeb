<template>
  <div class="seat-map-container p-4 shadow-lg rounded-3">
    
    <div class="empty-area-placeholder p-2 text-center rounded-3 mb-4">
    </div>

    <div v-if="!zonaEnZoom" class="stadium-layout-container">
        <h4 class="text-center mb-4 zone-map-title">
            Vista General del Estadio (Selecciona un Bloque)
        </h4>
        
        <div class="stadium-map mx-auto">
            
            <div class="zone-block general-block-front" 
                :style="{ backgroundColor: getZonaColor('General') }"
                :class="{ 'zone-selected': zonaSeleccionada.nombre === 'General' }"
                @click="seleccionarZonaClick('General')">
                General ({{ getZonaDisponibilidad('General') }})
            </div>

            <div class="zone-block central-block" 
                :style="{ backgroundColor: getZonaColor('Central') }"
                :class="{ 'zone-selected': zonaSeleccionada.nombre === 'Central' }"
                @click="seleccionarZonaClick('Central')">
                Central ({{ getZonaDisponibilidad('Central') }})
            </div>

            <div class="zone-block vip-block-middle" 
                :style="{ backgroundColor: getZonaColor('VIP') }"
                :class="{ 'zone-selected': zonaSeleccionada.nombre === 'VIP' }"
                @click="seleccionarZonaClick('VIP')">
                VIP ({{ getZonaDisponibilidad('VIP') }})
            </div>

            <div class="side-row">
                <div class="zone-block side-block left" 
                    :style="{ backgroundColor: getZonaColor('Laterales') }"
                    :class="{ 'zone-selected': zonaSeleccionada.nombre === 'Laterales' }"
                    @click="seleccionarZonaClick('Laterales')">
                    Lateral Izquierdo <br> ({{ getDisponibilidadLateralDividida() }} Disp.)
                </div>
                <div class="zone-block side-block right" 
                    :style="{ backgroundColor: getZonaColor('Laterales') }"
                    :class="{ 'zone-selected': zonaSeleccionada.nombre === 'Laterales' }"
                    @click="seleccionarZonaClick('Laterales')">
                    Lateral Derecho <br> ({{ getDisponibilidadLateralDividida() }} Disp.)
                </div>
            </div>
            
            <div class="zone-block main-stage-block">
                TARIMA DE CANTANTES / ESCENARIO
            </div>
            
        </div>
    </div>

    <div v-else class="zoom-layout-container">
        <button class="btn btn-sm btn-outline-secondary mb-3" @click="volverAlMapaGeneral">
             <i class="bi bi-arrow-left"></i> Volver al Mapa General
        </button>
        <h4 class="text-center mb-4 zone-map-title">
              Selecciona asientos en: {{ zonaEnZoom.nombre }}
        </h4>

        <div class="seat-grid-wrapper">
            <div class="seat-grid" :style="{ '--grid-cols': zonaEnZoom.asientosXFila }">
                
                <template v-for="fila in zonaEnZoom.filas" :key="fila">
                    <span class="row-label">Fila {{ fila }}</span> 
                    
                    <div 
                        v-for="asiento in zonaEnZoom.asientosXFila" 
                        :key="`${fila}-${asiento}`" 
                        class="seat-block"
                        :class="{ 
                            'occupied': isOccupied(fila, asiento),
                            'selected': isSelected(fila, asiento), 
                            'available': !isOccupied(fila, asiento) && !isSelected(fila, asiento),
                            'clickable': !isOccupied(fila, asiento) 
                        }"
                        @click="!isOccupied(fila, asiento) && toggleAsiento(fila, asiento)"
                        :title="isOccupied(fila, asiento) ? 'OCUPADO' : `Fila ${fila}, Asiento ${asiento}`"
                    >
                    </div>
                </template>
            </div>
        </div>
        
    </div>

    <div class="legend mt-4 pt-3 border-top d-flex justify-content-center gap-4 flex-wrap">
        <div class="legend-item d-flex align-items-center">
             <div class="seat-placeholder available-legend me-2"></div> Asiento Disponible
        </div>
        <div class="legend-item d-flex align-items-center selected">
          <div class="seat-placeholder selected-legend me-2" :style="{ backgroundColor: zonaSeleccionada.color }"></div> Tu Selección
        </div>
        <div class="legend-item d-flex align-items-center">
             <div class="seat-placeholder occupied-legend me-2"></div> Asiento Ocupado
        </div>
        <div class="legend-item d-flex align-items-center">
             <div class="seat-placeholder main-stage-legend me-2"></div> Tarima / Escenario
        </div>
    </div>

  </div>
</template>

<script>
export default {
    name: 'MapaAsientos',
    props: {
        todasZonas: {
            type: Array,
            required: true
        },
        zonaSeleccionada: {
            type: Object,
            default: () => ({})
        },
        asientosOcupadosExternos: {
            type: Array,
            default: () => []
        },
        asientosSeleccionadosExternos: { // ⬅️ NUEVA PROP (Usada para el estado de selección)
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            zonaEnZoom: null,
            // ❌ Eliminamos asientosSeleccionadosLocales
        };
    },
    watch: {
        zonaSeleccionada: {
            handler(newZona) {
                // Si la zona viene vacía, mostramos el mapa general
                if (!newZona || !newZona.nombre) {
                    this.zonaEnZoom = null;
                    return;
                }
                // Asignamos la zona para hacer zoom
                this.zonaEnZoom = newZona;
            },
            immediate: true 
        }
    },
    methods: {
        getZonaColor(nombre) {
            const zona = this.todasZonas.find(z => z.nombre === nombre);
            return zona ? zona.color : '#ccc';
        },
        getZonaDisponibilidad(nombre) {
            const zona = this.todasZonas.find(z => z.nombre === nombre);
            return zona ? `${zona.disponibles} Disp.` : 'N/A';
        },
        getDisponibilidadLateralDividida() {
            const zona = this.todasZonas.find(z => z.nombre === 'Laterales');
            if (zona && zona.disponibles) {
                return Math.floor(zona.disponibles / 2);
            }
            return 'N/A';
        },
        seleccionarZonaClick(nombre) {
            const zona = this.todasZonas.find(z => z.nombre === nombre);
            if (zona) {
                this.$emit('seleccionar-zona-externa', zona); 
            }
        },
        volverAlMapaGeneral() {
            this.zonaEnZoom = null;
            this.$emit('seleccionar-zona-externa', {});
        },
        isSelected(fila, numero) {
            // 🔑 Usamos la prop externa
            return this.asientosSeleccionadosExternos.some(a => 
                a.fila === fila && a.numero === numero
            );
        },
        isOccupied(fila, numero) {
            if (!this.zonaEnZoom || !this.zonaEnZoom.nombre) return false;
            
            return this.asientosOcupadosExternos.some(a => 
                a.fila === fila && 
                a.numero === numero && 
                a.zona === this.zonaEnZoom.nombre
            );
        },
        toggleAsiento(fila, numero) { 
            const zonaActual = this.zonaEnZoom.nombre;
            
            if (this.isOccupied(fila, numero)) {
                return;
            }

            const asiento = { 
                fila: fila, 
                numero: numero, 
                zona: zonaActual // Incluimos la zona para que el padre pueda manejar los ocupados
            }; 
            
            // 🔑 Emitimos el evento para que el padre gestione la adición/eliminación
            this.$emit('asiento-seleccionado', asiento);
        }
    }
};
</script>

<style scoped>
/* Estilos del mapa de zonas (sin cambios) */
/* ---------------------------------------------------- */
/* ESTILOS GENERALES Y ESCENARIO */
/* ---------------------------------------------------- */
.seat-map-container {
    background-color: #ffffff;
    border: 1px solid #ddd;
    overflow: hidden;
}

.empty-area-placeholder {
    height: 50px;
    background-color: transparent;
    border: none;
}

.zone-map-title {
    font-weight: 700;
    color: #343a40;
}

/* ---------------------------------------------------- */
/* MODO 1: ESTADIO LAYOUT (Bloques) */
/* ---------------------------------------------------- */
.stadium-layout-container {
    padding: 20px 0;
}

.stadium-map {
    position: relative;
    width: 90%;
    max-width: 600px;
    aspect-ratio: 1.5 / 1;
    border: 3px solid #ccc;
    border-radius: 50% / 100% 100% 0 0;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 20px;
}

.zone-block {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    border: 2px solid rgba(0, 0, 0, 0.2);
    cursor: pointer;
    text-align: center;
    padding: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s, opacity 0.3s, border-color 0.3s;
    opacity: 0.9;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6); 
}

.zone-block:hover {
    opacity: 1;
    transform: scale(1.03);
}

.zone-block.zone-selected {
    border-color: #ff6b00;
    box-shadow: 0 0 15px rgba(255, 107, 0, 0.8);
    transform: scale(1.05);
}

.general-block-front {
    width: 60%; 
    height: 20%;
    bottom: 75%; 
    border-radius: 10px;
    z-index: 5; 
}

.central-block {
    width: 75%; 
    height: 25%;
    bottom: 45%; 
    border-radius: 10px;
    z-index: 4; 
}

.vip-block-middle {
    width: 85%; 
    height: 20%;
    bottom: 20%; 
    border-radius: 10px;
    z-index: 3; 
}

.main-stage-block {
    width: 95%; 
    height: 15%;
    bottom: 0; 
    border-radius: 10px;
    z-index: 1; 
    background-color: #343a40; 
    cursor: default;
    opacity: 1;
    border: 5px solid #ff6b00; 
}

.side-row {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2; 
}

.side-block {
    height: 50%; 
    width: 10%; 
    bottom: 25%; 
    border-radius: 10px;
    writing-mode: vertical-rl;
    padding: 10px 0;
    font-size: 0.75em; 
    line-height: 1.2; 
}

.side-block.left {
    left: 2%; 
}

.side-block.right {
    right: 2%; 
}

/* ---------------------------------------------------- */
/* MODO 2: ZOOM LAYOUT (Cuadrícula para Selección) */
/* ---------------------------------------------------- */
.seat-grid-wrapper {
    overflow-x: auto;
    padding-bottom: 10px;
}

.seat-grid {
    max-width: 700px; 
    display: grid;
    grid-template-columns: 45px repeat(var(--grid-cols), 1fr); 
    gap: 3px 5px;
    margin: 0 auto;
}

.row-label {
    grid-column: 1;
    font-weight: bold;
    text-align: right;
    margin-right: 5px;
    color: #6c757d;
    font-size: 0.8rem;
    align-self: center;
}

.seat-block {
    width: 18px;
    height: 18px; 
    border-radius: 4px;
    background-color: #ced4da; /* Color de disponible por defecto */
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: transform 0.1s, box-shadow 0.2s, background-color 0.2s;
    cursor: default;
}

.seat-block.occupied {
    background-color: #dc3545; /* Rojo vibrante */
    border-color: #a71d2a;
    cursor: not-allowed;
    transform: none; 
    box-shadow: none;
}

.seat-block.clickable {
    cursor: pointer;
}

.seat-block.clickable:hover {
    transform: scale(1.2);
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.seat-block.selected {
    background-color: v-bind('zonaEnZoom ? zonaEnZoom.color : "#dc3545"') !important;
    border-color: #343a40;
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    z-index: 10;
}

/* ---------------------------------------------------- */
/* ESTILOS DE LEYENDA */
/* ---------------------------------------------------- */
.available-legend {
    background-color: #ced4da;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.selected-legend {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.occupied-legend {
    background-color: #dc3545; /* Rojo vibrante */
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.main-stage-legend {
    background-color: #343a40; 
    border: 1px solid #ff6b00;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.legend-item {
    font-size: 0.9rem;
    color: #495057;
}
</style>