const instances = new Map();

function destroyIfExists(canvasId) {
  const existing = instances.get(canvasId);
  if (existing) { existing.destroy(); instances.delete(canvasId); }
}

const PALETTE = {
  on_track: '#1B7F72', at_risk: '#B8862B', behind: '#9C3B34', completed: '#2B5FA8', not_started: '#5B6B78',
};

export function statusDonut(canvasId, counts) {
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const labels = { on_track: 'En curso', at_risk: 'En riesgo', behind: 'Retrasado', completed: 'Completado', not_started: 'Sin iniciar' };
  const keys = Object.keys(counts).filter(k => counts[k] > 0);
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: keys.map(k => labels[k]),
      datasets: [{ data: keys.map(k => counts[k]), backgroundColor: keys.map(k => PALETTE[k]), borderWidth: 0 }],
    },
    options: {
      cutout: '68%',
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
    },
  });
  instances.set(canvasId, chart);
}

export function teamBarChart(canvasId, labels, values) {
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: values.map(v => v >= 70 ? PALETTE.on_track : v >= 40 ? PALETTE.at_risk : PALETTE.behind),
        borderRadius: 6, maxBarThickness: 34,
      }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      scales: { x: { min: 0, max: 100, ticks: { callback: v => v + '%' } }, y: { grid: { display: false } } },
      plugins: { legend: { display: false } },
    },
  });
  instances.set(canvasId, chart);
}

export function trendLineChart(canvasId, labels, series) {
  // series: [{label, data, color}]
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: series.map(s => ({
        label: s.label, data: s.data, borderColor: s.color, backgroundColor: s.color + '22',
        fill: true, tension: 0.35, pointRadius: 3,
      })),
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: series.length > 1, position: 'bottom' } },
      scales: { y: { beginAtZero: true } },
    },
  });
  instances.set(canvasId, chart);
}

export function radarChart(canvasId, labels, values) {
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Progreso (%)', data: values,
        backgroundColor: 'rgba(76,95,163,.18)', borderColor: '#4C5FA3', pointBackgroundColor: '#4C5FA3',
      }],
    },
    options: {
      maintainAspectRatio: false,
      scales: { r: { min: 0, max: 100, ticks: { stepSize: 25 } } },
      plugins: { legend: { display: false } },
    },
  });
  instances.set(canvasId, chart);
}
