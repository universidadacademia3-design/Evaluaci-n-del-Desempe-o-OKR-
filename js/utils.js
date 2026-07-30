export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export function fmtNumber(n, unit = '') {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const num = Number(n);
  const formatted = Math.abs(num % 1) > 0
    ? num.toLocaleString('es-ES', { maximumFractionDigits: 1 })
    : num.toLocaleString('es-ES');
  if (unit === '%') return `${formatted}%`;
  if (unit === '$') return `$${formatted}`;
  return unit ? `${formatted} ${unit}` : formatted;
}

export function daysBetween(a, b) {
  const MS = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b) - new Date(a)) / MS);
}

export function daysRemaining(endIso) {
  return daysBetween(new Date().toISOString(), endIso);
}

// Progress percentage for a Key Result given its metric type and values
export function krProgress(kr) {
  if (kr.metricType === 'milestone') {
    return clamp(kr.currentValue >= kr.targetValue ? 100 : (kr.milestoneProgress || 0));
  }
  const { startValue, targetValue, currentValue } = kr;
  const span = targetValue - startValue;
  if (span === 0) return currentValue >= targetValue ? 100 : 0;
  const pct = ((currentValue - startValue) / span) * 100;
  return clamp(Math.round(pct * 10) / 10);
}

// Status derived from progress vs. time elapsed in the cycle (classic OKR traffic-light logic)
export function krStatus(kr, cycle) {
  const progress = krProgress(kr);
  if (progress >= 100) return 'completed';
  if (!cycle) return progress >= 60 ? 'on_track' : progress >= 30 ? 'at_risk' : 'behind';

  const totalDays = Math.max(1, daysBetween(cycle.startDate, cycle.endDate));
  const elapsed = clamp(daysBetween(cycle.startDate, new Date().toISOString()), 0, totalDays);
  const expectedProgress = (elapsed / totalDays) * 100;

  if (elapsed === 0) return 'not_started';
  const delta = progress - expectedProgress;
  if (delta >= -8) return 'on_track';
  if (delta >= -25) return 'at_risk';
  return 'behind';
}

export function statusLabel(status) {
  return {
    on_track: 'En curso',
    at_risk: 'En riesgo',
    behind: 'Retrasado',
    completed: 'Completado',
    not_started: 'Sin iniciar',
  }[status] || status;
}

export function statusColorVar(status) {
  return {
    on_track: 'var(--signal-on-track)',
    at_risk: 'var(--signal-at-risk)',
    behind: 'var(--signal-behind)',
    completed: 'var(--signal-done)',
    not_started: 'var(--signal-neutral)',
  }[status] || 'var(--signal-neutral)';
}

// Objective progress = weighted average of its Key Results' progress
export function objectiveProgress(objective, allKRs) {
  const krs = allKRs.filter(k => k.objectiveId === objective.id);
  if (krs.length === 0) return 0;
  const totalWeight = krs.reduce((s, k) => s + (k.weight || 1), 0);
  const sum = krs.reduce((s, k) => s + krProgress(k) * (k.weight || 1), 0);
  return Math.round((sum / totalWeight) * 10) / 10;
}

export function objectiveStatus(objective, allKRs, cycle) {
  const krs = allKRs.filter(k => k.objectiveId === objective.id);
  if (krs.length === 0) return 'not_started';
  const statuses = krs.map(k => krStatus(k, cycle));
  if (statuses.every(s => s === 'completed')) return 'completed';
  if (statuses.includes('behind')) return 'behind';
  if (statuses.includes('at_risk')) return 'at_risk';
  if (statuses.every(s => s === 'not_started')) return 'not_started';
  return 'on_track';
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export function toast(message, type = '') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}
