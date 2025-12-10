<template>
  <div class="overlay" @click.self="cerrarModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Recuperar Contraseña</h2>
        <button class="close-btn" @click="cerrarModal">✕</button>
      </div>
      <form @submit.prevent="sendResetLink" class="reset-form">
        <p class="text-muted-custom">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <div class="input-group">
          <label for="resetEmail">Correo electrónico</label>
          <input 
            type="email" 
            id="resetEmail" 
            v-model="email" 
            placeholder="Correo electrónico" 
            required 
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-submit">Enviar Enlace</button>
        </div>
      </form>

      <div class="back-link">
        <a href="#" @click.prevent="switchToLogin">← Volver a Iniciar Sesión</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPasswordModal',
  emits: ['cerrar', 'cambiar-a-login'], 
  data() {
    return {
      email: "",
    };
  },
  methods: {
    cerrarModal() {
      this.$emit("cerrar");
    },
    switchToLogin() {
      this.$emit("cambiar-a-login");
    },
    sendResetLink() {
      alert(`Se ha enviado un enlace de restablecimiento a: ${this.email}`);
      this.cerrarModal();
      this.email = ''; 
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
  background-color: #fff; padding: 30px; border-radius: 8px; width: 400px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.2); position: relative;
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
.reset-form .input-group {
  margin-bottom: 20px;
}
.reset-form label {
  display: block; font-size: 14px; color: #666; margin-bottom: 5px;
}
.reset-form input {
  width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box;
}
.reset-form input:focus {
  outline: none; border-color: #ff6b00; box-shadow: 0 0 5px rgba(255, 107, 0, 0.5);
}
.form-actions {
  display: flex; flex-direction: column; align-items: center;
}
.btn-submit {
  padding: 12px 20px; background-color: #ff6b00; color: white; font-size: 16px; border: none; border-radius: 8px; width: 100%; cursor: pointer; transition: background-color 0.3s;
}
.btn-submit:hover {
  background-color: #ff4500;
}
.back-link {
  text-align: center; margin-top: 20px; font-size: 14px;
}
.back-link a {
  color: #ff6b00; text-decoration: none;
}
.back-link a:hover {
  text-decoration: underline;
}
.text-muted-custom {
    font-size: 14px; color: #666; margin-bottom: 20px; text-align: center;
}
</style>