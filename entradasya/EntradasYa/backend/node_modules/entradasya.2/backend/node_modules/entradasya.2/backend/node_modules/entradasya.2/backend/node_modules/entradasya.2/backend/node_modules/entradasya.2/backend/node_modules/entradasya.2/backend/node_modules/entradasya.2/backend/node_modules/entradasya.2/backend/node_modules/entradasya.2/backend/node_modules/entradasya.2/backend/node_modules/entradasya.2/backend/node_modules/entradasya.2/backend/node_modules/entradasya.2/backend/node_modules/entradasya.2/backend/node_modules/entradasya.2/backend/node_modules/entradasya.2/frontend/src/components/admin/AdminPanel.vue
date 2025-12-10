<template>
  <div class="admin-panel">
    <!-- Sidebar de Navegación -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3 class="logo">EntradasYa</h3>
        <p class="subtitle">Panel Administrativo</p>
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
              :class="['nav-link', { active: activeSection === 'users' }]"
              @click="setActiveSection('users')"
            >
              <i class="bi bi-people me-3"></i>
              Usuarios
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              :class="['nav-link', { active: activeSection === 'events' }]"
              @click="setActiveSection('events')"
            >
              <i class="bi bi-calendar-event me-3"></i>
              Eventos
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              :class="['nav-link', { active: activeSection === 'payments' }]"
              @click="setActiveSection('payments')"
            >
              <i class="bi bi-cash-stack me-3"></i>
              Pagos y Gastos
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              :class="['nav-link', { active: activeSection === 'reports' }]"
              @click="setActiveSection('reports')"
            >
              <i class="bi bi-graph-up me-3"></i>
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
            <p class="user-role">{{ getRoleName(currentUser.id_rol) }}</p>
          </div>
        </div>
        <button class="btn btn-outline-light btn-sm logout-btn" @click="logout">
          <i class="bi bi-box-arrow-right me-2"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="main-content">
      <!-- Header -->
      <header class="main-header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="toggleSidebar">
            <i class="bi bi-list"></i>
          </button>
          <h1 class="page-title">{{ getPageTitle() }}</h1>
        </div>
        <div class="header-right">
          <div class="header-notifications">
            <button class="notification-btn">
              <i class="bi bi-bell"></i>
              <span class="notification-badge">3</span>
            </button>
          </div>
          <div class="header-date">
            {{ currentDate }}
          </div>
        </div>
      </header>

      <!-- Contenido Dinámico -->
      <main class="content-area">
        <AdminDashboard v-if="activeSection === 'dashboard'" />
        <AdminUsers v-if="activeSection === 'users'" />
        <AdminEvents v-if="activeSection === 'events'" />
        <AdminPayments v-if="activeSection === 'payments'" />
        <AdminReports v-if="activeSection === 'reports'" />
      </main>
    </div>
  </div>
</template>

<script>
import AdminDashboard from './AdminDashboard.vue';
import AdminUsers from './AdminUsers.vue';
import AdminEvents from './AdminEvents.vue';
import AdminPayments from './AdminPayments.vue';
import AdminReports from './AdminReports.vue';

export default {
  name: 'AdminPanel',
  components: {
    AdminDashboard,
    AdminUsers,
    AdminEvents,
    AdminPayments,
    AdminReports
  },
  data() {
    return {
      activeSection: 'dashboard',
      sidebarCollapsed: false,
      currentUser: {
        nombre: 'Admin',
        id_rol: 1
      },
      currentDate: ''
    };
  },
  mounted() {
    this.setCurrentDate();
    this.loadCurrentUser();
  },
  methods: {
    setActiveSection(section) {
      this.activeSection = section;
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    getPageTitle() {
      const titles = {
        dashboard: 'Dashboard',
        users: 'Gestión de Usuarios',
        events: 'Gestión de Eventos',
        payments: 'Pagos y Gastos',
        reports: 'Reportes y Estadísticas'
      };
      return titles[this.activeSection] || 'Dashboard';
    },
    getRoleName(roleId) {
      const roles = { 1: 'Administrador', 2: 'Organizador', 3: 'Usuario' };
      return roles[roleId] || 'Usuario';
    },
    setCurrentDate() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      this.currentDate = new Date().toLocaleDateString('es-ES', options);
    },
    async loadCurrentUser() {
      try {
        // Cargar información del usuario actual desde el token/localStorage
        const token = localStorage.getItem('token');
        if (token) {
          // Decodificar token o hacer petición para obtener info del usuario
          // this.currentUser = decodedUser;
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    },
    logout() {
      localStorage.removeItem('token');
      // Redirigir al login. Use router if available, otherwise fallback to full navigation.
      if (this.$router && typeof this.$router.push === 'function') {
        this.$router.push('/login');
      } else {
        window.location.href = '/login';
      }
    }
  }
};
</script>

<style scoped>
.admin-panel {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 30px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
}

.subtitle {
  margin: 5px 0 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
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
  margin-bottom: 5px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.5);
}

.nav-link.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  border-left-color: white;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
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

.header-notifications {
  position: relative;
}

.notification-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.notification-btn:hover {
  background: #f8f9fa;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
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
