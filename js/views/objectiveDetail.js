import { store } from '../state.js';
import { krProgress, krStatus, objectiveProgress, objectiveStatus, fmtNumber, fmtDate, escapeHtml, toast } from '../utils.js';
import { ringProgress, badge, bar, personCell, confidenceDots, openModal, confirmDialog, emptyState } from '../components.js';

export function renderObjectiveDetail(id) {
  const o = store.find('objectives', id);
  if (!o) return `<div class="card card-pad">${emptyState('Objetivo no encontrado', 'Puede haber sido eliminado.')}</div>`;

  const cycle = store.data.cycles.find(c => c.id === o.cycleId);
  const krs = store.krsFor(o.id);
  const owner = store.userById(o.ownerId);
  const team = store.teamById(o.teamId);
  const progress = objectiveProgress(o, store.data.keyResults);
  const status = objectiveStatus(o, store.data.keyResults, cycle);
  const parent = o.alignedTo ? store.find('objectives', o.alignedTo) : null;
  const children = store.childObjectives(o.id);

  return `
    <a href="#/objectives" class="link-btn" style="margin-bottom:16px;display:inline-block;">← Volver a objetivos</a>

    <div class="card card-pad" style="margin-bottom:20px;">
      <div class="obj-top">
        <div style="max-width:640px;">
          <p class="muted" style="font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;">
            ${{ company: 'Objetivo de empresa', team: 'Objetivo de equipo', individual: 'Objetivo individual' }[o.level]} · ${cycle ? cycle.name : 'Sin ciclo'}
          </p>
          <h2 style="margin:4px 0 8px;">${escapeHtml(o.title)}</h2>
          <p class="muted">${escapeHtml(o.description || 'Sin descripción.')}</p>
          <div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;font-size:.85rem;">
            <span>👤 ${personCell(owner)}</span>
            <span class="muted">🏢 ${team ? escapeHtml(team.name) : 'Sin equipo'}</span>
            ${parent ? `<span class="muted">⌆ Alineado a: <a href="#/objectives/${parent.id}">${escapeHtml(parent.title)}</a></span>` : ''}
          </div>
        </div>
        <div style="text-align:center;">
          ${ringProgress(progress, { size: 84, stroke: 8 })}
          <div style="margin-top:8px;">${badge(status)}</div>
        </div>
      </div>
      <div style="margin-top:16px;display:flex;gap:10px;">
        <button class="btn btn-secondary btn-sm" id="btn-edit-objective">Editar objetivo</button>
      </div>
    </div>

    ${children.length ? `
    <div class="section-title"><h2>Objetivos alineados</h2></div>
    <div class="grid grid-3" style="margin-bottom:10px;">
      ${children.map(c => {
        const p = objectiveProgress(c, store.data.keyResults);
        const s = objectiveStatus(c, store.data.keyResults, cycle);
        return `<a href="#/objectives/${c.id}" class="card objective-card" style="text-decoration:none;">
          <div class="obj-top"><h4>${escapeHtml(c.title)}</h4>${ringProgress(p, { size: 40, stroke: 4 })}</div>
          <div style="margin-top:8px;">${badge(s)}</div>
        </a>`;
      }).join('')}
    </div>` : ''}

    <div class="section-title">
      <h2>Resultados clave (${krs.length})</h2>
      <button class="btn btn-primary btn-sm" id="btn-new-kr">+ Nuevo resultado clave</button>
    </div>

    <div style="display:grid;gap:14px;">
      ${krs.length ? krs.map(kr => krCard(kr, cycle)).join('') : `<div class="card card-pad">${emptyState('Sin resultados clave', 'Agrega al menos uno para poder medir el avance de este objetivo.')}</div>`}
    </div>
  `;
}

