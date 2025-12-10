<template>
  <div class="overlay" @click.self="cerrarModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Crear Cuenta</h2>
        <button class="close-btn" @click="cerrarModal">✕</button>
      </div>
      <form @submit.prevent="signup" class="signup-form">
        
        <p v-if="error" :class="{'error-message': !isSuccess, 'success-message': isSuccess}">
          {{ error }}
        </p>

        <div class="input-group">
          <label for="regName">Nombre</label>
          <input type="text" id="regName" v-model="name" placeholder="Tu Nombre" required />
        </div>
        
        <div class="input-group">
          <label for="regApellido">Apellido</label>
          <input type="text" id="regApellido" v-model="apellido" placeholder="Tu Apellido (Opcional)" />
        </div>
        
        <div class="input-group">
          <label for="regEmail">Correo electrónico</label>
          <input type="email" id="regEmail" v-model="email" placeholder="ejemplo@correo.com" required />
        </div>
        
        <div class="input-group">
          <label for="regPhone">Teléfono</label>
          <input 
            type="tel" 
            id="regPhone" 
            v-model="telefono" 
            placeholder="Número telefónico" 
            maxlength="11" 
          />
        </div>
        
        <p v-if="telefono.length > 0 && !isPhoneValid" class="error-message">
             El teléfono debe ser un número válido de 11 dígitos (Ej: 04123709233).
        </p>
        
        <div class="input-group">
          <label for="regPassword">Contraseña</label>
          <input type="password" id="regPassword" v-model="password" placeholder="Mínimo 6 caracteres" required />
        </div>
        
        <p v-if="password.length > 0 && !isPasswordValid" class="error-message">
            La contraseña debe tener al menos 6 caracteres.
        </p>
        
        <div class="input-group">
          <label for="regConfirmPassword">Confirmar Contraseña</label>
          <input type="password" id="regConfirmPassword" v-model="confirmPassword" placeholder="Repite tu contraseña" required />
        </div>
        
        <p v-if="password !== confirmPassword && confirmPassword.length > 0" class="error-message">
          Las contraseñas no coinciden.
        </p>

        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="!isFormValid">Registrarse</button>
        </div>
      </form>

      <div class="login-link">
        <p>¿Ya tienes cuenta? <a href="#" @click.prevent="switchToLogin">Inicia Sesión</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; 

export default {
  name: 'SignupModal',
  emits: ['cerrar', 'cambiar-a-login'],
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      apellido: "",
      telefono: "", 
      error: null,
      isSuccess: false,
    };
  },
  
  computed: {
    isPasswordValid() {
        return this.password.length >= 6;
    },
    
    // NUEVA PROPIEDAD: Validación de Teléfono (Venezuela - 11 dígitos numéricos)
    isPhoneValid() {
        // Si el campo está vacío, es válido (es opcional)
        if (this.telefono.length === 0) {
            return true;
        }
        
        // Expresión regular para 11 dígitos, solo números (Ej: 04123709233)
        // ^\d{11}$
        const phoneRegex = /^\d{11}$/; 
        return phoneRegex.test(this.telefono);
    },
    
    isFormValid() {
        // Ahora incluye la validación de teléfono si el campo NO está vacío
        const phoneCheck = this.telefono.length > 0 ? this.isPhoneValid : true;
        
        return (
            this.password === this.confirmPassword &&
            this.isPasswordValid &&
            phoneCheck && // Incluye la validación del teléfono
            this.name.length > 0 &&
            this.email.length > 0
        );
    }
  },

  methods: {
    cerrarModal() {
      this.$emit("cerrar");
    },
    switchToLogin() {
      this.$emit("cambiar-a-login");
    },
    
    async signup() {
      this.error = null;
      this.isSuccess = false;
      
      if (!this.isFormValid) {
          this.error = "Completa todos los campos obligatorios y verifica el formato de teléfono/contraseña.";
          return;
      }
      
      try {
        await axios.post('/auth/register', {
          nombre: this.name,
          email: this.email,
          password: this.password,
          apellido: this.apellido,
          telefono: this.telefono // Envía el campo, aunque sea vacío
        });

        // Manejo de éxito
        this.isSuccess = true;
        this.error = '¡Cuenta creada con éxito! Serás redirigido para iniciar sesión.';
        
        // Limpiar formulario y temporizador para cambiar de vista
        this.name = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
        this.apellido = '';
        this.telefono = '';

        setTimeout(() => {
            this.$emit("cambiar-a-login"); 
        }, 1500); 

      } catch (error) {
        // Manejo de errores del backend
        this.isSuccess = false;
        console.error('Error al registrar:', error);
        
        const msg = error.response?.data?.message || 'Error desconocido al intentar registrar.';
        this.error = msg;
      }
    },
  },
};
</script>

<style scoped>
/* Estilos se mantienen */
.overlay {
  position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content {
  background-color: #fff; padding: 30px; border-radius: 8px; width: 450px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.2); position: relative;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;
}
h2 {
  font-size: 24px; font-weight: 600; color: #333; margin: 0;
}
button.close-btn {
  background: none; border: none; font-size: 20px; color: #333; cursor: pointer;
}
.signup-form .input-group {
  margin-bottom: 15px;
}
.signup-form label {
  display: block; font-size: 14px; color: #666; margin-bottom: 5px;
}
.signup-form input {
  width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box;
}
.signup-form input:focus {
  outline: none; border-color: #ff6b00; box-shadow: 0 0 5px rgba(255, 107, 0, 0.5);
}
.form-actions {
  display: flex; flex-direction: column; align-items: center; margin-top: 10px;
}
.btn-submit {
  padding: 12px 20px; background-color: #ff6b00; color: white; font-size: 16px; border: none; border-radius: 8px; width: 100%; cursor: pointer; transition: background-color 0.3s;
}
.btn-submit:hover:not(:disabled) {
  background-color: #ff4500;
}
.btn-submit:disabled {
  background-color: #ccc; cursor: not-allowed;
}
.login-link {
  text-align: center; margin-top: 20px; font-size: 14px; color: #666;
}
.login-link a {
  color: #ff6b00; text-decoration: none;
}
.login-link a:hover {
  text-decoration: underline;
}
.error-message {
    color: #cc0000; /* Rojo */
    font-size: 13px;
    margin-top: -10px;
    margin-bottom: 15px;
    text-align: center;
}

.success-message {
    color: #155724; /* Verde Oscuro */
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    padding: 10px;
    border-radius: 5px;
    margin-top: -10px;
    margin-bottom: 15px;
    text-align: center;
}
</style>