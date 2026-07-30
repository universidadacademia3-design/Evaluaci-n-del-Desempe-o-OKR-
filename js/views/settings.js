import { store } from '../state.js';
import { resetDemoData, clearLiveData } from '../storage.js';
import { fmtDate, escapeHtml, toast } from '../utils.js';
import { openModal, confirmDialog, emptyState } from '../components.js';

export function renderSettings() {
  const c = store.data.company;
  const cycles = store.data.cycles;
  const isDemo = store.workspace === 'demo';

  return `
    <div class="settings-section card card-pad">
      <div class="card-header"><h3>Perfil de la organización</h3></div>
      <div class="field-row">
        <label class="field"><span>Nombre de la empresa</span><input id="s-company-name" value="${escapeHtml(c.name)}" /></label>
        <label class="field"><span>Sector / industria</span><input id="s-company-industry" value="${escapeHtml(c.industry || '')}" /></label>
      </div>
      <div class="field-row" style="margin-top:12px;">
        <label class="field"><span>Metodología aplicada</span>
          <select id="s-framework">
            <option ${c.framework?.includes('OKR') ? 'selected' : ''} value="OKR + Evaluación de Desempeño">OKR + Evaluación de Desempeño</option>
            <option ${c.framework === 'OKR' ? 'selected' : ''} value="OKR">Solo OKR</option>
            <option ${c.framework === 'APO' ? 'selected' : ''} value="APO">Administración por Objetivos (APO)</option>
            <option ${c.framework === 'BSC' ? 'selected' : ''} value="BSC">Balanced Scorecard + OKR</option>
          </select>
        </label>
        <label class="field"><span>Moneda</span>
          <select id="s-currency">
            <option value="USD" ${c.currency === 'USD' ? 'selected' : ''}>USD — Dólar</option>
            <option value="EUR" ${c.currency === 'EUR' ? 'selected' : ''}>EUR — Euro</option>
            <option value="MXN" ${c.currency === 'MXN' ? 'selected' : ''}>MXN — Peso mexicano</option>
            <option value="COP" ${c.currency === 'COP' ? 'selected' : ''}>COP — Peso colombiano</option>
            <option value="CRC" ${c.currency === 'CRC' ? 'selected' : ''}>CRC — Colón costarricense</option>
          </select>
        </label>
      </div>
      <button class="btn btn-primary" id="btn-save-company" style="margin-top:14px;">Guardar cambios</button>
    </div>

    <div class="settings-section card card-pad">
      <div class="card-header"><h3>Ciclos de evaluación</h3><button class="btn btn-secondary btn-sm" id="btn-new-cycle">+ Nuevo ciclo</button></div>
      <div style="display:grid;gap:2px;">
        ${cycles.length ? cycles.map(cy => `
          <div class="list-row">
            <div>
              <strong>${escapeHtml(cy.name)}</strong> ${cy.id === store.data.activeCycleId ? '<span class="badge badge-on_track">Activo</span>' : ''}
              <p class="muted" style="margin:2px 0 0;font-size:.78rem;">${fmtDate(cy.startDate)} – ${fmtDate(cy.endDate)}</p>
            </div>
            <div style="display:flex;gap:8px;">
              ${cy.id !== store.data.activeCycleId ? `<button class="btn btn-secondary btn-sm" data-activate="${cy.id}">Activar</button>` : ''}
              <button class="btn btn-secondary btn-sm" data-del-cycle="${cy.id}">Eliminar</button>
            </div>
          </div>`).join('') : emptyState('Sin ciclos configurados', 'Crea un ciclo trimestral o anual para comenzar a registrar objetivos.')}
      </div>
    </div>

    <div class="settings-section card card-pad">
      <div class="card-header"><h3>Espacio de trabajo</h3></div>
      <p class="muted">Estás usando el espacio de <strong>${isDemo ? 'práctica (datos de ejemplo)' : 'producción (datos reales)'}</strong>.</p>
      ${isDemo ? `
        <button class="btn btn-secondary" id="btn-reset-demo">Restablecer datos de ejemplo</button>
        <p class="field-hint" style="margin-top:8px;">Vuelve a cargar el set de datos original de práctica. Se perderán los cambios realizados en este espacio.</p>
      ` : `
        <button class="btn btn-danger" id="btn-clear-live">Borrar todos los datos de producción</button>
        <p class="field-hint" style="margin-top:8px;">Elimina permanentemente todos los objetivos, equipos y personas del espacio de producción.</p>
      `}
    </div>

    <div class="settings-section card card-pad">
      <div class="card-header"><h3>Acerca de la metodología</h3></div>
      <p class="muted" style="font-size:.87rem;">
        Esta plataforma implementa <strong>OKR (Objetivos y Resultados Clave)</strong> como metodología principal, complementada con
        <strong>indicadores KPI</strong> de seguimiento continuo y <strong>evaluaciones de desempeño</strong> periódicas propias de la
        Administración por Objetivos (APO). Consulta el <a href="#/manual">manual de uso</a> para una guía detallada de cada componente.
      </p>
    </div>
  `;
}

