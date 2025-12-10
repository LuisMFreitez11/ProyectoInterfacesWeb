<template>
  <div>
    <nav class="navbar navbar-expand-lg main-header" v-if="!isAdminAccess">
      <div class="container-fluid">
        <a href="#" @click.prevent="navegar('home')" class="navbar-brand">
          <img src="@/assets/Logo.png" alt="EntradasYa Logo" class="logo-img" />
        </a>

        <button class="navbar-toggler custom-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav menu-container mb-0 mx-auto">
            <li class="nav-item" v-for="(item, index) in menu" :key="index">
              <a :href="item.link" class="nav-link px-3 text-white menu-link" @click.prevent="navegar(item.link)">
                {{ item.label }}
              </a>
            </li>
          </ul>

          <div class="button-container d-flex justify-content-lg-end align-items-center mt-3 mt-lg-0">
            <div v-if="isLoggedIn && currentUser" class="d-flex align-items-center">
              <button v-if="currentUser.id_rol === 2" type="button" class="btn btn-warning me-3 px-3 py-1"
                @click="navegar('admin')">Panel Admin</button>
              <button v-if="currentUser.id_rol === 4" type="button" class="btn btn-info me-3 px-3 py-1"
                @click="navegar('contador')">Panel Contador</button>

              <button class="btn btn-link text-white me-3 p-0" @click="navegarPerfil" title="Mi Perfil">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor"
                  class="bi bi-person-circle" viewBox="0 0 16 16">

                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />

                  <path fill-rule="evenodd"
                    d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />

                </svg>
              </button>
              <button type="button" class="btn btn-outline-light px-3 py-1" @click="logout">Salir</button>
            </div>

            <div v-else>
              <button type="button" class="btn btn-outline-light me-2 px-4 py-2" @click="abrirModal">Login</button>
              <button type="button" class="btn btn-signup px-4 py-2" @click="abrirRegistro">Sign-up</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div v-if="showToast" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100;">
      <div class="toast show border-0" :class="`text-bg-${toastType}`" role="alert" aria-live="assertive"
        aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body text-white">{{ toastMessage }}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="showToast = false"
            aria-label="Cerrar"></button>
        </div>
      </div>
    </div>

    <div v-if="vistaActual === 'home'">
      <div id="carouselExampleIndicators" class="carousel slide custom-slider" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active"
            aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"
            aria-label="Slide 2"></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active"><img :src="slider1Img" class="d-block w-100 slider-img" alt="slider 1">
          </div>
          <div class="carousel-item"><img :src="slider2Img" class="d-block w-100 slider-img" alt="slider 2">
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators"
          data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Anterior</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators"
          data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Siguiente</span>
        </button>
      </div>

      <div class="album py-5 eventos-section" ref="eventContainer" id="eventos-ancla">
        <div class="container">
          <h2 class="text-center mb-4">Eventos</h2>

          <div class="row mb-5 justify-content-center">
            <div class="col-md-6">
              <input type="text" class="form-control form-control-lg search-input"
                placeholder="Busca por nombre, artista o palabra clave..." v-model="busqueda" />
            </div>
          </div>

          <div v-if="loadingEvents" class="text-center py-5">
            <div class="spinner-border text-warning" role="status">
              <span class="visually-hidden">Cargando eventos...</span>
            </div>
            <p class="mt-3">Cargando eventos disponibles...</p>
          </div>

          <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
            <div class="col fade-in-on-scroll" v-for="(evento, index) in eventosFiltrados" :key="evento.id"
              :style="{ '--card-index': index + 1 }" :class="{ 'is-visible': cardVisible[index] }">
              <div class="card shadow-sm h-100">
                <img :src="getEventoImagen(evento)" class="card-img-top event-img" :alt="evento.titulo"
                  @error="handleImageError">

                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">{{ evento.titulo }}</h5>
                  <p class="card-text flex-grow-1">{{ evento.descripcion }}</p>

                  <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-details px-3 py-1" @click="verDetalles(evento)">
                          Ver Detalles
                        </button>
                      </div>
                      <small class="text-body-secondary">{{ evento.fecha }}</small>
                    </div>

                    <div class="mt-2">
                      <small class="text-muted">
                        <i class="bi bi-geo-alt"></i> {{ evento.estadio }}
                      </small>
                      <br>
                      <small class="text-success" v-if="evento.zonas_disponibles > 0">
                        <i class="bi bi-ticket-perforated"></i> {{ evento.zonas_disponibles }}
                        zonas disponibles
                      </small>
                      <small class="text-danger" v-else>
                        <i class="bi bi-exclamation-circle"></i> Agotado
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="eventosFiltrados.length === 0 && !loadingEvents" class="col-12 text-center text-muted mt-4">
              <div class="py-5">
                <i class="bi bi-calendar-x display-1"></i>
                <p class="mt-3">No se encontraron eventos que coincidan con "{{ busqueda }}".</p>
                <button class="btn btn-outline-warning mt-2" @click="busqueda = ''">
                  Mostrar todos los eventos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <EventoDetalle v-else-if="vistaActual === 'detalle'" :evento="eventoSeleccionado" :usuarioLogueado="isLoggedIn"
      @volver="vistaActual = 'home'; eventoSeleccionado = null" @requiere-login="abrirModal" />

    <NosotrosPagina v-else-if="vistaActual === 'nosotros'" />

    <ContactoPagina v-else-if="vistaActual === 'contacto'" />

    <PerfilUsuario v-else-if="vistaActual === 'perfil'" :usuario="currentUser" :navegarHandler="navegar"
      @logout="logout" @abrir-edicion="abrirEdicionModal" />
    <router-view v-else />


    <LoginModal v-if="mostrarModal" @cerrar="cerrarModal" @cambiar-a-registro="cambiarA('registro')"
      @cambiar-a-olvido-pass="cambiarA('olvido-pass')" @login-exitoso="handleSuccessfulLogin"
      @login-fallido="handleLoginFailure" />

    <SignupModal v-if="mostrarRegistro" @cerrar="cerrarRegistro" @cambiar-a-login="cambiarA('login')" />

    <ForgotPasswordModal v-if="mostrarOlvidoPass" @cerrar="cerrarOlvidoPass" @cambiar-a-login="cambiarA('login')" />

    <PerfilEditarModal v-if="mostrarEdicionModal" :usuario-data="currentUser" @cerrar="cerrarEdicionModal"
      @perfil-actualizado="handlePerfilActualizado" />

    <footer class="main-footer pt-5 pb-3" v-if="!isAdminAccess">
      <div class="container">
        <div class="row">
          <div class="col-md-5 mb-4">
            <a href="#" @click.prevent="navegar('home')"
              class="d-inline-flex align-items-center text-decoration-none mb-3">
              <img src="@/assets/Logo.png" alt="EntradasYa Logo" class="footer-logo-img" />
            </a>
            <p class="text-white-50">Tu plataforma de boletos para los eventos más grandes. Vive la
              experiencia, compra
              fácil.</p>
          </div>

          <div class="col-md-3 mb-4">
            <h5 class="footer-title mb-3">Navegación Rápida</h5>
            <ul class="list-unstyled">
              <li v-for="item in menu" :key="item.label" class="mb-2">
                <a :href="item.link" class="footer-link" @click.prevent="navegar(item.link)">{{
                  item.label }}</a>
              </li>
            </ul>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a href="#eventos-ancla" class="footer-link" @click.prevent="navegar('#eventos-ancla')">Eventos</a>
              </li>
            </ul>
          </div>

          <div class="col-md-4 mb-4">
            <h5 class="footer-title mb-3">Contáctanos</h5>
            <ul class="list-unstyled text-white-50">
              <li class="mb-2">Envíanos un correo si tienes dudas o comentarios:</li>
              <li class="mb-2">
                <a href="mailto:entradasya@gmail.com" class="footer-link">entradasya@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <hr class="footer-divider">
        <div class="text-center text-white-50 mt-3">
          Proyecto Final {{ new Date().getFullYear() }} | Desarrollado con Vue.js y Bootstrap.
        </div>

      </div>
    </footer>

  </div>
