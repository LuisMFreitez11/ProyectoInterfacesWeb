<template>
  <div class="contacto-container py-5">
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <h2 class="card-title text-center mb-4 fw-bold text-primary-orange">
                Soporte EntradasYa: Estamos para Ayudarte
              </h2>
              <p class="text-center text-muted mb-5">
                Nuestro equipo de soporte digital está disponible para responder todas tus consultas sobre compras, eventos o asistencia técnica.
              </p>

              <div class="row">
                <div class="col-md-5 mb-4 mb-md-0">
                  <h5 class="fw-bold mb-3">Canales de Soporte</h5>
                  <ul class="list-unstyled contact-info-list">
                    <li class="mb-3">
                        <i class="bi bi-envelope-fill me-2 contact-icon"></i> 
                        Soporte General y Consultas de Compras
                        <br>
                        <a href="mailto:soporte@entradasya.com" class="text-dark">soporte@entradasya.com</a>
                    </li>
                    <li class="mb-3">
                        <i class="bi bi-person-badge-fill me-2 contact-icon"></i> 
                        Asuntos de Promotores y Eventos
                        <br>
                        <a href="mailto:promotores@entradasya.com" class="text-dark">promotores@entradasya.com</a>
                    </li>
                    <li class="mb-3">
                        <i class="bi bi-clock-fill me-2 contact-icon"></i> 
                        Tiempos de Respuesta Estimados
                        <br>
                        24 a 48 horas hábiles para tickets de soporte.
                    </li>
                  </ul>
                  <p class="mt-4 text-muted small">
                    *Para resolver dudas comunes de forma inmediata, consulta nuestra sección de Preguntas Frecuentes.
                  </p>
                </div>

                <div class="col-md-7 border-start ps-md-5">
                  <h5 class="fw-bold mb-3">Envíanos un Ticket de Soporte</h5>
                  <form @submit.prevent="enviarFormulario">
                    <div class="mb-3">
                      <label for="nombre" class="form-label">Nombre Completo</label>
                      <input type="text" class="form-control" id="nombre" required>
                    </div>
                    <div class="mb-3">
                      <label for="correo" class="form-label">Correo Electrónico</label>
                      <input type="email" class="form-control" id="correo" required>
                    </div>
                    <div class="mb-3">
                      <label for="asunto" class="form-label">Asunto del Ticket</label>
                      <select id="asunto" class="form-select" required>
                        <option value="">Selecciona el área de tu consulta...</option>
                        <option value="compra">Problemas con una compra / Facturación</option>
                        <option value="evento">Detalles de un evento / Fecha / Lugar</option>
                        <option value="soporte">Asistencia Técnica de la plataforma</option>
                        <option value="otro">Otro tipo de consulta</option>
                      </select>
                    </div>
                    <div class="mb-4">
                      <label for="mensaje" class="form-label">Mensaje</label>
                      <textarea class="form-control" id="mensaje" rows="4" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary-orange w-100 py-2">
                        Generar Ticket y Enviar
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactoPagina',
  methods: {
    enviarFormulario() {
      // Simulación de envío de formulario para una plataforma online
      alert('¡Ticket de soporte generado! Revisaremos tu solicitud y te responderemos por correo electrónico en un plazo de 24 a 48 horas hábiles.');
    }
  }
};
</script>

<style scoped>
.contacto-container {
  min-height: calc(100vh - 200px); 
  background-color: #f8f9fa; 
}
.text-primary-orange {
  color: #ff6b00;
}
.btn-primary-orange {
    background-color: #ff6b00;
    border-color: #ff6b00;
    color: white;
    transition: background-color 0.3s;
}
.btn-primary-orange:hover {
    background-color: #e65c00;
    border-color: #e65c00;
}
.contact-icon {
    color: #ff6b00;
    font-size: 1.2rem;
}
</style>