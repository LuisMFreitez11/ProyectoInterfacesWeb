<template>
  <div class="modal-backdrop" @click.self="cerrar">
    <div class="modal-content" @keydown.esc="cerrar">
      <button class="modal-close" @click="cerrar">&times;</button>
      
      <div class="modal-header">
        <h3>Editar Perfil</h3>
      </div>

      <div class="modal-body">
        <p v-if="error" class="alert alert-danger">{{ error }}</p>
        <p v-if="mensajeExito" class="alert alert-success">{{ mensajeExito }}</p>

        <form @submit.prevent="guardarCambios">
          
          <div class="mb-3">
            <label for="edit-nombre" class="form-label">Nombre:</label>
            <input type="text" id="edit-nombre" class="form-control" v-model="form.nombre" required>
          </div>

          <div class="mb-3">
            <label for="edit-apellido" class="form-label">Apellido:</label>
            <input type="text" id="edit-apellido" class="form-control" v-model="form.apellido">
          </div>

          <div class="mb-3">
            <label for="edit-telefono" class="form-label">Teléfono:</label>
            <input type="tel" id="edit-telefono" class="form-control" v-model="form.telefono">
          </div>

          <div class="mb-4">
            <label class="form-label text-muted">Correo Electrónico:</label>
            <p class="form-control-plaintext">{{ form.email }}</p>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
            {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; 

export default {
  name: 'PerfilEditarModal',
  emits: ['cerrar', 'perfil-actualizado'],
  props: {
    usuarioData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: {
        nombre: '',
        apellido: '',
        telefono: '', // 🚨 Usamos 'telefono' como clave predeterminada
        email: ''
      },
      isLoading: false,
      error: null,
      mensajeExito: null,
    };
  },
  watch: {
    // Observa si la prop cambia y actualiza el formulario
    usuarioData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // Si el campo real es 'numTelefonico', lo mapeamos a 'telefono' del form para editar
          const telefonoValor = newVal.telefono || newVal.numTelefonico || '';
          
          this.form = {
            nombre: newVal.nombre || '',
            apellido: newVal.apellido || '',
            telefono: telefonoValor, 
            email: newVal.email || ''
          };
        }
      }
    }
  },
  methods: {
    cerrar() {
      this.$emit('cerrar');
    },
    async guardarCambios() {
      this.error = null;
      this.mensajeExito = null;
      this.isLoading = true;

      // Objeto a enviar, limpiando el email y solo enviando campos modificables
      const dataToSend = {
          nombre: this.form.nombre,
          apellido: this.form.apellido,
          // 🚨 Enviar el campo como lo espera el backend (Asumimos 'telefono' por simplicidad)
          telefono: this.form.telefono, 
      };

      // Si tu backend requiere el ID del usuario:
      const userId = this.usuarioData.id;
      const userToken = localStorage.getItem('userToken');

      try {
        const response = await axios.put(`${API_URL}/users/${userId}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });
        
        this.mensajeExito = 'Perfil actualizado exitosamente.';
        
        // 🚨 Actualizar localStorage y notificar al componente padre
        const updatedUser = response.data.data; // Asumimos que el backend devuelve el usuario actualizado
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        this.$emit('perfil-actualizado', updatedUser); 

        // Opcional: Cerrar el modal después de un breve tiempo
        setTimeout(() => this.cerrar(), 1500);

      } catch (err) {
        this.error = 'Error al actualizar: ' + (err.response?.data?.message || 'Error de conexión.');
      } finally {
        this.isLoading = false;
      }
    }
  },
};
</script>

<style scoped>
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
    z-index: 1050;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    width: 90%;
    max-width: 450px;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
</style>