import { createStore } from 'vuex';

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('userData') || 'null'),
    token: localStorage.getItem('userToken') || null,
    eventToPay: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('userData', JSON.stringify(user));
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('userToken', token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('userData');
      localStorage.removeItem('userToken');
    },
    setEventToPay(state, event) {
      state.eventToPay = event;
    },
    clearEventToPay(state) {
      state.eventToPay = null;
    },
  },
  actions: {
    login({ commit }, { user, token }) {
      commit('setUser', user);
      commit('setToken', token);
    },
    logout({ commit }) {
      commit('logout');
    },
    setEventForPayment({ commit }, event) {
      commit('setEventToPay', event);
    },
    clearEventForPayment({ commit }) {
      commit('clearEventToPay');
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: (state) => state.user?.role,
    isAdmin: (state) => state.user?.role === 2,
    isContador: (state) => state.user?.role === 4,
    eventToPay: (state) => state.eventToPay,
  },
});
