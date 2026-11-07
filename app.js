/**
 * SIMULADOR EDO: MODELO LOGÍSTICO DE BIENESTAR ANIMAL
 * Métodos Numéricos: Solución Analítica, Heun (RK2) y Runge-Kutta 4 (RK4)
 */

// Estado global de la simulación
let currentSimulationData = null;
let mainChart = null;
let currentChartTab = 'curves'; // 'curves' o 'errors'

// Función de la EDO: f(t, y) = r * y * (1 - y / K)
function odeF(t, y, r, K) {
  return r * y * (1.0 - y / K);
}

// Solución analítica exacta: y(t) = K / (1 + A * exp(-r * t)), donde A = (K - y0) / y0
function exactSolution(t, y0, K, r) {
  const A = (K - y0) / y0;
  return K / (1.0 + A * Math.exp(-r * t));
}

// Tiempo exacto para alcanzar una meta yTarget
function calculateTargetTime(yTarget, y0, K, r) {
  if (yTarget <= y0 || yTarget >= K) return null;
  const A = (K - y0) / y0;
  // yTarget = K / (1 + A * exp(-r * t)) => 1 + A * exp(-r * t) = K / yTarget
  const val = (K / yTarget - 1.0) / A;
  if (val <= 0) return null;
  return -Math.log(val) / r;
}

// Algoritmo de Heun (RK2 Predictor-Corrector)
function runHeun(y0, K, r, h, T) {
  const steps = Math.round(T / h);
  const t = [];
  const y = [];

  t.push(0);
  y.push(y0);

  for (let i = 0; i < steps; i++) {
    const ti = t[i];
    const yi = y[i];

    // Predictor (Euler)
    const k1 = odeF(ti, yi, r, K);
    const yPredictor = yi + h * k1;

    // Corrector (Trapecio)
    const k2 = odeF(ti + h, yPredictor, r, K);
    const yNext = yi + (h / 2.0) * (k1 + k2);

    t.push(Number((ti + h).toFixed(8)));
    y.push(yNext);
  }

  return { t, y };
}

// Algoritmo de Runge-Kutta de 4.° Orden (RK4)
function runRK4(y0, K, r, h, T) {
  const steps = Math.round(T / h);
  const t = [];
  const y = [];

  t.push(0);
  y.push(y0);

  for (let i = 0; i < steps; i++) {
    const ti = t[i];
    const yi = y[i];

    const k1 = odeF(ti, yi, r, K);
    const k2 = odeF(ti + 0.5 * h, yi + 0.5 * h * k1, r, K);
    const k3 = odeF(ti + 0.5 * h, yi + 0.5 * h * k2, r, K);
    const k4 = odeF(ti + h, yi + h * k3, r, K);

    const yNext = yi + (h / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4);

    t.push(Number((ti + h).toFixed(8)));
    y.push(yNext);
  }

  return { t, y };
}

// Ejecución completa de simulación y cálculo de errores
function computeSimulation(params) {
  const { y0, K, r, h, T, goalPercent } = params;

  const targetY = (goalPercent / 100.0) * K;
  const targetTime = calculateTargetTime(targetY, y0, K, r);

  const heunRes = runHeun(y0, K, r, h, T);
  const rk4Res = runRK4(y0, K, r, h, T);

  const stepsCount = heunRes.t.length;
  const tableData = [];

  let maxHeunRelError = 0;
  let maxRK4RelError = 0;

  for (let i = 0; i < stepsCount; i++) {
    const ti = heunRes.t[i];
    const yExact = exactSolution(ti, y0, K, r);
    const yHeun = heunRes.y[i];
    const yRK4 = rk4Res.y[i];

    const errHeunAbs = Math.abs(yExact - yHeun);
    const errHeunRel = yExact !== 0 ? (errHeunAbs / yExact) * 100.0 : 0;

    const errRK4Abs = Math.abs(yExact - yRK4);
    const errRK4Rel = yExact !== 0 ? (errRK4Abs / yExact) * 100.0 : 0;

    if (errHeunRel > maxHeunRelError) maxHeunRelError = errHeunRel;
    if (errRK4Rel > maxRK4RelError) maxRK4RelError = errRK4Rel;

    tableData.push({
      step: i,
      t: ti,
      yExact,
      yHeun,
      errHeunAbs,
      errHeunRel,
      yRK4,
      errRK4Abs,
      errRK4Rel,
    });
  }

  return {
    params,
    targetY,
    targetTime,
    maxHeunRelError,
    maxRK4RelError,
    data: tableData,
  };
}