</template>

<script>
import axios from 'axios';
import { mapActions, mapGetters } from 'vuex';

// Importación de Componentes
import LoginModal from './LoginModal.vue';
import SignupModal from './SignupModal.vue';
import ForgotPasswordModal from './ForgotPasswordModal.vue';
import EventoDetalle from './EventoDetalle.vue';
import NosotrosPagina from './NosotrosPagina.vue';
import ContactoPagina from './ContactoPagina.vue';
import PerfilUsuario from './PerfilUsuario.vue';
import PerfilEditarModal from './PerfilEditarModal.vue';

// Importar imágenes (asumiendo que las rutas están correctas)
import slider1Img from '@/assets/slider1.jpg';
import slider2Img from '@/assets/slider2.jpg';
import evento1Img from '@/assets/Evento1.jpg';
import evento2Img from '@/assets/Evento2.jpg';
import evento3Img from '@/assets/Evento3.jpg';
import evento4Img from '@/assets/Evento4.jpg';
import evento5Img from '@/assets/Evento5.jpg';
import evento6Img from '@/assets/Evento6.jpg';

// URLs
const API_BASE_URL = 'http://localhost:3000/api';
const UPLOADS_BASE_URL = 'http://localhost:3000/uploads/eventos/';

export default {
  name: 'InicioPagina',
  components: {
    LoginModal, SignupModal, ForgotPasswordModal, EventoDetalle,
    NosotrosPagina, ContactoPagina, PerfilUsuario, PerfilEditarModal
  },
  data() {
    return {
      menu: [
        { label: 'Inicio', link: 'home' },
        { label: 'Nosotros', link: 'nosotros' },
        { label: 'Contacto', link: 'contacto' }
      ],
      slider1Img, slider2Img,
      evento1Img, evento2Img, evento3Img, evento4Img, evento5Img, evento6Img,

      busqueda: '',
      eventos: [],
      cardVisible: [],
      loadingEvents: false,

      mostrarModal: false, mostrarRegistro: false, mostrarOlvidoPass: false, mostrarEdicionModal: false,
      vistaActual: 'home', eventoSeleccionado: null,

      showToast: false,
      toastMessage: '',
      toastType: 'dark',
      toastTimeoutRef: null,

      lugaresMap: {
        2: 'Estadio Nacional', 3: 'Arena Ciudad', 4: 'Palacio de los Deportes',
        5: 'Teatro Nacional', 6: 'Estadio Olímpico'
      },
      fallbackImg: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23ccc"%3E%3C/rect%3E%3Ctext x="50" y="55" font-size="12" text-anchor="middle" fill="%23fff"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
    };
  },
  computed: {
    // Mapeo CRÍTICO de getters
    ...mapGetters(['isLoggedIn', 'currentUser']),

    eventosFiltrados() {
      if (!this.busqueda) return this.eventos;
      const term = this.busqueda.toLowerCase();
      return this.eventos.filter(e =>
        e.titulo.toLowerCase().includes(term) ||
        e.descripcion.toLowerCase().includes(term) ||
        e.estadio.toLowerCase().includes(term)
      );
    },
    isAdminAccess() {
      const rolId = this.currentUser ? this.currentUser.id_rol : null;
      return rolId === 2 || rolId === 4 ||
        this.vistaActual.includes('admin') ||
        this.vistaActual.includes('contador');
    }
  },
  async mounted() {
    window.addEventListener('scroll', this.checkVisibility);

    // 🔑 CRÍTICO: Carga la sesión si existe en localStorage al inicio
    await this.checkInitialSession();

    await this.loadEvents();
    this.cardVisible = this.eventos.map(() => false);
    this.checkVisibility();
  },
  methods: {
    ...mapActions({
      loginAction: 'login',
      logoutAction: 'logout',
      checkInitialSession: 'checkInitialSession'
    }),

    getFallbackImage(id) {
      const defaultImages = [this.evento1Img, this.evento2Img, this.evento3Img,
      this.evento4Img, this.evento5Img, this.evento6Img];
      const index = (id - 1) % defaultImages.length;
      return defaultImages[index] || this.evento1Img;
    },

    getEventoImagen(evento) {
      const imageName = evento.imagen_db;
      if (!imageName) return this.getFallbackImage(evento.id);
      const isUploadedFile = imageName.includes('-') || imageName.length > 20 || imageName.startsWith('http');
      if (isUploadedFile) {
        return `${UPLOADS_BASE_URL}${imageName}`;
      } else {
        try {
          return require(`@/assets/${imageName}`);
        } catch (error) {
          console.warn(`[Asset Fallback] No se pudo cargar ${imageName} de assets. Usando fallback local.`, error);
          return this.getFallbackImage(evento.id);
        }
      }
    },

    handleImageError(event) {
      const imgElement = event.target;
      if (imgElement.src !== this.fallbackImg) {
        imgElement.src = this.fallbackImg;
        imgElement.style.objectFit = 'contain';
      }
    },

    async loadEvents() {
      this.loadingEvents = true;
      try {
        const response = await axios.get(`${API_BASE_URL}/eventos`);
        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error('Formato de respuesta de API principal inválido.');
        }
        const eventosPublicados = response.data.data.filter(evento => evento.estado === 'publicado');
        if (eventosPublicados.length === 0) { this.eventos = []; return; }

        this.eventos = await Promise.all(
          eventosPublicados.map(async (evento) => {
            let zonasDisponibles = 0;
            let lugarNombre = this.getNombreLugar(evento.id_lugar);

            try {
              const zonasResponse = await axios.get(`${API_BASE_URL}/tiposEntrada/evento/${evento.id_evento}`);
              if (Array.isArray(zonasResponse.data.data)) {
                zonasDisponibles = zonasResponse.data.data.length;
              }
            } catch (error) {
              console.error(`[Error API Zonas] Fallo al cargar zonas para evento ${evento.id_evento}`, error.message);
              zonasDisponibles = 0;
            }

            return {
              id: evento.id_evento, titulo: evento.nombre, descripcion: evento.descripcion || 'Descripción no disponible',
              fecha: this.formatFecha(evento.fecha_inicio), estadio: lugarNombre, imagen_db: evento.imagen,
              zonas_disponibles: zonasDisponibles, originalData: evento
            };
          })
        );

      } catch (error) {
        console.error('[CRÍTICO - FALLO API PRINCIPAL] Error cargando la lista principal de eventos.', error);
        this.showCustomToast('Error al cargar eventos (API inaccesible). Mostrando datos de ejemplo.', 'warning');
        this.loadEventosEstaticos();
      } finally {
        this.loadingEvents = false;
      }
    },

    formatFecha(fechaString) {
      if (!fechaString) return 'Fecha por definir';
      try {
        const fecha = new Date(fechaString);
        if (isNaN(fecha.getTime())) return 'Fecha inválida';
        const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
        return fecha.toLocaleDateString('es-ES', opciones).replace('.', '');
      } catch (error) { return 'Fecha no disponible'; }
    },

    getNombreLugar(idLugar) { return this.lugaresMap[idLugar] || 'Lugar por definir'; },

    loadEventosEstaticos() {
      this.eventos = [
        { id: 1, titulo: 'Dua Lipa: Future Nostalgia Tour (Demo)', descripcion: 'Prepárate para una noche electrizante con Dua Lipa...', fecha: '13-Feb-26', estadio: 'Estadio Olímpico de Caracas', imagen_db: 'Evento1.jpg', zonas_disponibles: 3, originalData: {} },
        { id: 2, titulo: 'Camila Cabello: Havana Nights (Demo)', descripcion: 'Camila Cabello regresa con su voz única...', fecha: '1-Abr-26', estadio: 'Poliedro de Caracas', imagen_db: 'Evento2.jpg', zonas_disponibles: 2, originalData: {} },
        { id: 3, titulo: 'Stray Kids: World Domination (Demo)', descripcion: 'El fenómeno global del K-pop, Stray Kids, aterriza...', fecha: '18-Feb-26', estadio: 'Estadio Monumental Simón Bolívar', imagen_db: 'Evento3.jpg', zonas_disponibles: 4, originalData: {} },
      ];
      this.cardVisible = this.eventos.map(() => false);
    },

    verDetalles(evento) {
      this.eventoSeleccionado = evento.originalData || evento;
      if (this.isLoggedIn) {
        this.vistaActual = 'detalle';
        window.scrollTo(0, 0);
      } else {
        this.abrirModal();
        this.showCustomToast('Debes iniciar sesión para ver los detalles y realizar una compra.', 'warning');
      }
    },

    navegar(link) {
      if (link.includes('admin') || link.includes('contador') || link === 'perfil') {
        this.vistaActual = link;
      } else if (link.startsWith('#')) {
        if (this.vistaActual !== 'home') {
          this.vistaActual = 'home';
          this.$nextTick(() => this.scrollToAnchor(link.substring(1)));
        } else {
          this.scrollToAnchor(link.substring(1));
        }
      } else {
        this.vistaActual = link;
      }
      window.scrollTo(0, 0);
      const navbarCollapse = document.getElementById('navbarNav');
      if (navbarCollapse && navbarCollapse.classList.contains('show')) navbarCollapse.classList.remove('show');
    },

    scrollToAnchor(id) { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); },

    // 🔑 MÉTODO CRÍTICO CORREGIDO: Uso de $nextTick para garantizar la reactividad del navbar
    async handleSuccessfulLogin(userData) {
      const token = localStorage.getItem('userToken');
      if (!token || !userData) {
        this.showCustomToast('Error interno: Token o datos de usuario faltantes.', 'danger');
        return;
      }

      // 1. Actualiza el Store
      await this.loginAction({ user: userData, token: token });

      this.cerrarModal();
      this.showCustomToast(`¡Bienvenido, ${userData.email.split('@')[0]}! Sesión iniciada.`, 'success');

      // 2. Espera la próxima actualización del DOM (necesario para que el v-if se recalcule)
      await this.$nextTick();

      // 3. Navegación
      if (this.eventoSeleccionado) {
        this.vistaActual = 'detalle';
      } else {
        if (this.currentUser?.id_rol === 2) {
          this.vistaActual = 'admin';
          this.$router.push('/admin');
        } else if (this.currentUser?.id_rol === 4) {
          this.vistaActual = 'contador';
          this.$router.push('/contador');
        } else {
          this.vistaActual = 'home';
          this.$router.push('/');
        }
      }
      window.scrollTo(0, 0);
    },

    logout() {
      this.logoutAction(); // Borra el storage y el estado de Vuex
      this.navegar('home');
      // Forzar reactividad del navbar después del logout antes de la navegación
      this.$nextTick(() => {
        this.$router.push('/');
        this.showCustomToast('¡Sesión Cerrada! Has salido de EntradasYa.', 'dark');
      });
    },

    handleLoginFailure(message) { this.showCustomToast(message, 'danger'); },
    navegarPerfil() { if (this.isLoggedIn) this.navegar('perfil'); else this.abrirModal(); },
    cambiarA(modal) { this.mostrarModal = this.mostrarRegistro = this.mostrarOlvidoPass = false; if (modal === 'login') this.mostrarModal = true; else if (modal === 'registro') this.mostrarRegistro = true; else if (modal === 'olvido-pass') this.mostrarOlvidoPass = true; },
    abrirModal() { this.cambiarA('login'); }, cerrarModal() { this.mostrarModal = false; },
    abrirRegistro() { this.cambiarA('registro'); }, cerrarRegistro() { this.mostrarRegistro = false; },
    abrirOlvidoPass() { this.cambiarA('olvido-pass'); }, cerrarOlvidoPass() { this.mostrarOlvidoPass = false; },
    abrirEdicionModal() { this.mostrarEdicionModal = true; }, cerrarEdicionModal() { this.mostrarEdicionModal = false; },
    handlePerfilActualizado(updatedUser) {
      this.$store.commit('setUser', updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      this.cerrarEdicionModal();
      this.showCustomToast('¡Perfil actualizado con éxito!', 'success');
    },
    showCustomToast(message, type = 'dark') {
      this.toastMessage = message; this.toastType = type; this.showToast = true;
      if (this.toastTimeoutRef) clearTimeout(this.toastTimeoutRef);
      this.toastTimeoutRef = setTimeout(() => { this.showToast = false; }, 4000);
    },

    checkVisibility() {
      const container = this.$refs.eventContainer; if (!container) return;
      const cards = container.querySelectorAll('.fade-in-on-scroll'); const windowHeight = window.innerHeight;
      cards.forEach((card, i) => { const cardTop = card.getBoundingClientRect().top; if (i < this.cardVisible.length && cardTop < windowHeight * 0.95) { if (!this.cardVisible[i]) this.cardVisible[i] = true; } });
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.checkVisibility);
    if (this.toastTimeoutRef) clearTimeout(this.toastTimeoutRef);
  }
};
</script>

