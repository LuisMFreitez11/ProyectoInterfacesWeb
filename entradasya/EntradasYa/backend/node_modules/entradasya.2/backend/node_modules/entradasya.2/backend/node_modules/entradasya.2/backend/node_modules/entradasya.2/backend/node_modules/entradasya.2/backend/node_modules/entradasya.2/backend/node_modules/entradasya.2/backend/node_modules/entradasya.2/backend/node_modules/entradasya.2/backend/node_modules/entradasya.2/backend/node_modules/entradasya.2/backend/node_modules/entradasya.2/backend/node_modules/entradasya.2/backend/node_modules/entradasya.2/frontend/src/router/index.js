import { createRouter, createWebHistory } from "vue-router";
import Inicio from "../components/shared/Inicio.vue";
import TicketViewer from "../components/shared/TicketViewer.vue";

import AdminAccess from "../components/admin/AdminAccess.vue";
import ContadorAccess from "../components/contador/ContadorAccess.vue";

import AdminPanel from "../components/admin/AdminPanel.vue";
import ContadorPanel from "../components/contador/ContadorPanel.vue";

import AdminDashboard from "../components/admin/AdminDashboard.vue";
import ContadorDashboard from "../components/contador/ContadorDashboard.vue";
// Importar store para tener acceso a las acciones de logout si es necesario
// import store from '../store'; // Descomentar si necesitas llamar store.dispatch('logout')

const routes = [
  { path: "/", name: "Home", component: Inicio }, // Rutas de ACCESO (No requieren autenticación)
  { path: "/admin-access", name: "AdminAccess", component: AdminAccess },
  {
    path: "/contador-access",
    name: "ContadorAccess",
    component: ContadorAccess,
  },

  {
    path: "/ticket-viewer",
    name: "TicketViewer",
    component: TicketViewer,
  },

  {
    path: "/admin",
    component: AdminPanel,
    meta: { requiresAuth: true, role: 2 }, // Rol Administrador: 2
    children: [{ path: "", name: "AdminDashboard", component: AdminDashboard }],
  },

  {
    path: "/contador",
    component: ContadorPanel,
    meta: { requiresAuth: true, role: 4 }, // Rol Contador: 4
    children: [
      { path: "", name: "ContadorDashboard", component: ContadorDashboard },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem("userToken");
  let userRole = null;
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}"); // Se asegura que userRole sea un número entero (necesario para la comparación estricta ===)
    userRole = parseInt(userData.id_rol, 10);
  } catch (e) {
    console.error("Error al parsear userData, limpiando sesión.", e);
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData"); // Si hay un error, el usuario no está logueado o los datos son corruptos
    return next("/");
  }

  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.role; // --- LÓGICA DE REDIRECCIÓN PARA USUARIOS YA AUTENTICADOS (EVITAR ACCESO A LOGIN) --- // Si un usuario está logueado y trata de acceder a una página de acceso, // lo redirigimos a su ruta principal.
  const isAccessPage =
    to.name === "AdminAccess" || to.name === "ContadorAccess";

  if (isLoggedIn && isAccessPage) {
    if (userRole === 2) {
      return next("/admin");
    } else if (userRole === 4) {
      return next("/contador");
    } else {
      // Cualquier otro rol logueado (ej. Cliente 5) es enviado a Home.
      console.log(
        `Usuario logueado (Rol ${userRole}) intentó acceder a página de acceso. Redirigiendo a Home.`
      );
      return next("/");
    }
  } // --- LÓGICA DE PROTECCIÓN DE RUTAS RESTRINGIDAS ---

  if (requiresAuth) {
    // 1. Si la ruta requiere autenticación y el usuario NO está logueado
    if (!isLoggedIn) {
      console.log(
        `Acceso denegado: Se requiere autenticación para ${to.path}.`
      ); // Redirige al login específico
      if (to.path.startsWith("/admin")) {
        return next("/admin-access");
      } else if (to.path.startsWith("/contador")) {
        return next("/contador-access");
      } // Para otras rutas protegidas sin un acceso específico, va a Home.
      return next("/");
    } // 2. Si la ruta requiere un rol específico y el usuario logueado NO lo tiene
    if (requiredRole && userRole !== requiredRole) {
      console.warn(
        `Intento de acceso denegado. Rol del usuario (${userRole}) no coincide con el requerido (${requiredRole}) para ${to.path}.`
      );
      return next("/");
    }
  } // Permite la navegación por defecto.
  next();
});

export default router;
