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

    <div id="report-dashboard-content" v-show="!loading && !error">
      
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="card-content">
            <h3>${{ totalRevenue }}</h3>
            <p>Ingresos Totales</p>
            <small :class="parseFloat(revenueChange) >= 0 ? 'positive' : 'negative'">
              {{ parseFloat(revenueChange) >= 0 ? '▲' : '▼' }} {{ revenueChange }}% vs periodo anterior
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
                {{ parseFloat(ticketsChange) >= 0 ? '▲' : '▼' }} {{ ticketsChange }}% vs periodo anterior
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
              {{ parseFloat(eventsChange) >= 0 ? '▲' : '▼' }} {{ eventsChange }}% vs periodo anterior
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
              {{ parseFloat(expensesChange) <= 0 ? '▼' : '▲' }} {{ expensesChange }}% vs periodo anterior
            </small>
          </div>
        </div>
      </div>
      
      <div class="charts-section">
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
      <div class="detailed-reports">
        <div class="report-tabs">
          <button
            :class="['tab-button', { active: activeReportTab === 'income' }]"
            @click="activeReportTab = 'income'"
          >
            Ingresos Totales ({{ incomeReport.length }})
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
          <div v-if="activeReportTab === 'income'" class="report-table-container">
            <div class="table-actions">
              <button class="btn btn-outline-primary me-2" @click="exportReport('income')">
                <i class="bi bi-download me-2"></i> Exportar Excel
              </button>
              <button class="btn btn-danger" @click="exportDetailedPDF('income')" :disabled="isGeneratingPDF || incomeReport.length === 0">
                <i class="bi bi-file-earmark-pdf-fill me-2"></i> Descargar PDF
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
                <tr v-for="sale in incomeReport" :key="sale.id_pago">
                  <td>{{ formatDate(sale.fecha) }}</td>
                  <td>{{ sale.evento }}</td>
                  <td>{{ sale.tickets }}</td>
                  <td>${{ parseFloat(sale.ingresos).toFixed(2) }}</td>
                  <td>{{ sale.metodo_pago }}</td>
                </tr>
                <tr v-if="incomeReport.length === 0">
                    <td colspan="5" class="text-center text-muted">No hay ingresos registrados en este período.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="activeReportTab === 'events'" class="report-table-container">
              <div class="table-actions">
                <button class="btn btn-outline-primary me-2" @click="exportReport('events')">
                  <i class="bi bi-download me-2"></i> Exportar Excel
                </button>
                <button class="btn btn-danger" @click="exportDetailedPDF('events')" :disabled="isGeneratingPDF || eventsReport.length === 0">
                  <i class="bi bi-file-earmark-pdf-fill me-2"></i> Descargar PDF
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
                <button class="btn btn-outline-primary me-2" @click="exportReport('payments')">
                  <i class="bi bi-download me-2"></i> Exportar Excel
                </button>
                <button class="btn btn-danger" @click="exportDetailedPDF('payments')" :disabled="isGeneratingPDF || paymentDistributionReport.length === 0">
                  <i class="bi bi-file-earmark-pdf-fill me-2"></i> Descargar PDF
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
  </div>
</template>

