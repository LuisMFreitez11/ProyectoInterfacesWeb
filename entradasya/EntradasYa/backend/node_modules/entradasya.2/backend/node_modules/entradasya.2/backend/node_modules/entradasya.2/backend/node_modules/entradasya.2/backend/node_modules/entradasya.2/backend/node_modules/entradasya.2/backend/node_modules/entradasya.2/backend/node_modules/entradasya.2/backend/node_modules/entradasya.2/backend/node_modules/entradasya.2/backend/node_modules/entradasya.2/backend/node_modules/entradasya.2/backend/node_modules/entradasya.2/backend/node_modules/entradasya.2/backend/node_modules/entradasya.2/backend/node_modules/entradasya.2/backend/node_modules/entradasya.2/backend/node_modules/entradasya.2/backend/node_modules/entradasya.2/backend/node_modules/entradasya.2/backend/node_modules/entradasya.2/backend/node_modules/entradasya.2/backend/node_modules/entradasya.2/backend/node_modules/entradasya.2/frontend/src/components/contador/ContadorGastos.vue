<template>
  <div class="contador-gastos">
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

      <div class="filter-group">
        <label>Categoría:</label>
        <select v-model="selectedCategory" @change="loadData">
          <option value="">Todas las categorías</option>
          <option v-for="category in expenseCategories" :key="category.id" :value="category.id">
            {{ category.nombre }}
          </option>
        </select>
      </div>

      <button class="btn btn-primary" @click="exportData">
        <i class="bi bi-download me-2"></i>
        Exportar
      </button>
    </div>

    <!-- Métricas Principales -->
    <div class="metrics-grid">
      <div class="metric-card">
        <h4>Gastos Totales</h4>
        <div class="metric-value">${{ totalExpenses }}</div>
        <div class="metric-change negative">
          <i class="bi bi-arrow-up"></i>
          {{ expensesChange }}% vs período anterior
        </div>
      </div>

      <div class="metric-card">
        <h4>Gastos por Evento</h4>
        <div class="metric-value">${{ eventExpenses }}</div>
        <div class="metric-change neutral">
          <i class="bi bi-dash"></i>
          {{ eventExpensesPercent }}% del total
        </div>
      </div>

      <div class="metric-card">
        <h4>Gastos Operacionales</h4>
        <div class="metric-value">${{ operationalExpenses }}</div>
        <div class="metric-change positive">
          <i class="bi bi-arrow-down"></i>
          {{ operationalChange }}% vs período anterior
        </div>
      </div>

      <div class="metric-card">
        <h4>Promedio Diario</h4>
        <div class="metric-value">${{ dailyAverage }}</div>
        <div class="metric-change neutral">
          <i class="bi bi-dash"></i>
          Estable
        </div>
      </div>
    </div>

    <!-- Gastos por Categoría -->
    <div class="category-breakdown">
      <h4>Distribución de Gastos por Categoría</h4>
      <div class="category-list">
        <div v-for="category in expensesByCategory" :key="category.id" class="category-item">
          <div class="category-info">
            <span class="category-name">{{ category.nombre }}</span>
            <span class="category-amount">${{ category.monto }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: category.porcentaje + '%' }"></div>
          </div>
          <small class="category-percentage">{{ category.porcentaje }}%</small>
        </div>
      </div>
    </div>

    <!-- Tabla de Gastos Detallados -->
    <div class="data-table">
      <h4>Gastos Detallados</h4>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Usuario</th>
            <th>Evento</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in detailedExpenses" :key="expense.id">
            <td>{{ formatDate(expense.fecha) }}</td>
            <td>{{ expense.categoria }}</td>
            <td>{{ expense.descripcion }}</td>
            <td>${{ expense.monto }}</td>
            <td>{{ expense.usuario }}</td>
            <td>{{ expense.evento || 'General' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Gráfico de Tendencia -->
    <div class="chart-section">
      <h4>Tendencia de Gastos Mensual</h4>
      <div class="chart-placeholder">
        <i class="bi bi-graph-down"></i>
        <p>Gráfico de gastos por mes</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContadorGastos',
  data() {
    return {
      selectedPeriod: 'monthly',
      startDate: '',
      endDate: '',
      selectedCategory: '',
      totalExpenses: 0,
      eventExpenses: 0,
      operationalExpenses: 0,
      dailyAverage: 0,
      expensesChange: 0,
      eventExpensesPercent: 0,
      operationalChange: 0,
      expenseCategories: [],
      expensesByCategory: [],
      detailedExpenses: []
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
        // const response = await axios.get('/api/contador/expenses', {
        //   params: { startDate: this.startDate, endDate: this.endDate, category: this.selectedCategory }
        // })

        // Datos de ejemplo
        this.totalExpenses = 32100
        this.eventExpenses = 18500
        this.operationalExpenses = 13600
        this.dailyAverage = Math.round(this.totalExpenses / 30)
        this.expensesChange = 8.5
        this.eventExpensesPercent = Math.round((this.eventExpenses / this.totalExpenses) * 100)
        this.operationalChange = -5.2

        this.expenseCategories = [
          { id: 1, nombre: 'Marketing' },
          { id: 2, nombre: 'Infraestructura' },
          { id: 3, nombre: 'Personal' },
          { id: 4, nombre: 'Proveedores' }
        ]

        this.expensesByCategory = [
          { id: 1, nombre: 'Marketing', monto: 8500, porcentaje: 26 },
          { id: 2, nombre: 'Infraestructura', monto: 7200, porcentaje: 22 },
          { id: 3, nombre: 'Personal', monto: 9600, porcentaje: 30 },
          { id: 4, nombre: 'Proveedores', monto: 6800, porcentaje: 21 }
        ]

        this.detailedExpenses = [
          {
            id: 1,
            fecha: '2024-11-10',
            categoria: 'Marketing',
            descripcion: 'Campaña digital Facebook',
            monto: 2500,
            usuario: 'María García',
            evento: 'Concierto Rock 2024'
          },
          {
            id: 2,
            fecha: '2024-11-08',
            categoria: 'Infraestructura',
            descripcion: 'Mantenimiento servidores',
            monto: 1800,
            usuario: 'Carlos López',
            evento: null
          },
          {
            id: 3,
            fecha: '2024-11-05',
            categoria: 'Personal',
            descripcion: 'Salarios octubre',
            monto: 4800,
            usuario: 'Admin',
            evento: null
          }
        ]
      } catch (error) {
        console.error('Error loading expenses data:', error)
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES')
    },

    exportData() {
      // Implementar exportación a Excel/CSV
      alert('Funcionalidad de exportación próximamente disponible')
    }
  }
}
</script>

<style scoped>
.contador-gastos {
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

.category-breakdown {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.category-breakdown h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 200px;
  flex: 1;
}

.category-name {
  font-weight: 600;
  color: #2c3e50;
}

.category-amount {
  font-weight: 700;
  color: #ff6b00;
}

.progress-bar {
  flex: 2;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b00, #ff8533);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.category-percentage {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
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

  .category-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .category-info {
    min-width: auto;
    width: 100%;
  }

  .progress-bar {
    width: 100%;
  }
}
</style>
