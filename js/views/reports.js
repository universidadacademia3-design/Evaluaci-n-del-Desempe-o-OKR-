import { store } from '../state.js';
import { objectiveProgress, objectiveStatus, krProgress, krStatus, statusLabel, fmtNumber, escapeHtml } from '../utils.js';
import { radarChart, trendLineChart } from '../charts.js';
import { exportExecutiveReportPdf } from '../pdfExport.js';
import { downloadCsv } from '../csvExport.js';
import { emptyState } from '../components.js';

export function renderReports() {
  const cycle = store.activeCycle;
  const objectives = store.objectivesForCycle();
  const krs = store.data.keyResults;
  const categories = [...new Set(objectives.map(o => o.category).filter(Boolean))];

  return `
    <div class="toolbar">
      <div class="spacer"></div>
      <button class="btn btn-secondary" id="btn-export-csv">Exportar datos (CSV)</button>
      <button class="btn btn-primary" id="btn-export-pdf">Exportar reporte ejecutivo (PDF)</button>
    </div>

    <div class="grid grid-2">
      <div class="card card-pad chart-card">
        <div class="card-header"><h3>Progreso por categoría estratégica</h3></div>
        ${categories.length ? `<canvas id="chart-radar" height="240"></canvas>` : emptyState('Sin categorías definidas')}
      </div>
      <div class="card card-pad chart-card">
        <div class="card-header"><h3>Evolución del progreso general</h3><span class="muted">Simulación por quincena</span></div>
        <canvas id="chart-trend" height="240"></canvas>
      </div>
    </div>

    <div class="section-title"><h2>Detalle de objetivos y resultados clave</h2></div>
    <div class="table-wrap card">
      <table class="data-table">
        <thead><tr><th>Objetivo</th><th>Resultado clave</th><th>Progreso</th><th>Estado</th><th>Responsable</th></tr></thead>
        <tbody>
          ${objectives.length ? objectives.map(o => {
            const rows = store.krsFor(o.id);
            if (!rows.length) return `<tr><td>${escapeHtml(o.title)}</td><td colspan="4" class="muted">Sin resultados clave</td></tr>`;
            return rows.map((kr, i) => `
              <tr>
                <td>${i === 0 ? `<strong>${escapeHtml(o.title)}</strong>` : ''}</td>
                <td>${escapeHtml(kr.title)}</td>
                <td>${krProgress(kr)}%</td>
                <td><span class="badge badge-${krStatus(kr, cycle)}">${statusLabel(krStatus(kr, cycle))}</span></td>
                <td>${store.userById(o.ownerId)?.name || '—'}</td>
              </tr>`).join('');
          }).join('') : `<tr><td colspan="5">${emptyState('Sin datos para este ciclo')}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

export function afterRenderReports() {
  const cycle = store.activeCycle;
  const objectives = store.objectivesForCycle();
  const krs = store.data.keyResults;
  const categories = [...new Set(objectives.map(o => o.category).filter(Boolean))];

  if (categories.length) {
    const values = categories.map(cat => {
      const objs = objectives.filter(o => o.category === cat);
      return Math.round(objs.reduce((s, o) => s + objectiveProgress(o, krs), 0) / objs.length);
    });
    radarChart('chart-radar', categories, values);
  }

  // Simple synthetic trend built from average progress today, receding backward proportionally.
  const overall = objectives.length ? Math.round(objectives.reduce((s, o) => s + objectiveProgress(o, krs), 0) / objectives.length) : 0;
  const points = 6;
  const trendData = Array.from({ length: points }, (_, i) => Math.max(0, Math.round(overall * ((i + 1) / points))));
  const labels = Array.from({ length: points }, (_, i) => `Quincena ${i + 1}`);
  trendLineChart('chart-trend', labels, [{ label: 'Progreso (%)', data: trendData, color: '#1B7F72' }]);

  document.getElementById('btn-export-pdf')?.addEventListener('click', () => exportExecutiveReportPdf());
  document.getElementById('btn-export-csv')?.addEventListener('click', () => downloadCsv());
}
