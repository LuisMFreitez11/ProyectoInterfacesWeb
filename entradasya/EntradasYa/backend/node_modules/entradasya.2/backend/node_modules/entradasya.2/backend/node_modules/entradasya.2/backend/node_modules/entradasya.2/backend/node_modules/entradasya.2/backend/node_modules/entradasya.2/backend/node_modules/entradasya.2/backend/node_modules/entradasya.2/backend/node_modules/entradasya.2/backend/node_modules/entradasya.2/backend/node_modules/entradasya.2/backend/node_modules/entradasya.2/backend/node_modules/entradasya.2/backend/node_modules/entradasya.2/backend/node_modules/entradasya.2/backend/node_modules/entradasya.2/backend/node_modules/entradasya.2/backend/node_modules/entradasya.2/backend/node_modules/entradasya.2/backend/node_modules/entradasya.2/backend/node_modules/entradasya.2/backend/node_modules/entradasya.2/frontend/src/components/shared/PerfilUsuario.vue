<template>
  <div class="user-profile-container py-5">
    <div class="container my-5" v-if="usuario && usuario.nombre">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow-lg border-0 profile-card">
            <div class="card-body p-4 p-md-5">
              <h2 class="card-title text-center mb-4 fw-bold text-primary-orange">
                Perfil de Usuario
              </h2>
              <p class="text-center text-muted mb-5">
                Bienvenido/a a tu espacio personal, {{ usuario.nombre }}. Aquí puedes gestionar tu información y
                acceder a tus boletos.
              </p>

              <div class="mb-5 p-4 bg-light rounded shadow-sm">
                <h4 class="fw-bold mb-3 text-dark">Información Personal</h4>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold">Nombre Completo:</label>
                    <p class="form-control-plaintext">{{ usuario.nombre }} {{ usuario.apellido || '' }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold">Correo Electrónico:</label>
                    <p class="form-control-plaintext">{{ usuario.email }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold">Teléfono:</label>
                    <p class="form-control-plaintext">
                      {{ usuario.telefono || usuario.numTelefonico || 'No especificado' }}
                    </p>
                  </div>
                </div>
                <button class="btn btn-outline-secondary btn-sm mt-3" @click="$emit('abrir-edicion', usuario)">
                    Editar Perfil
                </button>
              </div>

              <div class="mb-5">
                <h4 class="fw-bold mb-4 text-dark">Historial de Compras</h4>
                <div v-if="!usuario.historialCompras || usuario.historialCompras.length === 0" class="alert alert-info text-center">
                  Aún no tienes compras realizadas. ¡Explora nuestros <a href="#" @click.prevent="navegarHomeEventos"
                    class="alert-link text-primary-orange">eventos</a>!
                </div>
                <div v-else>
                  <div class="list-group">
                    <div v-for="compra in usuario.historialCompras" :key="compra.id"
                      class="list-group-item list-group-item-action flex-column align-items-start mb-3 shadow-sm rounded">
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1 fw-bold">{{ compra.evento }}</h5>
                        <small class="text-muted">{{ compra.fechaCompra }}</small>
                      </div>
                      <p class="mb-1">Cantidad: {{ compra.cantidad }} tickets</p>
                      <small class="text-muted">Total: ${{ compra.total ? compra.total.toFixed(2) : '0.00' }}</small>
                      <button class="btn btn-sm btn-outline-primary-orange mt-2" @click="verDetalleCompra(compra.id)">
                        Ver Detalle de Compra
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="fw-bold mb-4 text-dark">Mis Tickets Activos</h4>
                <div v-if="!usuario.ticketsActivos || usuario.ticketsActivos.length === 0" class="alert alert-warning text-center">
                  No tienes tickets activos para próximos eventos.
                </div>
                <div v-else>
                  <div class="row row-cols-1 row-cols-md-2 g-4">
                    <div class="col" v-for="ticket in usuario.ticketsActivos" :key="ticket.id">
                      <div class="card h-100 shadow-sm ticket-card">
                        <div class="card-body">
                          <h5 class="card-title fw-bold text-primary-orange">{{ ticket.evento }}</h5>
                          <p class="card-text mb-1">
                            <i class="bi bi-calendar-event me-2"></i>Fecha: {{ ticket.fechaEvento }}
                          </p>
                          <p class="card-text mb-1">
                            <i class="bi bi-geo-alt me-2"></i>Lugar: {{ ticket.lugar }}
                          </p>
                          <p class="card-text mb-3">
                            <i class="bi bi-ticket me-2"></i>Entradas: {{ ticket.cantidad }}
                          </p>
                          <div class="d-grid gap-2">
                            <button class="btn btn-primary-orange" @click="descargarTicket(ticket)">
                              <i class="bi bi-download me-2"></i>Descargar Ticket
                            </button>
                            <button class="btn btn-outline-secondary" @click="verMapa(ticket.lugar)">
                              <i class="bi bi-map me-2"></i>Ver Ubicación
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="container my-5 text-center">
      <div class="alert alert-info" role="alert">
        Cargando datos de perfil o no hay sesión activa...
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PerfilUsuario',
  emits: ['abrir-edicion'], // 🚨 Evento emitido para abrir el modal de edición
  props: {
    usuario: {
      type: Object,
      required: false,
      default: () => ({}), 
    },
    navegarHandler: {
      type: Function,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {
    verDetalleCompra(compraId) {
      alert(`Simulando ver detalles de la compra: ${compraId}`);
    },
    descargarTicket(ticket) {
      alert(`Simulando descarga de ticket para ${ticket.evento}. ¡Ticket listo para el evento!`);
    },
    verMapa(lugar) {
      alert(`Simulando ver ubicación de ${lugar} en el mapa.`);
    },
    navegarHomeEventos() {
      this.navegarHandler('#eventos-ancla');
    }
  }
};
</script>

<style scoped>
.user-profile-container {
  min-height: calc(100vh - 200px);
  background-color: #f8f9fa;
}

.profile-card {
  border-radius: 15px;
}

.text-primary-orange {
  color: #ff6b00;
}

.btn-primary-orange {
  background-color: #ff6b00;
  border-color: #ff6b00;
  color: white;
  transition: background-color 0.3s;
}

.btn-primary-orange:hover {
  background-color: #e65c00;
  border-color: #e65c00;
}

.btn-outline-primary-orange {
  color: #ff6b00;
  border-color: #ff6b00;
}

.btn-outline-primary-orange:hover {
  background-color: #ff6b00;
  color: white;
}

.ticket-card {
  border-left: 5px solid #ff6b00;
}

.list-group-item strong {
  color: #ff6b00;
}
</style>