import { store } from './state.js';
import { krProgress, krStatus, statusLabel } from './utils.js';

function csvEscape(val) {
  const s = String(val ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv() {
  const cycle = store.activeCycle;
  const objectives = store.objectivesForCycle();
  const rows = [['Objetivo', 'Nivel', 'Categoría', 'Responsable', 'Equipo', 'Resultado clave', 'Tipo métrica', 'Inicio', 'Actual', 'Meta', 'Progreso %', 'Estado']];

  objectives.forEach(o => {
    const owner = store.userById(o.ownerId);
    const team = store.teamById(o.teamId);
    const krs = store.krsFor(o.id);
    if (!krs.length) {
      rows.push([o.title, o.level, o.category || '', owner?.name || '', team?.name || '', '', '', '', '', '', '', '']);
    }
    krs.forEach(kr => {
      rows.push([
        o.title, o.level, o.category || '', owner?.name || '', team?.name || '',
        kr.title, kr.metricType, kr.startValue, kr.currentValue, kr.targetValue,
        krProgress(kr), statusLabel(krStatus(kr, cycle)),
      ]);
    });
  });

  const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-okr-${(cycle?.name || 'ciclo').replace(/\s+/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
