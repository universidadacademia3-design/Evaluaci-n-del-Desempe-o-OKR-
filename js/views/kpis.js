import { store } from '../state.js';
import { fmtNumber, escapeHtml, toast } from '../utils.js';
import { openModal, confirmDialog, emptyState } from '../components.js';
import { trendLineChart } from '../charts.js';

export function renderKpis() {
  const kpis = store.data.kpis;
  return `
    <div class="alert alert-info" style="margin-bottom:20px;">
      Los indicadores clave de desempeño (KPI) complementan a los OKR: son métricas operativas continuas, sin fecha de cierre, que sostienen la salud del negocio entre ciclos.
    </div>
    <div class="toolbar">
      <div class="spacer"></div>
      <button class="btn btn-primary" id="btn-new-kpi">+ Nuevo indicador</button>
    </div>
    <div class="grid grid-3">
      ${kpis.length ? kpis.map(kpiCard).join('') : `<div class="card">${emptyState('Sin indicadores registrados')}</div>`}
    </div>
  `;
}

function kpiCard(k) {
  const team = store.teamById(k.teamId);
  const onTarget = k.direction === 'down' ? k.current <= k.target : k.current >= k.target;
  const canvasId = `kpi-chart-${k.id}`;
  return `
    <div class="card card-pad">
      <div class="card-header">
        <div>
          <h4 style="margin:0;font-size:.94rem;">${escapeHtml(k.name)}</h4>
          <p class="muted" style="font-size:.76rem;margin:2px 0 0;">${team ? escapeHtml(team.name) : 'General'} · ${k.frequency === 'weekly' ? 'Semanal' : 'Mensual'}</p>
        </div>
        <span class="badge ${onTarget ? 'badge-on_track' : 'badge-at_risk'}">${onTarget ? 'En meta' : 'Fuera de meta'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
        <span style="font-family:var(--font-display);font-size:1.6rem;">${fmtNumber(k.current, k.unit === '$' ? '$' : k.unit === '%' ? '%' : '')}</span>
        <span class="muted" style="font-size:.78rem;">meta: ${fmtNumber(k.target, k.unit === '$' ? '$' : k.unit === '%' ? '%' : '')} ${k.direction === 'down' ? '(máx.)' : '(mín.)'}</span>
      </div>
      <canvas id="${canvasId}" height="120"></canvas>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="btn btn-secondary btn-sm" data-log-kpi="${k.id}">Registrar lectura</button>
        <button class="btn btn-secondary btn-sm" data-edit-kpi="${k.id}">Editar</button>
      </div>
    </div>`;
}

export function afterRenderKpis() {
  store.data.kpis.forEach(k => {
    const canvas = document.getElementById(`kpi-chart-${k.id}`);
    if (!canvas) return;
    const labels = k.history.map(h => new Date(h.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
    trendLineChart(`kpi-chart-${k.id}`, labels, [{ label: k.name, data: k.history.map(h => h.value), color: '#4C5FA3' }]);
  });

  document.getElementById('btn-new-kpi')?.addEventListener('click', () => openKpiModal(null));
  document.querySelectorAll('button[data-edit-kpi]').forEach(btn => {
    btn.addEventListener('click', () => openKpiModal(store.find('kpis', btn.dataset.editKpi)));
  });
  document.querySelectorAll('button[data-log-kpi]').forEach(btn => {
    btn.addEventListener('click', () => openKpiLogModal(btn.dataset.logKpi));
  });
}

function rerender() {
  const root = document.getElementById('view-root');
  root.innerHTML = renderKpis();
  afterRenderKpis();
}

function openKpiModal(existing) {
  const teams = store.data.teams;
  openModal({
    title: existing ? 'Editar indicador' : 'Nuevo indicador (KPI)',
    bodyHtml: `
      <div class="field"><span>Nombre del indicador</span><input id="k-name" value="${escapeHtml(existing?.name || '')}" placeholder="Ej. Tasa de accidentalidad laboral" /></div>
      <div class="field-row">
        <label class="field"><span>Equipo</span>
          <select id="k-team">${teams.map(t => `<option value="${t.id}" ${existing?.teamId === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}</select>
        </label>
        <label class="field"><span>Frecuencia</span>
          <select id="k-freq">
            <option value="weekly" ${existing?.frequency === 'weekly' ? 'selected' : ''}>Semanal</option>
            <option value="monthly" ${!existing || existing?.frequency === 'monthly' ? 'selected' : ''}>Mensual</option>
          </select>
        </label>
      </div>
      <div class="field-row">
        <label class="field"><span>Meta</span><input id="k-target" type="number" step="any" value="${existing?.target ?? 0}" /></label>
        <label class="field"><span>Unidad</span><input id="k-unit" value="${escapeHtml(existing?.unit || '')}" placeholder="%, $, hrs…" /></label>
      </div>
      <div class="field"><span>Dirección deseada</span>
        <select id="k-dir">
          <option value="down" ${existing?.direction === 'down' ? 'selected' : ''}>Menor es mejor</option>
          <option value="up" ${!existing || existing?.direction === 'up' ? 'selected' : ''}>Mayor es mejor</option>
        </select>
      </div>
    `,
    footHtml: `
      ${existing ? `<button class="btn btn-danger" id="btn-delete" style="margin-right:auto;">Eliminar</button>` : ''}
      <button class="btn btn-secondary" id="btn-cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save">Guardar</button>`,
    onMount: (close) => {
      document.getElementById('btn-cancel').addEventListener('click', close);
      document.getElementById('btn-delete')?.addEventListener('click', () => {
        confirmDialog('¿Eliminar este indicador y su historial?', () => {
          store.remove('kpis', existing.id); toast('Indicador eliminado', 'ok'); close(); rerender();
        });
      });
      document.getElementById('btn-save').addEventListener('click', () => {
        const name = document.getElementById('k-name').value.trim();
        if (!name) { toast('El nombre es obligatorio', 'err'); return; }
        const payload = {
          name, teamId: document.getElementById('k-team').value,
          frequency: document.getElementById('k-freq').value,
          target: Number(document.getElementById('k-target').value),
          unit: document.getElementById('k-unit').value.trim(),
          direction: document.getElementById('k-dir').value,
        };
        if (existing) store.update('kpis', existing.id, payload);
        else store.add('kpis', { ...payload, current: payload.target, history: [] }, 'kpi');
        toast('Indicador guardado', 'ok'); close(); rerender();
      });
    },
  });
}

function openKpiLogModal(kpiId) {
  const k = store.find('kpis', kpiId);
  openModal({
    title: `Registrar lectura · ${k.name}`,
    size: 'sm',
    bodyHtml: `<div class="field"><span>Nuevo valor</span><input id="log-value" type="number" step="any" value="${k.current}" /></div>`,
    footHtml: `<button class="btn btn-secondary" id="btn-cancel">Cancelar</button><button class="btn btn-primary" id="btn-save">Guardar</button>`,
    onMount: (close) => {
      document.getElementById('btn-cancel').addEventListener('click', close);
      document.getElementById('btn-save').addEventListener('click', () => {
        const value = Number(document.getElementById('log-value').value);
        const history = [...k.history, { date: new Date().toISOString(), value }];
        store.update('kpis', k.id, { current: value, history });
        toast('Lectura registrada', 'ok'); close(); rerender();
      });
    },
  });
}
