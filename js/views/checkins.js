import { store } from '../state.js';
import { fmtDate, fmtNumber, escapeHtml } from '../utils.js';
import { avatar, confidenceDots, emptyState, personCell } from '../components.js';

export function renderCheckins() {
  const cycle = store.activeCycle;
  const objIds = new Set(store.objectivesForCycle().map(o => o.id));
  const krsInCycle = store.data.keyResults.filter(k => objIds.has(k.objectiveId));
  const krIds = new Set(krsInCycle.map(k => k.id));

  const checkIns = [...store.data.checkIns]
    .filter(c => krIds.has(c.keyResultId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const dueSoon = krsInCycle.filter(k => {
    const last = store.checkInsFor(k.id)[0];
    if (!last) return true;
    const days = (Date.now() - new Date(last.date)) / 86400000;
    return days > 14;
  });

  return `
    <div class="grid grid-2" style="align-items:start;margin-bottom:22px;">
      <div class="card card-pad">
        <div class="card-header"><h3>Pendientes de actualizar</h3><span class="muted">${dueSoon.length}</span></div>
        ${dueSoon.length ? `<div style="display:grid;gap:10px;">
          ${dueSoon.slice(0, 8).map(k => {
            const obj = store.find('objectives', k.objectiveId);
            return `<div class="list-row">
              <div><strong>${escapeHtml(k.title)}</strong><br><span class="muted" style="font-size:.78rem;">${obj ? escapeHtml(obj.title) : ''}</span></div>
              <a href="#/objectives/${k.objectiveId}" class="btn btn-secondary btn-sm">Actualizar</a>
            </div>`;
          }).join('')}
        </div>` : emptyState('Todo al día', 'No hay resultados clave pendientes de actualización.')}
      </div>
      <div class="card card-pad">
        <div class="card-header"><h3>Buenas prácticas de check-in</h3></div>
        <p class="muted" style="font-size:.87rem;">Registra avances cada 1–2 semanas. Un check-in útil incluye:</p>
        <ul style="margin:0;padding-left:18px;font-size:.87rem;color:var(--ink-600);">
          <li>El valor actual medido, no una estimación aproximada.</li>
          <li>Un nivel de confianza honesto sobre alcanzar la meta.</li>
          <li>Contexto breve: qué avanzó y qué lo bloquea.</li>
        </ul>
      </div>
    </div>

    <div class="section-title"><h2>Historial de check-ins${cycle ? ` · ${cycle.name}` : ''}</h2></div>
    <div class="card">
      ${checkIns.length ? `<div style="padding:6px 22px;">${checkIns.map(rowHtml).join('')}</div>` : `<div class="card-pad">${emptyState('Sin check-ins registrados en este ciclo')}</div>`}
    </div>
  `;
}

function rowHtml(ci) {
  const kr = store.find('keyResults', ci.keyResultId);
  const user = store.userById(ci.authorId);
  if (!kr) return '';
  const obj = store.find('objectives', kr.objectiveId);
  return `
  <div class="checkin-item">
    ${avatar(user?.name || '?')}
    <div class="ci-body">
      <p style="margin:0;"><strong>${user ? escapeHtml(user.name) : 'Usuario'}</strong> actualizó
        <a href="#/objectives/${obj?.id || ''}">${escapeHtml(kr.title)}</a></p>
      ${ci.comment ? `<p class="muted" style="margin:2px 0;">${escapeHtml(ci.comment)}</p>` : ''}
      <div class="ci-meta">
        <span>${fmtDate(ci.date)}</span>
        ${ci.value !== null && ci.value !== undefined ? `<span class="mono">${fmtNumber(ci.value)}</span>` : ''}
        <span>Confianza ${confidenceDots(ci.confidence)}</span>
      </div>
    </div>
  </div>`;
}

export function afterRenderCheckins() {}