<style scoped>
/* ==================== HEADER ==================== */
.main-header {
  background-color: #212122ff;
  padding: 0 20px;
}

.custom-toggler {
  border-color: rgba(255, 255, 255, 0.5);
}

.custom-toggler .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.logo-img {
  width: 200px;
  height: auto;
}

.menu-link {
  padding: 8px 12px !important;
  border-radius: 6px;
  position: relative;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.menu-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  color: white !important;
}

@media (min-width: 992px) {
  .menu-container {
    display: flex !important;
    justify-content: center !important;
    align-items: center;
    flex-grow: 1;
  }

  .navbar-collapse {
    justify-content: space-between;
  }
}

@media (max-width: 991.98px) {
  .navbar-collapse {
    background-color: #212122ff;
    padding: 15px;
    border-radius: 5px;
    margin-top: 10px;
  }

  .menu-container {
    display: block !important;
    width: 100%;
    text-align: center;
    margin-bottom: 15px !important;
  }

  .nav-item {
    margin: 5px 0;
  }

  .button-container {
    display: flex;
    justify-content: center !important;
    width: 100%;
    padding-bottom: 10px;
  }
}

/* ==================== BOTONES ==================== */
.btn-signup {
  background-color: #ff6b00;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-signup:hover {
  background-color: #e65c00;
}

