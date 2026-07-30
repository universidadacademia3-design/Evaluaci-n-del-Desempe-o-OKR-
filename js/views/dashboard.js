import { store } from '../state.js';
import { objectiveProgress, objectiveStatus, fmtNumber, daysRemaining } from '../utils.js';
import { ringProgress, badge, avatar, emptyState } from '../components.js';
import { statusDonut, teamBarChart } from '../charts.js';

export function renderDashboard() {
  const cycle = store.activeCycle;
  const objectives = store.objectivesForCycle();
  const krs = store.data.keyResults;

  const withStatus = objectives.map(o => ({
    o, progress: objectiveProgress(o, krs), status: objectiveStatus(o, krs, cycle),
  }));

  const counts = { on_track: 0, at_risk: 0, behind: 0, completed: 0, not_started: 0 };
  withStatus.forEach(w => counts[w.status]++);

  const overallProgress = withStatus.length
    ? Math.round(withStatus.reduce((s, w) => s + w.progress, 0) / withStatus.length)
    : 0;

  const companyObjectives = withStatus.filter(w => w.o.level === 'company');
  const teamObjectives = withStatus.filter(w => w.o.level === 'team');
  const atRiskCount = counts.at_risk + counts.behind;
  const remaining = cycle ? daysRemaining(cycle.endDate) : null;

  // team progress aggregation
  const teamAgg = {};
  withStatus.forEach(({ o, progress }) => {
    if (!o.teamId) return;
    if (!teamAgg[o.teamId]) teamAgg[o.teamId] = { sum: 0, n: 0 };
    teamAgg[o.teamId].sum += progress; teamAgg[o.teamId].n++;
  });
  const teamLabels = Object.keys(teamAgg).map(id => store.teamById(id)?.name || id);
  const teamValues = Object.values(teamAgg).map(t => Math.round(t.sum / t.n));

  const recentCheckIns = [...store.data.checkIns]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return `
    <div class="dash-hero">
      <div class="hero-text">
        <p style="text-transform:uppercase;letter-spacing:.08em;font-size:.74rem;color:var(--ink-300);margin-bottom:6px;">
          ${store.data.company.name} · ${cycle ? cycle.name : 'Sin ciclo activo'}
        </p>
        <h2>Progreso general del ciclo</h2>
        <p>${withStatus.length} objetivos activos · ${krs.filter(k => withStatus.some(w => w.o.id === k.objectiveId)).length} resultados clave
        ${remaining !== null ? ` · ${remaining >= 0 ? remaining + ' días restantes' : 'Ciclo finalizado'}` : ''}</p>
      </div>
      <div class="hero-ring">${ringProgress(overallProgress, { size: 108, stroke: 10 })}</div>
    </div>

    ${atRiskCount > 0 ? `
    <div class="alert alert-warn" style="margin-bottom:20px;">
      ⚠️ <div><strong>${atRiskCount} objetivo(s) requieren atención.</strong> Revisa los resultados clave en riesgo o retrasados para reorientar esfuerzos antes del cierre del ciclo.</div>
    </div>` : ''}

    <div class="grid grid-4" style="margin-bottom:8px;">
      <div class="card stat-tile"><p class="stat-label">Objetivos en curso</p><p class="stat-value">${counts.on_track}</p><p class="stat-delta up">Dentro de lo planeado</p></div>
      <div class="card stat-tile"><p class="stat-label">En riesgo</p><p class="stat-value">${counts.at_risk}</p><p class="stat-delta down">Requieren seguimiento</p></div>
      <div class="card stat-tile"><p class="stat-label">Retrasados</p><p class="stat-value">${counts.behind}</p><p class="stat-delta down">Acción inmediata</p></div>
      <div class="card stat-tile"><p class="stat-label">Completados</p><p class="stat-value">${counts.completed}</p><p class="stat-delta up">Meta alcanzada</p></div>
    </div>

    <div class="grid grid-2" style="margin-top:20px;align-items:stretch;">
      <div class="card card-pad chart-card">
        <div class="card-header"><h3>Distribución por estado</h3><span class="muted">${withStatus.length} objetivos</span></div>
        ${withStatus.length ? `<canvas id="chart-status-donut" height="220"></canvas>
        <div class="legend-row">
          <span><i class="legend-dot" style="background:#1B7F72"></i>En curso</span>
          <span><i class="legend-dot" style="background:#B8862B"></i>En riesgo</span>
          <span><i class="legend-dot" style="background:#9C3B34"></i>Retrasado</span>
          <span><i class="legend-dot" style="background:#2B5FA8"></i>Completado</span>
          <span><i class="legend-dot" style="background:#5B6B78"></i>Sin iniciar</span>
        </div>` : emptyState('Aún no hay objetivos en este ciclo', 'Crea tu primer objetivo desde la sección Objetivos & KR.')}
      </div>
      <div class="card card-pad chart-card">
        <div class="card-header"><h3>Progreso promedio por equipo</h3></div>
        ${teamLabels.length ? `<canvas id="chart-team-bar" height="220"></canvas>` : emptyState('Sin datos por equipo todavía')}
      </div>
    </div>

    <div class="section-title"><h2>Objetivos de la organización</h2></div>
    <div class="grid grid-3">
      ${companyObjectives.length ? companyObjectives.map(cardHtml).join('') : `<div class="card">${emptyState('Sin objetivos a nivel empresa')}</div>`}
    </div>

    <div class="section-title"><h2>Objetivos por equipo</h2></div>
    <div class="grid grid-3">
      ${teamObjectives.length ? teamObjectives.slice(0, 6).map(cardHtml).join('') : `<div class="card">${emptyState('Sin objetivos por equipo todavía')}</div>`}
    </div>

    <div class="section-title"><h2>Actividad reciente</h2></div>
    <div class="card card-pad">
      ${recentCheckIns.length ? recentCheckIns.map(ci => {
        const kr = store.find('keyResults', ci.keyResultId);
        const user = store.userById(ci.authorId);
        if (!kr) return '';
        return `<div class="checkin-item">
          ${avatar(user?.name || '?')}
          <div class="ci-body">
            <p style="margin:0;"><strong>${user?.name || 'Usuario'}</strong> actualizó <em>${kr.title}</em></p>
            <p class="muted" style="margin:2px 0 0;">${ci.comment || ''}</p>
            <div class="ci-meta"><span>${new Date(ci.date).toLocaleDateString('es-ES')}</span></div>
          </div>
        </div>`;
      }).join('') : emptyState('Sin actividad reciente')}
    </div>
  `;
}

