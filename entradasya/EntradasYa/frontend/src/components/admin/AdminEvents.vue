<template>
  <div class="admin-events">
    <!-- Encabezado -->
    <div class="admin-header mb-4">
      <h2 class="title">
        <i class="bi bi-calendar-event me-2"></i>Gestión de Eventos
      </h2>
      <p class="text-muted">Administra eventos, artistas y lugares del sistema</p>
    </div>

    <!-- Pestañas -->
    <div class="tabs mb-4">
      <button :class="{ active: activeTab === 'eventos' }" @click="activeTab = 'eventos'">
        <i class="bi bi-calendar-check me-1"></i> Eventos
      </button>
      <button :class="{ active: activeTab === 'artistas' }" @click="activeTab = 'artistas'">
        <i class="bi bi-mic me-1"></i> Artistas
      </button>
      <button :class="{ active: activeTab === 'lugares' }" @click="activeTab = 'lugares'">
        <i class="bi bi-geo-alt me-1"></i> Lugares
      </button>
      <button :class="{ active: activeTab === 'estadisticas' }" @click="activeTab = 'estadisticas'">
        <i class="bi bi-graph-up me-1"></i> Estadísticas
      </button>
    </div>

    <!-- ==================== SECCIÓN EVENTOS ==================== -->
    <div v-if="activeTab === 'eventos'">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-0">Lista de Eventos</h4>
          <small class="text-muted">{{ eventos.length }} eventos registrados</small>
        </div>
        <button class="btn btn-success" @click="openModal('evento')">
          <i class="bi bi-plus-circle me-1"></i> Nuevo Evento
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loadingEventos" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Cargando eventos...</p>
      </div>

      <!-- Sin eventos -->
      <div v-else-if="eventos.length === 0" class="text-center py-5 border rounded">
        <i class="bi bi-calendar-x display-4 text-muted"></i>
        <p class="mt-3">No hay eventos registrados</p>
        <button class="btn btn-primary" @click="openModal('evento')">
          Crear mi primer evento
        </button>
      </div>

      <!-- Tabla de eventos -->
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Evento</th>
              <th>Fecha</th>
              <th>Lugar</th>
              <th>Artistas</th>
              <th>Estado</th>
              <th>Zonas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in eventos" :key="e.id_evento">
              <td class="fw-bold">#{{ e.id_evento }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <img v-if="e.imagen" :src="getImageUrl(e.imagen)" 
                       class="event-thumb me-2" :alt="e.nombre" @error="handleImageError">
                  <div>
                    <strong>{{ e.nombre }}</strong>
                    <small class="d-block text-muted text-truncate" style="max-width: 200px;">
                      {{ e.descripcion || 'Sin descripción' }}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <div>{{ formatFecha(e.fecha_inicio) }}</div>
                <small class="text-muted">Inicio</small>
              </td>
              <td>{{ e.lugar_nombre || getLugarNombre(e.id_lugar) || 'Sin lugar' }}</td>
              <td>
                <div v-if="e.artistas && e.artistas.length > 0">
                  <template v-for="artista in e.artistas.slice(0, 2)" :key="artista.id_artista">
                    <span class="badge bg-info me-1 mb-1 d-inline-block">
                      {{ artista.nombre }}
                    </span>
                  </template>
                  <span v-if="e.artistas.length > 2" class="badge bg-secondary">
                    +{{ e.artistas.length - 2 }} más
                  </span>
                </div>
                <span v-else class="text-muted">Sin artistas</span>
              </td>
              <td>
                <span :class="getEstadoClass(e.estado)" class="badge">
                  {{ getEstadoTexto(e.estado) }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-secondary" @click="openTiposEntradaModal(e)">
                  <i class="bi bi-ticket-perforated me-1"></i>
                  Gestionar Zonas
                </button>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" @click="editEvento(e)" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-danger" @click="deleteEvento(e.id_evento)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== SECCIÓN ARTISTAS ==================== -->
    <div v-if="activeTab === 'artistas'">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-0">Artistas</h4>
          <small class="text-muted">{{ artistas.length }} artistas registrados</small>
        </div>
        <button class="btn btn-success" @click="openModal('artista')">
          <i class="bi bi-person-plus me-1"></i> Nuevo Artista
        </button>
      </div>

      <!-- Loading artistas -->
      <div v-if="loadingArtistas" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Cargando artistas...</p>
      </div>

      <!-- Sin artistas -->
      <div v-else-if="artistas.length === 0" class="text-center py-5 border rounded">
        <i class="bi bi-person-x display-4 text-muted"></i>
        <p class="mt-3">No hay artistas registrados</p>
        <button class="btn btn-primary" @click="openModal('artista')">
          Agregar primer artista
        </button>
      </div>

      <!-- Tabla de artistas -->
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Artista</th>
              <th>País</th>
              <th>Género</th>
              <th>Eventos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in artistas" :key="a.id_artista">
              <td>#{{ a.id_artista }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="artist-avatar me-2">
                    <img :src="a.imagen_url || getDefaultAvatar()" 
                         :alt="a.nombre" 
                         @error="handleArtistImageError(a)">
                  </div>
                  <div>
                    <strong>{{ a.nombre }} {{ a.apellido || '' }}</strong>
                    <small class="d-block text-muted text-truncate" style="max-width: 250px;">
                      {{ a.descripcion || 'Sin descripción' }}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge bg-secondary">{{ a.pais_origen || 'N/A' }}</span>
              </td>
              <td>{{ a.genero || 'No especificado' }}</td>
              <td>
                <span class="badge bg-primary">{{ a.eventos_count || 0 }} eventos</span>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" @click="editArtista(a)" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-danger" @click="deleteArtista(a.id_artista)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== SECCIÓN LUGARES ==================== -->
    <div v-if="activeTab === 'lugares'">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-0">Lugares</h4>
          <small class="text-muted">{{ lugares.length }} lugares registrados</small>
        </div>
        <button class="btn btn-success" @click="openModal('lugar')">
          <i class="bi bi-geo-alt-fill me-1"></i> Nuevo Lugar
        </button>
      </div>

      <!-- Loading lugares -->
      <div v-if="loadingLugares" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Cargando lugares...</p>
      </div>

      <!-- Sin lugares -->
      <div v-else-if="lugares.length === 0" class="text-center py-5 border rounded">
        <i class="bi bi-geo-alt-x display-4 text-muted"></i>
        <p class="mt-3">No hay lugares registrados</p>
        <button class="btn btn-primary" @click="openModal('lugar')">
          Agregar primer lugar
        </button>
      </div>

      <!-- Tabla de lugares -->
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" v-for="l in lugares" :key="l.id_lugar">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ l.nombre_lugar }}</h5>
              <p class="card-text text-muted">
                <i class="bi bi-geo-alt me-1"></i>{{ l.direccion || 'Sin dirección' }}
              </p>
              <div class="mb-3">
                <span class="badge bg-primary">{{ l.ciudad || 'N/A' }}, {{ l.pais || 'N/A' }}</span>
                <span class="badge bg-info ms-1">{{ l.tipo_lugar || 'General' }}</span>
              </div>
              <p class="card-text">
                <i class="bi bi-people me-1"></i>
                <strong>Capacidad:</strong> {{ parseInt(l.capacidad).toLocaleString() }} personas
              </p>
              <p class="card-text text-muted small">
                <i class="bi bi-calendar-event me-1"></i>
                {{ l.eventos_count || 0 }} evento(s) programado(s)
              </p>
            </div>
            <div class="card-footer bg-transparent">
              <div class="btn-group w-100">
                <button class="btn btn-sm btn-outline-primary" @click="editLugar(l)">
                  <i class="bi bi-pencil me-1"></i>Editar
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteLugar(l.id_lugar)">
                  <i class="bi bi-trash me-1"></i>Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== SECCIÓN ESTADÍSTICAS ==================== -->
    <div v-if="activeTab === 'estadisticas'">
      <div class="row">
        <div class="col-md-3 mb-4">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <h5 class="card-title">Total Eventos</h5>
              <h2 class="display-4">{{ eventos.length }}</h2>
              <p class="card-text">Eventos registrados</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-4">
          <div class="card bg-success text-white">
            <div class="card-body">
              <h5 class="card-title">Eventos Activos</h5>
              <h2 class="display-4">{{ eventos.filter(e => e.estado === 'publicado').length }}</h2>
              <p class="card-text">Publicados</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-4">
          <div class="card bg-info text-white">
            <div class="card-body">
              <h5 class="card-title">Total Artistas</h5>
              <h2 class="display-4">{{ artistas.length }}</h2>
              <p class="card-text">Artistas registrados</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-4">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <h5 class="card-title">Total Lugares</h5>
              <h2 class="display-4">{{ lugares.length }}</h2>
              <p class="card-text">Lugares disponibles</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-header">
          <h5 class="mb-0">Resumen de Eventos por Estado</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Cantidad</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span class="badge bg-success">Publicados</span></td>
                      <td>{{ eventos.filter(e => e.estado === 'publicado').length }}</td>
                      <td>{{ calcularPorcentaje('publicado') }}%</td>
                    </tr>
                    <tr>
                      <td><span class="badge bg-warning">Borradores</span></td>
                      <td>{{ eventos.filter(e => e.estado === 'borrador').length }}</td>
                      <td>{{ calcularPorcentaje('borrador') }}%</td>
                    </tr>
                    <tr>
                      <td><span class="badge bg-danger">Cancelados</span></td>
                      <td>{{ eventos.filter(e => e.estado === 'cancelado').length }}</td>
                      <td>{{ calcularPorcentaje('cancelado') }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="col-md-6">
              <div class="text-center">
                <p class="text-muted">Próximos eventos</p>
                <ul class="list-group">
                  <li v-for="e in proximosEventos.slice(0, 5)" :key="e.id_evento" class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <span>{{ e.nombre }}</span>
                      <span class="badge" :class="getEstadoClass(e.estado)">
                        {{ getEstadoTexto(e.estado) }}
                      </span>
                    </div>
                    <small class="text-muted">{{ formatFechaSimple(e.fecha_inicio) }}</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MODALES PRINCIPALES ==================== -->
    
    <!-- Modal Evento -->
    <div v-if="modal.open && modal.type === 'evento'" class="modal-overlay">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-calendar-event me-2"></i>
            {{ modal.editing ? 'Editar Evento' : 'Crear Nuevo Evento' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveEvento">
            <!-- Nombre y Descripción -->
            <div class="row mb-3">
              <div class="col-md-12">
                <label class="form-label">Nombre del Evento *</label>
                <input type="text" class="form-control" v-model="formEvento.nombre" 
                       placeholder="Ej: Concierto de Rock" required>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-12">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" v-model="formEvento.descripcion" 
                          rows="3" placeholder="Describe el evento..."></textarea>
              </div>
            </div>

            <!-- Fechas -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Fecha y Hora de Inicio *</label>
                <input type="datetime-local" class="form-control" v-model="formEvento.fecha_inicio" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Fecha y Hora de Fin</label>
                <input type="datetime-local" class="form-control" v-model="formEvento.fecha_fin">
              </div>
            </div>

            <!-- Lugar y Estado -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Lugar *</label>
                <select class="form-select" v-model="formEvento.id_lugar" required :disabled="lugares.length === 0">
                  <option value="">Seleccionar lugar</option>
                  <option v-for="l in lugares" :key="l.id_lugar" :value="l.id_lugar">
                    {{ l.nombre_lugar }} ({{ l.ciudad || 'N/A' }})
                  </option>
                </select>
                <small v-if="lugares.length === 0" class="text-danger">
                  No hay lugares disponibles. Agrega uno primero.
                </small>
              </div>
              <div class="col-md-6">
                <label class="form-label">Estado</label>
                <select class="form-select" v-model="formEvento.estado">
                  <option value="borrador">Borrador</option>
                  <option value="publicado">Publicado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <!-- Artistas (SELECCIÓN MÚLTIPLE MEJORADA) -->
            <div class="row mb-4">
              <div class="col-md-12">
                <label class="form-label">Artistas</label>
                <div class="border rounded p-3" style="max-height: 200px; overflow-y: auto;">
                  <div v-if="artistas.length === 0" class="text-muted">
                    No hay artistas disponibles. Agrega algunos en la pestaña "Artistas".
                  </div>
                  <div v-else>
                    <div v-for="a in artistas" :key="a.id_artista" class="form-check mb-2">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :value="a.id_artista"
                        :id="'artista_' + a.id_artista"
                        v-model="formEvento.artistas_ids"
                      >
                      <label class="form-check-label d-flex align-items-center" :for="'artista_' + a.id_artista">
                        <div class="artist-avatar-xs me-2">
                          <img :src="a.imagen_url || getDefaultAvatar()" 
                               :alt="a.nombre" 
                               class="rounded-circle"
                               @error="handleArtistImageError(a)">
                        </div>
                        <div>
                          <strong>{{ a.nombre }} {{ a.apellido || '' }}</strong>
                          <small class="d-block text-muted">{{ a.genero || 'Sin género' }}</small>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <small class="form-text text-muted">
                  {{ formEvento.artistas_ids.length }} artista(s) seleccionado(s)
                </small>
              </div>
            </div>

            <!-- Imagen y Capacidad -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Imagen del Evento</label>
                <input type="text" class="form-control" v-model="formEvento.imagen" 
                       placeholder="ejemplo.jpg">
                <small class="form-text text-muted">
                  Nombre del archivo en /assets/
                </small>
                
                <!-- Vista previa de imagen -->
                <div v-if="formEvento.imagen" class="mt-3">
                  <label class="form-label">Vista previa:</label>
                  <div class="border rounded p-2 text-center">
                    <img :src="getImageUrl(formEvento.imagen)" 
                         class="img-preview" 
                         :alt="formEvento.nombre"
                         @error="formEvento.imagen = ''">
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Capacidad Total</label>
                <input type="number" class="form-control" v-model.number="formEvento.capacidad_total" 
                       min="1" placeholder="Ej: 1000">
              </div>
            </div>

            <!-- Botones -->
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ modal.editing ? 'Actualizar Evento' : 'Crear Evento' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Artista -->
    <div v-if="modal.open && modal.type === 'artista'" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-person-plus me-2"></i>
            {{ modal.editing ? 'Editar Artista' : 'Nuevo Artista' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveArtista">
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-control" v-model="formArtista.nombre" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Apellido</label>
                <input type="text" class="form-control" v-model="formArtista.apellido">
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">País de Origen</label>
                <input type="text" class="form-control" v-model="formArtista.pais_origen" placeholder="Ej: México">
              </div>
              <div class="col-md-6">
                <label class="form-label">Género Musical</label>
                <input type="text" class="form-control" v-model="formArtista.genero" placeholder="Ej: Rock, Pop">
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" v-model="formArtista.descripcion" rows="3" 
                        placeholder="Biografía del artista..."></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">URL de Imagen</label>
              <input type="text" class="form-control" v-model="formArtista.imagen_url" 
                     placeholder="https://ejemplo.com/imagen.jpg">
              <small class="form-text text-muted">
                Puedes usar enlaces externos o subir la imagen a /assets/
              </small>
              
              <!-- Vista previa -->
              <div v-if="formArtista.imagen_url" class="mt-3">
                <label class="form-label">Vista previa:</label>
                <div class="border rounded p-2 text-center">
                  <img :src="formArtista.imagen_url" 
                       class="img-preview-sm" 
                       :alt="formArtista.nombre"
                       @error="formArtista.imagen_url = ''">
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ modal.editing ? 'Actualizar' : 'Crear Artista' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Lugar -->
    <div v-if="modal.open && modal.type === 'lugar'" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-geo-alt-fill me-2"></i>
            {{ modal.editing ? 'Editar Lugar' : 'Nuevo Lugar' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveLugar">
            <div class="mb-3">
              <label class="form-label">Nombre del Lugar *</label>
              <input type="text" class="form-control" v-model="formLugar.nombre_lugar" 
                     placeholder="Ej: Estadio Azteca" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Dirección</label>
              <input type="text" class="form-control" v-model="formLugar.direccion" 
                     placeholder="Ej: Calle Principal #123">
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Ciudad</label>
                <input type="text" class="form-control" v-model="formLugar.ciudad" placeholder="Ej: Ciudad de México">
              </div>
              <div class="col-md-6">
                <label class="form-label">País</label>
                <input type="text" class="form-control" v-model="formLugar.pais" placeholder="Ej: México">
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Tipo de Lugar</label>
                <select class="form-select" v-model="formLugar.tipo_lugar">
                  <option value="">Seleccionar tipo</option>
                  <option value="Estadio">Estadio</option>
                  <option value="Arena">Arena</option>
                  <option value="Teatro">Teatro</option>
                  <option value="Auditorio">Auditorio</option>
                  <option value="Club">Club</option>
                  <option value="Plaza">Plaza</option>
                  <option value="Salón">Salón</option>
                  <option value="Restaurante">Restaurante</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Capacidad *</label>
                <input type="number" class="form-control" v-model.number="formLugar.capacidad" 
                       required min="1" placeholder="Ej: 1000">
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ modal.editing ? 'Actualizar' : 'Crear Lugar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL ZONAS/ENTRADAS ==================== -->
    <div v-if="modal.open && modal.type === 'tiposEntrada'" class="modal-overlay modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-ticket-perforated me-2"></i>
            Gestión de Zonas: {{ eventoSeleccionado.nombre }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        
        <div class="modal-body">
          <!-- Pestañas internas -->
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <button class="nav-link" :class="{ active: innerTab === 'zonas' }" 
                      @click="innerTab = 'zonas'">Zonas y Precios</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" :class="{ active: innerTab === 'ocupacion' }" 
                      @click="innerTab = 'ocupacion'">Ocupación</button>
            </li>
          </ul>

          <!-- Contenido Zonas -->
          <div v-if="innerTab === 'zonas'">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6>Zonas definidas para este evento</h6>
              <button class="btn btn-sm btn-success" @click="openTipoEntradaForm(null)">
                <i class="bi bi-plus-circle me-1"></i> Nueva Zona
              </button>
            </div>

            <div v-if="loadingTiposEntrada" class="text-center py-3">
              <div class="spinner-border spinner-border-sm" role="status"></div>
              <span class="ms-2">Cargando zonas...</span>
            </div>

            <div v-else-if="tiposEntrada.length === 0" class="text-center py-5 border rounded">
              <i class="bi bi-ticket display-4 text-muted"></i>
              <p class="mt-3">No hay zonas definidas para este evento</p>
              <button class="btn btn-primary" @click="openTipoEntradaForm(null)">
                Crear primera zona
              </button>
            </div>

            <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
              <div class="col" v-for="t in tiposEntrada" :key="t.id_tipo">
                <div class="card h-100">
                  <div class="card-header" :style="{ backgroundColor: t.color + '20' }">
                    <h6 class="mb-0">
                      <span class="color-dot me-2" :style="{ backgroundColor: t.color }"></span>
                      {{ t.nombre_tipo }}
                    </h6>
                  </div>
                  <div class="card-body">
                    <p class="card-text">
                      <strong>Precio:</strong> ${{ parseFloat(t.precio).toFixed(2) }}
                    </p>
                    <p class="card-text">
                      <strong>Asientos:</strong> {{ t.cantidad_total }} totales
                    </p>
                    <p class="card-text">
                      <strong>Disponibles:</strong> {{ t.cantidad_disponible || t.cantidad_total }}
                    </p>
                  </div>
                  <div class="card-footer bg-transparent">
                    <div class="btn-group w-100">
                      <button class="btn btn-sm btn-outline-primary" @click="openTipoEntradaForm(t)">
                        <i class="bi bi-pencil"></i> Editar
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="deleteTipoEntrada(t.id_tipo)">
                        <i class="bi bi-trash"></i> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenido Ocupación -->
          <div v-if="innerTab === 'ocupacion'">
            <div v-if="tiposEntrada.length > 0">
              <div class="row">
                <div class="col-md-8">
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0">Resumen de ocupación</h6>
                    </div>
                    <div class="card-body">
                      <div v-for="t in tiposEntrada" :key="t.id_tipo" class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                          <span>
                            <span class="color-dot me-2" :style="{ backgroundColor: t.color }"></span>
                            {{ t.nombre_tipo }}
                          </span>
                          <span>{{ t.cantidad_disponible || t.cantidad_total }} / {{ t.cantidad_total }}</span>
                        </div>
                        <div class="progress" style="height: 20px;">
                          <div class="progress-bar" 
                               :style="{ 
                                 width: calcularPorcentajeDisponible(t) + '%',
                                 backgroundColor: t.color 
                               }">
                            {{ calcularPorcentajeDisponible(t) }}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0">Totales</h6>
                    </div>
                    <div class="card-body">
                      <p><strong>Asientos totales:</strong> {{ calcularTotalAsientos() }}</p>
                      <p><strong>Disponibles:</strong> {{ calcularAsientosDisponibles() }}</p>
                      <p><strong>Ocupados:</strong> {{ calcularTotalAsientos() - calcularAsientosDisponibles() }}</p>
                      <p><strong>Porcentaje ocupado:</strong> {{ calcularPorcentajeOcupacion() }}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-5">
              <p class="text-muted">No hay zonas definidas para mostrar ocupación</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL FORMULARIO ZONA ==================== -->
    <div v-if="formTipoEntrada.open" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-ticket-detailed me-2"></i>
            {{ formTipoEntrada.editing ? 'Editar Zona' : 'Crear Nueva Zona' }}
          </h5>
          <button type="button" class="btn-close" @click="formTipoEntrada.open = false"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveTipoEntrada">
            <div class="mb-3">
              <label class="form-label">Nombre de la Zona *</label>
              <input type="text" class="form-control" v-model="formTipoEntrada.nombre_tipo" 
                     placeholder="Ej: VIP, General, Platea" required>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Precio *</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="number" step="0.01" class="form-control" 
                         v-model.number="formTipoEntrada.precio" required min="0">
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Color de la Zona</label>
                <div class="input-group">
                  <input type="color" class="form-control form-control-color" 
                         v-model="formTipoEntrada.color" title="Elige un color">
                  <input type="text" class="form-control" v-model="formTipoEntrada.color" 
                         placeholder="#RRGGBB">
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Cantidad de Asientos *</label>
                <input type="number" class="form-control" v-model.number="formTipoEntrada.cantidad_total" 
                       required min="1" max="10000">
              </div>
              <div class="col-md-6">
                <label class="form-label">Disponibles</label>
                <input type="number" class="form-control" v-model.number="formTipoEntrada.cantidad_disponible" 
                       :max="formTipoEntrada.cantidad_total" min="0">
                <small class="form-text text-muted">Por defecto será igual a la cantidad total</small>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="formTipoEntrada.open = false">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ formTipoEntrada.editing ? 'Actualizar Zona' : 'Crear Zona' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminEventos",
  data() {
    return {
      activeTab: "eventos",
      saving: false,

      // Datos principales
      eventos: [],
      artistas: [],
      lugares: [],
      
      // Tipos de entrada (zonas)
      tiposEntrada: [],
      loadingTiposEntrada: false,
      eventoSeleccionado: {},
      innerTab: 'zonas',

      // Formulario tipos de entrada
      formTipoEntrada: {
        open: false,
        editing: false,
        id_tipo: null,
        id_evento: null,
        nombre_tipo: "",
        precio: 0,
        cantidad_total: 100,
        cantidad_disponible: 100,
        color: "#007BFF"
      },

      // Loading states
      loadingEventos: false,
      loadingArtistas: false,
      loadingLugares: false,

      // Modal principal
      modal: { open: false, type: "", editing: false },

      // Formularios
      formEvento: {
        id_evento: null,
        nombre: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        id_lugar: "",
        artistas_ids: [],
        estado: "borrador",
        imagen: "",
        capacidad_total: 1000
      },

      formArtista: {
        id_artista: null,
        nombre: "",
        apellido: "",
        pais_origen: "",
        descripcion: "",
        genero: "",
        imagen_url: ""
      },

      formLugar: {
        id_lugar: null,
        nombre_lugar: "",
        direccion: "",
        ciudad: "",
        pais: "",
        tipo_lugar: "",
        capacidad: 100
      }
    };
  },

  computed: {
    proximosEventos() {
      const ahora = new Date();
      return this.eventos
        .filter(e => new Date(e.fecha_inicio) > ahora)
        .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
    }
  },

  mounted() {
    this.loadAllData();
  },

  methods: {
    // ==================== MÉTODOS DE UTILIDAD ====================
    getImageUrl(imageName) {
      if (!imageName) return this.getDefaultEventImage();
      try {
        // Primero intenta con require
        return require(`@/assets/${imageName}`);
      } catch (error) {
        // Si falla, devuelve una imagen por defecto
        return this.getDefaultEventImage();
      }
    },

    getDefaultEventImage() {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=225&fit=crop';
    },

    getDefaultAvatar() {
      return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.formArtista.nombre || 'Artista') + '&background=random';
    },

    formatFecha(fechaString) {
      if (!fechaString) return 'No definida';
      try {
        const fecha = new Date(fechaString);
        const options = {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-ES', options);
      } catch (error) {
        return fechaString;
      }
    },

    formatFechaSimple(fechaString) {
      if (!fechaString) return '';
      try {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } catch (error) {
        return fechaString;
      }
    },

    getEstadoClass(estado) {
      const clases = {
        'publicado': 'bg-success',
        'borrador': 'bg-warning',
        'cancelado': 'bg-danger'
      };
      return clases[estado] || 'bg-secondary';
    },

    getEstadoTexto(estado) {
      const textos = {
        'publicado': 'Publicado',
        'borrador': 'Borrador',
        'cancelado': 'Cancelado'
      };
      return textos[estado] || estado;
    },

    calcularPorcentaje(estado) {
      const count = this.eventos.filter(e => e.estado === estado).length;
      return this.eventos.length > 0 ? ((count / this.eventos.length) * 100).toFixed(1) : 0;
    },

    calcularTotalAsientos() {
      return this.tiposEntrada.reduce((total, zona) => total + (zona.cantidad_total || 0), 0);
    },

    calcularAsientosDisponibles() {
      return this.tiposEntrada.reduce((total, zona) => total + (zona.cantidad_disponible || zona.cantidad_total || 0), 0);
    },

    calcularPorcentajeDisponible(tipo) {
      const total = tipo.cantidad_total || 0;
      const disponibles = tipo.cantidad_disponible || total;
      if (total === 0) return 0;
      return ((disponibles / total) * 100).toFixed(1);
    },

    calcularPorcentajeOcupacion() {
      const total = this.calcularTotalAsientos();
      const disponibles = this.calcularAsientosDisponibles();
      if (total === 0) return 0;
      return (((total - disponibles) / total) * 100).toFixed(1);
    },

    getLugarNombre(id_lugar) {
      const lugar = this.lugares.find(l => l.id_lugar == id_lugar);
      return lugar ? lugar.nombre_lugar : null;
    },

    handleImageError(event) {
      event.target.src = this.getDefaultEventImage();
    },

    handleArtistImageError(artista) {
      // Reemplazar con avatar por defecto
      const img = event.target;
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artista.nombre)}&background=random`;
    },

    // ==================== CARGAR DATOS ====================
    async loadAllData() {
      await Promise.all([
        this.loadEventos(),
        this.loadArtistas(),
        this.loadLugares()
      ]);
    },

    async loadEventos() {
      this.loadingEventos = true;
      try {
        const token = localStorage.getItem('userToken');
        const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};

        const res = await axios.get("http://localhost:3000/api/eventos", config);

        // Manejar diferentes estructuras de respuesta
        let eventosData = [];
        if (Array.isArray(res.data)) {
          eventosData = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          eventosData = res.data.data;
        } else if (res.data && res.data.eventos) {
          eventosData = res.data.eventos;
        }

        // Para cada evento, cargar artistas
        this.eventos = await Promise.all(eventosData.map(async (evento) => {
          try {
            // Cargar artistas del evento
            const artistasRes = await axios.get(`http://localhost:3000/api/eventos/${evento.id_evento}/artists`, config);
            evento.artistas = Array.isArray(artistasRes.data) ? artistasRes.data : [];
          } catch (error) {
            console.warn(`Error cargando artistas del evento ${evento.id_evento}:`, error);
            evento.artistas = [];
          }
          return evento;
        }));

      } catch (error) {
        console.error("Error al cargar eventos:", error);
        this.showToast('error', 'Error al cargar eventos');
        this.eventos = [];
      }
      this.loadingEventos = false;
    },

    async loadArtistas() {
      this.loadingArtistas = true;
      try {
        const token = localStorage.getItem('userToken');
        const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};

        const res = await axios.get("http://localhost:3000/api/artists", config);

        if (Array.isArray(res.data)) {
          this.artistas = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          this.artistas = res.data.data;
        } else if (res.data && res.data.artistas) {
          this.artistas = res.data.artistas;
        } else {
          this.artistas = [];
        }
      } catch (error) {
        console.error("Error al cargar artistas:", error);
        this.showToast('error', 'Error al cargar artistas');
        this.artistas = [];
      }
      this.loadingArtistas = false;
    },

    async loadLugares() {
      this.loadingLugares = true;
      try {
        const token = localStorage.getItem('userToken');
        const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};

        const res = await axios.get("http://localhost:3000/api/places", config);

        if (Array.isArray(res.data)) {
          this.lugares = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          this.lugares = res.data.data;
        } else if (res.data && res.data.lugares) {
          this.lugares = res.data.lugares;
        } else {
          this.lugares = [];
        }
      } catch (error) {
        console.error("Error al cargar lugares:", error);
        this.showToast('error', 'Error al cargar lugares');
        this.lugares = [];
      }
      this.loadingLugares = false;
    },
    
    // ==================== GESTIÓN TIPOS ENTRADA ====================
    async loadTiposEntrada(id_evento) {
      this.loadingTiposEntrada = true;
      try {
        const res = await axios.get(`http://localhost:3000/api/tiposEntrada/evento/${id_evento}`);
        
        if (Array.isArray(res.data)) {
          this.tiposEntrada = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          this.tiposEntrada = res.data.data;
        } else {
          this.tiposEntrada = [];
        }
      } catch (error) {
        console.error("Error al cargar tipos de entrada:", error);
        this.tiposEntrada = [];
      }
      this.loadingTiposEntrada = false;
    },

    openTiposEntradaModal(evento) {
      this.eventoSeleccionado = evento;
      this.modal = { open: true, type: "tiposEntrada", editing: false };
      this.innerTab = 'zonas';
      this.loadTiposEntrada(evento.id_evento);
    },

    openTipoEntradaForm(tipo = null) {
      this.formTipoEntrada.open = true;
      this.formTipoEntrada.id_evento = this.eventoSeleccionado.id_evento;

      if (tipo) {
        this.formTipoEntrada.editing = true;
        this.formTipoEntrada.id_tipo = tipo.id_tipo;
        this.formTipoEntrada.nombre_tipo = tipo.nombre_tipo;
        this.formTipoEntrada.precio = parseFloat(tipo.precio);
        this.formTipoEntrada.cantidad_total = tipo.cantidad_total || 100;
        this.formTipoEntrada.cantidad_disponible = tipo.cantidad_disponible || tipo.cantidad_total || 100;
        this.formTipoEntrada.color = tipo.color || "#007BFF";
      } else {
        this.formTipoEntrada.editing = false;
        this.formTipoEntrada.id_tipo = null;
        this.formTipoEntrada.nombre_tipo = "";
        this.formTipoEntrada.precio = 0;
        this.formTipoEntrada.cantidad_total = 100;
        this.formTipoEntrada.cantidad_disponible = 100;
        this.formTipoEntrada.color = "#007BFF";
      }
    },

    async saveTipoEntrada() {
      if (!this.formTipoEntrada.nombre_tipo?.trim()) {
        this.showToast('warning', 'El nombre de la zona es requerido');
        return;
      }
      
      if (this.formTipoEntrada.precio < 0) {
        this.showToast('warning', 'El precio no puede ser negativo');
        return;
      }
      
      if (this.formTipoEntrada.cantidad_total < 1) {
        this.showToast('warning', 'Debe haber al menos 1 asiento');
        return;
      }

      this.saving = true;
      
      const datos = {
        id_evento: this.formTipoEntrada.id_evento,
        nombre_tipo: this.formTipoEntrada.nombre_tipo.trim(),
        precio: parseFloat(this.formTipoEntrada.precio),
        cantidad_total: parseInt(this.formTipoEntrada.cantidad_total),
        cantidad_disponible: parseInt(this.formTipoEntrada.cantidad_disponible || this.formTipoEntrada.cantidad_total),
        color: this.formTipoEntrada.color
      };

      try {
        if (this.formTipoEntrada.editing) {
          await axios.put(
            `http://localhost:3000/api/tiposEntrada/${this.formTipoEntrada.id_tipo}`,
            datos
          );
          this.showToast('success', 'Zona actualizada exitosamente');
        } else {
          await axios.post("http://localhost:3000/api/tiposEntrada", datos);
          this.showToast('success', 'Zona creada exitosamente');
        }
        
        this.formTipoEntrada.open = false;
        await this.loadTiposEntrada(this.eventoSeleccionado.id_evento);
        
      } catch (error) {
        console.error("Error al guardar tipo de entrada:", error);
        const errorMsg = error.response?.data?.message || error.message || "Error desconocido";
        this.showToast('error', `Error: ${errorMsg}`);
      }
      
      this.saving = false;
    },
    
    async deleteTipoEntrada(id) {
      if (!confirm("¿Está seguro de eliminar esta zona? Esta acción no se puede deshacer.")) return;
      
      try {
        await axios.delete(`http://localhost:3000/api/tiposEntrada/${id}`);
        this.showToast('success', 'Zona eliminada exitosamente');
        this.loadTiposEntrada(this.eventoSeleccionado.id_evento);
      } catch (error) {
        console.error("Error al eliminar tipo de entrada:", error);
        this.showToast('error', 'Error al eliminar la zona');
      }
    },

    // ==================== MODALES GENERALES ====================
    openModal(type) {
      this.modal = { open: true, type, editing: false };
      
      if (type === 'evento') {
        this.formEvento = {
          id_evento: null,
          nombre: "",
          descripcion: "",
          fecha_inicio: this.getCurrentDateTime(),
          fecha_fin: "",
          id_lugar: "",
          artistas_ids: [],
          estado: "borrador",
          imagen: "",
          capacidad_total: 1000
        };
      } else if (type === 'artista') {
        this.formArtista = {
          id_artista: null,
          nombre: "",
          apellido: "",
          pais_origen: "",
          descripcion: "",
          genero: "",
          imagen_url: ""
        };
      } else if (type === 'lugar') {
        this.formLugar = {
          id_lugar: null,
          nombre_lugar: "",
          direccion: "",
          ciudad: "",
          pais: "",
          tipo_lugar: "",
          capacidad: 100
        };
      }
    },

    getCurrentDateTime() {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    },

    closeModal() {
      this.modal = { open: false, type: "", editing: false };
      this.formTipoEntrada.open = false;
      this.saving = false;
    },

    // ==================== EVENTOS ====================
    editEvento(e) {
      this.modal = { open: true, type: "evento", editing: true };
      
      // Formatear fechas para datetime-local
      const formatForInput = (dt) => {
        if (!dt) return '';
        const date = new Date(dt);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
      };

      // Obtener IDs de artistas
      let artistasIds = [];
      if (e.artistas && Array.isArray(e.artistas)) {
        artistasIds = e.artistas.map(a => a.id_artista);
      }

      this.formEvento = { 
        id_evento: e.id_evento,
        nombre: e.nombre || "",
        descripcion: e.descripcion || "",
        fecha_inicio: formatForInput(e.fecha_inicio),
        fecha_fin: formatForInput(e.fecha_fin),
        id_lugar: e.id_lugar || "",
        artistas_ids: artistasIds,
        estado: e.estado || "borrador",
        imagen: e.imagen || "",
        capacidad_total: e.capacidad_total || 1000
      };
    },

    async saveEvento() {
      // Validaciones
      if (!this.formEvento.nombre?.trim()) {
        this.showToast('warning', 'El nombre del evento es requerido');
        return;
      }
      
      if (!this.formEvento.fecha_inicio) {
        this.showToast('warning', 'La fecha de inicio es requerida');
        return;
      }
      
      if (!this.formEvento.id_lugar) {
        this.showToast('warning', 'Debe seleccionar un lugar');
        return;
      }

      this.saving = true;

      const payload = {
        nombre: this.formEvento.nombre.trim(),
        descripcion: this.formEvento.descripcion || "",
        fecha_inicio: this.formEvento.fecha_inicio,
        fecha_fin: this.formEvento.fecha_fin || null,
        id_lugar: parseInt(this.formEvento.id_lugar),
        estado: this.formEvento.estado,
        imagen: this.formEvento.imagen || null,
        capacidad_total: parseInt(this.formEvento.capacidad_total) || 1000,
        artistas_ids: Array.isArray(this.formEvento.artistas_ids) ? this.formEvento.artistas_ids : [],
        id_organizador: 1 // Cambiar según autenticación
      };

      try {
        if (this.modal.editing) {
          await axios.put(`http://localhost:3000/api/eventos/${this.formEvento.id_evento}`, payload);
          this.showToast('success', 'Evento actualizado exitosamente');
        } else {
          await axios.post("http://localhost:3000/api/eventos", payload);
          this.showToast('success', 'Evento creado exitosamente');
        }
        
        this.closeModal();
        await this.loadAllData();
        
      } catch (error) {
        console.error("Error guardando evento:", error);
        const errorMsg = error.response?.data?.message || error.message || "Error desconocido";
        this.showToast('error', `Error: ${errorMsg}`);
      }
      
      this.saving = false;
    },

    async deleteEvento(id) {
      if (!confirm("¿Está seguro de eliminar este evento? Esta acción no se puede deshacer.")) return;
      
      try {
        await axios.delete(`http://localhost:3000/api/eventos/${id}`);
        this.showToast('success', 'Evento eliminado exitosamente');
        await this.loadEventos();
      } catch (error) {
        console.error("Error eliminando evento:", error);
        this.showToast('error', 'Error al eliminar evento');
      }
    },

    // ==================== ARTISTAS ====================
    editArtista(a) {
      this.modal = { open: true, type: "artista", editing: true };
      this.formArtista = { ...a };
    },

    async saveArtista() {
      if (!this.formArtista.nombre?.trim()) {
        this.showToast('warning', 'El nombre del artista es requerido');
        return;
      }

      this.saving = true;

      const payload = {
        nombre: this.formArtista.nombre.trim(),
        apellido: this.formArtista.apellido || "",
        pais_origen: this.formArtista.pais_origen || "",
        descripcion: this.formArtista.descripcion || "",
        genero: this.formArtista.genero || "",
        imagen_url: this.formArtista.imagen_url || ""
      };

      const token = localStorage.getItem('userToken');
      const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};

      try {
        if (this.modal.editing) {
          await axios.put(`http://localhost:3000/api/artists/${this.formArtista.id_artista}`, payload, config);
          this.showToast('success', 'Artista actualizado exitosamente');
        } else {
          await axios.post("http://localhost:3000/api/artists", payload, config);
          this.showToast('success', 'Artista creado exitosamente');
        }

        this.closeModal();
        await this.loadArtistas();

      } catch (error) {
        console.error("Error guardando artista:", error);
        this.showToast('error', 'Error al guardar artista');
      }

      this.saving = false;
    },

    async deleteArtista(id) {
      if (!confirm("¿Está seguro de eliminar este artista?")) return;
      
      try {
        await axios.delete(`http://localhost:3000/api/artists/${id}`);
        this.showToast('success', 'Artista eliminado exitosamente');
        await this.loadArtistas();
      } catch (error) {
        console.error("Error eliminando artista:", error);
        this.showToast('error', 'Error al eliminar artista');
      }
    },

    // ==================== LUGARES ====================
    editLugar(l) {
      this.modal = { open: true, type: "lugar", editing: true };
      this.formLugar = { ...l };
    },

    async saveLugar() {
      if (!this.formLugar.nombre_lugar?.trim()) {
        this.showToast('warning', 'El nombre del lugar es requerido');
        return;
      }

      if (!this.formLugar.capacidad || this.formLugar.capacidad < 1) {
        this.showToast('warning', 'La capacidad debe ser mayor a 0');
        return;
      }

      this.saving = true;

      const payload = {
        nombre_lugar: this.formLugar.nombre_lugar.trim(),
        direccion: this.formLugar.direccion || "",
        ciudad: this.formLugar.ciudad || "",
        pais: this.formLugar.pais || "",
        tipo_lugar: this.formLugar.tipo_lugar || "",
        capacidad: parseInt(this.formLugar.capacidad)
      };

      const token = localStorage.getItem('userToken');
      const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};

      try {
        if (this.modal.editing) {
          await axios.put(`http://localhost:3000/api/places/${this.formLugar.id_lugar}`, payload, config);
          this.showToast('success', 'Lugar actualizado exitosamente');
        } else {
          await axios.post("http://localhost:3000/api/places", payload, config);
          this.showToast('success', 'Lugar creado exitosamente');
        }

        this.closeModal();
        await this.loadLugares();

      } catch (error) {
        console.error("Error guardando lugar:", error);
        this.showToast('error', 'Error al guardar lugar');
      }

      this.saving = false;
    },

    async deleteLugar(id) {
      if (!confirm("¿Está seguro de eliminar este lugar?")) return;
      
      try {
        await axios.delete(`http://localhost:3000/api/places/${id}`);
        this.showToast('success', 'Lugar eliminado exitosamente');
        await this.loadLugares();
      } catch (error) {
        console.error("Error eliminando lugar:", error);
        this.showToast('error', 'Error al eliminar lugar');
      }
    },

    // ==================== NOTIFICACIONES ====================
    showToast(type, message) {
      // Crear elemento toast
      const toast = document.createElement('div');
      toast.className = `toast-notification toast-${type}`;
      toast.innerHTML = `
        <div class="toast-content">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}
          <span>${message}</span>
        </div>
      `;
      
      document.body.appendChild(toast);
      
      // Remover después de 3 segundos
      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
          if (toast.parentNode) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }
  }
};
</script>

