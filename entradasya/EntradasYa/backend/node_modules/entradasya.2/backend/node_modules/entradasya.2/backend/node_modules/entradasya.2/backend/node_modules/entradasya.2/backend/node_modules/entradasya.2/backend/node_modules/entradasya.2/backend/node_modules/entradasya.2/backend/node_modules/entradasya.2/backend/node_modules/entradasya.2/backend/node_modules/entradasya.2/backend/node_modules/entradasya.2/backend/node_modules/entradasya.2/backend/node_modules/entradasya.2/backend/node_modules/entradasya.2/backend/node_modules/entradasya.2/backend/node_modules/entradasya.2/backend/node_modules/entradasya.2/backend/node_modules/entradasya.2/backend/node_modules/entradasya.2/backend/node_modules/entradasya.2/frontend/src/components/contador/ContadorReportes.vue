<template>
  <div class="contador-reportes">
    <!-- Generador de Reportes -->
    <div class="report-generator">
      <h4>Generar Reportes Financieros</h4>
      <div class="report-form">
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de Reporte:</label>
            <select v-model="selectedReportType">
              <option value="estado-resultados">Estado de Resultados</option>
              <option value="balance-general">Balance General</option>
              <option value="flujo-efectivo">Flujo de Efectivo</option>
              <option value="ventas-detallado">Ventas Detallado</option>
              <option value="gastos-categoria">Gastos por Categoría</option>
              <option value="conciliacion-bancaria">Conciliación Bancaria</option>
            </select>
          </div>

          <div class="form-group">
            <label>Período:</label>
            <select v-model="selectedPeriod">
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
        </div>

        <div v-if="selectedPeriod === 'custom'" class="form-row">
          <div class="form-group">
            <label>Fecha Desde:</label>
            <input type="date" v-model="startDate">
          </div>

          <div class="form-group">
            <label>Fecha Hasta:</label>
            <input type="date" v-model="endDate">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Formato:</label>
            <select v-model="selectedFormat">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div class="form-group">
            <label>&nbsp;</label>
            <button class="btn btn-primary" @click="generateReport">
              <i class="bi bi-file-earmark-text me-2"></i>
              Generar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reportes Recientes -->
    <div class="recent-reports">
      <h4>Reportes Generados Recientemente</h4>
      <div class="reports-list">
        <div v-for="report in recentReports" :key="report.id" class="report-item">
          <div class="report-info">
            <div class="report-name">{{ report.nombre }}</div>
            <div class="report-meta">
              <span class="report-type">{{ report.tipo }}</span>
              <span class="report-date">{{ formatDate(report.fecha) }}</span>
              <span class="report-size">{{ report.tamano }}</span>
            </div>
          </div>
          <div class="report-actions">
            <button class="btn btn-sm btn-outline-primary me-2" @click="downloadReport(report)">
              <i class="bi bi-download"></i>
            </button>
            <button class="btn btn-sm btn-outline-info me-2" @click="viewReport(report)">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteReport(report)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Plantillas de Reportes -->
    <div class="report-templates">
      <h4>Plantillas de Reportes</h4>
      <div class="templates-grid">
        <div v-for="template in reportTemplates" :key="template.id" class="template-card">
          <div class="template-icon">
            <i :class="template.icon"></i>
          </div>
          <div class="template-content">
            <h5>{{ template.nombre }}</h5>
            <p>{{ template.descripcion }}</p>
            <div class="template-meta">
              <span class="frequency">{{ template.frecuencia }}</span>
              <span class="recipients">{{ template.destinatarios }}</span>
            </div>
          </div>
          <div class="template-actions">
            <button class="btn btn-sm btn-primary" @click="useTemplate(template)">
              Usar Plantilla
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Programación de Reportes -->
    <div class="scheduled-reports">
      <h4>Reportes Programados</h4>
      <div class="scheduled-list">
        <div v-for="scheduled in scheduledReports" :key="scheduled.id" class="scheduled-item">
          <div class="scheduled-info">
            <div class="scheduled-name">{{ scheduled.nombre }}</div>
            <div class="scheduled-meta">
              <span class="frequency">{{ scheduled.frecuencia }}</span>
              <span class="next-run">{{ scheduled.proxima_ejecucion }}</span>
              <span class="status" :class="scheduled.activo ? 'active' : 'inactive'">
                {{ scheduled.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          <div class="scheduled-actions">
            <button class="btn btn-sm btn-outline-warning me-2" @click="editSchedule(scheduled)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteSchedule(scheduled)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
      <button class="btn btn-success mt-3" @click="newSchedule">
        <i class="bi bi-plus-circle me-2"></i>
        Programar Nuevo Reporte
      </button>
    </div>

    <!-- Estadísticas de Reportes -->
    <div class="reports-stats">
      <h4>Estadísticas de Generación de Reportes</h4>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="bi bi-file-earmark-text"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalReports }}</h3>
            <p>Reportes Generados</p>
            <small class="positive">Este mes</small>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="bi bi-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ avgGenerationTime }}</h3>
            <p>Tiempo Promedio</p>
            <small class="neutral">Por reporte</small>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="bi bi-graph-up"></i>
          </div>
          <div class="stat-content">
            <h3>{{ mostRequestedReport }}</h3>
            <p>Reporte Más Solicitado</p>
            <small class="info">Este trimestre</small>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="bi bi-people"></i>
          </div>
          <div class="stat-content">
            <h3>{{ activeSchedules }}</h3>
            <p>Reportes Programados</p>
            <small class="success">Activos</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContadorReportes',
  data() {
    return {
      selectedReportType: 'estado-resultados',
      selectedPeriod: 'monthly',
      startDate: '',
      endDate: '',
      selectedFormat: 'pdf',
      totalReports: 0,
      avgGenerationTime: '0',
      mostRequestedReport: '',
      activeSchedules: 0,
      recentReports: [],
      reportTemplates: [],
      scheduledReports: []
    }
  },
  mounted() {
    this.setDefaultDates()
    this.loadReportsData()
  },
  methods: {
    setDefaultDates() {
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)

      this.endDate = today.toISOString().split('T')[0]
      this.startDate = thirtyDaysAgo.toISOString().split('T')[0]
    },

    async loadReportsData() {
      try {
        // Aquí irían las llamadas a la API
        // const response = await axios.get('/api/contador/reports/stats')

        // Datos de ejemplo
        this.totalReports = 47
        this.avgGenerationTime = '2.3 min'
        this.mostRequestedReport = 'Estado de Resultados'
        this.activeSchedules = 5

        this.recentReports = [
          {
            id: 1,
            nombre: 'Estado de Resultados - Octubre 2024',
            tipo: 'PDF',
            fecha: '2024-11-01',
            tamano: '2.1 MB'
          },
          {
            id: 2,
            nombre: 'Ventas Detallado - Semana 44',
            tipo: 'Excel',
            fecha: '2024-10-30',
            tamano: '1.8 MB'
          },
          {
            id: 3,
            nombre: 'Conciliación Bancaria - Octubre',
            tipo: 'PDF',
            fecha: '2024-10-28',
            tamano: '3.2 MB'
          }
        ]

        this.reportTemplates = [
          {
            id: 1,
            nombre: 'Estado de Resultados Mensual',
            descripcion: 'Ingresos, gastos y utilidad neta del mes',
            icon: 'bi bi-graph-up',
            frecuencia: 'Mensual',
            destinatarios: 'Gerencia'
          },
          {
            id: 2,
            nombre: 'Balance General',
            descripcion: 'Activos, pasivos y patrimonio',
            icon: 'bi bi-scale',
            frecuencia: 'Trimestral',
            destinatarios: 'Contadores'
          },
          {
            id: 3,
            nombre: 'Flujo de Efectivo',
            descripcion: 'Movimientos de efectivo operativos, inversión y financiamiento',
            icon: 'bi bi-cash-stack',
            frecuencia: 'Mensual',
            destinatarios: 'Finanzas'
          }
        ]

        this.scheduledReports = [
          {
            id: 1,
            nombre: 'Estado de Resultados - Fin de Mes',
            frecuencia: 'Mensual',
            proxima_ejecucion: '2024-12-01',
            activo: true
          },
          {
            id: 2,
            nombre: 'Conciliación Bancaria Semanal',
            frecuencia: 'Semanal',
            proxima_ejecucion: '2024-11-18',
            activo: true
          },
          {
            id: 3,
            nombre: 'Backup Financiero',
            frecuencia: 'Diario',
            proxima_ejecucion: '2024-11-16',
            activo: false
          }
        ]
      } catch (error) {
        console.error('Error loading reports data:', error)
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES')
    },

    generateReport() {
      // Implementar generación de reporte
      alert(`Generando reporte: ${this.selectedReportType} en formato ${this.selectedFormat}`)
    },

    downloadReport(report) {
      // Implementar descarga
      alert(`Descargando: ${report.nombre}`)
    },

    viewReport(report) {
      // Implementar vista previa
      alert(`Viendo: ${report.nombre}`)
    },

    deleteReport(report) {
      // Implementar eliminación
      if (confirm(`¿Eliminar el reporte "${report.nombre}"?`)) {
        alert('Reporte eliminado')
      }
    },

    useTemplate(template) {
      // Implementar uso de plantilla
      this.selectedReportType = template.id
      alert(`Usando plantilla: ${template.nombre}`)
    },

    editSchedule(scheduled) {
      // Implementar edición de programación
      alert(`Editando programación: ${scheduled.nombre}`)
    },

    deleteSchedule(scheduled) {
      // Implementar eliminación de programación
      if (confirm(`¿Eliminar la programación "${scheduled.nombre}"?`)) {
        alert('Programación eliminada')
      }
    },

    newSchedule() {
      // Implementar nueva programación
      alert('Nueva programación próximamente disponible')
    }
  }
}
</script>