.btn-details {
  background-color: #ff6b00;
  color: white;
  border: 1px solid #ff6b00;
  font-weight: 500;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.btn-details:hover {
  background-color: #e65c00;
  border-color: #e65c00;
  color: white;
}

/* ==================== SLIDER ==================== */
.custom-slider {
  max-height: 500px;
  overflow: hidden;
}

.slider-img {
  height: 500px;
  width: 100%;
  object-fit: cover;
  object-position: center top;
}

@media (max-width: 768px) {
  .custom-slider {
    max-height: 300px;
  }

  .slider-img {
    height: 300px;
  }
}

/* ==================== EVENTOS ==================== */
.search-input {
  border-radius: 8px;
  border: 1px solid #ff6b00;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #e65c00;
  box-shadow: 0 0 0 0.25rem rgba(255, 107, 0, 0.25);
}

.event-img {
  height: 200px;
  object-fit: cover;
  width: 100%;
}

.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15) !important;
}

/* ==================== ANIMACIONES ==================== */
.fade-in-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  transition-delay: calc(0.1s * var(--card-index));
}

.fade-in-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ==================== FOOTER ==================== */
.main-footer {
  background-color: #212122ff;
  color: white;
}

.footer-logo-img {
  width: 150px;
  height: auto;
}

.footer-title {
  color: #ff6b00;
  font-weight: bold;
}

.footer-link {
  color: #ffffff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #ff6b00;
}

.footer-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* ==================== VARIOS ==================== */
.spinner-border.text-warning {
  width: 3rem;
  height: 3rem;
}

.toast-container {
  z-index: 9999;
}

.toast {
  min-width: 300px;
}
</style>