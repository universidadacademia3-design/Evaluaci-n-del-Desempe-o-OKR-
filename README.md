# Brújula OKR — Plataforma de Gestión por Objetivos

Aplicación web profesional para evaluar y medir el desempeño organizacional mediante **OKR (Objetivos y Resultados Clave)**, complementada con **indicadores KPI** de seguimiento continuo y **evaluaciones de desempeño** (Administración por Objetivos / APO).

Es una aplicación 100% estática (HTML, CSS y JavaScript, sin frameworks ni proceso de build), lista para desplegarse directamente en **Netlify**.

## Características

- Panel ejecutivo con progreso general, distribución por estado y actividad reciente.
- Gestión completa de objetivos y resultados clave (niveles Empresa / Equipo / Individual), con métricas numéricas, porcentuales, monetarias y de hito.
- Check-ins de seguimiento con nivel de confianza, comentarios e historial completo.
- Mapa de alineación organizacional (cascada de objetivos).
- Módulo de indicadores KPI complementario (métricas operativas continuas).
- Módulo de evaluación de desempeño (autoevaluación + evaluación del líder).
- Gestión de equipos y personas, con roles (administrador, líder de equipo, colaborador).
- Reportes y exportación a PDF ejecutivo y CSV.
- **Manual de uso descargable en PDF** (`assets/manual-brujula-okr.pdf`), accesible desde la pantalla de acceso y desde el menú "Manual de uso".
- **Espacio de práctica** con datos de ejemplo de una empresa ficticia ("Aurora Manufactura S.A.") para explorar la plataforma sin riesgo, y un **espacio de producción** independiente para datos reales.

## Estructura del proyecto

**Importante:** `index.html` está en la **raíz** de este paquete (no dentro de una subcarpeta). Al desplegar, el contenido que subas a Netlify debe ser exactamente este:

```
./
├── index.html                  # Punto de entrada de la aplicación (SPA)
├── netlify.toml                 # Configuración de despliegue en Netlify
├── css/                          # Hojas de estilo (tokens, layout, componentes, vistas, impresión)
├── js/
│   ├── app.js                    # Arranque de la aplicación y enrutamiento
│   ├── state.js                  # Estado central (store) y persistencia
│   ├── storage.js                # Capa de almacenamiento local (localStorage)
│   ├── demoData.js               # Generador del set de datos de práctica
│   ├── router.js                 # Enrutador SPA basado en hash
│   ├── components.js             # Componentes de UI reutilizables (modal, badges, anillo de progreso…)
│   ├── charts.js                 # Envoltorios de Chart.js
│   ├── csvExport.js              # Exportación de datos a CSV
│   ├── pdfExport.js              # Exportación de reporte ejecutivo a PDF (jsPDF)
│   ├── utils.js                  # Utilidades (formato, cálculo de progreso y estado, etc.)
│   └── views/                    # Una vista por sección de la aplicación
├── assets/
│   └── manual-brujula-okr.pdf    # Manual de uso descargable
└── recursos-manual/
    └── build_manual.py           # Script fuente del manual (no se despliega; solo referencia)
```

## Cómo desplegar en Netlify

### Opción A — Arrastrar y soltar (la más simple)
1. Ingresa a [app.netlify.com](https://app.netlify.com) e inicia sesión.
2. En el panel principal, ve a "Add new site → Deploy manually".
3. Arrastra **el contenido de esta carpeta** (todos los archivos y carpetas que ves arriba: `index.html`, `css/`, `js/`, `assets/`, `netlify.toml`…) al área de despliegue. No arrastres una carpeta contenedora — al soltar, `index.html` debe quedar directamente en la raíz del sitio.
4. Netlify publicará el sitio automáticamente y te asignará una URL (puedes personalizarla luego en "Site settings → Change site name").

### Opción B — Desde un repositorio Git (GitHub, GitLab, Bitbucket)
1. Sube **el contenido** de este paquete a la **raíz** del repositorio (es decir, `index.html` debe quedar en la raíz del repo, no dentro de una subcarpeta como `okr-app/`).
2. En Netlify, selecciona "Add new site → Import an existing project" y conecta el repositorio.
3. Configuración de build (Netlify la detecta automáticamente desde `netlify.toml`, pero verifica que quede así):
   - **Base directory:** vacío
   - **Build command:** vacío (esta app no necesita build)
   - **Publish directory:** `.`
4. Despliega.

> Si en algún momento ves la página **"Página no encontrada" (404 de Netlify)**, casi siempre significa que `index.html` no está en el directorio que Netlify está publicando. Revisa la sección de solución de problemas más abajo.

### Opción C — Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```
Ejecuta el comando desde dentro de esta misma carpeta (donde está `index.html`).

No se requieren variables de entorno, backend ni base de datos: los datos se almacenan localmente en el navegador de cada persona mediante `localStorage`, separados en dos espacios independientes ("Práctica" y "Producción").

## Primer uso

1. Abre la aplicación desplegada.
2. En la pantalla de acceso, selecciona un perfil y elige **Práctica** para explorar la plataforma con datos de ejemplo ya cargados, o **Producción** para comenzar con tu organización real (se crea automáticamente un usuario "Administrador" para el primer ingreso).
3. Descarga el manual de uso desde el botón en la pantalla de acceso o desde el menú **Manual de uso** dentro de la aplicación.
4. Cuando estés listo, configura tu organización real desde **Configuración** (perfil de empresa, ciclos, equipos y personas) y comienza a registrar objetivos desde **Objetivos & KR**.

## Solución de problemas: "Página no encontrada" (404) en Netlify

Este error significa que Netlify **no encontró `index.html` en el directorio que está publicando**. Casi siempre ocurre por uno de estos dos motivos:

**1. Desplegaste conectando un repositorio de GitHub y el archivo `index.html` no está en la raíz del repo.**
Ve a tu sitio en Netlify → **Site configuration → Build & deploy → Build settings** y revisa:
- **Base directory:** debe estar **vacío** (o apuntar exactamente a la carpeta donde está `index.html`, si la subiste dentro de una subcarpeta del repo).
- **Publish directory:** debe ser `.` (o el mismo nombre de esa subcarpeta, si aplica).
- **Build command:** debe estar **vacío** (esta app no necesita build).

Después de corregir estos valores, ve a **Deploys** y haz clic en **Trigger deploy → Clear cache and deploy site**.

**2. Subiste una carpeta contenedora en lugar del contenido de la app.**
Si usas "Deploy manually" (arrastrar y soltar), arrastra el **contenido** de esta carpeta (donde está `index.html` directamente), no una carpeta padre que la contenga.

Este paquete ya está organizado para evitar ese error: `index.html` está en la raíz, sin subcarpetas intermedias.

## Notas técnicas

- La aplicación usa **Chart.js**, **jsPDF** y **jsPDF-AutoTable** vía CDN (cdnjs.cloudflare.com) — se cargan automáticamente al abrir la app; no requieren instalación.
- Tipografías **Fraunces / Inter / JetBrains Mono** cargadas desde Google Fonts.
- Para un uso corporativo con múltiples personas colaborando sobre los mismos datos en tiempo real, se recomienda sustituir la capa de almacenamiento local (`js/storage.js`) por un backend compartido (por ejemplo, Netlify Functions + una base de datos como Supabase, Firebase o Airtable). El resto de la aplicación (vistas, componentes, cálculos) no requiere cambios para ese escenario, ya que toda la lectura/escritura de datos pasa por `js/state.js`.
- El manual de uso en PDF fue generado a partir del script en `recursos-manual/build_manual.py` (no se despliega; se incluye como referencia si deseas editarlo o regenerarlo).
