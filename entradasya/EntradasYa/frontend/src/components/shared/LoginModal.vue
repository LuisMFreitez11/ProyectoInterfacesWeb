<template>
    <div class="modal-backdrop" @click.self="cerrar">
        <div class="modal-content" @keydown.esc="cerrar">
            <button class="modal-close" @click="cerrar">&times;</button>
            
            <div class="modal-header">
                <h3>Iniciar Sesión</h3>
            </div>

            <div class="modal-body">
                <form @submit.prevent="login">
                    
                    <div class="mb-3">
                        <label for="login-email" class="form-label">Correo Electrónico:</label>
                        <input type="email" id="login-email" class="form-control" v-model="email" required>
                    </div>

                    <div class="mb-3">
                        <label for="login-password" class="form-label">Contraseña:</label>
                        <input type="password" id="login-password" class="form-control" v-model="password" required>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="isLoading">
                        {{ isLoading ? 'Iniciando...' : 'Entrar' }}
                    </button>

                    <p v-if="error" class="text-danger text-center">{{ error }}</p>

                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-link p-0" @click="$emit('cambiar-a-olvido-pass')">
                            Olvidé mi contraseña
                        </button>
                        <button type="button" class="btn btn-link p-0" @click="$emit('cambiar-a-registro')">
                            Crear una cuenta
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

// AJUSTA ESTA URL
const API_URL = 'http://localhost:3000/api';

export default {
    name: 'LoginModal',
    emits: ['cerrar', 'cambiar-a-registro', 'cambiar-a-olvido-pass', 'login-exitoso', 'login-fallido'],
    data() {
        return {
            email: '',
            password: '',
            error: null,
            isLoading: false,
        };
    },
    mounted() {
        console.log('LoginModal mounted - modal should be visible');
    },
    methods: {
        cerrar() {
            this.$emit('cerrar');
        },
        async login() {
            this.error = null;
            this.isLoading = true;

            if (!this.email || !this.password) {
                this.error = 'Por favor, ingrese email y contraseña.';
                this.$emit('login-fallido', '⚠️ Por favor, ingrese email y contraseña.');
                this.isLoading = false;
                return;
            }

            try {
                const response = await axios.post(`${API_URL}/auth/login`, {
                    email: this.email,
                    password: this.password,
                });

                // 🔑 CORRECCIÓN: Acceder a 'response.data.data' para obtener el token y el user
                const token = response.data.data.token;
                const user = response.data.data.user;

                if (token && user) {
                    localStorage.setItem('userToken', token); 
                    localStorage.setItem('userData', JSON.stringify(user)); 

                    this.$emit('login-exitoso', user);
                    this.cerrar();
                } else {
                    this.error = 'Respuesta de servidor incompleta (Token/Usuario faltante).';
                    this.$emit('login-fallido', '❌ Error: Respuesta de servidor incompleta.');
                }

            } catch (err) {
                let errorMessage;

                if (err.response && err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                    this.error = `Error ${err.response.status}: ${errorMessage}`;
                } else {
                    errorMessage = 'No se pudo conectar con el servidor de autenticación.';
                    this.error = errorMessage;
                }
                
                this.$emit('login-fallido', `❌ Error al iniciar sesión: ${errorMessage}`);
                
                localStorage.removeItem('userToken');
                localStorage.removeItem('userData');
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style scoped>
/* Estilos se mantienen */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    width: 90%;
    max-width: 400px;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #333;
}

.modal-header h3 {
    margin-bottom: 20px;
    color: #ff6b00;
    text-align: center;
}

.btn-primary {
    background-color: #ff6b00;
    border-color: #ff6b00;
    transition: background-color 0.3s;
}

.btn-primary:hover:not(:disabled) {
    background-color: #e65c00;
    border-color: #e65c00;
}

.btn-link {
    color: #ff6b00;
    font-size: 0.9rem;
}

.btn-link:hover {
    color: #e65c00;
}
</style>