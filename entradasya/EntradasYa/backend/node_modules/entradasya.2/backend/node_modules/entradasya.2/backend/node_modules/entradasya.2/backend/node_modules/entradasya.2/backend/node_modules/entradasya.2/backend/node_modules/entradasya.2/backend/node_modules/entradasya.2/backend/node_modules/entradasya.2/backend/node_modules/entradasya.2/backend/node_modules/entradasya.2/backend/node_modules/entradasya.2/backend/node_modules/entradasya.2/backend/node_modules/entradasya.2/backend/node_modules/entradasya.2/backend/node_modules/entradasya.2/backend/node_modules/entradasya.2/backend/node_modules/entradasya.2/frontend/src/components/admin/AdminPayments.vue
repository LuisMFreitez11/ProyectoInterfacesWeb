<template>
  <div class="payments-container">
    <div class="header-section">
      <h2 class="section-title">Gestión de Pagos y Gastos</h2>
      <button class="btn btn-primary" @click="openCreatePaymentModal">
        <i class="bi bi-plus-circle me-2"></i> Nuevo Pago
      </button>
    </div>

    <!-- Tabs para Pagos y Gastos -->
    <div class="tabs-section">
      <button
        :class="['tab-button', { active: activeTab === 'payments' }]"
        @click="switchTab('payments')"
      >
        Pagos
      </button>
      <button
        :class="['tab-button', { active: activeTab === 'expenses' }]"
        @click="switchTab('expenses')"
      >
        Gastos
      </button>
      <button
        :class="['tab-button', { active: activeTab === 'methods' }]"
        @click="switchTab('methods')"
      >
        Métodos de Pago
      </button>
    </div>

    <!-- Contenido de Pagos -->
    <div v-if="activeTab === 'payments'" class="tab-content">
      <div class="filters-section">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar pagos..."
            class="form-control"
            @input="filterPayments"
          >
          <i class="bi bi-search search-icon"></i>
        </div>
        <select v-model="statusFilter" class="form-select" @change="filterPayments">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="fallido">Fallido</option>
          <option value="reembolsado">Reembolsado</option>
        </select>
      </div>

      <div class="table-container">
        <table class="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Referencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id_pago">
              <td>{{ payment.id_pago }}</td>
              <td>{{ payment.usuario || 'N/A' }}</td>
              <td>{{ payment.metodo_pago || 'N/A' }}</td>
              <td>{{ payment.simbolo_moneda }}{{ payment.monto }}</td>
              <td>
                <span :class="getStatusBadgeClass(payment.estado)">
                  {{ payment.estado }}
                </span>
              </td>
              <td>{{ formatDate(payment.fecha_pago) }}</td>
              <td>{{ payment.referencia || 'N/A' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-outline-info" @click="viewPayment(payment)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button
                    v-if="payment.estado === 'pendiente'"
                    class="btn btn-sm btn-outline-success me-1"
                    @click="processPayment(payment)"
                    title="Marcar como completado"
                  >
                    <i class="bi bi-check-circle"></i>
                  </button>
                  <button
                    v-if="payment.estado === 'completado'"
                    class="btn btn-sm btn-outline-warning me-1"
                    @click="refundPayment(payment)"
                    title="Reembolsar"
                  >
                    <i class="bi bi-arrow-counterclockwise"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="editPayment(payment)"
                    title="Editar"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="deletePayment(payment)"
                    title="Eliminar"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPayments.length === 0">
              <td colspan="8" class="text-center py-4 text-muted">
                No hay pagos para mostrar
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="payments.length > 10" class="pagination-section">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="prevPage">Anterior</button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" 
                :class="{ active: page === currentPage }">
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="nextPage">Siguiente</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Contenido de Gastos -->
    <div v-if="activeTab === 'expenses'" class="tab-content">
      <div class="filters-section">
        <div class="search-box">
          <input
            type="text"
            v-model="expenseSearchQuery"
            placeholder="Buscar gastos..."
            class="form-control"
            @input="filterExpenses"
          >
          <i class="bi bi-search search-icon"></i>
        </div>
        <select v-model="expenseCategoryFilter" class="form-select" @change="filterExpenses">
          <option value="">Todas las categorías</option>
          <option v-for="category in expenseCategories" :key="category.id_categoria" 
                  :value="category.id_categoria">
            {{ category.nombre }}
          </option>
        </select>
        <button class="btn btn-success" @click="openCreateExpenseModal">
          <i class="bi bi-plus-circle me-2"></i> Nuevo Gasto
        </button>
      </div>

      <div class="table-container">
        <table class="expenses-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Receptor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in filteredExpenses" :key="expense.id_gasto">
              <td>{{ expense.id_gasto }}</td>
              <td>{{ expense.categoria_nombre || 'N/A' }}</td>
              <td>{{ expense.descripcion }}</td>
              <td>{{ expense.simbolo_moneda }}{{ expense.monto }}</td>
              <td>{{ formatDate(expense.fecha_gasto) }}</td>
              <td>{{ expense.receptor || 'N/A' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="editExpense(expense)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteExpense(expense)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredExpenses.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                No hay gastos para mostrar
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Contenido de Métodos de Pago -->
    <div v-if="activeTab === 'methods'" class="tab-content">
      <div class="table-container">
        <div class="table-header">
          <h4>Métodos de Pago Disponibles</h4>
          <button class="btn btn-primary" @click="openCreateMethodModal">
            <i class="bi bi-plus-circle me-2"></i> Nuevo Método
          </button>
        </div>
        <table class="methods-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="method in paymentMethods" :key="method.id_metodo_pago">
              <td>{{ method.id_metodo_pago }}</td>
              <td>{{ method.nombre }}</td>
              <td>{{ method.descripcion || 'Sin descripción' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="editMethod(method)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteMethod(method)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paymentMethods.length === 0">
              <td colspan="4" class="text-center py-4 text-muted">
                No hay métodos de pago registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Crear/Editar Pago -->
    <div v-if="showPaymentModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>{{ editingPayment ? 'Editar Pago' : 'Crear Nuevo Pago' }}</h5>
          <button class="btn-close" @click="closeModals"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="savePayment">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">ID Compra (opcional)</label>
                  <input
                    type="number"
                    v-model="paymentForm.id_compra"
                    class="form-control"
                    placeholder="ID de compra"
                  >
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Usuario *</label>
                  <select v-model="paymentForm.id_usuario" class="form-select" required>
                    <option value="">Seleccionar usuario</option>
                    <option v-for="user in users" :key="user.id_usuario" :value="user.id_usuario">
                      {{ user.nombre }} {{ user.apellido }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Método de Pago *</label>
                  <select v-model="paymentForm.id_metodo_pago" class="form-select" required>
                    <option value="">Seleccionar método</option>
                    <option v-for="method in paymentMethods" :key="method.id_metodo_pago" 
                            :value="method.id_metodo_pago">
                      {{ method.nombre }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Monto *</label>
                  <div class="input-group">
                    <span class="input-group-text">{{ paymentForm.simbolo_moneda }}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      v-model="paymentForm.monto"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Estado</label>
                  <select v-model="paymentForm.estado" class="form-select">
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                    <option value="fallido">Fallido</option>
                    <option value="reembolsado">Reembolsado</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Comisión</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    v-model="paymentForm.comision"
                    class="form-control"
                  >
                </div>
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Referencia</label>
              <input
                type="text"
                v-model="paymentForm.referencia"
                class="form-control"
                placeholder="Referencia del pago"
              >
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModals">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ editingPayment ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Gasto -->
    <div v-if="showExpenseModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>{{ editingExpense ? 'Editar Gasto' : 'Crear Nuevo Gasto' }}</h5>
          <button class="btn-close" @click="closeModals"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveExpense">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Evento (opcional)</label>
                  <select v-model="expenseForm.id_evento" class="form-select">
                    <option value="">Sin evento</option>
                    <option v-for="event in eventos" :key="event.id_evento" :value="event.id_evento">
                      {{ event.nombre }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Categoría *</label>
                  <select v-model="expenseForm.id_categoria" class="form-select" required>
                    <option value="">Seleccionar categoría</option>
                    <option v-for="category in expenseCategories" :key="category.id_categoria" 
                            :value="category.id_categoria">
                      {{ category.nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Descripción *</label>
              <input
                type="text"
                v-model="expenseForm.descripcion"
                class="form-control"
                required
                placeholder="Descripción del gasto"
              >
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Fecha *</label>
                  <input
                    type="date"
                    v-model="expenseForm.fecha_gasto"
                    class="form-control"
                    required
                  >
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Monto *</label>
                  <div class="input-group">
                    <span class="input-group-text">{{ expenseForm.simbolo_moneda }}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      v-model="expenseForm.monto"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Receptor</label>
                  <input
                    type="text"
                    v-model="expenseForm.receptor"
                    class="form-control"
                    placeholder="Nombre del receptor"
                  >
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="form-label">Referencia de Pago</label>
                  <input
                    type="text"
                    v-model="expenseForm.referencia_pago"
                    class="form-control"
                    placeholder="Referencia"
                  >
                </div>
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Comprobante URL (opcional)</label>
              <input
                type="url"
                v-model="expenseForm.comprobante_url"
                class="form-control"
                placeholder="https://..."
              >
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModals">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ editingExpense ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Método de Pago -->
    <div v-if="showMethodModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>{{ editingMethod ? 'Editar Método de Pago' : 'Crear Nuevo Método' }}</h5>
          <button class="btn-close" @click="closeModals"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveMethod">
            <div class="form-group mb-3">
              <label class="form-label">Nombre *</label>
              <input
                type="text"
                v-model="methodForm.nombre"
                class="form-control"
                required
                placeholder="Nombre del método"
              >
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Descripción</label>
              <textarea
                v-model="methodForm.descripcion"
                class="form-control"
                rows="3"
                placeholder="Descripción del método de pago"
              ></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModals">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ editingMethod ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'AdminPayments',
  data() {
    return {
      activeTab: 'payments',
      payments: [],
      expenses: [],
      paymentMethods: [],
      expenseCategories: [],
      users: [],
      eventos: [],
      
      // Filtros para pagos
      searchQuery: '',
      statusFilter: '',
      filteredPayments: [],
      
      // Filtros para gastos
      expenseSearchQuery: '',
      expenseCategoryFilter: '',
      filteredExpenses: [],
      
      // Paginación
      currentPage: 1,
      pageSize: 10,
      
      // Modales
      showPaymentModal: false,
      showExpenseModal: false,
      showMethodModal: false,
      editingPayment: false,
      editingExpense: false,
      editingMethod: false,
      
      // Formularios
      paymentForm: {
        id_pago: null,
        id_compra: '',
        id_usuario: '',
        id_metodo_pago: '',
        monto: '',
        estado: 'pendiente',
        referencia: '',
        comision: 0,
        simbolo_moneda: '$'
      },
      
      expenseForm: {
        id_gasto: null,
        id_evento: '',
        id_categoria: '',
        descripcion: '',
        fecha_gasto: new Date().toISOString().split('T')[0],
        monto: '',
        receptor: '',
        referencia_pago: '',
        comprobante_url: '',
        simbolo_moneda: '$'
      },
      
      methodForm: {
        id_metodo_pago: null,
        nombre: '',
        descripcion: ''
      }
    };
  },
  computed: {
    totalPages() {
      const totalItems = this.activeTab === 'payments' ? this.filteredPayments.length : 
                        this.activeTab === 'expenses' ? this.filteredExpenses.length : 0;
      return Math.ceil(totalItems / this.pageSize);
    },
    paginatedPayments() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredPayments.slice(start, end);
    },
    paginatedExpenses() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredExpenses.slice(start, end);
    }
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const api = await import('../../utils/api.js');
        
        // Cargar pagos
        const paymentsRes = await api.fetchJson('/api/pagos/payments');
        if (paymentsRes.ok) {
          this.payments = paymentsRes.data || [];
          this.filteredPayments = [...this.payments];
        }
        
        // Cargar métodos de pago
        const methodsRes = await api.fetchJson('/api/pagos/payment-methods');
        if (methodsRes.ok) {
          this.paymentMethods = methodsRes.data || [];
        }
        
        // Cargar gastos
        const expensesRes = await api.fetchJson('/api/pagos/expenses');
        if (expensesRes.ok) {
          this.expenses = expensesRes.data || [];
          this.filteredExpenses = [...this.expenses];
        }
        
        // Cargar categorías de gasto
        const categoriesRes = await api.fetchJson('/api/pagos/expense-categories');
        if (categoriesRes.ok) {
          this.expenseCategories = categoriesRes.data || [];
        }
        
        // Cargar usuarios (necesario para crear pagos)
        const usersRes = await api.fetchJson('/api/usuarios');
        if (usersRes.ok) {
          this.users = usersRes.data || [];
        }
        
        // Cargar eventos (para gastos)
        const eventsRes = await api.fetchJson('/api/eventos');
        if (eventsRes.ok) {
          this.eventos = eventsRes.data || [];
        }
        
        console.log('Datos cargados exitosamente');
      } catch (error) {
        console.error('Error cargando datos:', error);
        this.showError('Error al cargar datos');
      }
    },
    
    switchTab(tab) {
      this.activeTab = tab;
      this.currentPage = 1;
    },
    
    filterPayments() {
      this.filteredPayments = this.payments.filter(payment => {
        const matchesSearch = !this.searchQuery || 
          payment.id_pago.toString().includes(this.searchQuery) ||
          payment.usuario?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          payment.referencia?.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        const matchesStatus = !this.statusFilter || payment.estado === this.statusFilter;
        
        return matchesSearch && matchesStatus;
      });
      this.currentPage = 1;
    },
    
    filterExpenses() {
      this.filteredExpenses = this.expenses.filter(expense => {
        const matchesSearch = !this.expenseSearchQuery || 
          expense.descripcion?.toLowerCase().includes(this.expenseSearchQuery.toLowerCase()) ||
          expense.receptor?.toLowerCase().includes(this.expenseSearchQuery.toLowerCase());
        
        const matchesCategory = !this.expenseCategoryFilter || 
          expense.id_categoria == this.expenseCategoryFilter;
        
        return matchesSearch && matchesCategory;
      });
      this.currentPage = 1;
    },
    
    // Métodos para paginación
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    goToPage(page) {
      this.currentPage = page;
    },
    
    // Métodos para pagos
    openCreatePaymentModal() {
      this.paymentForm = {
        id_pago: null,
        id_compra: '',
        id_usuario: '',
        id_metodo_pago: '',
        monto: '',
        estado: 'pendiente',
        referencia: '',
        comision: 0,
        simbolo_moneda: '$'
      };
      this.editingPayment = false;
      this.showPaymentModal = true;
    },
    
    editPayment(payment) {
      this.paymentForm = {
        id_pago: payment.id_pago,
        id_compra: payment.id_compra || '',
        id_usuario: payment.id_usuario,
        id_metodo_pago: payment.id_metodo_pago,
        monto: payment.monto,
        estado: payment.estado,
        referencia: payment.referencia || '',
        comision: payment.comision || 0,
        simbolo_moneda: payment.simbolo_moneda || '$'
      };
      this.editingPayment = true;
      this.showPaymentModal = true;
    },
    
    async savePayment() {
      try {
        const api = await import('../../utils/api.js');
        const url = this.editingPayment 
          ? `/api/pagos/payments/${this.paymentForm.id_pago}`
          : '/api/pagos/payments';
        
        const method = this.editingPayment ? 'PUT' : 'POST';
        
        const paymentData = {
          id_compra: this.paymentForm.id_compra || null,
          id_usuario: this.paymentForm.id_usuario,
          id_metodo_pago: this.paymentForm.id_metodo_pago,
          monto: parseFloat(this.paymentForm.monto),
          estado: this.paymentForm.estado,
          referencia: this.paymentForm.referencia || null,
          comision: parseFloat(this.paymentForm.comision) || 0
        };
        
        const res = await api.fetchJson(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
        });
        
        if (res.ok) {
          this.showSuccess(res.message || 'Pago guardado correctamente');
          await this.loadData();
          this.closeModals();
        } else {
          this.showError(res.message || 'Error al guardar el pago');
        }
      } catch (error) {
        console.error('Error saving payment:', error);
        this.showError('Error al guardar el pago');
      }
    },
    
    async processPayment(payment) {
      if (!confirm('¿Marcar este pago como completado?')) return;
      
      try {
        const api = await import('../../utils/api.js');
        const res = await api.fetchJson(`/api/pagos/payments/${payment.id_pago}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'completado' })
        });
        
        if (res.ok) {
          this.showSuccess('Pago marcado como completado');
          await this.loadData();
        } else {
          this.showError(res.message || 'Error al procesar el pago');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        this.showError('Error al procesar el pago');
      }
    },
    
    async refundPayment(payment) {
      if (!confirm('¿Reembolsar este pago?')) return;
      
      try {
        const api = await import('../../utils/api.js');
        const res = await api.fetchJson(`/api/pagos/payments/${payment.id_pago}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'reembolsado' })
        });
        
        if (res.ok) {
          this.showSuccess('Pago reembolsado correctamente');
          await this.loadData();
        } else {
          this.showError(res.message || 'Error al reembolsar el pago');
        }
      } catch (error) {
        console.error('Error refunding payment:', error);
        this.showError('Error al reembolsar el pago');
      }
    },
    
    async deletePayment(payment) {
      if (!confirm(`¿Eliminar el pago #${payment.id_pago}? Esta acción no se puede deshacer.`)) return;
      
      try {
        const api = await import('../../utils/api.js');
        const res = await api.fetchJson(`/api/pagos/payments/${payment.id_pago}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          this.showSuccess('Pago eliminado correctamente');
          await this.loadData();
        } else {
          this.showError(res.message || 'Error al eliminar el pago');
        }
      } catch (error) {
        console.error('Error deleting payment:', error);
        this.showError('Error al eliminar el pago');
      }
    },
    
    // Métodos para gastos
    openCreateExpenseModal() {
      this.expenseForm = {
        id_gasto: null,
        id_evento: '',
        id_categoria: '',
        descripcion: '',
        fecha_gasto: new Date().toISOString().split('T')[0],
        monto: '',
        receptor: '',
        referencia_pago: '',
        comprobante_url: '',
        simbolo_moneda: '$'
      };
      this.editingExpense = false;
      this.showExpenseModal = true;
    },
    
    editExpense(expense) {
      this.expenseForm = {
        id_gasto: expense.id_gasto,
        id_evento: expense.id_evento || '',
        id_categoria: expense.id_categoria,
        descripcion: expense.descripcion,
        fecha_gasto: expense.fecha_gasto,
        monto: expense.monto,
        receptor: expense.receptor || '',
        referencia_pago: expense.referencia_pago || '',
        comprobante_url: expense.comprobante_url || '',
        simbolo_moneda: expense.simbolo_moneda || '$'
      };
      this.editingExpense = true;
      this.showExpenseModal = true;
    },
    
    async saveExpense() {
      try {
        const api = await import('../../utils/api.js');
        const url = this.editingExpense 
          ? `/api/pagos/expenses/${this.expenseForm.id_gasto}`
          : '/api/pagos/expenses';
        
        const method = this.editingExpense ? 'PUT' : 'POST';
        
        const expenseData = {
          id_evento: this.expenseForm.id_evento || null,
          id_categoria: this.expenseForm.id_categoria,
          descripcion: this.expenseForm.descripcion,
          fecha_gasto: this.expenseForm.fecha_gasto,
          monto: parseFloat(this.expenseForm.monto),
          receptor: this.expenseForm.receptor || null,
          referencia_pago: this.expenseForm.referencia_pago || null,
          comprobante_url: this.expenseForm.comprobante_url || null
        };
        
        const res = await api.fetchJson(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData)
        });
        
        if (res.ok) {
          this.showSuccess(res.message || 'Gasto guardado correctamente');
          await this.loadData();
          this.closeModals();
        } else {
          this.showError(res.message || 'Error al guardar el gasto');
        }
      } catch (error) {
        console.error('Error saving expense:', error);
        this.showError('Error al guardar el gasto');
      }
    },
    
    async deleteExpense(expense) {
      if (!confirm(`¿Eliminar el gasto #${expense.id_gasto}? Esta acción no se puede deshacer.`)) return;
      
      try {
        const api = await import('../../utils/api.js');
        const res = await api.fetchJson(`/api/pagos/expenses/${expense.id_gasto}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          this.showSuccess('Gasto eliminado correctamente');
          await this.loadData();
        } else {
          this.showError(res.message || 'Error al eliminar el gasto');
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        this.showError('Error al eliminar el gasto');
      }
    },
    
    // Métodos para métodos de pago
    openCreateMethodModal() {
      this.methodForm = {
        id_metodo_pago: null,
        nombre: '',
        descripcion: ''
      };
      this.editingMethod = false;
      this.showMethodModal = true;
    },
    
    editMethod(method) {
      this.methodForm = {
        id_metodo_pago: method.id_metodo_pago,
        nombre: method.nombre,
        descripcion: method.descripcion || ''
      };
      this.editingMethod = true;
      this.showMethodModal = true;
    },
    
    async saveMethod() {
      try {
        const api = await import('../../utils/api.js');
        const url = this.editingMethod 
          ? `/api/pagos/payment-methods/${this.methodForm.id_metodo_pago}`
          : '/api/pagos/payment-methods';
        
        const method = this.editingMethod ? 'PUT' : 'POST';
        
        const methodData = {
          nombre: this.methodForm.nombre,
          descripcion: this.methodForm.descripcion || null
        };
        
        const res = await api.fetchJson(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(methodData)
        });
        
        if (res.ok) {
          this.showSuccess(res.message || 'Método guardado correctamente');
          await this.loadData();
          this.closeModals();
        } else {
          this.showError(res.message || 'Error al guardar el método');
        }
      } catch (error) {
        console.error('Error saving method:', error);
        this.showError('Error al guardar el método');
      }
    },
    
    async deleteMethod(method) {
      if (!confirm(`¿Eliminar el método "${method.nombre}"? Esta acción no se puede deshacer.`)) return;
      
      try {
        const api = await import('../../utils/api.js');
        const res = await api.fetchJson(`/api/pagos/payment-methods/${method.id_metodo_pago}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          this.showSuccess('Método eliminado correctamente');
          await this.loadData();
        } else {
          this.showError(res.message || 'Error al eliminar el método');
        }
      } catch (error) {
        console.error('Error deleting method:', error);
        this.showError('Error al eliminar el método');
      }
    },
    
    // Métodos auxiliares
    viewPayment(payment) {
      // Aquí puedes implementar la vista detallada del pago
      alert(`Vista detallada del pago #${payment.id_pago}\nUsuario: ${payment.usuario}\nMonto: ${payment.simbolo_moneda}${payment.monto}\nEstado: ${payment.estado}`);
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    getStatusBadgeClass(status) {
      const classes = {
        'pendiente': 'badge bg-warning',
        'completado': 'badge bg-success',
        'fallido': 'badge bg-danger',
        'reembolsado': 'badge bg-info'
      };
      return classes[status] || 'badge bg-secondary';
    },
    
    closeModals() {
      this.showPaymentModal = false;
      this.showExpenseModal = false;
      this.showMethodModal = false;
      this.editingPayment = false;
      this.editingExpense = false;
      this.editingMethod = false;
    },
    
    showSuccess(message) {
      // Puedes usar toast notifications o alertas
      alert(`✅ ${message}`);
    },
    
    showError(message) {
      alert(`❌ ${message}`);
    }
  }
};
</script>

<style scoped>
.payments-container {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  color: #2c3e50;
  font-weight: 700;
}

.tabs-section {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: none;
  color: #6c757d;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-button.active {
  color: #4CAF50;
  border-bottom-color: #4CAF50;
}

.tab-button:hover:not(.active) {
  color: #4CAF50;
}

.filters-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.table-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.table-header h4 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.payments-table, .expenses-table, .methods-table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table th, .payments-table td,
.expenses-table th, .expenses-table td,
.methods-table th, .methods-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.payments-table th, .expenses-table th, .methods-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.payments-table tbody tr:hover,
.expenses-table tbody tr:hover,
.methods-table tbody tr:hover {
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: nowrap;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #2c3e50;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  position: sticky;
  bottom: 0;
  background: white;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .payments-table, .expenses-table, .methods-table {
    display: block;
    overflow-x: auto;
  }
  
  .modal-content {
    width: 95%;
    max-width: 95%;
  }
}
</style>