<style scoped>
.admin-events {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.admin-header {
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 15px;
}

.title {
  color: #343a40;
  font-weight: 700;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tabs button {
  padding: 10px 20px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.tabs button:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-lg {
  width: 90%;
  max-width: 900px;
}

.modal-xl {
  width: 95%;
  max-width: 1200px;
}

/* Event thumbnails */
.event-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.artist-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-avatar-xs {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.artist-avatar-xs img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Color dot for zones */
.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 5px;
}

.color-badge {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  vertical-align: middle;
}

/* Image preview */
.img-preview {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.img-preview-sm {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}

/* Checkbox list */
.artist-checkbox-list {
  max-height: 180px;
  overflow-y: auto;
}

.form-check-label {
  cursor: pointer;
  user-select: none;
}

/* Progress bars */
.progress {
  background-color: #e9ecef;
}

/* Toast notifications */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  z-index: 9999;
  animation: slideIn 0.3s ease;
  max-width: 350px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toast-success {
  background-color: #28a745;
}

.toast-error {
  background-color: #dc3545;
}

.toast-warning {
  background-color: #ffc107;
  color: #212529;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fade-out {
  animation: fadeOut 0.3s ease forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tabs {
    flex-direction: column;
  }
  
  .tabs button {
    width: 100%;
    justify-content: center;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .event-thumb {
    width: 40px;
    height: 40px;
  }
  
  .btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}

/* Badge styles */
.badge {
  font-weight: 500;
}

.bg-info {
  background-color: #17a2b8 !important;
}

.bg-primary {
  background-color: #007bff !important;
}

.bg-secondary {
  background-color: #6c757d !important;
}

.bg-success {
  background-color: #28a745 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
  color: #212529;
}

.bg-danger {
  background-color: #dc3545 !important;
}

/* Form controls */
.form-control:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.form-control-color {
  height: 38px;
  padding: 3px;
  cursor: pointer;
}

/* Card hover effects */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Table improvements */
.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.table-dark {
  background-color: #343a40;
  color: white;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>