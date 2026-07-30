import { store } from './state.js';
import { loadWorkspace, getSessionUser, setSessionUser, clearSession, getActiveWorkspace, setActiveWorkspace } from './storage.js';
import { registerRoute, setNotFound, startRouter, navigate, currentRouteInfo } from './router.js';
import { initials, escapeHtml } from './utils.js';

import { renderDashboard, afterRenderDashboard } from './views/dashboard.js';
import { renderObjectives, afterRenderObjectives } from './views/objectives.js';
import { renderObjectiveDetail, afterRenderObjectiveDetail } from './views/objectiveDetail.js';
import { renderCheckins, afterRenderCheckins } from './views/checkins.js';
import { renderAlignment, afterRenderAlignment } from './views/alignment.js';
import { renderKpis, afterRenderKpis } from './views/kpis.js';
import { renderTeams, afterRenderTeams } from './views/teams.js';
import { renderReviews, afterRenderReviews } from './views/reviews.js';
import { renderReports, afterRenderReports } from './views/reports.js';
import { renderSettings, afterRenderSettings } from './views/settings.js';
import { renderManual, afterRenderManual } from './views/manual.js';

const PAGE_META = {
  dashboard: ['Panel ejecutivo', 'Resumen de desempeño organizacional'],
  objectives: ['Objetivos & Resultados Clave', 'Define, alinea y da seguimiento a los OKR de tu organización'],
  checkins: ['Check-ins', 'Historial y pendientes de actualización de avance'],
  alignment: ['Mapa de alineación', 'Cómo se conectan los objetivos a través de la organización'],
  kpis: ['Indicadores (KPI)', 'Métricas operativas continuas que sostienen el desempeño'],
  teams: ['Equipos & personas', 'Estructura organizacional y responsables'],
  reviews: ['Evaluación de desempeño', 'Autoevaluación y evaluación del líder por ciclo'],
  reports: ['Reportes & exportación', 'Análisis del ciclo y generación de reportes descargables'],
  settings: ['Configuración', 'Perfil de la organización, ciclos y datos'],
  manual: ['Manual de uso', 'Documentación y guía rápida de la plataforma'],
};

function populateLoginUsers(workspace = 'demo') {
  const data = loadWorkspace(workspace);
  const select = document.getElementById('login-user');
  select.innerHTML = data.users.map(u => `<option value="${u.id}">${escapeHtml(u.name)} — ${escapeHtml(u.title || u.role)}</option>`).join('');
}

function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  renderShell();
  startRouter(onRouteChange);
}

function showAuth() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('main-app').classList.add('hidden');
}

function renderShell() {
  document.getElementById('workspace-label').textContent = store.workspace === 'demo' ? 'Espacio de práctica' : 'Espacio de producción';
  const chip = document.getElementById('current-user-chip');
  chip.textContent = initials(store.currentUser?.name || '?');
  chip.title = store.currentUser?.name || '';

  const cyclePill = document.getElementById('active-cycle-pill');
  cyclePill.textContent = store.activeCycle ? `Ciclo activo: ${store.activeCycle.name}` : 'Sin ciclo activo';

  const cycleSelector = document.getElementById('cycle-selector');
  cycleSelector.innerHTML = store.data.cycles.map(c => `<option value="${c.id}" ${c.id === store.data.activeCycleId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')
    || `<option value="">Sin ciclos</option>`;
}

function onRouteChange(info) {
  const meta = PAGE_META[info.name] || PAGE_META.dashboard;
  document.getElementById('page-title').textContent = info.name === 'objectives' && info.param ? 'Detalle del objetivo' : meta[0];
  document.getElementById('page-subtitle').textContent = meta[1];

  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.route === info.name);
  });

  // close mobile sidebar on navigation
  document.getElementById('sidebar').classList.remove('open');
}

function mountRoutes() {
  registerRoute('dashboard', () => paint(renderDashboard(), afterRenderDashboard));
  registerRoute('objectives', (info) => {
    if (info.param) paint(renderObjectiveDetail(info.param), () => afterRenderObjectiveDetail(info.param));
    else paint(renderObjectives(), afterRenderObjectives);
  });
  registerRoute('checkins', () => paint(renderCheckins(), afterRenderCheckins));
  registerRoute('alignment', () => paint(renderAlignment(), afterRenderAlignment));
  registerRoute('kpis', () => paint(renderKpis(), afterRenderKpis));
  registerRoute('teams', () => paint(renderTeams(), afterRenderTeams));
  registerRoute('reviews', () => paint(renderReviews(), afterRenderReviews));
  registerRoute('reports', () => paint(renderReports(), afterRenderReports));
  registerRoute('settings', () => paint(renderSettings(), afterRenderSettings));
  registerRoute('manual', () => paint(renderManual(), afterRenderManual));
  setNotFound(() => paint(`<div class="card card-pad"><h3>Página no encontrada</h3></div>`, () => {}));
}

function paint(html, after) {
  const root = document.getElementById('view-root');
  root.innerHTML = html;
  if (after) after();
}

function wireShellEvents() {
  document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.getElementById('btn-logout').addEventListener('click', () => {
    clearSession();
    showAuth();
  });
  document.getElementById('cycle-selector').addEventListener('change', (e) => {
    store.setActiveCycle(e.target.value);
    renderShell();
    window.dispatchEvent(new Event('hashchange'));
  });
  window.addEventListener('okr:refresh-shell', renderShell);
}

function boot() {
  populateLoginUsers();

  document.getElementById('login-workspace').addEventListener('change', (e) => {
    populateLoginUsers(e.target.value);
  });

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = document.getElementById('login-user').value;
    const workspace = document.getElementById('login-workspace').value;
    setActiveWorkspace(workspace);
    setSessionUser(userId, workspace);
    store.init(workspace, userId);
    mountRoutes();
    wireShellEvents();
    showApp();
  });

  document.getElementById('btn-open-manual-auth').addEventListener('click', () => {
    window.open('assets/manual-brujula-okr.pdf', '_blank');
  });

  // Resume session if present
  const session = getSessionUser();
  if (session) {
    store.init(session.workspace, session.userId);
    mountRoutes();
    wireShellEvents();
    showApp();
  }
}

boot();
