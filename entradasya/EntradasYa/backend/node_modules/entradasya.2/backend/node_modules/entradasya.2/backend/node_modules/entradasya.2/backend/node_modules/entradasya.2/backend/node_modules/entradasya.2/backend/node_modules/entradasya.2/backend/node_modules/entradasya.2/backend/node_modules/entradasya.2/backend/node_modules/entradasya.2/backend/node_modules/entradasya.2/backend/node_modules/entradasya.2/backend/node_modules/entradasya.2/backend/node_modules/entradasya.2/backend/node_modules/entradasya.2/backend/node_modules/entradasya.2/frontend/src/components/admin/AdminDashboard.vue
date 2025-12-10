<template>
  <div class="dashboard-container">
    <h2 class="dashboard-title">Dashboard Administrativo</h2>

    <!-- Métricas Principales -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">
          <i class="bi bi-calendar-event"></i>
        </div>
        <div class="metric-content">
          <h3>{{ totalEvents }}</h3>
          <p>Total Eventos</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="bi bi-ticket-perforated"></i>
        </div>
        <div class="metric-content">
          <h3>{{ totalTickets }}</h3>
          <p>Tickets Vendidos</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="metric-content">
          <h3>${{ totalRevenue }}</h3>
          <p>Ingresos Totales</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="bi bi-people"></i>
        </div>
        <div class="metric-content">
          <h3>{{ totalUsers }}</h3>
          <p>Usuarios Registrados</p>
        </div>
      </div>
    </div>

    <!-- Gráficos y Estadísticas (deshabilitados) -->
    <div class="charts-section">
      <div class="chart-container">
        <h4>Ventas por Mes</h4>
        <div class="chart-placeholder">Gráfico deshabilitado (usar componentes Vue/Bootstrap)</div>
      </div>

      <div class="chart-container">
        <h4>Eventos por Estado</h4>
        <div class="chart-placeholder">Gráfico deshabilitado</div>
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
            <p>{{ activity.description }}</p>
            <small>{{ activity.timestamp }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      totalEvents: 0,
      totalTickets: 0,
      totalRevenue: 0,
      totalUsers: 0,
      recentActivities: [],
      // charts disabled
    };
  },
  async mounted() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      try {
        // Cargar métricas principales
        const [eventsRes, ticketsRes, revenueRes, usersRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/tickets'),
          fetch('/api/payments'),
          fetch('/api/users')
        ]);

        const events = await eventsRes.json();
        const tickets = await ticketsRes.json();
        const payments = await revenueRes.json();
        const users = await usersRes.json();

        this.totalEvents = events.data.length;
        this.totalTickets = tickets.data.length;
        this.totalRevenue = payments.data.reduce((sum, payment) => sum + payment.monto, 0);
        this.totalUsers = users.data.length;

        // Cargar actividad reciente
        this.recentActivities = [
          { id: 1, description: 'Nuevo evento creado: Concierto de Rock', icon: 'bi bi-calendar-plus', timestamp: 'Hace 2 horas' },
          { id: 2, description: 'Pago procesado: $150.00', icon: 'bi bi-cash', timestamp: 'Hace 4 horas' },
          { id: 3, description: 'Usuario registrado: Juan Pérez', icon: 'bi bi-person-plus', timestamp: 'Hace 6 horas' }
        ];
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    },
    // charts removed
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-title {
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 700;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.metric-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
}

.metric-icon {
  font-size: 2.5rem;
  color: #4CAF50;
  margin-right: 20px;
}

.metric-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.metric-content p {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-weight: 500;
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
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chart-container h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.recent-activity {
  background: white;
  border-radius: 10px;
  padding: 20px;
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
  padding: 10px;
  border-radius: 8px;
  background: #f8f9fa;
}

.activity-icon {
  font-size: 1.5rem;
  color: #4CAF50;
  margin-right: 15px;
}

.activity-content p {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
}

.activity-content small {
  color: #7f8c8d;
}
</style>
