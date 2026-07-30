import { store } from '../state.js';
import { objectiveProgress, fmtDate, escapeHtml, toast } from '../utils.js';
import { personCell, badge, openModal, emptyState } from '../components.js';

const statusMap = { in_progress: 'at_risk', completed: 'completed', pending: 'not_started' };
const statusText = { in_progress: 'En proceso', completed: 'Completada', pending: 'Pendiente' };

export function renderReviews() {
  const reviews = store.data.reviews || [];
  const cycle = store.activeCycle;

  return `
    <div class="alert alert-info" style="margin-bottom:20px;">
      La evaluación de desempeño complementa al OKR con una revisión cualitativa periódica (autoevaluación + evaluación del líder), siguiendo el enfoque clásico de Administración por Objetivos (APO).
    </div>
    <div class="toolbar">
      <div class="spacer"></div>
      <button class="btn btn-primary" id="btn-new-review">+ Nueva evaluación</button>
    </div>
    <div class="table-wrap card">
      <table class="data-table">
        <thead><tr><th>Colaborador</th><th>Ciclo</th><th>Evaluador</th><th>Autoevaluación</th><th>Evaluación líder</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          ${reviews.length ? reviews.map(rowHtml).join('') : `<tr><td colspan="7">${emptyState('Sin evaluaciones registradas')}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function rowHtml(r) {
  const user = store.userById(r.userId);
  const reviewer = store.userById(r.reviewerId);
  const cycle = store.data.cycles.find(c => c.id === r.cycleId);
  return `
    <tr>
      <td>${personCell(user)}</td>
      <td>${cycle ? escapeHtml(cycle.name) : '—'}</td>
      <td>${personCell(reviewer)}</td>
      <td>${r.selfScore ? r.selfScore.toFixed(1) + ' / 5' : '<span class="muted">Pendiente</span>'}</td>
      <td>${r.managerScore ? r.managerScore.toFixed(1) + ' / 5' : '<span class="muted">Pendiente</span>'}</td>
      <td><span class="badge badge-${statusMap[r.status]}">${statusText[r.status]}</span></td>
      <td><button class="btn btn-secondary btn-sm" data-edit-review="${r.id}">Editar</button></td>
    </tr>`;
}

export function afterRenderReviews() {
  document.getElementById('btn-new-review')?.addEventListener('click', () => openReviewModal(null));
  document.querySelectorAll('button[data-edit-review]').forEach(btn => {
    btn.addEventListener('click', () => openReviewModal(store.data.reviews.find(r => r.id === btn.dataset.editReview)));
  });
}

function rerender() { const r = document.getElementById('view-root'); r.innerHTML = renderReviews(); afterRenderReviews(); }

function openReviewModal(existing) {
  const users = store.data.users;
  const cycles = store.data.cycles;
  openModal({
    title: existing ? 'Editar evaluación' : 'Nueva evaluación de desempeño',
    bodyHtml: `
      <div class="field-row">
        <label class="field"><span>Colaborador</span>
          <select id="r-user">${users.map(u => `<option value="${u.id}" ${existing?.userId === u.id ? 'selected' : ''}>${escapeHtml(u.name)}</option>`).join('')}</select>
        </label>
        <label class="field"><span>Evaluador</span>
          <select id="r-reviewer">${users.map(u => `<option value="${u.id}" ${existing?.reviewerId === u.id ? 'selected' : ''}>${escapeHtml(u.name)}</option>`).join('')}</select>
        </label>
      </div>
      <div class="field-row">
        <label class="field"><span>Ciclo</span>
          <select id="r-cycle">${cycles.map(c => `<option value="${c.id}" ${(existing?.cycleId || store.data.activeCycleId) === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select>
        </label>
        <label class="field"><span>Estado</span>
          <select id="r-status">
            <option value="pending" ${existing?.status === 'pending' ? 'selected' : ''}>Pendiente</option>
            <option value="in_progress" ${!existing || existing?.status === 'in_progress' ? 'selected' : ''}>En proceso</option>
            <option value="completed" ${existing?.status === 'completed' ? 'selected' : ''}>Completada</option>
          </select>
        </label>
      </div>
      <div class="field-row">
        <label class="field"><span>Autoevaluación (1–5)</span><input id="r-self" type="number" min="1" max="5" step="0.1" value="${existing?.selfScore ?? ''}" /></label>
        <label class="field"><span>Evaluación del líder (1–5)</span><input id="r-manager" type="number" min="1" max="5" step="0.1" value="${existing?.managerScore ?? ''}" /></label>
      </div>
    `,
    footHtml: `<button class="btn btn-secondary" id="btn-cancel">Cancelar</button><button class="btn btn-primary" id="btn-save">Guardar</button>`,
    onMount: (close) => {
      document.getElementById('btn-cancel').addEventListener('click', close);
      document.getElementById('btn-save').addEventListener('click', () => {
        const payload = {
          userId: document.getElementById('r-user').value,
          reviewerId: document.getElementById('r-reviewer').value,
          cycleId: document.getElementById('r-cycle').value,
          status: document.getElementById('r-status').value,
          selfScore: parseFloat(document.getElementById('r-self').value) || null,
          managerScore: parseFloat(document.getElementById('r-manager').value) || null,
          dueDate: existing?.dueDate || new Date().toISOString(),
        };
        if (existing) store.update('reviews', existing.id, payload);
        else store.add('reviews', payload, 'rev');
        toast('Evaluación guardada', 'ok'); close(); rerender();
      });
    },
  });
}