<style scoped>
.contador-reportes {
  padding: 20px 0;
}

.report-generator,
.recent-reports,
.report-templates,
.scheduled-reports,
.reports-stats {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.report-generator h4,
.recent-reports h4,
.report-templates h4,
.scheduled-reports h4,
.reports-stats h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  flex: 1;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.form-group select,
.form-group input {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  font-size: 0.9rem;
}

.reports-list,
.scheduled-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.report-item,
.scheduled-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ff6b00;
}

.report-info,
.scheduled-info {
  flex: 1;
}

.report-name,
.scheduled-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.report-meta,
.scheduled-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: #6c757d;
}

.report-type {
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.frequency {
  background: #d1ecf1;
  color: #0c5460;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.status.active {
  background: #d4edda;
  color: #155724;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.template-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: transform 0.3s ease;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.template-icon {
  font-size: 2rem;
  color: #ff6b00;
  margin-bottom: 15px;
  text-align: center;
}

.template-content {
  flex: 1;
  text-align: center;
}

.template-content h5 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.template-content p {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.template-meta {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.template-meta span {
  font-size: 0.8rem;
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.template-actions {
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 3rem;
  color: #ff6b00;
  margin-right: 20px;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-content p {
  margin: 0 0 5px 0;
  color: #7f8c8d;
  font-weight: 500;
  font-size: 1rem;
}

.stat-content small {
  font-size: 0.85rem;
  font-weight: 600;
}

.positive {
  color: #28a745;
}

.neutral {
  color: #6c757d;
}

.info {
  color: #17a2b8;
}

.success {
  color: #28a745;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-group {
    min-width: auto;
  }

  .report-item,
  .scheduled-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    font-size: 2.5rem;
    margin-right: 15px;
  }

  .stat-content h3 {
    font-size: 1.8rem;
  }
}
</style>
