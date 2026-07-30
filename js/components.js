import { statusLabel, statusColorVar, initials, escapeHtml } from './utils.js';

export function ringProgress(pct, { size = 64, stroke = 7, color = null, label = null } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c;
  const col = color || (pct >= 100 ? 'var(--signal-done)' : pct >= 60 ? 'var(--signal-on-track)' : pct >= 30 ? 'var(--signal-at-risk)' : 'var(--signal-behind)');
  const lbl = label !== null ? label : `${Math.round(pct)}%`;
  return `
    <span class="ring-progress" style="width:${size}px;height:${size}px;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
        <circle class="ring-value" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"
          stroke="${col}" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
      </svg>
      <span class="ring-label" style="font-size:${size * 0.24}px;">${lbl}</span>
    </span>`;
}

export function badge(status) {
  return `<span class="badge badge-${status}">${statusLabel(status)}</span>`;
}

export function bar(pct, status) {
  const col = statusColorVar(status);
  return `<span class="bar"><span style="width:${Math.max(2, Math.min(100, pct))}%;background:${col};"></span></span>`;
}

export function avatar(name, small = false) {
  return `<span class="avatar" style="${small ? 'width:24px;height:24px;font-size:.65rem;' : ''}">${initials(name)}</span>`;
}

export function confidenceDots(level = 5, max = 10) {
  const filled = Math.round((level / max) * 5);
  let out = '<span class="confidence-dots">';
  for (let i = 0; i < 5; i++) out += `<span class="${i < filled ? 'filled' : ''}"></span>`;
  return out + '</span>';
}

export function personCell(user) {
  if (!user) return '<span class="muted">Sin asignar</span>';
  return `<span class="person-cell">${avatar(user.name, true)} <span>${escapeHtml(user.name)}</span></span>`;
}

// ---------- Modal ----------
export function openModal({ title, bodyHtml, footHtml, onMount, size = 'md' }) {
  const root = document.getElementById('modal-root');
  const width = size === 'lg' ? '760px' : size === 'sm' ? '440px' : '620px';
  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal" style="max-width:${width};">
        <div class="modal-head">
          <h3>${escapeHtml(title)}</h3>
          <button class="modal-close" id="modal-close-btn" aria-label="Cerrar">×</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footHtml ? `<div class="modal-foot">${footHtml}</div>` : ''}
      </div>
    </div>`;
  const backdrop = document.getElementById('modal-backdrop');
  const close = () => { root.innerHTML = ''; };
  document.getElementById('modal-close-btn').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
  });
  if (onMount) onMount(close);
  return close;
}

export function confirmDialog(message, onConfirm, { title = 'Confirmar acción', confirmLabel = 'Eliminar' } = {}) {
  openModal({
    title,
    bodyHtml: `<p style="margin:0;">${escapeHtml(message)}</p>`,
    footHtml: `
      <button class="btn btn-secondary" id="confirm-cancel">Cancelar</button>
      <button class="btn btn-danger" id="confirm-ok">${escapeHtml(confirmLabel)}</button>`,
    onMount: (close) => {
      document.getElementById('confirm-cancel').addEventListener('click', close);
      document.getElementById('confirm-ok').addEventListener('click', () => { onConfirm(); close(); });
    },
  });
}

export function emptyState(message, sub = '') {
  return `<div class="empty-state"><h3>${escapeHtml(message)}</h3>${sub ? `<p>${escapeHtml(sub)}</p>` : ''}</div>`;
}
