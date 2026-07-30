import { store } from '../state.js';
import { objectiveProgress, objectiveStatus, escapeHtml } from '../utils.js';
import { ringProgress, badge, personCell, openModal, confirmDialog, emptyState } from '../components.js';
import { toast } from '../utils.js';

let filterLevel = 'all';
let filterTeam = 'all';
let searchTerm = '';

export function renderObjectives() {
  const cycle = store.activeCycle;
  const all = store.objectivesForCycle();
  const krs = store.data.keyResults;

  const filtered = all.filter(o => {
    if (filterLevel !== 'all' && o.level !== filterLevel) return false;
    if (filterTeam !== 'all' && o.teamId !== filterTeam) return false;
    if (searchTerm && !o.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const teams = store.data.teams;

  return `
    <div class="toolbar">
      <button class="chip-filter ${filterLevel === 'all' ? 'active' : ''}" data-level="all">Todos</button>
      <button class="chip-filter ${filterLevel === 'company' ? 'active' : ''}" data-level="company">Empresa</button>
      <button class="chip-filter ${filterLevel === 'team' ? 'active' : ''}" data-level="team">Equipo</button>
      <button class="chip-filter ${filterLevel === 'individual' ? 'active' : ''}" data-level="individual">Individual</button>
      <select id="filter-team" class="search-input" style="min-width:170px;">
        <option value="all">Todos los equipos</option>
        ${teams.map(t => `<option value="${t.id}" ${filterTeam === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}
      </select>
      <input id="search-obj" class="search-input" placeholder="Buscar objetivo…" value="${escapeHtml(searchTerm)}" />
      <div class="spacer"></div>
      <button class="btn btn-primary" id="btn-new-objective">+ Nuevo objetivo</button>
    </div>

    ${!cycle ? `<div class="alert alert-warn" style="margin-bottom:16px;">No hay un ciclo activo. Crea uno en Configuración para poder registrar objetivos.</div>` : ''}

    <div class="table-wrap card">
      <table class="data-table">
        <thead><tr>
          <th>Objetivo</th><th>Nivel</th><th>Responsable</th><th>Equipo</th><th>Progreso</th><th>Estado</th><th></th>
        </tr></thead>
        <tbody>
          ${filtered.length ? filtered.map(o => rowHtml(o, krs, cycle)).join('') : `<tr><td colspan="7">${emptyState('No se encontraron objetivos', 'Ajusta los filtros o crea un nuevo objetivo.')}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function rowHtml(o, krs, cycle) {
  const owner = store.userById(o.ownerId);
  const team = store.teamById(o.teamId);
  const progress = objectiveProgress(o, krs);
  const status = objectiveStatus(o, krs, cycle);
  const levelLabel = { company: 'Empresa', team: 'Equipo', individual: 'Individual' }[o.level] || o.level;
  return `
    <tr class="clickable" data-goto="${o.id}">
      <td><strong>${escapeHtml(o.title)}</strong><br><span class="muted" style="font-size:.78rem;">${escapeHtml(o.category || '')}</span></td>
      <td>${levelLabel}</td>
      <td>${personCell(owner)}</td>
      <td>${team ? escapeHtml(team.name) : '—'}</td>
      <td>${ringProgress(progress, { size: 40, stroke: 4 })}</td>
      <td>${badge(status)}</td>
      <td><button class="btn btn-secondary btn-sm" data-edit="${o.id}">Editar</button></td>
    </tr>`;
}

export function afterRenderObjectives() {
  document.querySelectorAll('.chip-filter[data-level]').forEach(btn => {
    btn.addEventListener('click', () => { filterLevel = btn.dataset.level; rerender(); });
  });
  const teamSel = document.getElementById('filter-team');
  if (teamSel) teamSel.addEventListener('change', () => { filterTeam = teamSel.value; rerender(); });
  const search = document.getElementById('search-obj');
  if (search) search.addEventListener('input', () => { searchTerm = search.value; rerender(); });

  document.querySelectorAll('tr[data-goto]').forEach(tr => {
    tr.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      location.hash = `#/objectives/${tr.dataset.goto}`;
    });
  });
  document.querySelectorAll('button[data-edit]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openObjectiveModal(store.find('objectives', btn.dataset.edit)); });
  });
  document.getElementById('btn-new-objective')?.addEventListener('click', () => openObjectiveModal(null));
}

function rerender() {
  const root = document.getElementById('view-root');
  root.innerHTML = renderObjectives();
  afterRenderObjectives();
}

