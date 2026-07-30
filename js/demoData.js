import { uid } from './utils.js';

// Realistic demo dataset for "Aurora Manufactura S.A.", a mid-size industrial goods company.
// Used to seed the practice workspace so users can explore the platform before real use.

export function buildDemoData() {
  const today = new Date();
  const y = today.getFullYear();

  const cycles = [
    { id: 'cyc_prev', name: `T${quarterOf(today) === 1 ? 4 : quarterOf(today) - 1} ${quarterOf(today) === 1 ? y - 1 : y}`, startDate: isoMonthsAgo(6), endDate: isoMonthsAgo(3), status: 'closed' },
    { id: 'cyc_current', name: `T${quarterOf(today)} ${y}`, startDate: isoMonthsAgo(1.5), endDate: isoMonthsAhead(1.5), status: 'active' },
    { id: 'cyc_next', name: `T${quarterOf(today) === 4 ? 1 : quarterOf(today) + 1} ${quarterOf(today) === 4 ? y + 1 : y}`, startDate: isoMonthsAhead(1.5), endDate: isoMonthsAhead(4.5), status: 'planning' },
  ];

  const teams = [
    { id: 'team_exec', name: 'Dirección General', parentId: null },
    { id: 'team_sales', name: 'Comercial & Ventas', parentId: 'team_exec' },
    { id: 'team_ops', name: 'Operaciones & Producción', parentId: 'team_exec' },
    { id: 'team_product', name: 'Producto & Innovación', parentId: 'team_exec' },
    { id: 'team_people', name: 'Talento Humano', parentId: 'team_exec' },
    { id: 'team_finance', name: 'Finanzas', parentId: 'team_exec' },
    { id: 'team_cs', name: 'Experiencia al Cliente', parentId: 'team_sales' },
  ];

  const users = [
    { id: 'u_ceo', name: 'Marcela Fonseca', role: 'admin', title: 'Directora General (CEO)', teamId: 'team_exec', email: 'mfonseca@aurora-demo.com' },
    { id: 'u_cso', name: 'Diego Herrera', role: 'manager', title: 'Director Comercial', teamId: 'team_sales', email: 'dherrera@aurora-demo.com' },
    { id: 'u_coo', name: 'Paula Rincón', role: 'manager', title: 'Directora de Operaciones', teamId: 'team_ops', email: 'princon@aurora-demo.com' },
    { id: 'u_cpo', name: 'Andrés Salazar', role: 'manager', title: 'Director de Producto', teamId: 'team_product', email: 'asalazar@aurora-demo.com' },
    { id: 'u_chro', name: 'Lucía Barrantes', role: 'manager', title: 'Directora de Talento Humano', teamId: 'team_people', email: 'lbarrantes@aurora-demo.com' },
    { id: 'u_cfo', name: 'Ricardo Mora', role: 'manager', title: 'Director Financiero', teamId: 'team_finance', email: 'rmora@aurora-demo.com' },
    { id: 'u_sales1', name: 'Camila Vindas', role: 'contributor', title: 'Ejecutiva de Cuentas Clave', teamId: 'team_sales', email: 'cvindas@aurora-demo.com' },
    { id: 'u_cs1', name: 'Josué Alpízar', role: 'contributor', title: 'Líder de Experiencia al Cliente', teamId: 'team_cs', email: 'jalpizar@aurora-demo.com' },
    { id: 'u_ops1', name: 'Fabiola Chinchilla', role: 'contributor', title: 'Jefa de Planta', teamId: 'team_ops', email: 'fchinchilla@aurora-demo.com' },
    { id: 'u_prod1', name: 'Mateo Solís', role: 'contributor', title: 'Product Manager', teamId: 'team_product', email: 'msolis@aurora-demo.com' },
  ];

  const objectives = [];
  const keyResults = [];
  const checkIns = [];
  const kpis = [];

  function addObjective(o) {
    const obj = { id: uid('obj'), cycleId: 'cyc_current', createdAt: isoMonthsAgo(1.4), ...o };
    objectives.push(obj);
    return obj;
  }
  function addKR(objectiveId, kr) {
    const rec = { id: uid('kr'), objectiveId, weight: 1, ...kr };
    keyResults.push(rec);
    // synthesize a short check-in history for realism
    const steps = 3;
    for (let i = steps; i >= 1; i--) {
      const frac = (steps - i + 1) / (steps + 1);
      const val = rec.metricType === 'milestone'
        ? null
        : Math.round((rec.startValue + (rec.currentValue - rec.startValue) * frac) * 10) / 10;
      checkIns.push({
        id: uid('ci'),
        keyResultId: rec.id,
        date: isoDaysAgo(i * 9),
        value: val,
        confidence: Math.min(10, 5 + i),
        comment: sampleComment(i),
        authorId: objIn(objectives, objectiveId)?.ownerId || 'u_ceo',
      });
    }
    return rec;
  }

  // ---- Company-level objective ----
  const oCompany = addObjective({
    title: 'Consolidar a Aurora como líder regional en manufactura sostenible',
    description: 'Objetivo estratégico anual de la compañía, desglosado en objetivos de área alineados.',
    level: 'company', ownerId: 'u_ceo', teamId: 'team_exec', alignedTo: null, category: 'Estrategia',
  });
  addKR(oCompany.id, { title: 'Aumentar ingresos recurrentes anuales', metricType: 'currency', unit: '$', startValue: 2.4, targetValue: 3.2, currentValue: 2.85, weight: 2 });
  addKR(oCompany.id, { title: 'Reducir huella de carbono de producción', metricType: 'percentage', unit: '%', startValue: 0, targetValue: 20, currentValue: 11 });
  addKR(oCompany.id, { title: 'Alcanzar certificación ISO 14001', metricType: 'milestone', startValue: 0, targetValue: 1, currentValue: 0, milestoneProgress: 55 });

  // ---- Comercial ----
  const oSales = addObjective({
    title: 'Expandir la base de clientes estratégicos',
    description: 'Fortalecer la cartera de cuentas clave y mejorar la tasa de conversión comercial.',
    level: 'team', ownerId: 'u_cso', teamId: 'team_sales', alignedTo: oCompany.id, category: 'Comercial',
  });
  addKR(oSales.id, { title: 'Nuevas cuentas clave firmadas', metricType: 'numeric', unit: 'cuentas', startValue: 0, targetValue: 12, currentValue: 8 });
  addKR(oSales.id, { title: 'Tasa de conversión de propuestas', metricType: 'percentage', unit: '%', startValue: 18, targetValue: 30, currentValue: 21 });
  addKR(oSales.id, { title: 'Valor promedio de contrato', metricType: 'currency', unit: '$', startValue: 42000, targetValue: 58000, currentValue: 46500 });

  const oCS = addObjective({
    title: 'Elevar la satisfacción y retención de clientes',
    description: 'Mejorar la experiencia postventa y reducir la fuga de clientes existentes.',
    level: 'team', ownerId: 'u_cs1', teamId: 'team_cs', alignedTo: oSales.id, category: 'Comercial',
  });
  addKR(oCS.id, { title: 'Net Promoter Score (NPS)', metricType: 'numeric', unit: 'pts', startValue: 38, targetValue: 55, currentValue: 41 });
  addKR(oCS.id, { title: 'Tasa de renovación de contratos', metricType: 'percentage', unit: '%', startValue: 82, targetValue: 92, currentValue: 84 });

  // ---- Operaciones ----
  const oOps = addObjective({
    title: 'Optimizar la eficiencia operativa de planta',
    description: 'Incrementar productividad y reducir mermas en el proceso productivo.',
    level: 'team', ownerId: 'u_coo', teamId: 'team_ops', alignedTo: oCompany.id, category: 'Operaciones',
  });
  addKR(oOps.id, { title: 'Reducir merma de materia prima', metricType: 'percentage', unit: '%', startValue: 9.4, targetValue: 4, currentValue: 8.1 });
  addKR(oOps.id, { title: 'Incrementar OEE (eficiencia global de equipos)', metricType: 'percentage', unit: '%', startValue: 68, targetValue: 82, currentValue: 70 });
  addKR(oOps.id, { title: 'Certificar líneas bajo ISO 14001', metricType: 'milestone', startValue: 0, targetValue: 1, currentValue: 0, milestoneProgress: 40 });

  // ---- Producto ----
  const oProduct = addObjective({
    title: 'Acelerar el ciclo de innovación de producto',
    description: 'Lanzar nuevas líneas sostenibles y reducir el tiempo de salida al mercado.',
    level: 'team', ownerId: 'u_cpo', teamId: 'team_product', alignedTo: oCompany.id, category: 'Producto',
  });
  addKR(oProduct.id, { title: 'Lanzar nuevas líneas de producto eco-friendly', metricType: 'numeric', unit: 'líneas', startValue: 0, targetValue: 3, currentValue: 3 });
  addKR(oProduct.id, { title: 'Reducir tiempo de desarrollo (idea → mercado)', metricType: 'numeric', unit: 'semanas', startValue: 20, targetValue: 12, currentValue: 13.5 });

  // ---- Talento Humano ----
  const oPeople = addObjective({
    title: 'Fortalecer el compromiso y desarrollo del talento',
    description: 'Mejorar el clima organizacional y reducir la rotación no deseada.',
    level: 'team', ownerId: 'u_chro', teamId: 'team_people', alignedTo: oCompany.id, category: 'Talento Humano',
  });
  addKR(oPeople.id, { title: 'Índice de compromiso (eNPS)', metricType: 'numeric', unit: 'pts', startValue: 22, targetValue: 40, currentValue: 19 });
  addKR(oPeople.id, { title: 'Reducir rotación voluntaria anual', metricType: 'percentage', unit: '%', startValue: 18, targetValue: 10, currentValue: 16.5 });
  addKR(oPeople.id, { title: 'Horas de capacitación por colaborador', metricType: 'numeric', unit: 'hrs', startValue: 6, targetValue: 20, currentValue: 9 });

  // ---- Finanzas ----
  const oFinance = addObjective({
    title: 'Fortalecer la disciplina financiera y rentabilidad',
    description: 'Mejorar márgenes operativos y control de gasto no esencial.',
    level: 'team', ownerId: 'u_cfo', teamId: 'team_finance', alignedTo: oCompany.id, category: 'Finanzas',
  });
  addKR(oFinance.id, { title: 'Margen EBITDA', metricType: 'percentage', unit: '%', startValue: 14, targetValue: 19, currentValue: 17.2 });
  addKR(oFinance.id, { title: 'Reducir días de cobro (DSO)', metricType: 'numeric', unit: 'días', startValue: 58, targetValue: 40, currentValue: 44 });

  // ---- Individual objectives ----
  const oIndiv1 = addObjective({
    title: 'Consolidar mi cartera de cuentas clave',
    description: 'Objetivo individual alineado al área comercial.',
    level: 'individual', ownerId: 'u_sales1', teamId: 'team_sales', alignedTo: oSales.id, category: 'Comercial',
  });
  addKR(oIndiv1.id, { title: 'Reuniones estratégicas con cuentas top 10', metricType: 'numeric', unit: 'reuniones', startValue: 0, targetValue: 10, currentValue: 7 });
  addKR(oIndiv1.id, { title: 'Cierre de oportunidades en pipeline', metricType: 'percentage', unit: '%', startValue: 20, targetValue: 45, currentValue: 33 });

  const oIndiv2 = addObjective({
    title: 'Mejorar la calidad del proceso productivo en mi línea',
    description: 'Objetivo individual alineado a operaciones.',
    level: 'individual', ownerId: 'u_ops1', teamId: 'team_ops', alignedTo: oOps.id, category: 'Operaciones',
  });
  addKR(oIndiv2.id, { title: 'Reducir paradas no programadas', metricType: 'numeric', unit: 'paradas/mes', startValue: 14, targetValue: 5, currentValue: 9 });
  addKR(oIndiv2.id, { title: 'Auditorías 5S aprobadas', metricType: 'percentage', unit: '%', startValue: 60, targetValue: 95, currentValue: 78 });

  // ---- Complementary KPI module (ongoing operational indicators, not tied to a cycle) ----
  kpis.push(
    { id: uid('kpi'), name: 'Tasa de accidentalidad laboral', teamId: 'team_ops', unit: 'eventos/mes', target: 0, current: 1, frequency: 'monthly', direction: 'down', history: kpiHistory([3, 2, 2, 1, 1]) },
    { id: uid('kpi'), name: 'Costo de adquisición de cliente (CAC)', teamId: 'team_sales', unit: '$', target: 900, current: 1120, frequency: 'monthly', direction: 'down', history: kpiHistory([1400, 1300, 1250, 1180, 1120]) },
    { id: uid('kpi'), name: 'Tiempo promedio de respuesta a soporte', teamId: 'team_cs', unit: 'hrs', target: 4, current: 5.6, frequency: 'weekly', direction: 'down', history: kpiHistory([8.1, 7.2, 6.5, 6.0, 5.6]) },
    { id: uid('kpi'), name: 'Liquidez corriente', teamId: 'team_finance', unit: 'x', target: 1.5, current: 1.35, frequency: 'monthly', direction: 'up', history: kpiHistory([1.1, 1.18, 1.22, 1.3, 1.35]) },
    { id: uid('kpi'), name: 'Ausentismo laboral', teamId: 'team_people', unit: '%', target: 3, current: 4.2, frequency: 'monthly', direction: 'down', history: kpiHistory([5.5, 5.1, 4.8, 4.5, 4.2]) },
  );

  // ---- Performance reviews (goal-management complement to OKR) ----
  const reviews = [
    { id: uid('rev'), userId: 'u_sales1', cycleId: 'cyc_current', reviewerId: 'u_cso', status: 'in_progress', selfScore: null, managerScore: null, dueDate: isoMonthsAhead(1) },
    { id: uid('rev'), userId: 'u_ops1', cycleId: 'cyc_current', reviewerId: 'u_coo', status: 'in_progress', selfScore: null, managerScore: null, dueDate: isoMonthsAhead(1) },
    { id: uid('rev'), userId: 'u_prod1', cycleId: 'cyc_prev', reviewerId: 'u_cpo', status: 'completed', selfScore: 4.2, managerScore: 4.0, dueDate: isoMonthsAgo(3.2) },
    { id: uid('rev'), userId: 'u_cs1', cycleId: 'cyc_prev', reviewerId: 'u_cso', status: 'completed', selfScore: 3.8, managerScore: 4.1, dueDate: isoMonthsAgo(3.1) },
  ];

  return {
    company: { name: 'Aurora Manufactura S.A.', industry: 'Manufactura industrial', framework: 'OKR + Evaluación de Desempeño', currency: 'USD' },
    cycles, teams, users, objectives, keyResults, checkIns, kpis, reviews,
    activeCycleId: 'cyc_current',
  };
}

// ---------- helpers ----------
function quarterOf(d) { return Math.floor(d.getMonth() / 3) + 1; }
function isoMonthsAgo(m) { const d = new Date(); d.setDate(d.getDate() - Math.round(m * 30)); return d.toISOString(); }
function isoMonthsAhead(m) { const d = new Date(); d.setDate(d.getDate() + Math.round(m * 30)); return d.toISOString(); }
function isoDaysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
function objIn(list, id) { return list.find(o => o.id === id); }
function kpiHistory(values) {
  return values.map((v, i) => ({ date: isoDaysAgo((values.length - i) * 14), value: v }));
}
function sampleComment(step) {
  const comments = [
    'Avance inicial registrado tras kickoff del ciclo.',
    'Progreso constante; sin bloqueos relevantes esta quincena.',
    'Se ajustó el plan de acción para acelerar el cierre del resultado clave.',
  ];
  return comments[Math.min(step - 1, comments.length - 1)] || 'Actualización de seguimiento.';
}
