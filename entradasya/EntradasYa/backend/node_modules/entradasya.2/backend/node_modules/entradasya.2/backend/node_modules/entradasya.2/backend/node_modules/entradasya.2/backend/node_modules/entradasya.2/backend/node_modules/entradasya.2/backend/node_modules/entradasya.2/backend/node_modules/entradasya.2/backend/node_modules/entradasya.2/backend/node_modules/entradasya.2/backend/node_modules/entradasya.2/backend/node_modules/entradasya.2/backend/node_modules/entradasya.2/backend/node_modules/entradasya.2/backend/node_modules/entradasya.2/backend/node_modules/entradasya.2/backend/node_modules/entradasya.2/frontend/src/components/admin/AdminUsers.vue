<template>
    <div class="admin-users">
        <h3 class="mb-4">Gestión de Usuarios</h3>

        <div class="mb-3">
            <button class="btn btn-success" @click="showNewUserForm = !showNewUserForm">
                {{ showNewUserForm ? 'Ocultar Formulario' : '➕ Agregar Nuevo Usuario' }}
            </button>
        </div>

        <div v-if="showNewUserForm" class="mt-4 p-3 border rounded shadow-sm mb-4 bg-light">
            <h5>Detalles del Nuevo Usuario</h5>
            <div class="row g-3">
                <div class="col-md-3">
                    <input v-model="newUser.nombre" class="form-control" placeholder="Nombre (Obligatorio)" required />
                </div>
                <div class="col-md-3">
                    <input v-model="newUser.apellido" class="form-control" placeholder="Apellido" />
                </div>
                <div class="col-md-3">
                    <input v-model="newUser.email" type="email" class="form-control" placeholder="Email (Obligatorio)"
                        required />
                </div>
                <div class="col-md-3">
                    <input v-model="newUser.telefono" class="form-control" placeholder="Teléfono" />
                </div>
                <div class="col-md-4">
                    <input v-model="newUser.password" type="password" class="form-control"
                        placeholder="Contraseña (Obligatoria)" required />
                </div>
                <div class="col-md-3">
                    <select v-model="newUser.id_rol" class="form-select">
                        <option v-for="(name, id) in roles" :key="id" :value="id">{{ name }}</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select v-model="newUser.activo" class="form-select">
                        <option :value="1">Activo</option>
                        <option :value="0">Inactivo</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-primary w-100" @click="createUser">Crear Usuario</button>
                </div>
            </div>
        </div>

        <hr>

        <div v-if="loading" class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>

        <p v-if="errorMessage" class="text-danger text-center">{{ errorMessage }}</p>

        <table v-if="!loading && usuarios.length" class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="u in usuarios" :key="u.id_usuario">
                    <td>{{ u.id_usuario }}</td>

                    <td v-if="editUserId !== u.id_usuario">{{ u.nombre }}</td>
                    <td v-else>
                        <input v-model="editForm.nombre" class="form-control form-control-sm" />
                    </td>

                    <td v-if="editUserId !== u.id_usuario">{{ u.apellido || '-' }}</td>
                    <td v-else>
                        <input v-model="editForm.apellido" class="form-control form-control-sm" />
                    </td>

                    <td>{{ u.email }}</td>

                    <td v-if="editUserId !== u.id_usuario">{{ u.telefono || '-' }}</td>
                    <td v-else>
                        <input v-model="editForm.telefono" class="form-control form-control-sm" />
                    </td>

                    <td v-if="editUserId !== u.id_usuario">{{ getRoleName(u.id_rol) }}</td>
                    <td v-else>
                        <select v-model="editForm.id_rol" class="form-select form-select-sm">
                            <option v-for="(name, id) in roles" :key="id" :value="id">{{ name }}</option>
                        </select>
                    </td>

                    <td v-if="editUserId !== u.id_usuario">{{ u.activo ? 'Sí' : 'No' }}</td>
                    <td v-else>
                        <select v-model.number="editForm.activo" class="form-select form-select-sm">
                            <option :value="1">Sí</option>
                            <option :value="0">No</option>
                        </select>
                    </td>

                    <td>
                        <div class="d-flex">
                            <button v-if="editUserId !== u.id_usuario" class="btn btn-sm btn-primary me-1"
                                @click="startEdit(u)">
                                Editar
                            </button>

                            <button v-if="editUserId === u.id_usuario" class="btn btn-sm btn-success me-1"
                                @click="saveEdit(u.id_usuario)">
                                Guardar
                            </button>

                            <button v-if="editUserId === u.id_usuario" class="btn btn-sm btn-secondary me-1"
                                @click="cancelEdit">
                                Cancelar
                            </button>

                            <button v-if="editUserId !== u.id_usuario" class="btn btn-sm btn-danger"
                                @click="deleteUser(u.id_usuario)">
                                Eliminar
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <p v-if="!loading && usuarios.length === 0" class="text-center text-muted mt-4">
            No hay usuarios registrados.
        </p>

    </div>
