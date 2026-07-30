import { store } from '../state.js';
import { objectiveProgress, escapeHtml, toast } from '../utils.js';
import { ringProgress, avatar, openModal, confirmDialog, emptyState } from '../components.js';

export function renderTeams() {
  const teams = store.data.teams;
  const cycle = store.activeCycle;
  const objectives = store.objectivesForCycle();
  const krs = store.data.keyResults;

  return `
    <div class="toolbar">
      <div class="spacer"></div>
      <button class="btn btn-secondary" id="btn-new-team">+ Nuevo equipo</button>
      <button class="btn btn-primary" id="btn-new-user">+ Nueva persona</button>
    </div>

    <div class="grid grid-3">
      ${teams.map(t => {
        const members = store.data.users.filter(u => u.teamId === t.id);
        const teamObjs = objectives.filter(o => o.teamId === t.id);
        const avgProgress = teamObjs.length ? Math.round(teamObjs.reduce((s, o) => s + objectiveProgress(o, krs), 0) / teamObjs.length) : 0;
        return `
        <div class="card card-pad">
          <div class="card-header">
            <div><h4 style="margin:0;">${escapeHtml(t.name)}</h4><p class="muted" style="font-size:.78rem;margin:2px 0 0;">${members.length} persona(s) · ${teamObjs.length} objetivo(s)</p></div>
            ${ringProgress(avgProgress, { size: 46, stroke: 5 })}
          </div>
          <div style="display:grid;gap:8px;margin-top:10px;">
            ${members.length ? members.map(u => `
              <div class="list-row">
                <span class="person-cell">${avatar(u.name, true)} <span>${escapeHtml(u.name)}<br><span class="muted" style="font-size:.74rem;">${escapeHtml(u.title || '')}</span></span></span>
                <button class="btn btn-secondary btn-sm" data-edit-user="${u.id}">Editar</button>
              </div>`).join('') : `<p class="muted" style="font-size:.82rem;">Sin miembros asignados.</p>`}
          </div>
          <div style="margin-top:10px;display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" data-edit-team="${t.id}">Editar equipo</button>
          </div>
        </div>`;
      }).join('') || `<div class="card">${emptyState('Sin equipos registrados')}</div>`}
    </div>
  `;
}

export function afterRenderTeams() {
  document.getElementById('btn-new-team')?.addEventListener('click', () => openTeamModal(null));
  document.getElementById('btn-new-user')?.addEventListener('click', () => openUserModal(null));
  document.querySelectorAll('button[data-edit-team]').forEach(btn => btn.addEventListener('click', () => openTeamModal(store.find('teams', btn.dataset.editTeam))));
  document.querySelectorAll('button[data-edit-user]').forEach(btn => btn.addEventListener('click', () => openUserModal(store.find('users', btn.dataset.editUser))));
}

function rerender() { const r = document.getElementById('view-root'); r.innerHTML = renderTeams(); afterRenderTeams(); }

function openTeamModal(existing) {
  const teams = store.data.teams.filter(t => t.id !== existing?.id);
  openModal({
    title: existing ? 'Editar equipo' : 'Nuevo equipo',
    bodyHtml: `
      <div class="field"><span>Nombre del equipo/área</span><input id="t-name" value="${escapeHtml(existing?.name || '')}" placeholder="Ej. Comercial & Ventas" /></div>
      <div class="field"><span>Área superior (opcional)</span>
        <select id="t-parent"><option value="">Ninguna (dirección general)</option>
          ${teams.map(t => `<option value="${t.id}" ${existing?.parentId === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}
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
        confirmDialog('Los miembros de este equipo quedarán sin equipo asignado. ¿Continuar?', () => {
          store.data.users.forEach(u => { if (u.teamId === existing.id) u.teamId = null; });
          store.remove('teams', existing.id); toast('Equipo eliminado', 'ok'); close(); rerender();
        });
      });
      document.getElementById('btn-save').addEventListener('click', () => {
        const name = document.getElementById('t-name').value.trim();
        if (!name) { toast('El nombre es obligatorio', 'err'); return; }
        const payload = { name, parentId: document.getElementById('t-parent').value || null };
        if (existing) store.update('teams', existing.id, payload);
        else store.add('teams', payload, 'team');
        toast('Equipo guardado', 'ok'); close(); rerender();
      });
    },
  });
}

function openUserModal(existing) {
  const teams = store.data.teams;
  openModal({
    title: existing ? 'Editar persona' : 'Nueva persona',
    bodyHtml: `
      <div class="field-row">
        <label class="field"><span>Nombre completo</span><input id="u-name" value="${escapeHtml(existing?.name || '')}" /></label>
        <label class="field"><span>Correo</span><input id="u-email" type="email" value="${escapeHtml(existing?.email || '')}" /></label>
      </div>
      <div class="field-row">
        <label class="field"><span>Cargo</span><input id="u-title" value="${escapeHtml(existing?.title || '')}" /></label>
        <label class="field"><span>Equipo</span>
          <select id="u-team"><option value="">Sin equipo</option>${teams.map(t => `<option value="${t.id}" ${existing?.teamId === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}</select>
        </label>
      </div>
      <div class="field"><span>Rol en la plataforma</span>
        <select id="u-role">
          <option value="admin" ${existing?.role === 'admin' ? 'selected' : ''}>Administrador</option>
          <option value="manager" ${!existing || existing?.role === 'manager' ? 'selected' : ''}>Líder de equipo</option>
          <option value="contributor" ${existing?.role === 'contributor' ? 'selected' : ''}>Colaborador</option>
        </select>
        <span class="field-hint">Administrador: control total. Líder: gestiona su equipo. Colaborador: gestiona sus objetivos.</span>
      </div>
    `,
    footHtml: `
      ${existing ? `<button class="btn btn-danger" id="btn-delete" style="margin-right:auto;">Eliminar</button>` : ''}
      <button class="btn btn-secondary" id="btn-cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save">Guardar</button>`,
    onMount: (close) => {
      document.getElementById('btn-cancel').addEventListener('click', close);
      document.getElementById('btn-delete')?.addEventListener('click', () => {
        confirmDialog('Se eliminará esta persona. Los objetivos que le pertenecen no se eliminarán, pero quedarán sin responsable.', () => {
          store.remove('users', existing.id); toast('Persona eliminada', 'ok'); close(); rerender();
        });
      });
      document.getElementById('btn-save').addEventListener('click', () => {
        const name = document.getElementById('u-name').value.trim();
        if (!name) { toast('El nombre es obligatorio', 'err'); return; }
        const payload = {
          name, email: document.getElementById('u-email').value.trim(),
          title: document.getElementById('u-title').value.trim(),
          teamId: document.getElementById('u-team').value || null,
          role: document.getElementById('u-role').value,
        };
        if (existing) store.update('users', existing.id, payload);
        else store.add('users', payload, 'u');
        toast('Persona guardada', 'ok'); close(); rerender();
      });
    },
  });
}
