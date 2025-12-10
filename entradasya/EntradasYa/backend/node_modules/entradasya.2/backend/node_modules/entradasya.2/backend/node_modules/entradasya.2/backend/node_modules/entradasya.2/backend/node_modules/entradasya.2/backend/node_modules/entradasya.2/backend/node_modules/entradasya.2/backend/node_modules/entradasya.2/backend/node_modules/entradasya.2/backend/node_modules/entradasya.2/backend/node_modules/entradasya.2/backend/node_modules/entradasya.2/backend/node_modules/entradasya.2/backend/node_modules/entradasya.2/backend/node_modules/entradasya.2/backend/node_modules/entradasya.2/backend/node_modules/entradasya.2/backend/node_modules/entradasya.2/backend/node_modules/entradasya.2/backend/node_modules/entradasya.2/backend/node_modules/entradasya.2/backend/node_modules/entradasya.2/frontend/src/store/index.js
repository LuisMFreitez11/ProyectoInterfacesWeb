import { createStore } from "vuex";

export default createStore({
  state: {
    // Inicializa el estado leyendo directamente desde localStorage
    user: JSON.parse(localStorage.getItem("userData") || "null"),
    token: localStorage.getItem("userToken") || null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      localStorage.setItem("userData", JSON.stringify(user));
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem("userToken", token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("userData");
      localStorage.removeItem("userToken");
    },
  },
  actions: {
    login({ commit }, { user, token }) {
      commit("setUser", user);
      commit("setToken", token);
    },
    logout({ commit }) {
      commit("logout");
    }, // Acción para verificar y cargar la sesión al montar la aplicación
    checkInitialSession({ commit }) {
      const user = JSON.parse(localStorage.getItem("userData") || "null");
      const token = localStorage.getItem("userToken") || null;
      if (user && token) {
        commit("setUser", user);
        commit("setToken", token);
      }
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.token, // 🔑 CRÍTICO: Getter que expone el objeto de usuario para el navbar
    currentUser: (state) => state.user, // Utilizamos 'id_rol' ya que es el campo que viene del objeto userData
    userRole: (state) => state.user?.id_rol,
    isAdmin: (state) => state.user?.id_rol === 2,
    isContador: (state) => state.user?.id_rol === 4,
  },
});
