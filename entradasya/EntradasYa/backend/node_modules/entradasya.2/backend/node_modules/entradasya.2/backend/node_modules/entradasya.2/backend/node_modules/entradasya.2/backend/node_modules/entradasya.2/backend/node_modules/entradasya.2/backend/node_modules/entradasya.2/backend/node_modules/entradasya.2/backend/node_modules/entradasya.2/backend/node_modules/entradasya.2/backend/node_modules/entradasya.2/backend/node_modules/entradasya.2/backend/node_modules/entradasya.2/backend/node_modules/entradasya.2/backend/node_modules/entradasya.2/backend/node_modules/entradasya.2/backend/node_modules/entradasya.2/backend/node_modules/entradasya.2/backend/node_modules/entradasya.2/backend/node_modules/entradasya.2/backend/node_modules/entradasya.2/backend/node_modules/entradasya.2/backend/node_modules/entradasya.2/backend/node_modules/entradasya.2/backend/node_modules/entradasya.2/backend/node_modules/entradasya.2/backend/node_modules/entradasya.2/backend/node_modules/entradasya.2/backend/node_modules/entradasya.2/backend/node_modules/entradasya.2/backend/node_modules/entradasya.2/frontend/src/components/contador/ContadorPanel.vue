<template>
  <div class="contador-panel">
    <!-- Sidebar de Navegación -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3 class="logo">EntradasYa</h3>
        <p class="subtitle">Panel Contable</p>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <a
              href="#"
              :class="['nav-link', { active: activeSection === 'dashboard' }]"
              @click="setActiveSection('dashboard')"
            >
              <i class="bi bi-speedometer2 me-3"></i>
              Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              :class="['nav-link', { active: activeSection === 'ingresos' }]"
              @click="setActiveSection('ingresos')"
            >
              <i class="bi bi-cash-stack me-3"></i>
              Ingresos y Ventas
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              :class="['nav-link', { active: activeSection === 'gastos' }]"
              @click="setActiveSection('gastos')"
            >
              <i class="bi bi-graph-down me-3"></i>
              Gastos y Costos
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              :class="['nav-link', { active: activeSection === 'conciliacion' }]"
              @click="setActiveSection('conciliacion')"
            >
              <i class="bi bi-bank me-3"></i>
              Conciliación Bancaria
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              :class="['nav-link', { active: activeSection === 'movimientos' }]"
              @click="setActiveSection('movimientos')"
            >
              <i class="bi bi-journal-text me-3"></i>
              Movimientos Contables
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              :class="['nav-link', { active: activeSection === 'reportes' }]"
              @click="setActiveSection('reportes')"
            >
              <i class="bi bi-file-earmark-text me-3"></i>
              Reportes
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="user-details">
            <p class="user-name">{{ currentUser.nombre }}</p>
            <p class="user-role">Contador</p>
          </div>
        </div>
        <button class="btn btn-outline-light btn-sm logout-btn" @click="logout">
          <i class="bi bi-box-arrow-right me-2"></i>
          Salir
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="main-header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="toggleSidebar">
            <i class="bi bi-list"></i>
          </button>
          <h1 class="page-title">{{ getPageTitle() }}</h1>
        </div>
        <div class="header-right">
          <div class="header-date">
            {{ currentDate }}
          </div>
        </div>
      </div>

      <div class="content-area">
        <!-- Dashboard -->
        <div v-if="activeSection === 'dashboard'">
          <ContadorDashboard />
        </div>

        <!-- Ingresos y Ventas -->
        <div v-if="activeSection === 'ingresos'">
          <ContadorIngresos />
        </div>

        <!-- Gastos y Costos -->
        <div v-if="activeSection === 'gastos'">
          <ContadorGastos />
        </div>

        <!-- Conciliación Bancaria -->
        <div v-if="activeSection === 'conciliacion'">
          <ContadorConciliacion />
        </div>

        <!-- Movimientos Contables -->
        <div v-if="activeSection === 'movimientos'">
          <ContadorMovimientos />
        </div>

        <!-- Reportes -->
        <div v-if="activeSection === 'reportes'">
          <ContadorReportes />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ContadorDashboard from './ContadorDashboard.vue'
import ContadorIngresos from './ContadorIngresos.vue'
import ContadorGastos from './ContadorGastos.vue'
import ContadorConciliacion from './ContadorConciliacion.vue'
import ContadorMovimientos from './ContadorMovimientos.vue'
import ContadorReportes from './ContadorReportes.vue'

export default {
  name: 'ContadorPanel',
  components: {
    ContadorDashboard,
    ContadorIngresos,
    ContadorGastos,
    ContadorConciliacion,
    ContadorMovimientos,
    ContadorReportes
  },
  data() {
    return {
      activeSection: 'dashboard',
      sidebarCollapsed: false,
      currentUser: JSON.parse(localStorage.getItem('userData') || '{}'),
      currentDate: new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },
  methods: {
    setActiveSection(section) {
      this.activeSection = section
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    getPageTitle() {
      const titles = {
        dashboard: 'Dashboard Contable',
        ingresos: 'Ingresos y Ventas',
        gastos: 'Gastos y Costos Operacionales',
        conciliacion: 'Conciliación Bancaria',
        movimientos: 'Movimientos Contables',
        reportes: 'Reportes y Documentación'
      }
      return titles[this.activeSection] || 'Dashboard Contable'
    },
    logout() {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.contador-panel {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar.collapsed .sidebar-header {
  padding: 20px 10px;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b00;
}

.sidebar.collapsed .logo {
  font-size: 1rem;
}

.subtitle {
  margin: 5px 0 0 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.sidebar.collapsed .subtitle {
  display: none;
}

.sidebar-nav {
  padding: 20px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 5px 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  border-left-color: #ff6b00;
}

.nav-link.active {
  color: white;
  background-color: rgba(255, 107, 0, 0.2);
  border-left-color: #ff6b00;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px;
}

.sidebar.collapsed .nav-link span {
  display: none;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar {
  font-size: 2rem;
  margin-right: 10px;
}

.user-details p {
  margin: 0;
  font-size: 0.9rem;
}

.user-name {
  font-weight: 600;
}

.user-role {
  opacity: 0.8;
  font-size: 0.8rem;
}

.sidebar.collapsed .user-info {
  justify-content: center;
}

.sidebar.collapsed .user-details {
  display: none;
}

.logout-btn {
  width: 100%;
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 70px;
}

/* Header */
.main-header {
  background: white;
  padding: 20px 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  margin-right: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.sidebar-toggle:hover {
  background: #f8f9fa;
}

.page-title {
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-date {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Content Area */
.content-area {
  padding: 30px;
  min-height: calc(100vh - 80px);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .main-header {
    padding: 15px 20px;
  }

  .page-title {
    font-size: 1.2rem;
  }

  .content-area {
    padding: 20px;
  }
}
</style>