export function afterRenderDashboard() {
  const cycle = store.activeCycle;
  const objectives = store.objectivesForCycle();
  const krs = store.data.keyResults;
  const counts = { on_track: 0, at_risk: 0, behind: 0, completed: 0, not_started: 0 };
  objectives.forEach(o => counts[objectiveStatus(o, krs, cycle)]++);
  if (objectives.length) statusDonut('chart-status-donut', counts);

  const teamAgg = {};
  objectives.forEach(o => {
    if (!o.teamId) return;
    const p = objectiveProgress(o, krs);
    if (!teamAgg[o.teamId]) teamAgg[o.teamId] = { sum: 0, n: 0 };
    teamAgg[o.teamId].sum += p; teamAgg[o.teamId].n++;
  });
  const labels = Object.keys(teamAgg).map(id => store.teamById(id)?.name || id);
  const values = Object.values(teamAgg).map(t => Math.round(t.sum / t.n));
  if (labels.length) teamBarChart('chart-team-bar', labels, values);
}

function cardHtml({ o, progress, status }) {
  const owner = store.userById(o.ownerId);
  const krCount = store.krsFor(o.id).length;
  return `
    <a href="#/objectives/${o.id}" class="card objective-card" style="text-decoration:none;display:flex;flex-direction:column;">
      <div class="obj-top">
        <div>
          <h4>${o.title}</h4>
          <p class="obj-meta">${owner ? owner.name : 'Sin responsable'} · ${o.category || 'General'}</p>
        </div>
        ${ringProgress(progress, { size: 46, stroke: 5 })}
      </div>
      <div style="margin-top:10px;">${badge(status)}</div>
      <p class="kr-count">${krCount} resultado(s) clave</p>
    </a>`;
}
