<template>
  <div class="contador-dashboard">
    <!-- Resumen Ejecutivo -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="card-content">
          <h3>${{ totalRevenue }}</h3>
          <p>Ingresos Totales</p>
          <small :class="revenueChange >= 0 ? 'positive' : 'negative'">
            {{ revenueChange }}% vs mes anterior
          </small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-graph-down"></i>
        </div>
        <div class="card-content">
          <h3>${{ totalExpenses }}</h3>
          <p>Gastos Totales</p>
          <small :class="expensesChange >= 0 ? 'negative' : 'positive'">
            {{ expensesChange }}% vs mes anterior
          </small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-bank"></i>
        </div>
        <div class="card-content">
          <h3>${{ netProfit }}</h3>
          <p>Utilidad Neta</p>
          <small :class="profitChange >= 0 ? 'positive' : 'negative'">
            {{ profitChange }}% vs mes anterior
          </small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="card-content">
          <h3>{{ pendingConciliations }}</h3>
          <p>Conciliaciones Pendientes</p>
          <small class="warning">Requiere atención</small>
        </div>
      </div>
    </div>

    <!-- Gráficos de Tendencia -->
    <div class="charts-section">
      <div class="chart-container">
        <h4>Ingresos vs Gastos - Últimos 6 meses</h4>
        <div class="chart-placeholder">
          <i class="bi bi-graph-up"></i>
          <p>Gráfico de tendencias mensuales</p>
        </div>
      </div>

      <div class="chart-container">
        <h4>Distribución de Gastos por Categoría</h4>
        <div class="chart-placeholder">
          <i class="bi bi-pie-chart"></i>
          <p>Gráfico circular de gastos</p>
        </div>
      </div>
    </div>

    <!-- Actividad Reciente -->
    <div class="recent-activity">
      <h4>Actividad Reciente</h4>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <small class="activity-time">{{ activity.time }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchJson } from '../../utils/api.js'

export default {
  name: 'ContadorDashboard',
  data() {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      revenueChange: 0,
      expensesChange: 0,
      profitChange: 0,
      pendingConciliations: 0,
      recentActivities: [
        {
          id: 1,
          icon: 'bi bi-cash-stack text-success',
          text: 'Pago procesado: $1,250.00',
          time: 'Hace 2 horas'
        },
        {
          id: 2,
          icon: 'bi bi-receipt text-info',
          text: 'Nuevo gasto registrado: Marketing',
          time: 'Hace 4 horas'
        },
        {
          id: 3,
          icon: 'bi bi-bank text-warning',
          text: 'Conciliación bancaria pendiente',
          time: 'Hace 1 día'
        },
        {
          id: 4,
          icon: 'bi bi-file-earmark-text text-primary',
          text: 'Reporte mensual generado',
          time: 'Hace 2 días'
        }
      ]
    }
  },
  mounted() {
    this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      try {
        const response = await fetchJson('/api/contador/dashboard/summary')

        if (response.success) {
          this.totalRevenue = response.data.totalRevenue || 0
          this.totalExpenses = response.data.totalExpenses || 0
          this.netProfit = response.data.balance || 0
          this.pendingConciliations = response.data.pendingMovements || 0

          // Change percentages not available from API, set to 0
          this.revenueChange = 0
          this.expensesChange = 0
          this.profitChange = 0
        } else {
          console.error('Error fetching dashboard data:', response.message)
          // Fallback to dummy data if API fails
          this.totalRevenue = 45250
          this.totalExpenses = 32100
          this.netProfit = this.totalRevenue - this.totalExpenses
          this.pendingConciliations = 3
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Fallback to dummy data if API fails
        this.totalRevenue = 45250
        this.totalExpenses = 32100
        this.netProfit = this.totalRevenue - this.totalExpenses
        this.pendingConciliations = 3
      }
    }
  }
}
</script>

<style scoped>
.contador-dashboard {
  padding: 20px 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
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

.positive {
  color: #28a745;
}

.negative {
  color: #dc3545;
}

.warning {
  color: #ffc107;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.chart-container {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chart-container h4 {
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
  height: 200px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.chart-placeholder i {
  font-size: 3rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.chart-placeholder p {
  margin: 0;
  font-weight: 500;
}

.recent-activity {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.recent-activity h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ff6b00;
}

.activity-icon {
  font-size: 1.5rem;
  margin-right: 15px;
  width: 30px;
  text-align: center;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-weight: 500;
}

.activity-time {
  color: #6c757d;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .charts-section {
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
}
</style>
