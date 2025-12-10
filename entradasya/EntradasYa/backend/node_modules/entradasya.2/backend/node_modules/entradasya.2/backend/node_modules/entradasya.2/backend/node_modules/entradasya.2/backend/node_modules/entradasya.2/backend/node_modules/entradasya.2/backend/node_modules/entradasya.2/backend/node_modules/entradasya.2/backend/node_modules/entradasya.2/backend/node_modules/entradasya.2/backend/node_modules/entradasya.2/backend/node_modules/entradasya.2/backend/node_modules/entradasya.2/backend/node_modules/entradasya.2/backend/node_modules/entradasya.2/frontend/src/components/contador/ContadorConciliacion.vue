<template>
  <div class="contador-conciliacion">
    <!-- Filtros -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Cuenta Bancaria:</label>
        <select v-model="selectedAccount" @change="loadData">
          <option value="">Todas las cuentas</option>
          <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
            {{ account.nombre }}
          </option>
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
          <option value="pendiente">Pendiente</option>
          <option value="conciliado">Conciliado</option>
          <option value="diferencia">Con Diferencia</option>
        </select>
      </div>

      <button class="btn btn-primary" @click="newConciliation">
        <i class="bi bi-plus-circle me-2"></i>
        Nueva Conciliación
      </button>
    </div>

    <!-- Resumen de Conciliaciones -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="card-content">
          <h3>{{ totalConciliated }}</h3>
          <p>Conciliaciones Completadas</p>
          <small class="success">{{ conciliatedPercent }}% del total</small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-clock"></i>
        </div>
        <div class="card-content">
          <h3>{{ pendingConciliations }}</h3>
          <p>Pendientes</p>
          <small class="warning">Requieren atención</small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <div class="card-content">
          <h3>{{ differencesFound }}</h3>
          <p>Diferencias Encontradas</p>
          <small class="danger">Revisar manualmente</small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-cash"></i>
        </div>
        <div class="card-content">
          <h3>${{ totalDifferences }}</h3>
          <p>Total Diferencias</p>
          <small class="neutral">Valor absoluto</small>
        </div>
      </div>
    </div>

    <!-- Lista de Conciliaciones -->
    <div class="conciliations-list">
      <h4>Conciliaciones Recientes</h4>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cuenta</th>
              <th>Saldo Inicial</th>
              <th>Saldo Final</th>
              <th>Movimientos</th>
              <th>Diferencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="conciliation in conciliations" :key="conciliation.id">
              <td>{{ formatDate(conciliation.fecha) }}</td>
              <td>{{ conciliation.cuenta }}</td>
              <td>${{ conciliation.saldo_inicial }}</td>
              <td>${{ conciliation.saldo_final }}</td>
              <td>{{ conciliation.movimientos }}</td>
              <td :class="conciliation.diferencia != 0 ? 'text-danger fw-bold' : 'text-success'">
                ${{ conciliation.diferencia }}
              </td>
              <td>
                <span class="badge" :class="getStatusClass(conciliation.estado)">
                  {{ conciliation.estado }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2" @click="viewDetails(conciliation)">
                  <i class="bi bi-eye"></i>
                </button>
                <button v-if="conciliation.estado === 'pendiente'" class="btn btn-sm btn-success" @click="markAsConciliated(conciliation)">
                  <i class="bi bi-check"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Movimientos Pendientes -->
    <div class="pending-movements">
      <h4>Movimientos Pendientes de Conciliar</h4>
      <div class="movements-grid">
        <div v-for="movement in pendingMovements" :key="movement.id" class="movement-card">
          <div class="movement-header">
            <span class="movement-type" :class="movement.tipo === 'ingreso' ? 'income' : 'expense'">
              {{ movement.tipo === 'ingreso' ? 'Ingreso' : 'Gasto' }}
            </span>
            <span class="movement-date">{{ formatDate(movement.fecha) }}</span>
          </div>
          <div class="movement-body">
            <p class="movement-description">{{ movement.descripcion }}</p>
            <div class="movement-amount">
              <span :class="movement.tipo === 'ingreso' ? 'text-success' : 'text-danger'">
                {{ movement.tipo === 'ingreso' ? '+' : '-' }}${{ movement.monto }}
              </span>
            </div>
          </div>
          <div class="movement-actions">
            <button class="btn btn-sm btn-outline-success" @click="conciliateMovement(movement)">
              <i class="bi bi-check-circle me-1"></i>
              Conciliar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContadorConciliacion',
  data() {
    return {
      selectedAccount: '',
      startDate: '',
      endDate: '',
      selectedStatus: '',
      totalConciliated: 0,
      pendingConciliations: 0,
      differencesFound: 0,
      totalDifferences: 0,
      conciliatedPercent: 0,
      bankAccounts: [],
      conciliations: [],
      pendingMovements: []
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
        // const response = await axios.get('/api/contador/conciliation', {
        //   params: { account: this.selectedAccount, startDate: this.startDate, endDate: this.endDate, status: this.selectedStatus }
        // })

        // Datos de ejemplo
        this.totalConciliated = 12
        this.pendingConciliations = 3
        this.differencesFound = 2
        this.totalDifferences = 450
        this.conciliatedPercent = Math.round((this.totalConciliated / (this.totalConciliated + this.pendingConciliations)) * 100)

        this.bankAccounts = [
          { id: 1, nombre: 'Cuenta Corriente BBVA' },
          { id: 2, nombre: 'Cuenta Ahorros Santander' },
          { id: 3, nombre: 'Cuenta Digital Mercado Pago' }
        ]

        this.conciliations = [
          {
            id: 1,
            fecha: '2024-11-15',
            cuenta: 'Cuenta Corriente BBVA',
            saldo_inicial: 15000,
            saldo_final: 18250,
            movimientos: 8,
            diferencia: 0,
            estado: 'conciliado'
          },
          {
            id: 2,
            fecha: '2024-11-10',
            cuenta: 'Cuenta Ahorros Santander',
            saldo_inicial: 25000,
            saldo_final: 24750,
            movimientos: 5,
            diferencia: 0,
            estado: 'conciliado'
          },
          {
            id: 3,
            fecha: '2024-11-08',
            cuenta: 'Cuenta Digital Mercado Pago',
            saldo_inicial: 3200,
            saldo_final: 2950,
            movimientos: 3,
            diferencia: 50,
            estado: 'diferencia'
          },
          {
            id: 4,
            fecha: '2024-11-05',
            cuenta: 'Cuenta Corriente BBVA',
            saldo_inicial: 12000,
            saldo_final: 11800,
            movimientos: 6,
            diferencia: 0,
            estado: 'pendiente'
          }
        ]

        this.pendingMovements = [
          {
            id: 1,
            fecha: '2024-11-12',
            tipo: 'ingreso',
            descripcion: 'Pago evento Concierto Rock',
            monto: 8500,
            cuenta: 'BBVA'
          },
          {
            id: 2,
            fecha: '2024-11-10',
            tipo: 'gasto',
            descripcion: 'Comisión Mercado Pago',
            monto: 125,
            cuenta: 'Mercado Pago'
          },
          {
            id: 3,
            fecha: '2024-11-08',
            tipo: 'gasto',
            descripcion: 'Mantenimiento servidores',
            monto: 1800,
            cuenta: 'Santander'
          }
        ]
      } catch (error) {
        console.error('Error loading conciliation data:', error)
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES')
    },

    getStatusClass(status) {
      const classes = {
        'conciliado': 'bg-success',
        'pendiente': 'bg-warning',
        'diferencia': 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    },

    viewDetails(conciliation) {
      // Implementar vista de detalles
      alert(`Detalles de conciliación ${conciliation.id}`)
    },

    markAsConciliated(conciliation) {
      // Implementar marcar como conciliado
      conciliation.estado = 'conciliado'
      this.loadData()
    },

    conciliateMovement(movement) {
      // Implementar conciliación de movimiento
      alert(`Conciliar movimiento ${movement.id}`)
    },

    newConciliation() {
      // Implementar nueva conciliación
      alert('Nueva conciliación próximamente disponible')
    }
  }
}
</script>

<style scoped>
.contador-conciliacion {
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

.conciliations-list {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.conciliations-list h4 {
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

.pending-movements {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pending-movements h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.movements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.movement-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  background: #f8f9fa;
}

.movement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.movement-type {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.movement-type.income {
  background-color: #d4edda;
  color: #155724;
}

.movement-type.expense {
  background-color: #f8d7da;
  color: #721c24;
}

.movement-date {
  color: #6c757d;
  font-size: 0.85rem;
}

.movement-body {
  margin-bottom: 15px;
}

.movement-description {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-weight: 500;
}

.movement-amount {
  font-size: 1.2rem;
  font-weight: 700;
}

.movement-actions {
  text-align: right;
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

  .movements-grid {
    grid-template-columns: 1fr;
  }
}
</style>
