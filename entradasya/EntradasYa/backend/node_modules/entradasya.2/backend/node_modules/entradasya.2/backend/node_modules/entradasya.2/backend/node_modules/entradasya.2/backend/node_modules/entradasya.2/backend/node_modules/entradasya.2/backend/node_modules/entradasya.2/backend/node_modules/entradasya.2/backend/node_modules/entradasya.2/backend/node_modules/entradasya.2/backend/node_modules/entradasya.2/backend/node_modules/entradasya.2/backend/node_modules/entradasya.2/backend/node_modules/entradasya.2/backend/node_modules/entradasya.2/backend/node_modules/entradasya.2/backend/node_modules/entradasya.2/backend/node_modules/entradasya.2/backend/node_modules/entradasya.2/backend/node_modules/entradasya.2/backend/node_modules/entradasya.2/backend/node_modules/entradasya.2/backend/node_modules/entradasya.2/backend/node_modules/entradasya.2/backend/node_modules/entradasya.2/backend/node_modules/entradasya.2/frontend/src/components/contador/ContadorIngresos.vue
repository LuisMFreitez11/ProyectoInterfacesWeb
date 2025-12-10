<template>
  <div class="contador-ingresos">
    <!-- Filtros -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Período:</label>
        <select v-model="selectedPeriod" @change="loadData">
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
          <option value="yearly">Anual</option>
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

      <button class="btn btn-primary" @click="exportData">
        <i class="bi bi-download me-2"></i>
        Exportar
      </button>
    </div>

    <!-- Métricas Principales -->
    <div class="metrics-grid">
      <div class="metric-card">
        <h4>Ventas Totales</h4>
        <div class="metric-value">${{ totalSales }}</div>
        <div class="metric-change positive">
          <i class="bi bi-arrow-up"></i>
          {{ salesChange }}% vs período anterior
        </div>
      </div>

      <div class="metric-card">
        <h4>Tickets Vendidos</h4>
        <div class="metric-value">{{ totalTickets }}</div>
        <div class="metric-change positive">
          <i class="bi bi-arrow-up"></i>
          {{ ticketsChange }}% vs período anterior
        </div>
      </div>

      <div class="metric-card">
        <h4>Promedio por Ticket</h4>
        <div class="metric-value">${{ averageTicket }}</div>
        <div class="metric-change neutral">
          <i class="bi bi-dash"></i>
          Sin cambios
        </div>
      </div>

      <div class="metric-card">
        <h4>Comisiones Totales</h4>
        <div class="metric-value">${{ totalCommissions }}</div>
        <div class="metric-change negative">
          <i class="bi bi-arrow-down"></i>
          {{ commissionsChange }}% vs período anterior
        </div>
      </div>
    </div>

    <!-- Tabla de Ventas por Evento -->
    <div class="data-table">
      <h4>Ventas por Evento</h4>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Evento</th>
            <th>Fecha</th>
            <th>Tickets Vendidos</th>
            <th>Ingresos</th>
            <th>Ocupación</th>
            <th>Estado de Pagos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in salesByEvent" :key="event.id">
            <td>{{ event.nombre }}</td>
            <td>{{ formatDate(event.fecha) }}</td>
            <td>{{ event.tickets_vendidos }}</td>
            <td>${{ event.ingresos }}</td>
            <td>{{ event.ocupacion }}%</td>
            <td>
              <span class="badge" :class="getPaymentStatusClass(event.estado_pagos)">
                {{ event.estado_pagos }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Gráfico de Tendencia -->
    <div class="chart-section">
      <h4>Tendencia de Ingresos</h4>
      <div class="chart-placeholder">
        <i class="bi bi-graph-up"></i>
        <p>Gráfico de ingresos por período</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContadorIngresos',
  data() {
    return {
      selectedPeriod: 'monthly',
      startDate: '',
      endDate: '',
      totalSales: 0,
      totalTickets: 0,
      averageTicket: 0,
      totalCommissions: 0,
      salesChange: 0,
      ticketsChange: 0,
      commissionsChange: 0,
      salesByEvent: []
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
        // const response = await axios.get('/api/contador/sales', {
        //   params: { startDate: this.startDate, endDate: this.endDate, period: this.selectedPeriod }
        // })

        // Datos de ejemplo
        this.totalSales = 45250
        this.totalTickets = 1250
        this.averageTicket = Math.round(this.totalSales / this.totalTickets)
        this.totalCommissions = 1357
        this.salesChange = 12.5
        this.ticketsChange = 8.3
        this.commissionsChange = -2.1

        this.salesByEvent = [
          {
            id: 1,
            nombre: 'Concierto Rock 2024',
            fecha: '2024-11-15',
            tickets_vendidos: 450,
            ingresos: 18000,
            ocupacion: 90,
            estado_pagos: 'completado'
          },
          {
            id: 2,
            nombre: 'Festival Jazz',
            fecha: '2024-11-20',
            tickets_vendidos: 320,
            ingresos: 12800,
            ocupacion: 64,
            estado_pagos: 'pendiente'
          },
          {
            id: 3,
            nombre: 'Teatro Musical',
            fecha: '2024-11-25',
            tickets_vendidos: 480,
            ingresos: 14450,
            ocupacion: 96,
            estado_pagos: 'completado'
          }
        ]
      } catch (error) {
        console.error('Error loading sales data:', error)
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES')
    },

    getPaymentStatusClass(status) {
      const classes = {
        'completado': 'bg-success',
        'pendiente': 'bg-warning',
        'cancelado': 'bg-danger',
        'reembolsado': 'bg-secondary'
      }
      return classes[status] || 'bg-secondary'
    },

    exportData() {
      // Implementar exportación a Excel/CSV
      alert('Funcionalidad de exportación próximamente disponible')
    }
  }
}
</script>

<style scoped>
.contador-ingresos {
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.metric-card h4 {
  color: #6c757d;
  margin-bottom: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.metric-change {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.metric-change.positive {
  color: #28a745;
}

.metric-change.negative {
  color: #dc3545;
}

.metric-change.neutral {
  color: #6c757d;
}

.data-table {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.data-table h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
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

/* Responsive */
@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: auto;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: 20px;
  }

  .metric-value {
    font-size: 1.8rem;
  }
}
</style>