export function afterRenderSettings() {
  document.getElementById('btn-save-company')?.addEventListener('click', () => {
    store.data.company = {
      ...store.data.company,
      name: document.getElementById('s-company-name').value.trim() || store.data.company.name,
      industry: document.getElementById('s-company-industry').value.trim(),
      framework: document.getElementById('s-framework').value,
      currency: document.getElementById('s-currency').value,
    };
    store.persist();
    toast('Perfil de la organización actualizado', 'ok');
    rerender();
  });

  document.getElementById('btn-new-cycle')?.addEventListener('click', () => openCycleModal());

  document.querySelectorAll('button[data-activate]').forEach(btn => {
    btn.addEventListener('click', () => { store.setActiveCycle(btn.dataset.activate); toast('Ciclo activo actualizado', 'ok'); rerender(); });
  });
  document.querySelectorAll('button[data-del-cycle]').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmDialog('Se eliminará el ciclo. Los objetivos asociados no se eliminarán pero quedarán sin ciclo.', () => {
        store.remove('cycles', btn.dataset.delCycle);
        toast('Ciclo eliminado', 'ok'); rerender();
      });
    });
  });

  document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
    confirmDialog('Se restablecerán los datos de ejemplo a su estado original.', () => {
      store.data = resetDemoData();
      toast('Datos de ejemplo restablecidos', 'ok');
      rerender();
    }, { title: 'Restablecer datos de práctica', confirmLabel: 'Restablecer' });
  });
  document.getElementById('btn-clear-live')?.addEventListener('click', () => {
    confirmDialog('Esta acción eliminará permanentemente todos los datos de producción: objetivos, equipos, personas y evaluaciones.', () => {
      store.data = clearLiveData();
      toast('Datos de producción eliminados', 'ok');
      rerender();
    }, { title: 'Borrar datos de producción', confirmLabel: 'Borrar todo' });
  });
}

function rerender() {
  const root = document.getElementById('view-root');
  root.innerHTML = renderSettings();
  afterRenderSettings();
  window.dispatchEvent(new CustomEvent('okr:refresh-shell'));
}

function openCycleModal() {
  const today = new Date();
  const in90 = new Date(); in90.setDate(in90.getDate() + 90);
  openModal({
    title: 'Nuevo ciclo de evaluación',
    bodyHtml: `
      <div class="field"><span>Nombre del ciclo</span><input id="c-name" placeholder="Ej. T3 2026" /></div>
      <div class="field-row">
        <label class="field"><span>Fecha de inicio</span><input id="c-start" type="date" value="${today.toISOString().slice(0, 10)}" /></label>
        <label class="field"><span>Fecha de cierre</span><input id="c-end" type="date" value="${in90.toISOString().slice(0, 10)}" /></label>
      </div>
    `,
    footHtml: `<button class="btn btn-secondary" id="btn-cancel">Cancelar</button><button class="btn btn-primary" id="btn-save">Crear ciclo</button>`,
    onMount: (close) => {
      document.getElementById('btn-cancel').addEventListener('click', close);
      document.getElementById('btn-save').addEventListener('click', () => {
        const name = document.getElementById('c-name').value.trim();
        if (!name) { toast('El nombre del ciclo es obligatorio', 'err'); return; }
        const cyc = store.add('cycles', {
          name,
          startDate: new Date(document.getElementById('c-start').value).toISOString(),
          endDate: new Date(document.getElementById('c-end').value).toISOString(),
          status: 'active',
        }, 'cyc');
        if (!store.data.activeCycleId) { store.data.activeCycleId = cyc.id; store.persist(); }
        toast('Ciclo creado', 'ok'); close(); rerender();
      });
    },
  });
}
