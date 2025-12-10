<template>
  <div class="admin-access-wrapper d-flex align-items-center justify-content-center">
    <div class="auth-card p-4 shadow-lg" v-if="showForm">

      <h2 class="text-center mb-4 access-title">Portal de Gestión de Eventos</h2>

      <div v-if="!adminExists">
        <h4 class="mb-3 text-center subtitle">Registro Administrador</h4>
        <form @submit.prevent="registerAdmin" class="mb-4">
          <input type="text" v-model="form.nombre" class="form-control auth-input mb-3"
            placeholder="Nombre Completo" required>
          <input type="email" v-model="form.email" class="form-control auth-input mb-3"
            placeholder="Correo Admin" required>
          <input type="password" v-model="form.password" class="form-control auth-input mb-3"
            placeholder="Contraseña" required>
          <button type="submit" class="btn btn-setup w-100">Crear Administrador</button>
        </form>
      </div>

      <hr v-if="!adminExists" class="divider">

      <div>
        <h4 class="mb-3 text-center subtitle">Acceso</h4>
        <form @submit.prevent="loginAdmin">
          <input type="email" v-model="loginForm.email" class="form-control auth-input mb-3"
            placeholder="Correo Electrónico" required>
          <input type="password" v-model="loginForm.password" class="form-control auth-input mb-3"
            placeholder="Contraseña" required>
          <button type="submit" class="btn btn-login w-100">Ingresar al Panel</button>
        </form>
        <p v-if="errorMessage" class="text-danger mt-3 text-center error-message">⚠️ {{ errorMessage }}</p>
      </div>

    </div>
    <div v-else class="text-center">
      <p class="text-white">Verificando sesión...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminAccess',
  data() {
    return {
      adminExists: true,
      showForm: false, // Oculto por defecto para permitir la redirección inmediata
      form: { nombre: '', email: '', password: '' },
      loginForm: { email: '', password: '' },
      errorMessage: '',
    };
  },
  
  // 🔑 LÓGICA CLAVE: Redirección inmediata al montar el componente
  mounted() {
    const token = localStorage.getItem('userToken');
    const userDataString = localStorage.getItem('userData');

    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        
        // Determina la ruta de destino según el rol
        const targetRoute = this.getRoleRoute(userData.id_rol);
        
        if (targetRoute !== '/') {
          this.$router.push(targetRoute);
          return; // Detiene la ejecución
        }
      } catch (e) {
        console.error("Error al parsear userData o token inválido. Limpiando sesión.", e);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
    }
    
    // Si no hubo redirección, chequeamos la existencia del admin y mostramos el formulario
    this.checkAdminExists();
  },

  methods: {
    // Función auxiliar para mapear el ID de Rol a la ruta del Dashboard
    getRoleRoute(roleId) {
        if (roleId === 2) return '/admin';     // Administrador
        if (roleId === 4) return '/contador';  // Contador
        if (roleId === 3) return '/organizador';// Organizador (o el que uses)
        return '/'; // Rol no reconocido (vuelve a la página de inicio)
    },

    async checkAdminExists() {
        // Implementar la llamada a 'http://localhost:3000/api/auth/check-admin'
        try {
            // Ejemplo de llamada (descomentar y completar si ya tienes el endpoint)
            /*
            const response = await fetch('http://localhost:3000/api/auth/check-admin', { method: 'GET' });
            const data = await response.json();
            this.adminExists = data.exists;
            */
            this.adminExists = true; // Asumiendo que el admin ya existe para mostrar el login por defecto
        } catch (err) {
            console.error("Error al verificar admin:", err);
            this.adminExists = true; 
        } finally {
            this.showForm = true; // Muestra el formulario una vez terminado el chequeo
        }
    },

    async registerAdmin() {
      this.errorMessage = '';
      if (!this.form.nombre || !this.form.email || !this.form.password) {
        this.errorMessage = 'Todos los campos son obligatorios.';
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/api/auth/register-admin-secret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        const data = await response.json();
        if (data.success) {
          alert('¡Administrador creado! Por favor, inicia sesión.');
          this.adminExists = true;
        } else {
          this.errorMessage = data.message || 'Error en el registro. El correo podría existir.';
        }
      } catch (err) {
        this.errorMessage = 'No se pudo conectar con el servidor.';
      }
    },

    async loginAdmin() {
      this.errorMessage = '';
      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.loginForm)
        });
        const data = await response.json();

        if (data.success) {
          // 🔑 CRÍTICO: Usar data.data.user.id_rol que es lo que devuelve el backend
          const userRole = data.data.user.id_rol; 
          
          localStorage.setItem('userToken', data.data.token);
          localStorage.setItem('userData', JSON.stringify(data.data.user));

          // Redirige al portal correcto según el rol
          const targetRoute = this.getRoleRoute(userRole);
          if (targetRoute !== '/') {
            this.$router.push(targetRoute);
          } else {
              this.errorMessage = 'Acceso denegado. Rol de usuario no autorizado.';
              localStorage.removeItem('userToken');
              localStorage.removeItem('userData');
          }

        } else {
          this.errorMessage = data.message || 'Credenciales incorrectas.';
        }
      } catch (err) {
        this.errorMessage = 'Error en el inicio de sesión. Verifique su conexión.';
        console.error(err);
      }
    },
  },
};
</script>

<style scoped>
.admin-access-wrapper {
  height: 100vh;
  background: linear-gradient(135deg, #f0f4f8 0%, #e0e7ed 100%);
  min-height: 100vh;
}

.auth-card {
  max-width: 450px;
  width: 90%;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #dcdcdc;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.access-title { color: #004d99; font-weight: 700; font-size: 1.8rem; }
.subtitle { color: #444; font-weight: 500; margin-bottom: 20px !important; }
.auth-input { border: 1px solid #ccc; border-radius: 6px; padding: 10px 15px; }
.auth-input:focus { border-color: #007bff; box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25); }
.btn-setup { background-color: #ff6b6b; border: none; color: white; font-weight: 600; padding: 12px 0; border-radius: 8px; }
.btn-setup:hover { background-color: #e85a5a; }
.btn-login { background-color: #007bff; border: none; color: white; font-weight: 600; padding: 12px 0; border-radius: 8px; }
.btn-login:hover { background-color: #0056b3; }
.divider { border-top: 2px solid #eee; }
.error-message { font-weight: 600; color: #cc0000 !important; }
</style>