<script>
import BarChart from '../charts/BarChart.vue'; 
import LineChart from '../charts/LineChart.vue'; 
// import html2canvas from 'html2canvas'; // Ya no es necesario
import { jsPDF } from 'jspdf'; 
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
      isGeneratingPDF: false, 

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
      activeReportTab: 'income', 
      incomeReport: [], 
      expensesReport: [], 
      eventsReport: [],
      paymentDistributionReport: [], 
      
      // Charts
      chartDataLoaded: false,
      revenueExpenseChartData: { labels: [], datasets: [] },
      salesByEventChartData: { labels: [], datasets: [] },
      paymentMethodChartData: { labels: [], datasets: [] },
      eventOccupationChartData: { labels: [], datasets: [] },


      // Opciones de Gráficos (sin cambios)
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
    this.generateReport(); 
  },
  methods: {
    // FUNCIÓN AUXILIAR REFACTORIZADA: Unifica la obtención de datos para PDF y Excel
    getReportData(type) {
        let title = '';
        let head = []; // Array simple de strings para los títulos
        let dataToUse = [];
        let body = []; // Array de arrays para el contenido de la tabla

        switch (type) {
            case 'income':
                title = 'REPORTE DETALLADO DE INGRESOS';
                dataToUse = this.incomeReport;
                head = ['Fecha', 'Evento', 'Tickets Vendidos', 'Ingresos ($)', 'Método de Pago'];
                body = dataToUse.map(s => [
                    this.formatDate(s.fecha), 
                    s.evento, 
                    s.tickets, 
                    `$${parseFloat(s.ingresos).toFixed(2)}`, 
                    s.metodo_pago
                ]);
                break;
            case 'events':
                title = 'REPORTE DETALLADO DE EVENTOS';
                dataToUse = this.eventsReport;
                head = ['Evento', 'Fecha', 'Capacidad', 'Vendidos', 'Ocupación (%)', 'Ingresos ($)'];
                body = dataToUse.map(e => [
                    e.nombre, 
                    this.formatDate(e.fecha), 
                    e.capacidad, 
                    e.tickets_vendidos, 
                    `${e.ocupacion}%`, 
                    `$${parseFloat(e.ingresos).toFixed(2)}`
                ]);
                break;
            case 'payments':
                title = 'DISTRIBUCIÓN DE INGRESOS POR MÉTODO DE PAGO';
                dataToUse = this.paymentDistributionReport;
                head = ['Método de Pago', 'Ingresos Totales ($)'];
                body = dataToUse.map(p => [
                    p.method, 
                    `$${parseFloat(p.total).toFixed(2)}`
                ]);
                break;
            default:
                console.error('Tipo de reporte desconocido:', type);
                return null;
        }
        
        return { title, head, body, dataToUse };
    },

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

            // 1. Manejo de Summary (Tarjetas) - APLICANDO FORMATO EN FRONT
            if (summaryRes.data.success) {
                const data = summaryRes.data.data;
                this.totalRevenue = parseFloat(data.totalRevenue || 0).toFixed(2);
                this.totalTicketsSold = data.totalTicketsSold || 0;
                this.totalEvents = data.totalEvents || 0;
                this.totalExpenses = parseFloat(data.totalExpenses || 0).toFixed(2);
                this.revenueChange = data.revenueChange || 0; 
                this.ticketsChange = data.ticketsChange || 0;
                this.eventsChange = data.eventsChange || 0;
                this.expensesChange = data.expensesChange || 0;
            }

            // 2. Manejo de Tablas Detalladas
            this.incomeReport = salesRes.data.success && Array.isArray(salesRes.data.data) ? salesRes.data.data : []; 
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
      await this.loadReportData();
    },
    
    // ❌ Función exportToPDF ELIMINADA, ya no es necesaria.

    
    // ✅ FUNCIÓN EXPORTAR PDF DETALLADO (Manual, sin AutoTable y con validación de datos)
    exportDetailedPDF(type) {
        this.isGeneratingPDF = true;
        const reportData = this.getReportData(type); 
        
        if (!reportData) {
            this.isGeneratingPDF = false;
            return;
        }
        
        const { title, head, body } = reportData;

        if (body.length === 0) {
            alert(`El reporte de ${title.toLowerCase()} para el período seleccionado está vacío. No se puede generar el PDF.`);
            this.isGeneratingPDF = false;
            return;
        }

        // Crear instancia de jsPDF
        const doc = new jsPDF({ 
            orientation: 'p', 
            unit: 'pt', 
            format: 'letter'
        });
        
        const margin = 40;
        let currentY = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Título y Subtítulo
        doc.setFontSize(18);
        doc.text(title, margin, currentY);
        currentY += 20;
        
        doc.setFontSize(10);
        doc.text(`Período: ${this.formatDate(this.startDate)} a ${this.formatDate(this.endDate)}`, margin, currentY);
        currentY += 40;

        // --- Dibujar la Tabla Manualmente ---
        const columnCount = head.length;
        // Calcular el ancho de cada columna. Dividimos el ancho total (página - márgenes)
        const columnWidth = (pageWidth - 2 * margin) / columnCount;
        const rowHeight = 25;
        const cellPadding = 5;
        
        // 1. Dibujar Cabecera
        doc.setFillColor(76, 175, 80); // Color verde para la cabecera
        doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255); // Texto blanco
        
        head.forEach((colTitle, colIndex) => {
            const x = margin + colIndex * columnWidth + cellPadding;
            doc.text(colTitle, x, currentY + rowHeight / 2); // Centrado verticalmente
        });
        currentY += rowHeight;

        // 2. Dibujar Cuerpo
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0); // Texto negro
        
        body.forEach((row, rowIndex) => {
            
            // ✅ VALIDACIÓN CLAVE: Asegura que 'row' es un array antes de iterar.
            if (!Array.isArray(row)) {
                 console.error(`Fila inválida detectada en el índice ${rowIndex}. Se omite.`, row);
                 return; // Saltar esta fila
            }

            // Alternar color de fondo para filas (Striped theme)
            if (rowIndex % 2 === 1) {
                doc.setFillColor(248, 249, 250); // Color gris claro
                doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
            }
            
            // Dibujar el contenido de la fila
            row.forEach((cellText, colIndex) => {
                // ✅ VALIDACIÓN CLAVE: Asegura que el contenido no es null/undefined antes de toString()
                const safeCellText = cellText !== null && cellText !== undefined ? String(cellText) : '';

                const x = margin + colIndex * columnWidth + cellPadding;
                doc.text(safeCellText, x, currentY + rowHeight / 2);
            });
            
            // Dibujar línea inferior de la celda
            doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

            currentY += rowHeight;

            // Manejo de saltos de página
            if (currentY > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                currentY = margin;
                
                // Volver a dibujar la cabecera en la nueva página
                doc.setFillColor(76, 175, 80);
                doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                
                head.forEach((colTitle, colIndex) => {
                    const x = margin + colIndex * columnWidth + cellPadding;
                    doc.text(colTitle, x, currentY + rowHeight / 2);
                });
                currentY += rowHeight;
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
            }
        });
        // --- Fin de Dibujo de Tabla Manual ---

        // Guardar
        const today = moment().format('YYYYMMDD_HHmm');
        doc.save(`Reporte_Detallado_${type}_${today}.pdf`);
        this.isGeneratingPDF = false;
        alert(`Reporte PDF de ${title.toLowerCase()} generado y descargado correctamente.`);
    },
    
    // FUNCIÓN EXPORTAR EXCEL (Usa getReportData)
    exportReport(type) {
        const reportData = this.getReportData(type); 

        if (!reportData) return;
        
        const { head, body, title } = reportData;
        let sheetName = title.replace('REPORTE DETALLADO DE ', '').split(' ')[0];
        
        if (body.length === 0) {
            alert(`El reporte de ${sheetName} para el período seleccionado está vacío. No se puede exportar.`);
            return;
        }

        // Convertir el array de arrays 'body' a un array de objetos para XLSX
        let dataToExport = body.map(row => {
            let obj = {};
            head.forEach((col, index) => {
                // Limpiar símbolos de moneda/porcentaje para que Excel los maneje como números
                let value = row[index].toString().replace('$', '').replace('%', ''); 
                // Si el valor es un número válido, lo parseamos; si no, dejamos la cadena.
                obj[col] = !isNaN(parseFloat(value)) && isFinite(value) ? parseFloat(value) : row[index];
            });
            return obj;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        
        try {
            saveAs(
                new Blob([wbout], { type: 'application/octet-stream' }),
                `${sheetName}_${moment().format('YYYYMMDD_HHmm')}.xlsx`
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
.spin { animation: spin 1s linear infinite; }
@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
</style>