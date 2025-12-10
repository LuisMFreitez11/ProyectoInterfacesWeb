<template>
  <div class="nosotros-container py-5">
    <div class="container my-5">
      <div class="text-center mb-5">
        <h1 class="display-4 fw-bold text-primary-orange mb-3">
          ¿Quiénes Somos?
        </h1>
        <p class="lead text-muted">
          Somos la plataforma líder en venta de boletos en Venezuela, dedicada a transformar el acceso a tus eventos más
          esperados.
        </p>
      </div>

      <div class="row featurette d-flex align-items-center mb-5">
        <div class="col-md-7 order-md-1">
          <h2 class="featurette-heading fw-semibold">
            Nuestra Historia
          </h2>
          <p class="lead">
            <strong class="fw-bold">EntradasYa</strong> fue fundada por un equipo de expertos venezolanos con una meta
            clara: <strong class="fw-bold">eliminar las fricciones en la compra de entradas</strong> y devolverle la
            emoción a la experiencia. Vimos la necesidad de una solución digital robusta y transparente que garantizara
            que el público pudiera adquirir sus boletos de forma rápida y segura, sin sorpresas ni reventas
            fraudulentas.
            <br><br>
            Más que una plataforma, somos el puente tecnológico que garantiza tu presencia en los momentos memorables de
            la cultura, el deporte y el entretenimiento, mediante un sistema de <strong class="fw-bold">venta en línea
              eficiente y confiable.</strong>
          </p>
        </div>
        <div class="col-md-5 order-md-2 text-center">
          <img :src="heroImg" alt="Mapa de Venezuela con luces de concierto"
            class="img-fluid rounded shadow-lg feature-img">
        </div>
      </div>

      <hr class="featurette-divider">

      <div class="row featurette d-flex align-items-center mb-5">
        <div class="col-md-7 order-md-2">
          <h2 class="featurette-heading fw-semibold">
            Compromiso con la Confianza y la <span class="text-primary-orange">Experiencia del Cliente.</span>
          </h2>
          <p class="lead">
            Nuestro compromiso principal es la <strong class="fw-bold">confianza digital</strong>. Trabajamos con
            tecnología de punta para asegurar la encriptación de datos, la verificación de boletos y la prevención de
            fraudes en cada clic. Colaboramos directamente con los promotores de eventos más grandes, asegurando que
            cada ticket digital que adquieres es <strong class="fw-bold">100% legítimo</strong>.
            <br><br>
            Para el cliente, esto significa una interfaz intuitiva, múltiples métodos de pago en línea y un equipo de
            soporte dedicado. Queremos que la única tarea pendiente sea disfrutar el evento. Vive la experiencia con la
            seguridad de tener el boleto correcto en tu dispositivo.
          </p>
        </div>
        <div class="col-md-5 order-md-1 text-center">
          <img :src="visionImg" alt="Persona con entrada de concierto en mano"
            class="img-fluid rounded shadow-lg feature-img">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Usamos imágenes existentes como se corrigió anteriormente para evitar el error 'Module not found'
import logoImg from '@/assets/nosotros.jpg';
import event1 from '@/assets/nosotros2.jpg';

export default {
  name: 'NosotrosPagina',
  data() {
    return {
      heroImg: event1,
      visionImg: logoImg,
    };
  }
};
</script>

<style scoped>
.nosotros-container {
  min-height: calc(100vh - 200px);
}

.text-primary-orange {
  color: #ff6b00;
}

.text-muted-dark {
  color: #495057 !important;
}

.featurette-heading {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-img {
  max-height: 350px;
  object-fit: cover;
}

.featurette-divider {
  margin: 5rem 0;
  border-top: 1px solid rgba(0, 0, 0, .1);
}
</style>