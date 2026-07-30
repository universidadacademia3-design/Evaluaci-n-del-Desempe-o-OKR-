import { store } from '../state.js';
import { objectiveProgress, objectiveStatus, escapeHtml } from '../utils.js';
import { badge, ringProgress, emptyState } from '../components.js';

export function renderAlignment() {
  const cycle = store.activeCycle;
  const objectives = store.objectivesForCycle();
  const krs = store.data.keyResults;
  const roots = objectives.filter(o => !o.alignedTo || !objectives.some(p => p.id === o.alignedTo));

  return `
    <div class="alert alert-info" style="margin-bottom:20px;">
      El mapa de alineación muestra cómo cada objetivo de equipo o individual contribuye a objetivos superiores, permitiendo verificar coherencia estratégica de arriba hacia abajo.
    </div>
    <div class="card card-pad">
      ${roots.length ? `<div class="tree">${roots.map(o => nodeHtml(o, objectives, krs, cycle)).join('')}</div>` : emptyState('Sin objetivos para mostrar en este ciclo')}
    </div>
  `;
}

function nodeHtml(o, all, krs, cycle) {
  const progress = objectiveProgress(o, krs);
  const status = objectiveStatus(o, krs, cycle);
  const owner = store.userById(o.ownerId);
  const children = all.filter(c => c.alignedTo === o.id);
  return `
    <div class="tree-node">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <div>
          <a href="#/objectives/${o.id}" style="text-decoration:none;color:var(--ink-900);font-weight:700;">${escapeHtml(o.title)}</a>
          <p class="muted" style="margin:2px 0 0;font-size:.78rem;">${owner ? escapeHtml(owner.name) : ''} · ${{ company: 'Empresa', team: 'Equipo', individual: 'Individual' }[o.level]}</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">${badge(status)}${ringProgress(progress, { size: 36, stroke: 4 })}</div>
      </div>
      ${children.length ? `<div class="tree-children">${children.map(c => nodeHtml(c, all, krs, cycle)).join('')}</div>` : ''}
    </div>`;
}

export function afterRenderAlignment() {}