function krCard(kr, cycle) {
  const progress = krProgress(kr);
  const status = krStatus(kr, cycle);
  const checkIns = store.checkInsFor(kr.id);
  const unitDisplay = kr.metricType === 'currency' ? '$' : kr.metricType === 'percentage' ? '%' : (kr.unit || '');
  return `
  <div class="card card-pad kr-row" data-kr="${kr.id}">
    <div class="kr-row-top">
      <div>
        <h4>${escapeHtml(kr.title)}</h4>
        ${kr.metricType !== 'milestone' ? `
        <div class="kr-values">
          <span>Inicio: ${fmtNumber(kr.startValue, unitDisplay)}</span>
          <span>Actual: <strong>${fmtNumber(kr.currentValue, unitDisplay)}</strong></span>
          <span>Meta: ${fmtNumber(kr.targetValue, unitDisplay)}</span>
        </div>` : `<p class="muted" style="font-size:.8rem;margin:2px 0;">Hito binario (completado / pendiente)</p>`}
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        ${badge(status)}
        <button class="btn btn-secondary btn-sm" data-checkin="${kr.id}">Registrar avance</button>
        <button class="btn btn-secondary btn-sm" data-edit-kr="${kr.id}">Editar</button>
      </div>
    </div>
    ${bar(progress, status)}
    <p class="muted" style="font-size:.78rem;margin:2px 0 0;">${progress}% de avance ${checkIns[0] ? `· última actualización ${fmtDate(checkIns[0].date)}` : '· sin actualizaciones aún'}</p>

    ${checkIns.length ? `
    <details style="margin-top:6px;">
      <summary style="cursor:pointer;font-size:.8rem;color:var(--brand-600);font-weight:600;">Historial de check-ins (${checkIns.length})</summary>
      <div style="margin-top:10px;">
        ${checkIns.map(ci => {
          const u = store.userById(ci.authorId);
          return `<div class="checkin-item">
            <div class="ci-body">
              <div class="ci-meta">
                <strong style="color:var(--ink-800);">${u ? escapeHtml(u.name) : 'Usuario'}</strong>
                <span>${fmtDate(ci.date)}</span>
                ${ci.value !== null && ci.value !== undefined ? `<span class="mono">valor: ${fmtNumber(ci.value, unitDisplay)}</span>` : ''}
                <span>Confianza: ${confidenceDots(ci.confidence)}</span>
              </div>
              ${ci.comment ? `<p style="margin:4px 0 0;">${escapeHtml(ci.comment)}</p>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </details>` : ''}
  </div>`;
}

export function afterRenderObjectiveDetail(id) {
  document.getElementById('btn-edit-objective')?.addEventListener('click', async () => {
    const { openObjectiveModal } = await import('./objectives.js');
    openObjectiveModal(store.find('objectives', id));
  });
  document.getElementById('btn-new-kr')?.addEventListener('click', () => openKRModal(id, null));
  document.querySelectorAll('button[data-edit-kr]').forEach(btn => {
    btn.addEventListener('click', () => openKRModal(id, store.find('keyResults', btn.dataset.editKr)));
  });
  document.querySelectorAll('button[data-checkin]').forEach(btn => {
    btn.addEventListener('click', () => openCheckInModal(btn.dataset.checkin, id));
  });
}

function rerenderDetail(id) {
  const root = document.getElementById('view-root');
  root.innerHTML = renderObjectiveDetail(id);
  afterRenderObjectiveDetail(id);
}

function openKRModal(objectiveId, existing) {
  openModal({
    title: existing ? 'Editar resultado clave' : 'Nuevo resultado clave',
    size: 'md',
    bodyHtml: `
      <div class="field">
        <span>Título del resultado clave</span>
        <input id="kr-title" type="text" placeholder="Ej. Aumentar ingresos recurrentes anuales" value="${escapeHtml(existing?.title || '')}" />
      </div>
      <div class="field-row">
        <label class="field"><span>Tipo de métrica</span>
          <select id="kr-type">
            <option value="numeric" ${existing?.metricType === 'numeric' ? 'selected' : ''}>Numérica</option>
            <option value="percentage" ${existing?.metricType === 'percentage' ? 'selected' : ''}>Porcentaje</option>
            <option value="currency" ${existing?.metricType === 'currency' ? 'selected' : ''}>Monetaria</option>
            <option value="milestone" ${existing?.metricType === 'milestone' ? 'selected' : ''}>Hito (Sí/No)</option>
          </select>
        </label>
        <label class="field"><span>Unidad (opcional)</span>
          <input id="kr-unit" type="text" placeholder="Ej. clientes, hrs, pts" value="${escapeHtml(existing?.unit || '')}" />
        </label>
      </div>
      <div id="kr-numeric-fields" class="field-row">
        <label class="field"><span>Valor inicial</span><input id="kr-start" type="number" step="any" value="${existing?.startValue ?? 0}" /></label>
        <label class="field"><span>Valor meta</span><input id="kr-target" type="number" step="any" value="${existing?.targetValue ?? 100}" /></label>
      </div>
      <div class="field">
        <span>Ponderación (peso relativo dentro del objetivo)</span>
        <input id="kr-weight" type="number" min="1" max="5" value="${existing?.weight ?? 1}" />
        <span class="field-hint">1 = peso estándar. Usa valores mayores para resultados clave más críticos.</span>
      </div>
    `,
    footHtml: `
      ${existing ? `<button class="btn btn-danger" id="btn-delete-kr" style="margin-right:auto;">Eliminar</button>` : ''}
      <button class="btn btn-secondary" id="btn-cancel">Cancelar</button>
      <button class="btn btn-primary" id="btn-save">${existing ? 'Guardar cambios' : 'Crear resultado clave'}</button>
    `,
    onMount: (close) => {
      const typeSel = document.getElementById('kr-type');
      const toggleFields = () => {
        document.getElementById('kr-numeric-fields').style.display = typeSel.value === 'milestone' ? 'none' : 'grid';
      };
      typeSel.addEventListener('change', toggleFields); toggleFields();

      document.getElementById('btn-cancel').addEventListener('click', close);
      document.getElementById('btn-delete-kr')?.addEventListener('click', () => {
        confirmDialog('Se eliminará este resultado clave y su historial de check-ins.', () => {
          store.data.checkIns = store.data.checkIns.filter(c => c.keyResultId !== existing.id);
          store.remove('keyResults', existing.id);
          toast('Resultado clave eliminado', 'ok');
          close(); rerenderDetail(objectiveId);
        });
      });
      document.getElementById('btn-save').addEventListener('click', () => {
        const title = document.getElementById('kr-title').value.trim();
        if (!title) { toast('El título es obligatorio', 'err'); return; }
        const metricType = typeSel.value;
        const payload = {
          title, metricType,
          unit: document.getElementById('kr-unit').value.trim(),
          weight: Number(document.getElementById('kr-weight').value) || 1,
        };
        if (metricType === 'milestone') {
          payload.startValue = 0; payload.targetValue = 1;
          payload.currentValue = existing?.currentValue ?? 0;
          payload.milestoneProgress = existing?.milestoneProgress ?? 0;
        } else {
          payload.startValue = Number(document.getElementById('kr-start').value);
          payload.targetValue = Number(document.getElementById('kr-target').value);
          payload.currentValue = existing?.currentValue ?? payload.startValue;
        }
        if (existing) {
          store.update('keyResults', existing.id, payload);
          toast('Resultado clave actualizado', 'ok');
        } else {
          store.add('keyResults', { ...payload, objectiveId }, 'kr');
          toast('Resultado clave creado', 'ok');
        }
        close(); rerenderDetail(objectiveId);
      });
    },
  });
}

function openCheckInModal(krId, objectiveId) {
  const kr = store.find('keyResults', krId);
  const isMilestone = kr.metricType === 'milestone';
  openModal({
    title: `Registrar avance · ${kr.title}`,
    size: 'sm',
    bodyHtml: `
      ${isMilestone ? `
      <div class="field">
        <span>Progreso del hito (%)</span>
        <input id="ci-milestone" type="range" min="0" max="100" value="${kr.milestoneProgress || 0}" oninput="document.getElementById('ci-milestone-val').textContent=this.value+'%'" />
        <span class="field-hint" id="ci-milestone-val">${kr.milestoneProgress || 0}%</span>
      </div>` : `
      <div class="field">
        <span>Nuevo valor actual</span>
        <input id="ci-value" type="number" step="any" value="${kr.currentValue}" />
      </div>`}
      <div class="field">
        <span>Nivel de confianza (1 = bajo, 10 = alto)</span>
        <input id="ci-confidence" type="range" min="1" max="10" value="7" oninput="document.getElementById('ci-conf-val').textContent=this.value" />
        <span class="field-hint" id="ci-conf-val">7</span>
      </div>
      <div class="field">
        <span>Comentario de seguimiento</span>
        <textarea id="ci-comment" placeholder="¿Qué avanzó? ¿Hay bloqueos?"></textarea>
      </div>
    `,
    footHtml: `<button class="btn btn-secondary" id="btn-cancel">Cancelar</button><button class="btn btn-primary" id="btn-save">Guardar check-in</button>`,
    onMount: (close) => {
      document.getElementById('btn-cancel').addEventListener('click', close);
      document.getElementById('btn-save').addEventListener('click', () => {
        const confidence = Number(document.getElementById('ci-confidence').value);
        const comment = document.getElementById('ci-comment').value.trim();
        let value = null;
        if (isMilestone) {
          const mp = Number(document.getElementById('ci-milestone').value);
          store.update('keyResults', kr.id, { milestoneProgress: mp, currentValue: mp >= 100 ? 1 : 0 });
        } else {
          value = Number(document.getElementById('ci-value').value);
          store.update('keyResults', kr.id, { currentValue: value });
        }
        store.add('checkIns', {
          keyResultId: kr.id, date: new Date().toISOString(), value, confidence, comment,
          authorId: store.currentUserId,
        }, 'ci');
        toast('Check-in registrado', 'ok');
        close(); rerenderDetail(objectiveId);
      });
    },
  });
}
