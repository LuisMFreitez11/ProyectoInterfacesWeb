<template>
  <div class="contador-movimientos">
    <!-- Filtros -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Tipo:</label>
        <select v-model="selectedType" @change="loadData">
          <option value="">Todos los tipos</option>
          <option value="ingreso">Ingresos</option>
          <option value="gasto">Gastos</option>
          <option value="ajuste">Ajustes</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Fecha Desde:</label>
        <input type="date" v-model="startDate" @change="loadData">
      </div>

      <div class="filter-group">
        <label>Fecha Hasta:</label>
        <input type="date" v-model="endDate" @change="loadData">
      </div>

      <div class="filter-group">
        <label>Estado:</label>
        <select v-model="selectedStatus" @change="loadData">
          <option value="">Todos los estados</option>
          <option value="contabilizado">Contabilizado</option>
          <option value="pendiente">Pendiente</option>
          <option value="conciliado">Conciliado</option>
        </select>
      </div>

      <button class="btn btn-primary" @click="newMovement">
        <i class="bi bi-plus-circle me-2"></i>
        Nuevo Movimiento
      </button>
    </div>

    <!-- Resumen de Movimientos -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-graph-up"></i>
        </div>
        <div class="card-content">
          <h3>{{ totalMovements }}</h3>
          <p>Total Movimientos</p>
          <small class="neutral">Este período</small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="card-content">
          <h3>{{ contabilizedMovements }}</h3>
          <p>Contabilizados</p>
          <small class="success">{{ contabilizedPercent }}% del total</small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-clock"></i>
        </div>
        <div class="card-content">
          <h3>{{ pendingMovements }}</h3>
          <p>Pendientes</p>
          <small class="warning">Requieren atención</small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-bank"></i>
        </div>
        <div class="card-content">
          <h3>{{ conciliatedMovements }}</h3>
          <p>Conciliados</p>
          <small class="info">{{ conciliatedPercent }}% del total</small>
        </div>
      </div>
    </div>

    <!-- Tabla de Movimientos -->
    <div class="movements-table">
      <h4>Movimientos Contables</h4>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Referencia</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Estado Contable</th>
              <th>Estado Conciliación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movement in movements" :key="movement.id">
              <td>{{ formatDate(movement.fecha) }}</td>
              <td>
                <span class="badge" :class="getTypeClass(movement.tipo)">
                  {{ movement.tipo }}
                </span>
              </td>
              <td>{{ movement.referencia }}</td>
              <td>{{ movement.descripcion }}</td>
              <td :class="movement.tipo === 'ingreso' ? 'text-success fw-bold' : 'text-danger fw-bold'">
                {{ movement.tipo === 'ingreso' ? '+' : '-' }}${{ movement.monto }}
              </td>
              <td>
                <span class="badge" :class="getContableStatusClass(movement.contabilizado)">
                  {{ movement.contabilizado ? 'Contabilizado' : 'Pendiente' }}
                </span>
              </td>
              <td>
                <span class="badge" :class="getConciliationStatusClass(movement.conciliado)">
                  {{ movement.conciliado ? 'Conciliado' : 'Pendiente' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-info me-2" @click="viewDetails(movement)">
                  <i class="bi bi-eye"></i>
                </button>
                <button v-if="!movement.contabilizado" class="btn btn-sm btn-success me-2" @click="markAsContabilized(movement)">
                  <i class="bi bi-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" @click="editMovement(movement)">
                  <i class="bi bi-pencil"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Gráfico de Movimientos por Tipo -->
    <div class="chart-section">
      <h4>Distribución de Movimientos por Tipo</h4>
      <div class="chart-placeholder">
        <i class="bi bi-bar-chart"></i>
        <p>Gráfico de barras por tipo de movimiento</p>
      </div>
    </div>

    <!-- Movimientos Recientes -->
    <div class="recent-movements">
      <h4>Movimientos Recientes</h4>
      <div class="timeline">
        <div v-for="movement in recentMovements" :key="movement.id" class="timeline-item">
          <div class="timeline-marker" :class="movement.tipo"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="movement-type">{{ movement.tipo }}</span>
              <span class="movement-amount" :class="movement.tipo === 'ingreso' ? 'positive' : 'negative'">
                {{ movement.tipo === 'ingreso' ? '+' : '-' }}${{ movement.monto }}
              </span>
            </div>
            <p class="movement-description">{{ movement.descripcion }}</p>
            <small class="movement-date">{{ formatDate(movement.fecha) }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContadorMovimientos',
  data() {
    return {
      selectedType: '',
      startDate: '',
      endDate: '',
      selectedStatus: '',
      totalMovements: 0,
      contabilizedMovements: 0,
      pendingMovements: 0,
      conciliatedMovements: 0,
      contabilizedPercent: 0,
      conciliatedPercent: 0,
      movements: [],
      recentMovements: []
    }
  },
  mounted() {
    this.setDefaultDates()
    this.loadData()
  },
  methods: {
    setDefaultDates() {
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)

      this.endDate = today.toISOString().split('T')[0]
      this.startDate = thirtyDaysAgo.toISOString().split('T')[0]
    },

    async loadData() {
      try {
        // Aquí irían las llamadas a la API
        // const response = await axios.get('/api/contador/movements', {
        //   params: { type: this.selectedType, startDate: this.startDate, endDate: this.endDate, status: this.selectedStatus }
        // })

        // Datos de ejemplo
        this.totalMovements = 45
        this.contabilizedMovements = 38
        this.pendingMovements = 7
        this.conciliatedMovements = 32
        this.contabilizedPercent = Math.round((this.contabilizedMovements / this.totalMovements) * 100)
        this.conciliatedPercent = Math.round((this.conciliatedMovements / this.totalMovements) * 100)

        this.movements = [
          {
            id: 1,
            fecha: '2024-11-15',
            tipo: 'ingreso',
            referencia: 'COMP-001',
            descripcion: 'Venta entradas Concierto Rock 2024',
            monto: 8500,
            contabilizado: true,
            conciliado: true
          },
          {
            id: 2,
            fecha: '2024-11-14',
            tipo: 'gasto',
            referencia: 'GAST-045',
            descripcion: 'Marketing digital Facebook Ads',
            monto: 2500,
            contabilizado: true,
            conciliado: false
          },
          {
            id: 3,
            fecha: '2024-11-13',
            tipo: 'ingreso',
            referencia: 'COMP-002',
            descripcion: 'Venta entradas Teatro Musical',
            monto: 4800,
            contabilizado: true,
            conciliado: true
          },
          {
            id: 4,
            fecha: '2024-11-12',
            tipo: 'gasto',
            referencia: 'GAST-046',
            descripcion: 'Comisión Mercado Pago',
            monto: 125,
            contabilizado: false,
            conciliado: false
          },
          {
            id: 5,
            fecha: '2024-11-11',
            tipo: 'ajuste',
            referencia: 'AJUST-012',
            descripcion: 'Ajuste inventario entradas',
            monto: 300,
            contabilizado: true,
            conciliado: true
          }
        ]

        this.recentMovements = [
          {
            id: 1,
            fecha: '2024-11-15',
            tipo: 'ingreso',
            descripcion: 'Venta entradas Concierto Rock 2024',
            monto: 8500
          },
          {
            id: 2,
            fecha: '2024-11-14',
            tipo: 'gasto',
            descripcion: 'Marketing digital Facebook Ads',
            monto: 2500
          },
          {
            id: 3,
            fecha: '2024-11-13',
            tipo: 'ingreso',
            descripcion: 'Venta entradas Teatro Musical',
            monto: 4800
          }
        ]
      } catch (error) {
        console.error('Error loading movements data:', error)
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES')
    },

    getTypeClass(type) {
      const classes = {
        'ingreso': 'bg-success',
        'gasto': 'bg-danger',
        'ajuste': 'bg-warning'
      }
      return classes[type] || 'bg-secondary'
    },

    getContableStatusClass(contabilized) {
      return contabilized ? 'bg-success' : 'bg-warning'
    },

    getConciliationStatusClass(conciliated) {
      return conciliated ? 'bg-info' : 'bg-secondary'
    },

    viewDetails(movement) {
      // Implementar vista de detalles
      alert(`Detalles del movimiento ${movement.id}`)
    },

    markAsContabilized(movement) {
      // Implementar marcar como contabilizado
      movement.contabilizado = true
      this.loadData()
    },

    editMovement(movement) {
      // Implementar edición de movimiento
      alert(`Editar movimiento ${movement.id}`)
    },

    newMovement() {
      // Implementar nuevo movimiento
      alert('Nuevo movimiento próximamente disponible')
    }
  }
}
</script>

<style scoped>
.contador-movimientos {
  padding: 20px 0;
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  font-size: 0.9rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  font-size: 3rem;
  color: #ff6b00;
  margin-right: 20px;
}

.card-content h3 {
  margin: 0 0 5px 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
}

.card-content p {
  margin: 0 0 5px 0;
  color: #7f8c8d;
  font-weight: 500;
  font-size: 1rem;
}

.card-content small {
  font-size: 0.85rem;
  font-weight: 600;
}

.success {
  color: #28a745;
}

.warning {
  color: #ffc107;
}

.danger {
  color: #dc3545;
}

.neutral {
  color: #6c757d;
}

.info {
  color: #17a2b8;
}

.movements-table {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.movements-table h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #2c3e50;
  padding: 12px;
  white-space: nowrap;
}

.table td {
  padding: 12px;
  vertical-align: middle;
}

.badge {
  font-size: 0.75rem;
  padding: 6px 10px;
}

.chart-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.chart-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.chart-placeholder i {
  font-size: 4rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.chart-placeholder p {
  margin: 0;
  font-weight: 500;
}

.recent-movements {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.recent-movements h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  padding-left: 20px;
}

.timeline-marker {
  position: absolute;
  left: -22px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.timeline-marker.ingreso {
  background-color: #28a745;
}

.timeline-marker.gasto {
  background-color: #dc3545;
}

.timeline-marker.ajuste {
  background-color: #ffc107;
}

.timeline-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #ff6b00;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.movement-type {
  font-weight: 600;
  text-transform: capitalize;
  color: #2c3e50;
}

.movement-amount {
  font-weight: 700;
  font-size: 1.1rem;
}

.movement-amount.positive {
  color: #28a745;
}

.movement-amount.negative {
  color: #dc3545;
}

.movement-description {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-weight: 500;
}

.movement-date {
  color: #6c757d;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: auto;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .summary-card {
    padding: 20px;
  }

  .card-icon {
    font-size: 2.5rem;
    margin-right: 15px;
  }

  .card-content h3 {
    font-size: 1.8rem;
  }

  .timeline {
    padding-left: 20px;
  }

  .timeline-item {
    padding-left: 15px;
  }

  .timeline-marker {
    left: -17px;
  }
}
</style>
