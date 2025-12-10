<template>
    <div class="contador-access-wrapper d-flex align-items-center justify-content-center">
        <div class="auth-card p-4 shadow-lg">
            <h2 class="text-center mb-4 access-title">Portal Contable</h2>
            <div>
                <h4 class="mb-3 text-center subtitle">Acceso Contador</h4>
                <form @submit.prevent="loginContador">
                    <input 
                        type="email" 
                        v-model="loginForm.email" 
                        class="form-control auth-input mb-3"
                        placeholder="Correo Contador" 
                        required
                    >
                    <input 
                        type="password" 
                        v-model="loginForm.password" 
                        class="form-control auth-input mb-3"
                        placeholder="Contraseña" 
                        required
                    >
                    <button type="submit" class="btn btn-login w-100">
                        Ingresar al Panel Contable
                    </button>
                </form>
                <p v-if="errorMessage" class="text-danger mt-3 text-center error-message">⚠️ {{ errorMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'; 

export default {
    name: 'ContadorAccess',
    data() {
        return {
            loginForm: { email: '', password: '' },
            errorMessage: '',
        };
    },
    methods: {
        async loginContador() {
            this.errorMessage = '';
            try {
                const apiUrl = 'http://localhost:3000/api/auth/login';
                const response = await axios.post(apiUrl, this.loginForm);
                const data = response.data;

                // 🌟 NOTA: La propiedad 'data.data.user.id_rol' ahora es correcta 
                // porque modificamos el backend (loginController.js).
                if (data.success && data.data.user.id_rol === 4) {
                    // 1. Guardar credenciales
                    localStorage.setItem('userToken', data.data.token);
                    // IMPORTANTE: Guardamos el objeto de usuario que incluye 'id_rol'
                    localStorage.setItem('userData', JSON.stringify(data.data.user)); 
                    
                    // 2. Redirigir al panel del contador
                    this.$router.push('/contador'); 

                } else if (data.success && data.data.user.id_rol !== 4) {
                    this.errorMessage = 'Acceso denegado. Este portal es solo para contadores.';
                } else {
                    this.errorMessage = data.message || 'Credenciales incorrectas.';
                }
            } catch (error) {
                // 🚀 MEJORA EN MANEJO DE ERRORES: Muestra el mensaje específico del backend 401
                if (error.response && error.response.status === 401) {
                    // Muestra el mensaje de "Credenciales inválidas" del backend
                    this.errorMessage = error.response.data.message || 'Credenciales de acceso incorrectas.';
                } else {
                    // Muestra un mensaje genérico para otros errores de red o servidor 500
                    this.errorMessage = 'Error en el inicio de sesión. Por favor, intente más tarde.';
                }
                console.error("Error de login:", error);
            }
        },
    }
};
</script>

<style scoped>
.contador-access-wrapper {
    height: 100vh;
    background: linear-gradient(135deg, #f0f4f8 0%, #e0e7ed 100%);
    min-height: 100vh;
}
.auth-card {
    max-width: 450px;
    width: 90%;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #dcdcdc;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
.access-title {
    color: #ff6b00;
    font-weight: 700;
    font-size: 1.8rem;
    letter-spacing: 0.5px;
}
.btn-login {
    background-color: #ff6b00;
    border: none;
    color: white;
    font-weight: 600;
    padding: 12px 0;
    border-radius: 8px;
    transition: background-color 0.3s ease;
}
.btn-login:hover {
    background-color: #e65c00;
}
.error-message {
    font-weight: 600;
    color: #cc0000 !important;
}
</style>