// Actualizar Tarjetas KPI
function updateKPIs(sim) {
  const { params, targetY, targetTime, maxHeunRelError, maxRK4RelError } = sim;

  // KPI 1: Tiempo meta
  const kpiTargetTimeEl = document.getElementById('kpiTargetTime');
  const kpiTargetDescEl = document.getElementById('kpiTargetDesc');
  if (targetTime !== null) {
    kpiTargetTimeEl.textContent = targetTime.toFixed(2);
    const weeks = Math.floor(targetTime);
    const days = Math.round((targetTime - weeks) * 7);
    kpiTargetDescEl.textContent = `Para alcanzar ${targetY.toFixed(0)} adopciones (${weeks} sem y ${days} días)`;
  } else {
    kpiTargetTimeEl.textContent = 'N/A';
    kpiTargetDescEl.textContent = 'Meta fuera de rango alcanzable';
  }

  // KPI 2: Error Heun
  const kpiHeunEl = document.getElementById('kpiHeunError');
  kpiHeunEl.textContent = maxHeunRelError < 0.001 
    ? maxHeunRelError.toExponential(3) + '%' 
    : maxHeunRelError.toFixed(4) + '%';

  // KPI 3: Error RK4
  const kpiRK4El = document.getElementById('kpiRK4Error');
  kpiRK4El.textContent = maxRK4RelError < 0.0001 
    ? maxRK4RelError.toExponential(3) + '%' 
    : maxRK4RelError.toFixed(6) + '%';

  // KPI 4: Factor de ventaja
  const kpiFactorEl = document.getElementById('kpiPrecisionFactor');
  if (maxRK4RelError > 0) {
    const factor = maxHeunRelError / maxRK4RelError;
    kpiFactorEl.textContent = factor >= 1000 
      ? Math.round(factor).toLocaleString() + 'x' 
      : factor.toFixed(1) + 'x';
  } else {
    kpiFactorEl.textContent = 'Infinito';
  }

  // Leyenda de la meta
  document.getElementById('labelLegendGoal').textContent = `Meta ${params.goalPercent}% (${targetY.toFixed(0)} adopciones)`;
}

