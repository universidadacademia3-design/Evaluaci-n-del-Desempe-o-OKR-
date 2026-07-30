export function renderManual() {
  return `
    <div class="manual-hero">
      <div>
        <p class="muted" style="text-transform:uppercase;font-size:.74rem;letter-spacing:.06em;">Documentación</p>
        <h2 style="margin:4px 0 6px;">Manual de uso de Brújula OKR</h2>
        <p class="muted" style="margin:0;max-width:56ch;">Guía completa para configurar la plataforma, definir objetivos y resultados clave, dar seguimiento con check-ins y generar reportes ejecutivos.</p>
      </div>
      <a href="assets/manual-brujula-okr.pdf" download class="btn btn-primary">⬇ Descargar manual completo (PDF)</a>
    </div>

    <div class="grid grid-2">
      <div>
        <div class="section-title" style="margin-top:0;"><h2>Contenido del manual</h2></div>
        <div class="manual-toc">
          <a href="assets/manual-brujula-okr.pdf#page=3" target="_blank" rel="noopener">1. Introducción a la metodología OKR <span>p. 3</span></a>
          <a href="assets/manual-brujula-okr.pdf#page=4" target="_blank" rel="noopener">2. Primeros pasos y configuración inicial <span>p. 4</span></a>
          <a href="assets/manual-brujula-okr.pdf#page=5" target="_blank" rel="noopener">3. Creación de objetivos y resultados clave <span>p. 5</span></a>
          <a href="assets/manual-brujula-okr.pdf#page=6" target="_blank" rel="noopener">4. Check-ins y seguimiento de avance <span>p. 6</span></a>
          <a href="assets/manual-brujula-okr.pdf#page=7" target="_blank" rel="noopener">5. Mapa de alineación organizacional <span>p. 7</span></a>
          <a href="assets/manual-brujula-okr.pdf#page=8" target="_blank" rel="noopener">6. Indicadores KPI y evaluación de desempeño <span>p. 8</span></a>
          <a href="assets/manual-brujula-okr.pdf#page=9" target="_blank" rel="noopener">7. Reportes, exportación y buenas prácticas <span>p. 9</span></a>
          <a href="assets/manual-brujula-okr.pdf#page=10" target="_blank" rel="noopener">8. Roles, permisos y administración <span>p. 10</span></a>
        </div>
      </div>

      <div>
        <div class="section-title" style="margin-top:0;"><h2>Guía rápida (5 minutos)</h2></div>
        <div class="card card-pad">
          <ol style="margin:0;padding-left:18px;display:grid;gap:12px;font-size:.88rem;color:var(--ink-700);">
            <li><strong>Explora el espacio de práctica.</strong> Ya contiene una empresa de ejemplo con objetivos, equipos y check-ins reales para que aprendas sin riesgo.</li>
            <li><strong>Revisa el Panel ejecutivo.</strong> Ahí verás el progreso general, objetivos por estado y actividad reciente.</li>
            <li><strong>Abre un objetivo.</strong> Desde “Objetivos & KR”, entra a cualquiera para ver sus resultados clave y registrar un check-in de prueba.</li>
            <li><strong>Consulta el mapa de alineación.</strong> Verifica cómo los objetivos de equipo se conectan con el objetivo de empresa.</li>
            <li><strong>Genera un reporte.</strong> Desde “Reportes”, exporta un PDF ejecutivo o un CSV con todos los datos.</li>
            <li><strong>Cuando estés listo, cambia al espacio de producción</strong> desde el selector de inicio de sesión y comienza a cargar los datos reales de tu organización.</li>
          </ol>
        </div>

        <div class="alert alert-info" style="margin-top:16px;">
          💡 Todos los datos se guardan de forma local en este navegador. Para uso en equipo dentro de una empresa real, se recomienda conectar la plataforma a una base de datos compartida (ver sección 8 del manual).
        </div>
      </div>
    </div>
  `;
}

export function afterRenderManual() {}
