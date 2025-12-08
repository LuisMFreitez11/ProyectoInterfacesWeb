<template>
  <div class="reports-container">
    <div class="header-section">
      <h2 class="section-title">Reportes y Estadísticas</h2>
      <div class="date-filters">
        <input
          type="date"
          v-model="startDate"
          class="form-control"
        >
        <span>a</span>
        <input
          type="date"
          v-model="endDate"
          class="form-control"
        >
        <button class="btn btn-primary" @click="generateReport" :disabled="loading">
          <i class="bi bi-graph-up me-2"></i> {{ loading ? 'Cargando...' : 'Generar Reporte' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info">
      <i class="bi bi-arrow-clockwise spin me-2"></i> Cargando datos...
    </div>
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> Error: {{ error }}
    </div>

    <div class="summary-cards" v-show="!loading && !error">
      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="card-content">
          <h3>${{ totalRevenue }}</h3>
          <p>Ingresos Totales</p>
          <small :class="parseFloat(revenueChange) >= 0 ? 'positive' : 'negative'">
            {{ revenueChange }}% vs periodo anterior
          </small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-ticket-perforated"></i>
          </div>
          <div class="card-content">
            <h3>{{ totalTicketsSold }}</h3>
            <p>Tickets Vendidos</p>
            <small :class="parseFloat(ticketsChange) >= 0 ? 'positive' : 'negative'">
              {{ ticketsChange }}% vs periodo anterior
            </small>
          </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-calendar-event"></i>
        </div>
        <div class="card-content">
          <h3>{{ totalEvents }}</h3>
          <p>Eventos Realizados</p>
          <small :class="parseFloat(eventsChange) >= 0 ? 'positive' : 'negative'">
            {{ eventsChange }}% vs periodo anterior
          </small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="bi bi-graph-down"></i>
        </div>
        <div class="card-content">
          <h3>${{ totalExpenses }}</h3>
          <p>Gastos Totales</p>
          <small :class="parseFloat(expensesChange) <= 0 ? 'positive' : 'negative'">
            {{ expensesChange }}% vs periodo anterior
          </small>
        </div>
      </div>
    </div>

    <div class="charts-section" v-show="!loading && !error">
      <div class="chart-container">
        <h4>Tendencia Ingresos vs Gastos</h4>
        <LineChart :chartData="revenueExpenseChartData" :chartOptions="lineChartOptions" v-if="chartDataLoaded" />
        <div v-else class="chart-placeholder">Cargando datos del gráfico...</div>
      </div>

      <div class="chart-container">
        <h4>Ventas por Evento</h4>
        <BarChart :chartData="salesByEventChartData" :chartOptions="barChartOptions" v-if="chartDataLoaded" />
        <div v-else class="chart-placeholder">Cargando datos del gráfico...</div>
      </div>
      
      <div class="chart-container">
        <h4>Distribución por Método de Pago</h4>
        <BarChart :chartData="paymentMethodChartData" :chartOptions="barChartOptions" v-if="chartDataLoaded" />
        <div v-else class="chart-placeholder">Cargando datos del gráfico...</div>
      </div>

      <div class="chart-container">
        <h4>Ocupación de Eventos (%)</h4>
        <BarChart :chartData="eventOccupationChartData" :chartOptions="occupationBarChartOptions" v-if="chartDataLoaded" />
        <div v-else class="chart-placeholder">Cargando datos del gráfico...</div>
      </div>
    </div>

    <div class="detailed-reports" v-show="!loading && !error">
      <div class="report-tabs">
        <button
          :class="['tab-button', { active: activeReportTab === 'sales' }]"
          @click="activeReportTab = 'sales'"
        >
          Ventas ({{ salesReport.length }})
        </button>
        <button
          :class="['tab-button', { active: activeReportTab === 'expenses' }]"
          @click="activeReportTab = 'expenses'"
        >
          Gastos ({{ expensesReport.length }})
        </button>
        <button
          :class="['tab-button', { active: activeReportTab === 'events' }]"
          @click="activeReportTab = 'events'"
        >
          Eventos ({{ eventsReport.length }})
        </button>
        <button
          :class="['tab-button', { active: activeReportTab === 'payments' }]"
          @click="activeReportTab = 'payments'"
        >
          Pagos ({{ paymentDistributionReport.length }})
        </button>
      </div>

      <div class="report-content">
        <div v-if="activeReportTab === 'sales'" class="report-table-container">
          <div class="table-actions">
            <button class="btn btn-outline-primary" @click="exportReport('sales')">
              <i class="bi bi-download me-2"></i> Exportar Excel
            </button>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Evento</th>
                <th>Tickets Vendidos</th>
                <th>Ingresos</th>
                <th>Método de Pago</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in salesReport" :key="sale.id_pago">
                <td>{{ formatDate(sale.fecha) }}</td>
                <td>{{ sale.evento }}</td>
                <td>{{ sale.tickets }}</td>
                <td>${{ sale.ingresos }}</td>
                <td>{{ sale.metodo_pago }}</td>
              </tr>
              <tr v-if="salesReport.length === 0">
                  <td colspan="5" class="text-center text-muted">No hay ventas registradas en este período.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="activeReportTab === 'expenses'" class="report-table-container">
          <div class="table-actions">
            <button class="btn btn-outline-primary" @click="exportReport('expenses')">
              <i class="bi bi-download me-2"></i> Exportar Excel
            </button>
            </div>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="expense in expensesReport" :key="expense.id_gasto">
                  <td>{{ formatDate(expense.fecha) }}</td>
                  <td>{{ expense.categoria }}</td>
                  <td>{{ expense.descripcion }}</td>
                  <td>${{ expense.monto }}</td>
                  <td>{{ expense.usuario || 'N/A' }}</td>
                </tr>
                <tr v-if="expensesReport.length === 0">
                    <td colspan="5" class="text-center text-muted">No hay gastos registrados en este período.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="activeReportTab === 'events'" class="report-table-container">
            <div class="table-actions">
              <button class="btn btn-outline-primary" @click="exportReport('events')">
                <i class="bi bi-download me-2"></i> Exportar Excel
              </button>
            </div>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Capacidad</th>
                  <th>Tickets Vendidos</th>
                  <th>Ocupación</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in eventsReport" :key="event.id">
                  <td>{{ event.nombre }}</td>
                  <td>{{ formatDate(event.fecha) }}</td>
                  <td>{{ event.capacidad }}</td>
                  <td>{{ event.tickets_vendidos }}</td>
                  <td>{{ event.ocupacion }}%</td>
                  <td>${{ parseFloat(event.ingresos).toFixed(2) }}</td>
                </tr>
                <tr v-if="eventsReport.length === 0">
                    <td colspan="6" class="text-center text-muted">No hay eventos publicados en este período.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="activeReportTab === 'payments'" class="report-table-container">
            <div class="table-actions">
              <button class="btn btn-outline-primary" @click="exportReport('payments')">
                <i class="bi bi-download me-2"></i> Exportar Excel
              </button>
            </div>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Método de Pago</th>
                  <th>Ingresos Totales</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paymentDistributionReport" :key="item.method">
                  <td>{{ item.method }}</td>
                  <td>${{ parseFloat(item.total).toFixed(2) }}</td>
                </tr>
                <tr v-if="paymentDistributionReport.length === 0">
                    <td colspan="2" class="text-center text-muted">No hay distribución de pagos para este período.</td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from '../charts/BarChart.vue'; 
import LineChart from '../charts/LineChart.vue'; 

import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment';

const API_BASE_URL = 'http://localhost:3000/api/reports'; 

export default {
  name: 'AdminReports',
  components: {
    BarChart,
    LineChart
  },
  data() {
    return {
      // Filtros
      startDate: '',
      endDate: '',
      loading: false,
      error: null,

      // Summary
      totalRevenue: '0.00',
      totalTicketsSold: 0,
      totalEvents: 0,
      totalExpenses: '0.00',
      revenueChange: 0,
      ticketsChange: 0,
      eventsChange: 0,
      expensesChange: 0,

      // Reports
      activeReportTab: 'sales',
      salesReport: [],
      expensesReport: [],
      eventsReport: [],
      paymentDistributionReport: [], // Array de objetos { method: 'Nombre', total: '0.00' }
      
      // Charts
      chartDataLoaded: false,
      revenueExpenseChartData: { labels: [], datasets: [] },
      salesByEventChartData: { labels: [], datasets: [] },
      paymentMethodChartData: { labels: [], datasets: [] },
      eventOccupationChartData: { labels: [], datasets: [] },


      // Opciones de Gráficos
      barChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: { size: 10 },
              autoSkip: false,
            }
          }
        },
        plugins: { legend: { display: false } }
      },
      occupationBarChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { 
              beginAtZero: true, 
              max: 100,
              ticks: { callback: function(value) { return value + "%"; } } 
            },
          x: {
            ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 }, autoSkip: false }
          }
        },
        plugins: { legend: { display: false } }
      },
      lineChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      }
    };
  },
  mounted() {
    this.setDefaultDates();
    // 💡 Cambio aquí: Llamamos a generateReport para la carga inicial
    this.generateReport(); 
  },
  methods: {
    setDefaultDates() {
        const today = moment();
        const thirtyDaysAgo = moment().subtract(30, 'days');

        this.endDate = today.format('YYYY-MM-DD');
        this.startDate = thirtyDaysAgo.format('YYYY-MM-DD');
    },

    async loadReportData() {
        this.loading = true;
        this.error = null;
        this.chartDataLoaded = false;

        if (!this.startDate || !this.endDate) {
           this.error = "Debe seleccionar un rango de fechas válido.";
           this.loading = false;
           return;
        }

        const token = localStorage.getItem('userToken');
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        const params = {
            startDate: this.startDate,
            endDate: this.endDate
        };

        try {
            const [summaryRes, salesRes, expensesRes, eventsRes, trendRes, paymentRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/summary`, { params, headers }),
                axios.get(`${API_BASE_URL}/sales`, { params, headers }),
                axios.get(`${API_BASE_URL}/expenses`, { params, headers }),
                axios.get(`${API_BASE_URL}/events`, { params, headers }),
                axios.get(`${API_BASE_URL}/trend`, { params, headers }),
                axios.get(`${API_BASE_URL}/payment-distribution`, { params, headers })
            ]);

            // 1. Manejo de Summary (Tarjetas)
            if (summaryRes.data.success) {
                const data = summaryRes.data.data;
                this.totalRevenue = data.totalRevenue || '0.00';
                this.totalTicketsSold = data.totalTicketsSold || 0;
                this.totalEvents = data.totalEvents || 0;
                this.totalExpenses = data.totalExpenses || '0.00';
                this.revenueChange = data.revenueChange || 0; 
                this.ticketsChange = data.ticketsChange || 0;
                this.eventsChange = data.eventsChange || 0;
                this.expensesChange = data.expensesChange || 0;
            }

            // 2. Manejo de Tablas Detalladas
            this.salesReport = salesRes.data.success && Array.isArray(salesRes.data.data) ? salesRes.data.data : [];
            this.expensesReport = expensesRes.data.success && Array.isArray(expensesRes.data.data) ? expensesRes.data.data : [];
            
            const eventsData = eventsRes.data.success && Array.isArray(eventsRes.data.data) ? eventsRes.data.data : [];
            this.eventsReport = eventsData.map(e => ({
                ...e,
                ingresos: parseFloat(e.ingresos || 0).toFixed(2)
            }));
            
            // 3. Manejo de Distribución de Pagos 
            const rawPaymentData = paymentRes.data.success && paymentRes.data.data 
                ? paymentRes.data.data 
                : { methods: [], totals: [] }; 
            
            this.paymentDistributionReport = (rawPaymentData.methods || []).map((method, index) => ({
                method: method,
                total: parseFloat(rawPaymentData.totals[index] || 0).toFixed(2)
            }));


            // 4. Actualizar los gráficos con los datos
            const trendDataSafe = trendRes.data.success && trendRes.data.data ? trendRes.data.data : { dates: [], revenue: [], expenses: [] };
            this.updateCharts(trendDataSafe, rawPaymentData);

        } catch (error) {
            console.error('Error al cargar los reportes:', error.response ? error.response.data : error.message);
            this.error = error.response 
                ? error.response.data.message || 'Error desconocido al cargar datos del servidor.' 
                : 'Error de conexión con el servidor. Revise la consola del servidor (Node.js).';
        } finally {
            this.loading = false;
            this.chartDataLoaded = true;
        }
    },
    
    updateCharts(trendData, paymentData) {
        const trendDates = trendData.dates || [];
        
        // Gráfico 1: Ingresos vs Gastos (LineChart)
        this.revenueExpenseChartData = {
            labels: trendDates.map(this.formatDate),
            datasets: [
                {
                    label: 'Ingresos',
                    backgroundColor: '#4CAF50',
                    borderColor: '#4CAF50',
                    data: trendData.revenue,
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Gastos',
                    backgroundColor: '#F44336',
                    borderColor: '#F44336',
                    data: trendData.expenses,
                    tension: 0.3,
                    fill: false
                }
            ]
        };

        // Gráfico 2: Ventas por Evento (BarChart)
        this.salesByEventChartData = {
            labels: this.eventsReport.map(e => e.nombre),
            datasets: [
                {
                    label: 'Tickets Vendidos',
                    backgroundColor: '#2196F3',
                    data: this.eventsReport.map(e => e.tickets_vendidos),
                }
            ]
        };
        
        // Gráfico 3: Distribución por Método de Pago (BarChart)
        this.paymentMethodChartData = {
            labels: paymentData.methods || [],
            datasets: [
                {
                    label: 'Ingresos por Método de Pago',
                    backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF5722', '#00BCD4'], 
                    data: paymentData.totals || [],
                }
            ]
        };

        // Gráfico 4: Ocupación de Eventos (BarChart)
        this.eventOccupationChartData = {
            labels: this.eventsReport.map(e => e.nombre),
            datasets: [
                {
                    label: 'Ocupación (%)',
                    backgroundColor: this.eventsReport.map(e => parseFloat(e.ocupacion) > 80 ? '#4CAF50' : '#FFC107'),
                    data: this.eventsReport.map(e => parseFloat(e.ocupacion)),
                }
            ]
        };
    },
    
    async generateReport() {
      // 💡 Cambio aquí: generateReport llama a loadReportData
      await this.loadReportData();
    },
    
    exportReport(type) {
        let dataToExport = [];
        let fileName = '';
        let sheetName = '';

        switch (type) {
            case 'sales':
                dataToExport = this.salesReport.map(s => ({
                    Fecha: this.formatDate(s.fecha),
                    Evento: s.evento,
                    'Tickets Vendidos': s.tickets,
                    Ingresos: parseFloat(s.ingresos),
                    'Método de Pago': s.metodo_pago,
                }));
                fileName = 'Reporte_Ventas';
                sheetName = 'Ventas';
                break;
            case 'expenses':
                dataToExport = this.expensesReport.map(e => ({
                    Fecha: this.formatDate(e.fecha),
                    Categoría: e.categoria,
                    Descripción: e.descripcion,
                    Monto: parseFloat(e.monto),
                    Usuario: e.usuario || 'N/A',
                }));
                fileName = 'Reporte_Gastos';
                sheetName = 'Gastos';
                break;
            case 'events':
                dataToExport = this.eventsReport.map(e => ({
                    Evento: e.nombre,
                    Fecha: this.formatDate(e.fecha),
                    Capacidad: e.capacidad,
                    'Tickets Vendidos': e.tickets_vendidos,
                    'Ocupación (%)': parseFloat(e.ocupacion),
                    Ingresos: parseFloat(e.ingresos),
                }));
                fileName = 'Reporte_Eventos';
                sheetName = 'Eventos';
                break;
            case 'payments':
                dataToExport = this.paymentDistributionReport.map(p => ({
                    'Método de Pago': p.method,
                    Ingresos: parseFloat(p.total),
                }));
                fileName = 'Reporte_Pagos';
                sheetName = 'Pagos';
                break;
            default:
                console.error('Tipo de reporte no reconocido:', type);
                return;
        }

        if (dataToExport.length === 0) {
            alert(`El reporte de ${sheetName} para el período seleccionado está vacío. No se puede exportar.`);
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        
        try {
            saveAs(
                new Blob([wbout], { type: 'application/octet-stream' }),
                `${fileName}_${moment().format('YYYYMMDD_HHmm')}.xlsx`
            );
        } catch (e) {
            console.error('Error al guardar el archivo:', e);
            alert('Error al intentar descargar el archivo.');
        }
    },
    
    formatDate(dateString) {
        if (dateString) {
            return moment(dateString).format('DD/MM/YYYY');
        }
        return '';
    }
  }
};
</script>

<style scoped>
/* Estilos necesarios para la presentación */
.reports-container { padding: 20px; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.section-title { color: #2c3e50; font-weight: 700; }
.date-filters { display: flex; align-items: center; gap: 10px; }
.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
.summary-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: flex; align-items: center; transition: transform 0.3s ease; }
.summary-card:hover { transform: translateY(-5px); }
.card-icon { font-size: 2.5rem; color: #4CAF50; margin-right: 20px; }
.card-content h3 { margin: 0; font-size: 2rem; font-weight: 700; color: #2c3e50; }
.card-content p { margin: 5px 0 0 0; color: #7f8c8d; font-weight: 500; }
.card-content small { font-size: 0.8rem; }
.positive { color: #4CAF50; }
.negative { color: #F44336; }
.charts-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 40px; }
.chart-container { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); height: 350px; }
.chart-container h4 { color: #2c3e50; margin-bottom: 20px; font-weight: 600; }
.chart-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #999; border-radius: 5px; }
.detailed-reports { background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
.report-tabs { display: flex; border-bottom: 1px solid #dee2e6; }
.tab-button { padding: 15px 25px; border: none; background: none; color: #6c757d; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s ease; }
.tab-button.active { color: #4CAF50; border-bottom-color: #4CAF50; }
.tab-button:hover { color: #4CAF50; }
.report-content { padding: 20px; }
.table-actions { margin-bottom: 20px; display: flex; justify-content: flex-end; }
.report-table { width: 100%; border-collapse: collapse; }
.report-table th, .report-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
.report-table th { background: #f8f9fa; font-weight: 600; color: #2c3e50; }

/* Estilos de carga (Spin) */
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>