// Renderizar o actualizar gráfica Chart.js
function renderChart(sim) {
  const ctx = document.getElementById('mainChart').getContext('2d');
  const chartTitleEl = document.getElementById('chartTitle');

  // Reducir número de puntos para la gráfica si hay demasiados (para rendimiento óptimo)
  const maxPlotPoints = 200;
  const stride = Math.max(1, Math.floor(sim.data.length / maxPlotPoints));
  const plotData = sim.data.filter((_, idx) => idx % stride === 0 || idx === sim.data.length - 1);

  const labels = plotData.map(d => d.t.toFixed(2));

  if (mainChart) {
    mainChart.destroy();
  }

  if (currentChartTab === 'curves') {
    chartTitleEl.textContent = 'Curvas de Solución: Dinámica Acumulada de Adopciones';

    const exactDataset = {
      label: 'Solución Exacta (Analítica)',
      data: plotData.map(d => d.yExact),
      borderColor: '#0f172a', // Slate 900
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0.1,
    };

    const heunDataset = {
      label: 'Método de Heun (RK2)',
      data: plotData.map(d => d.yHeun),
      borderColor: '#3b82f6', // Blue 500
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 4],
      pointRadius: plotData.length < 50 ? 3 : 0,
      pointBackgroundColor: '#3b82f6',
      tension: 0.1,
    };

    const rk4Dataset = {
      label: 'Runge-Kutta 4.° Orden (RK4)',
      data: plotData.map(d => d.yRK4),
      borderColor: '#10b981', // Emerald 500
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [2, 2],
      pointRadius: plotData.length < 50 ? 3 : 0,
      pointBackgroundColor: '#10b981',
      tension: 0.1,
    };

    const goalLine = {
      label: `Meta (${sim.targetY.toFixed(0)} adopciones)`,
      data: plotData.map(() => sim.targetY),
      borderColor: '#f59e0b', // Amber 500
      borderWidth: 1.5,
      borderDash: [6, 6],
      pointRadius: 0,
      fill: false,
    };

    mainChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [exactDataset, heunDataset, rk4Dataset, goalLine],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tiempo t (semanas)',
              font: { weight: 'bold', size: 12 },
            },
            grid: { color: '#f1f5f9' },
          },
          y: {
            title: {
              display: true,
              text: 'Animales adoptados y(t)',
              font: { weight: 'bold', size: 12 },
            },
            min: 0,
            max: sim.params.K * 1.05,
            grid: { color: '#f1f5f9' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 12 },
            bodyFont: { size: 12 },
            callbacks: {
              title: items => `Semana ${items[0].label}`,
              label: context => ` ${context.dataset.label}: ${context.parsed.y.toFixed(3)} animales`,
            },
          },
        },
      },
    });

  } else {
    // Pestaña de Errores Relativos
    chartTitleEl.textContent = 'Error Relativo Porcentual frente a la Solución Analítica';

    const heunErrorDataset = {
      label: 'Error Relativo Heun (%)',
      data: plotData.map(d => d.errHeunRel),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      borderWidth: 2,
      fill: true,
      pointRadius: plotData.length < 50 ? 3 : 0,
      tension: 0.1,
    };

    const rk4ErrorDataset = {
      label: 'Error Relativo RK4 (%)',
      data: plotData.map(d => d.errRK4Rel),
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.12)',
      borderWidth: 2,
      fill: true,
      pointRadius: plotData.length < 50 ? 3 : 0,
      tension: 0.1,
    };

    mainChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [heunErrorDataset, rk4ErrorDataset],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tiempo t (semanas)',
              font: { weight: 'bold', size: 12 },
            },
            grid: { color: '#f1f5f9' },
          },
          y: {
            title: {
              display: true,
              text: 'Error Relativo (%)',
              font: { weight: 'bold', size: 12 },
            },
            grid: { color: '#f1f5f9' },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: context => ` ${context.dataset.label}: ${context.parsed.y < 0.001 ? context.parsed.y.toExponential(4) : context.parsed.y.toFixed(5)}%`,
            },
          },
        },
      },
    });
  }
}

