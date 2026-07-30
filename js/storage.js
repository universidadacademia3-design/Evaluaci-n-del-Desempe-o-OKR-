import { buildDemoData } from './demoData.js';

const KEY_PREFIX = 'okrpro_v1_';
const WORKSPACE_KEY = 'okrpro_v1_active_workspace';
const SESSION_KEY = 'okrpro_v1_session_user';

function key(workspace) {
  return `${KEY_PREFIX}${workspace}`;
}

export function emptyLiveData() {
  const today = new Date();
  const in90 = new Date(); in90.setDate(in90.getDate() + 90);
  return {
    company: { name: 'Mi Empresa', industry: '', framework: 'OKR + Evaluación de Desempeño', currency: 'USD' },
    cycles: [{ id: 'cyc_live_1', name: 'Primer ciclo', startDate: today.toISOString(), endDate: in90.toISOString(), status: 'active' }],
    teams: [{ id: 'team_live_1', name: 'Dirección General', parentId: null }],
    users: [{ id: 'u_live_admin', name: 'Administrador', role: 'admin', title: 'Administrador de la plataforma', teamId: 'team_live_1', email: '' }],
    objectives: [], keyResults: [], checkIns: [], kpis: [], reviews: [],
    activeCycleId: 'cyc_live_1',
  };
}

export function loadWorkspace(workspace) {
  const raw = localStorage.getItem(key(workspace));
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through to seed */ }
  }
  const seeded = workspace === 'demo' ? buildDemoData() : emptyLiveData();
  saveWorkspace(workspace, seeded);
  return seeded;
}

export function saveWorkspace(workspace, data) {
  localStorage.setItem(key(workspace), JSON.stringify(data));
}

export function resetDemoData() {
  const fresh = buildDemoData();
  saveWorkspace('demo', fresh);
  return fresh;
}

export function clearLiveData() {
  const fresh = emptyLiveData();
  saveWorkspace('live', fresh);
  return fresh;
}

export function getActiveWorkspace() {
  return localStorage.getItem(WORKSPACE_KEY) || null;
}
export function setActiveWorkspace(ws) {
  localStorage.setItem(WORKSPACE_KEY, ws);
}

export function getSessionUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function setSessionUser(userId, workspace) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, workspace }));
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
