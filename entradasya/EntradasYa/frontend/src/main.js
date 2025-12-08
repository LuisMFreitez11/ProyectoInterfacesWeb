import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const app = createApp(App);

app.use(router);
app.use(store);

axios.defaults.baseURL = 'http://localhost:3000/api';

app.config.globalProperties.$axios = axios;

app.mount('#app');