// Renderizar tabla comparativa
function renderTable(sim) {
  const tbody = document.getElementById('simTableBody');
  const filter = document.getElementById('tableFilter').value;
  const countEl = document.getElementById('tableRowsCount');

  let rowsToRender = sim.data;

  if (filter === 'integers') {
    rowsToRender = sim.data.filter(d => Math.abs(d.t - Math.round(d.t)) < 1e-4);
  } else if (filter === 'key') {
    const keyTimes = [0, 1, 2, 5, 10, sim.params.T];
    if (sim.targetTime !== null) keyTimes.push(sim.targetTime);
    rowsToRender = sim.data.filter(d => {
      return keyTimes.some(kt => Math.abs(d.t - kt) < sim.params.h * 0.51) || d.step === 0 || d.step === sim.data.length - 1;
    });
  }

  tbody.innerHTML = '';
  countEl.textContent = `Mostrando ${rowsToRender.length} de ${sim.data.length} pasos calculados`;

  const fragment = document.createDocumentFragment();

  rowsToRender.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

    const fmt = num => num.toFixed(4);
    const fmtErr = num => num < 0.0001 ? num.toExponential(3) : num.toFixed(4);

    tr.innerHTML = `
      <td class="py-2.5 px-3.5 text-slate-400">${row.step}</td>
      <td class="py-2.5 px-3.5 font-semibold text-slate-800">${row.t.toFixed(2)}</td>
      <td class="py-2.5 px-3.5 bg-slate-50/60 font-semibold text-slate-900">${fmt(row.yExact)}</td>
      <td class="py-2.5 px-3.5 text-blue-700 bg-blue-50/20">${fmt(row.yHeun)}</td>
      <td class="py-2.5 px-3.5 text-blue-600 bg-blue-50/10 font-mono">${fmtErr(row.errHeunRel)}%</td>
      <td class="py-2.5 px-3.5 text-emerald-700 bg-emerald-50/20">${fmt(row.yRK4)}</td>
      <td class="py-2.5 px-3.5 text-emerald-600 bg-emerald-50/10 font-mono">${fmtErr(row.errRK4Rel)}%</td>
    `;
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

// Generar texto dinámico de interpretación
function renderInterpretation(sim) {
  const { params, targetY, targetTime, maxHeunRelError, maxRK4RelError } = sim;
  const container = document.getElementById('interpretationContent');

  const weeks = targetTime ? Math.floor(targetTime) : 0;
  const days = targetTime ? Math.round((targetTime - weeks) * 7) : 0;
  const precisionFactor = (maxHeunRelError / (maxRK4RelError || 1e-9)).toFixed(0);

  container.innerHTML = `
    <div class="p-3 bg-white/80 rounded-xl border border-emerald-100 shadow-sm">
      <h4 class="font-bold text-emerald-950 flex items-center gap-1.5 text-sm mb-1">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        1. Respuesta Cuantificable al Desafío Comunitario
      </h4>
      <p class="text-xs text-slate-700">
        Iniciando con <strong>${params.y0} animales</strong> adoptados y con una capacidad comunitaria de <strong>${params.K} hogares</strong> 
        a una tasa de difusión $r = ${params.r}\\text{ sem}^{-1}$, el albergue alcanzará el <strong>${params.goalPercent}% de su capacidad</strong> 
        (meta de <strong>${targetY.toFixed(0)} adopciones acumuladas</strong>) exactamente en 
        <strong class="text-emerald-800 font-bold">${targetTime !== null ? targetTime.toFixed(2) + ' semanas' : 'N/A'}</strong> 
        (aproximadamente <em>${weeks} semanas y ${days} días</em>).
      </p>
    </div>

    <div class="p-3 bg-white/80 rounded-xl border border-emerald-100 shadow-sm">
      <h4 class="font-bold text-emerald-950 flex items-center gap-1.5 text-sm mb-1">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        2. Comparación de Métodos Numéricos y Orden de Convergencia
      </h4>
      <p class="text-xs text-slate-700">
        Con un tamaño de paso $h = ${params.h}$, el método clásico de <strong>Runge-Kutta de 4.° orden (RK4)</strong> alcanzó un error relativo máximo de 
        <strong>${maxRK4RelError < 0.001 ? maxRK4RelError.toExponential(3) : maxRK4RelError.toFixed(5)}%</strong>, resultando 
        <strong class="text-purple-700 font-bold">${Number(precisionFactor).toLocaleString()} veces más preciso</strong> que el método de 
        <strong>Heun (RK2)</strong>, cuyo error relativo máximo fue de <strong>${maxHeunRelError.toFixed(4)}%</strong>. 
        Esto comprueba en la práctica la diferencia teórica entre un método de orden $\\mathcal{O}(h^2)$ y uno de $\\mathcal{O}(h^4)$.
      </p>
    </div>

    <div class="p-3 bg-white/80 rounded-xl border border-emerald-100 shadow-sm">
      <h4 class="font-bold text-emerald-950 flex items-center gap-1.5 text-sm mb-1">
        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        3. Toma de Decisiones y Recomendación para el Albergue
      </h4>
      <p class="text-xs text-slate-700">
        Entre las semanas 5 y 10 se observa la máxima pendiente de adopción (fase de mayor impacto del boca a boca). A partir de la semana 14, 
        el ritmo de adopciones se desacelera por la saturación de familias aptas. Se recomienda al equipo comunitario enfocar sus campañas 
        de difusión externa y alianzas intermunicipales antes de la semana 12 para expandir la capacidad $K$ hacia nuevas zonas.
      </p>
    </div>
  `;

  // Renderizar expresiones matemáticas con KaTeX en el contenedor
  if (window.renderMathInElement) {
    window.renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
    });
  }
}