export function openObjectiveModal(existing) {
  const teams = store.data.teams;
  const users = store.data.users;
  const cycles = store.data.cycles;
  const allObjectives = store.data.objectives.filter(o => o.id !== existing?.id);

  openModal({
    title: existing ? 'Editar objetivo' : 'Nuevo objetivo',
    size: 'lg',
    bodyHtml: `
      <div class="field">
        <span>Título del objetivo</span>
        <input id="f-title" type="text" placeholder="Ej. Expandir la base de clientes estratégicos" value="${escapeHtml(existing?.title || '')}" required />
      </div>
      <div class="field">
        <span>Descripción</span>
        <textarea id="f-desc" placeholder="Describe el propósito de este objetivo">${escapeHtml(existing?.description || '')}</textarea>
      </div>
      <div class="field-row">
        <label class="field"><span>Nivel</span>
          <select id="f-level">
            <option value="company" ${existing?.level === 'company' ? 'selected' : ''}>Empresa</option>
            <option value="team" ${!existing || existing?.level === 'team' ? 'selected' : ''}>Equipo</option>
            <option value="individual" ${existing?.level === 'individual' ? 'selected' : ''}>Individual</option>
          </select>
        </label>
        <label class="field"><span>Ciclo</span>
          <select id="f-cycle">
            ${cycles.map(c => `<option value="${c.id}" ${(existing?.cycleId || store.data.activeCycleId) === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="field-row">
        <label class="field"><span>Responsable</span>
          <select id="f-owner">
            ${users.map(u => `<option value="${u.id}" ${existing?.ownerId === u.id ? 'selected' : ''}>${escapeHtml(u.name)}</option>`).join('')}
          </select>
        </label>
        <label class="field"><span>Equipo</span>
          <select id="f-team">
            <option value="">Sin equipo específico</option>
            ${teams.map(t => `<option value="${t.id}" ${existing?.teamId === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="field-row">
        <label class="field"><span>Categoría</span>
          <input id="f-category" type="text" placeholder="Ej. Comercial, Operaciones…" value="${escapeHtml(existing?.category || '')}" />
        </label>
        <label class="field"><span>Alineado a (objetivo superior)</span>
          <select id="f-aligned">
            <option value="">Sin alineación (nivel superior)</option>
            ${allObjectives.map(o => `<option value="${o.id}" ${existing?.alignedTo === o.id ? 'selected' : ''}>${escapeHtml(o.title)}</option>`).join('')}
          </select>
        </label>
      </div>
    `,
    footHtml: `
      ${existing ? `<button class="btn btn-danger" id="btn-delete-obj" style="margin-right:auto;">Eliminar</button>` : ''}
      <button class="btn btn-secondary" id="btn-cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save">${existing ? 'Guardar cambios' : 'Crear objetivo'}</button>
    `,
    onMount: (close) => {
      document.getElementById('btn-cancel').addEventListener('click', close);
      document.getElementById('btn-delete-obj')?.addEventListener('click', () => {
        confirmDialog('Se eliminará el objetivo y todos sus resultados clave asociados. Esta acción no se puede deshacer.', () => {
          store.data.keyResults = store.data.keyResults.filter(k => k.objectiveId !== existing.id);
          store.remove('objectives', existing.id);
          toast('Objetivo eliminado', 'ok');
          close();
          location.hash = '#/objectives';
          rerender();
        });
      });
      document.getElementById('btn-save').addEventListener('click', () => {
        const title = document.getElementById('f-title').value.trim();
        if (!title) { toast('El título es obligatorio', 'err'); return; }
        const payload = {
          title,
          description: document.getElementById('f-desc').value.trim(),
          level: document.getElementById('f-level').value,
          cycleId: document.getElementById('f-cycle').value,
          ownerId: document.getElementById('f-owner').value,
          teamId: document.getElementById('f-team').value || null,
          category: document.getElementById('f-category').value.trim(),
          alignedTo: document.getElementById('f-aligned').value || null,
        };
        if (existing) {
          store.update('objectives', existing.id, payload);
          toast('Objetivo actualizado', 'ok');
        } else {
          const obj = store.add('objectives', payload, 'obj');
          toast('Objetivo creado. Ahora agrega sus resultados clave.', 'ok');
          close();
          location.hash = `#/objectives/${obj.id}`;
          return;
        }
        close();
        rerender();
      });
    },
  });
}
