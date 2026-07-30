import { store } from './state.js';
import { objectiveProgress, objectiveStatus, krProgress, krStatus, statusLabel, fmtDate } from './utils.js';

export function exportExecutiveReportPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const cycle = store.activeCycle;
  const objectives = store.objectivesForCycle();
  const krs = store.data.keyResults;
  const company = store.data.company;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(16, 28, 40);
  doc.rect(0, 0, pageWidth, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(company.name || 'Reporte Ejecutivo', 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Reporte ejecutivo OKR · ${cycle ? cycle.name : 'Sin ciclo activo'} · Generado el ${new Date().toLocaleDateString('es-ES')}`, 40, 60);

  doc.setTextColor(20, 35, 47);

  const overall = objectives.length
    ? Math.round(objectives.reduce((s, o) => s + objectiveProgress(o, krs), 0) / objectives.length)
    : 0;

  let y = 118;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('Resumen general', 40, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  y += 18;
  doc.text(`Progreso promedio del ciclo: ${overall}%`, 40, y); y += 14;
  doc.text(`Objetivos activos: ${objectives.length}`, 40, y); y += 14;
  const counts = { on_track: 0, at_risk: 0, behind: 0, completed: 0, not_started: 0 };
  objectives.forEach(o => counts[objectiveStatus(o, krs, cycle)]++);
  doc.text(`En curso: ${counts.on_track}   En riesgo: ${counts.at_risk}   Retrasados: ${counts.behind}   Completados: ${counts.completed}`, 40, y);
  y += 28;

  const body = [];
  objectives.forEach(o => {
    const owner = store.userById(o.ownerId);
    const rows = store.krsFor(o.id);
    if (!rows.length) {
      body.push([o.title, '—', owner?.name || '—', '—', '—']);
    }
    rows.forEach((kr, i) => {
      body.push([
        i === 0 ? o.title : '',
        kr.title,
        owner?.name || '—',
        `${krProgress(kr)}%`,
        statusLabel(krStatus(kr, cycle)),
      ]);
    });
  });

  doc.autoTable({
    startY: y,
    head: [['Objetivo', 'Resultado clave', 'Responsable', 'Progreso', 'Estado']],
    body,
    styles: { fontSize: 8.5, cellPadding: 5, textColor: [20, 35, 47] },
    headStyles: { fillColor: [59, 76, 138], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [244, 246, 248] },
    margin: { left: 40, right: 40 },
  });

  const finalY = doc.lastAutoTable.finalY + 24;
  doc.setFontSize(8.5);
  doc.setTextColor(90, 100, 110);
  doc.text('Generado con Brújula OKR — Plataforma de gestión por objetivos y resultados clave.', 40, Math.min(finalY, doc.internal.pageSize.getHeight() - 30));

  doc.save(`reporte-ejecutivo-okr-${(cycle?.name || 'ciclo').replace(/\s+/g, '-')}.pdf`);
}