// Exportar datos a CSV
function exportCSV(sim) {
  const headers = ['Paso', 'Tiempo_Semanas', 'Solucion_Analitica', 'Heun_RK2', 'Error_Abs_Heun', 'Error_Rel_Heun_Pct', 'RK4', 'Error_Abs_RK4', 'Error_Rel_RK4_Pct'];
  const rows = sim.data.map(d => [
    d.step,
    d.t.toFixed(4),
    d.yExact.toFixed(6),
    d.yHeun.toFixed(6),
    d.errHeunAbs.toFixed(6),
    d.errHeunRel.toFixed(6),
    d.yRK4.toFixed(6),
    d.errRK4Abs.toFixed(6),
    d.errRK4Rel.toFixed(6),
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `simulacion_edo_adopciones_h${sim.params.h}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Validar entradas del formulario
function getAndValidateInputs() {
  const y0 = parseFloat(document.getElementById('inputY0').value);
  const K = parseFloat(document.getElementById('inputK').value);
  const r = parseFloat(document.getElementById('inputR').value);
  const h = parseFloat(document.getElementById('inputH').value);
  const T = parseFloat(document.getElementById('inputT').value);
  const goalPercent = parseFloat(document.getElementById('inputGoal').value);

  const alertBox = document.getElementById('validationAlert');
  const alertMsg = document.getElementById('validationMessage');

  const errors = [];
  if (isNaN(y0) || y0 <= 0) errors.push('La condición inicial y₀ debe ser un número positivo.');
  if (isNaN(K) || K <= y0) errors.push('La capacidad K debe ser estrictamente mayor que la condición inicial y₀.');
  if (isNaN(r) || r <= 0) errors.push('La tasa r debe ser un valor positivo mayor que 0.');
  if (isNaN(h) || h <= 0 || h > T) errors.push('El paso h debe ser positivo y menor o igual al tiempo total T.');
  if (isNaN(T) || T <= 0) errors.push('El tiempo total T debe ser mayor que 0.');
  if (isNaN(goalPercent) || goalPercent <= 0 || goalPercent >= 100) errors.push('La meta debe estar entre 1% y 99% de K.');

  if (errors.length > 0) {
    alertBox.classList.remove('hidden');
    alertMsg.innerHTML = errors.join('<br>');
    return null;
  }

  alertBox.classList.add('hidden');

  // Actualizar etiquetas auxiliares
  document.getElementById('valY0').textContent = `${y0} animales`;
  document.getElementById('valK').textContent = `${K} animales`;
  document.getElementById('valR').textContent = `${r} sem⁻¹`;
  document.getElementById('valH').textContent = `${h} semanas`;
  document.getElementById('valT').textContent = `${T} semanas`;
  document.getElementById('valGoal').textContent = `${goalPercent}% de K`;

  return { y0, K, r, h, T, goalPercent };
}

// Ejecutar ciclo completo de actualización de la UI
function runSimulationPipeline() {
  const params = getAndValidateInputs();
  if (!params) return;

  currentSimulationData = computeSimulation(params);
  updateKPIs(currentSimulationData);
  renderChart(currentSimulationData);
  renderTable(currentSimulationData);
  renderInterpretation(currentSimulationData);
}

// Inicialización y Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Renderizar iconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Renderizar fórmulas LaTeX iniciales
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
    });
  }

  // Ejecución inicial
  runSimulationPipeline();

  // Botón Ejecutar
  document.getElementById('btnRunSim').addEventListener('click', runSimulationPipeline);

  // Escuchar cambios en inputs para reactividad
  ['inputY0', 'inputK', 'inputR', 'inputH', 'inputT', 'inputGoal'].forEach(id => {
    document.getElementById(id).addEventListener('change', runSimulationPipeline);
  });

  // Botones de selección rápida de paso h
  document.querySelectorAll('.btn-step').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-step').forEach(b => {
        b.className = 'btn-step text-xs py-1 px-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100';
      });
      btn.className = 'btn-step text-xs py-1 px-1 rounded border border-emerald-400 bg-emerald-50 font-bold text-emerald-800';
      const stepVal = parseFloat(btn.getAttribute('data-h'));
      document.getElementById('inputH').value = stepVal;
      runSimulationPipeline();
    });
  });

  // Pestañas de gráficos
  const btnCurves = document.getElementById('btnTabCurves');
  const btnErrors = document.getElementById('btnTabErrors');

  btnCurves.addEventListener('click', () => {
    currentChartTab = 'curves';
    btnCurves.className = 'px-3 py-1.5 rounded-md bg-white text-emerald-700 shadow-sm font-semibold transition';
    btnErrors.className = 'px-3 py-1.5 rounded-md hover:text-slate-900 transition text-slate-600';
    if (currentSimulationData) renderChart(currentSimulationData);
  });

  btnErrors.addEventListener('click', () => {
    currentChartTab = 'errors';
    btnErrors.className = 'px-3 py-1.5 rounded-md bg-white text-emerald-700 shadow-sm font-semibold transition';
    btnCurves.className = 'px-3 py-1.5 rounded-md hover:text-slate-900 transition text-slate-600';
    if (currentSimulationData) renderChart(currentSimulationData);
  });

  // Filtro de tabla
  document.getElementById('tableFilter').addEventListener('change', () => {
    if (currentSimulationData) renderTable(currentSimulationData);
  });

  // Botón Exportar CSV
  document.getElementById('btnExportCSV').addEventListener('click', () => {
    if (currentSimulationData) exportCSV(currentSimulationData);
  });

  // Reset botón
  document.getElementById('btnResetParams').addEventListener('click', () => {
    document.getElementById('inputY0').value = 20;
    document.getElementById('inputK').value = 200;
    document.getElementById('inputR').value = 0.25;
    document.getElementById('inputH').value = 0.5;
    document.getElementById('inputT').value = 25;
    document.getElementById('inputGoal').value = 80;
    runSimulationPipeline();
  });

  // Presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => {
        b.className = 'preset-btn px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition';
      });
      btn.className = 'preset-btn px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 transition';

      const preset = btn.getAttribute('data-preset');
      if (preset === 'base') {
        document.getElementById('inputY0').value = 20;
        document.getElementById('inputK').value = 200;
        document.getElementById('inputR').value = 0.25;
        document.getElementById('inputH').value = 0.5;
        document.getElementById('inputT').value = 25;
      } else if (preset === 'step1') {
        document.getElementById('inputY0').value = 20;
        document.getElementById('inputK').value = 200;
        document.getElementById('inputR').value = 0.25;
        document.getElementById('inputH').value = 1.0;
        document.getElementById('inputT').value = 25;
      } else if (preset === 'fine') {
        document.getElementById('inputY0').value = 20;
        document.getElementById('inputK').value = 200;
        document.getElementById('inputR').value = 0.25;
        document.getElementById('inputH').value = 0.25;
        document.getElementById('inputT').value = 25;
      } else if (preset === 'fast') {
        document.getElementById('inputY0').value = 20;
        document.getElementById('inputK').value = 200;
        document.getElementById('inputR').value = 0.40;
        document.getElementById('inputH').value = 0.5;
        document.getElementById('inputT').value = 20;
      }
      runSimulationPipeline();
    });
  });
});