</template>

<script>
// 🔑 URLs OPTIMIZADAS: Usamos las URLs correctas para cada función
const CRUD_USERS_URL = 'http://localhost:3000/api/admin/users'; // URL para GET, PUT, DELETE (La que te funciona)
const CREATE_USER_URL = 'http://localhost:3000/api/auth/admin/user/create'; // URL para POST (La ruta protegida)

export default {
    name: 'AdminUsers',
    data() {
        return {
            usuarios: [],
            loading: false,
            errorMessage: '',
            editUserId: null,
            showNewUserForm: false,
            editForm: { nombre: '', apellido: '', telefono: '', id_rol: '5', activo: 1 },
            newUser: { nombre: '', apellido: '', email: '', telefono: '', password: '', id_rol: '5', activo: 1 },
            roles: { '2': 'Admin', '4': 'Contador', '3': 'Organizador', '5': 'Usuario' }
        };
    },
    mounted() {
        this.cargarUsuarios();
    },
    methods: {
        // --- LECTURA (GET /api/admin/users) ---
        async cargarUsuarios() {
            this.loading = true;
            this.errorMessage = '';
            const token = localStorage.getItem('userToken');
            try {
                // Usamos la URL CRUD para listar
                const response = await fetch(CRUD_USERS_URL, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    this.usuarios = data.data.map(u => ({
                        ...u,
                        activo: u.activo ? 1 : 0,
                        id_rol: String(u.id_rol)
                    }));
                } else {
                    this.errorMessage = data.message || 'Error al cargar usuarios';
                }
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
                this.errorMessage = 'Error de conexión con el servidor o token inválido.';
            } finally {
                this.loading = false;
            }
        },
        getRoleName(roleId) {
            return this.roles[String(roleId)] || 'Desconocido';
        },

        // --- EDICIÓN (PUT /api/admin/users/:id) ---
        startEdit(user) {
            this.cancelEdit();
            this.editUserId = user.id_usuario;
            this.editForm = {
                nombre: user.nombre,
                apellido: user.apellido || '',
                telefono: user.telefono || '',
                id_rol: String(user.id_rol),
                activo: user.activo ? 1 : 0
            };
        },
        cancelEdit() {
            this.editUserId = null;
            this.editForm = { nombre: '', apellido: '', telefono: '', id_rol: '5', activo: 1 };
        },
        async saveEdit(userId) {
            const token = localStorage.getItem('userToken');
            const dataToSend = {
                ...this.editForm,
                id_rol: Number(this.editForm.id_rol),
                activo: Number(this.editForm.activo)
            };

            try {
                // Usa la URL CRUD para editar
                const response = await fetch(`${CRUD_USERS_URL}/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(dataToSend)
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    this.cargarUsuarios();
                    this.cancelEdit();
                } else {
                    alert(data.message || `Error al actualizar usuario. Código: ${response.status}`);
                }
            } catch (error) {
                console.error("Error al actualizar usuario:", error);
                alert('Error de conexión al actualizar usuario');
            }
        },

        // --- ELIMINACIÓN (DELETE /api/admin/users/:id) ---
        async deleteUser(userId) {
            if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

            const token = localStorage.getItem('userToken');
            try {
                // Usa la URL CRUD para eliminar
                const response = await fetch(`${CRUD_USERS_URL}/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    this.cargarUsuarios();
                } else {
                    alert(data.message || `Error al eliminar usuario. Código: ${response.status}`);
                }
            } catch (error) {
                console.error("Error al eliminar usuario:", error);
                alert('Error de conexión al eliminar usuario');
            }
        },

        // --- CREACIÓN (POST /api/auth/admin/user/create) ---
        async createUser() {
            const token = localStorage.getItem('userToken');
            if (!this.newUser.nombre || !this.newUser.email || !this.newUser.password) {
                alert('Nombre, email y contraseña son obligatorios');
                return;
            }

            const dataToSend = {
                ...this.newUser,
                id_rol: Number(this.newUser.id_rol),
                activo: Number(this.newUser.activo)
            };

            try {
                // 🔑 USAMOS LA URL ESPECÍFICA DE CREACIÓN (con /api/auth)
                const response = await fetch(CREATE_USER_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(dataToSend)
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    this.cargarUsuarios();
                    this.newUser = { nombre: '', apellido: '', email: '', telefono: '', password: '', id_rol: '5', activo: 1 };
                    this.showNewUserForm = false;
                    alert('Usuario creado con éxito.');
                } else {
                    alert(data.message || `Error al crear usuario. Código: ${response.status}`);
                }
            } catch (error) {
                console.error("Error al crear usuario:", error);
                alert('Error de conexión al crear usuario');
            }
        }
    }
};
</script>

<style scoped>
.admin-users {
    padding: 20px;
}

.spinner-border {
    width: 3rem;
    height: 3rem;
}

button {
    min-width: 70px;
}

.d-flex button {
    min-width: 75px;
}
</style>+