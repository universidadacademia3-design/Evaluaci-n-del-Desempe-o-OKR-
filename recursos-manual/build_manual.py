# -*- coding: utf-8 -*-
"""Builds the professional user manual for Brújula OKR as a PDF."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    ListFlowable, ListItem, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas as pdfcanvas

INK_900 = colors.HexColor('#101C28')
INK_700 = colors.HexColor('#1D3345')
INK_500 = colors.HexColor('#42607A')
BRAND_600 = colors.HexColor('#3B4C8A')
CLAY = colors.HexColor('#C77D2E')
PAPER = colors.HexColor('#F4F6F8')
ON_TRACK = colors.HexColor('#1B7F72')
AT_RISK = colors.HexColor('#B8862B')
BEHIND = colors.HexColor('#9C3B34')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle('CoverTitle', fontName='Helvetica-Bold', fontSize=30, leading=36, textColor=colors.white, spaceAfter=6))
styles.add(ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=13, leading=18, textColor=colors.HexColor('#D7E0E8')))
styles.add(ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=19, leading=24, textColor=INK_900, spaceBefore=4, spaceAfter=12))
styles.add(ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=13.5, leading=18, textColor=BRAND_600, spaceBefore=14, spaceAfter=8))
styles.add(ParagraphStyle('Body', fontName='Helvetica', fontSize=10, leading=15, textColor=INK_700, spaceAfter=8, alignment=TA_LEFT))
styles.add(ParagraphStyle('BodyBold', parent=styles['Body'], fontName='Helvetica-Bold', textColor=INK_900))
styles.add(ParagraphStyle('BulletBody', parent=styles['Body'], leftIndent=0, spaceAfter=4))
styles.add(ParagraphStyle('Caption', fontName='Helvetica-Oblique', fontSize=8.5, textColor=INK_500, spaceAfter=10))
styles.add(ParagraphStyle('TocEntry', fontName='Helvetica', fontSize=11, leading=22, textColor=INK_900))
styles.add(ParagraphStyle('KpiLabel', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white))

PAGE_W, PAGE_H = A4

def section_number(n, title):
    return Paragraph(f'<font color="#C77D2E">{n:02d}</font> &nbsp;&nbsp; {title}', styles['H1'])

def sub(title):
    return Paragraph(title, styles['H2'])

def body(text):
    return Paragraph(text, styles['Body'])

def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(t, styles['BulletBody']), leftIndent=14, bulletColor=CLAY) for t in items],
        bulletType='bullet', start='circle', bulletFontSize=6, spaceBefore=2, spaceAfter=10,
    )

def numbered(items):
    return ListFlowable(
        [ListItem(Paragraph(t, styles['BulletBody']), leftIndent=14) for t in items],
        bulletType='1', spaceBefore=2, spaceAfter=10,
    )

def status_table(rows, header):
    t = Table([header] + rows, colWidths=[4.6*cm, 3*cm, 8*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), INK_900),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, PAPER]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE4E9')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    return t

story = []

# ---------------- COVER PAGE ----------------
class CoverCanvas(pdfcanvas.Canvas):
    pass

def cover_flow():
    flow = []
    flow.append(Spacer(1, 7*cm))
    flow.append(Paragraph('BRÚJULA OKR', styles['CoverTitle']))
    flow.append(Paragraph('Manual de uso de la plataforma', styles['CoverSub']))
    flow.append(Spacer(1, 0.4*cm))
    flow.append(Paragraph('Gestión por Objetivos y Resultados Clave (OKR) y otros sistemas de administración por objetivos',
                           ParagraphStyle('CoverSub2', parent=styles['CoverSub'], textColor=colors.HexColor('#C77D2E'), fontSize=11)))
    flow.append(Spacer(1, 6*cm))
    flow.append(Paragraph('Versión 1.0 · Documento de referencia para administradores, líderes de equipo y colaboradores',
                           ParagraphStyle('CoverFoot', parent=styles['CoverSub'], fontSize=9, textColor=colors.HexColor('#8FA6B8'))))
    return flow

story += cover_flow()
story.append(PageBreak())

# ---------------- TABLE OF CONTENTS ----------------
story.append(Paragraph('Índice de contenidos', styles['H1']))
toc_items = [
    ('1. Introducción a la metodología OKR', '3'),
    ('2. Primeros pasos y configuración inicial', '4'),
    ('3. Creación de objetivos y resultados clave', '5'),
    ('4. Check-ins y seguimiento de avance', '6'),
    ('5. Mapa de alineación organizacional', '7'),
    ('6. Indicadores KPI y evaluación de desempeño', '8'),
    ('7. Reportes, exportación y buenas prácticas', '9'),
    ('8. Roles, permisos y administración', '10'),
]
toc_table = Table([[Paragraph(a, styles['TocEntry']), Paragraph(b, styles['TocEntry'])] for a, b in toc_items],
                   colWidths=[13.5*cm, 2*cm])
toc_table.setStyle(TableStyle([
    ('LINEBELOW', (0, 0), (-1, -2), 0.4, colors.HexColor('#DFE4E9')),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(toc_table)
story.append(PageBreak())

# ---------------- 1. INTRODUCCIÓN ----------------
story.append(section_number(1, 'Introducción a la metodología OKR'))
story.append(body('Brújula OKR es una plataforma profesional para diseñar, dar seguimiento y evaluar el desempeño organizacional '
                   'mediante la metodología de <b>Objetivos y Resultados Clave (OKR)</b>, complementada con indicadores KPI de '
                   'seguimiento continuo y evaluaciones de desempeño propias de la Administración por Objetivos (APO).'))
story.append(sub('¿Qué es un OKR?'))
story.append(body('Un <b>Objetivo</b> es una meta cualitativa, ambiciosa e inspiradora que describe hacia dónde se dirige la '
                   'organización, un equipo o una persona en un período determinado (típicamente trimestral o anual). Cada '
                   'objetivo se acompaña de 2 a 5 <b>Resultados Clave</b>: métricas cuantificables que determinan objetivamente '
                   'si el objetivo se está cumpliendo.'))
story.append(status_table(
    [['Objetivo', 'Cualitativo, inspirador', 'Responde a: ¿qué queremos lograr y por qué importa?'],
     ['Resultado Clave', 'Cuantitativo, medible', 'Responde a: ¿cómo sabremos que lo logramos?'],
     ['Iniciativa', 'Plan de acción', 'Responde a: ¿qué haremos para mover el resultado clave?']],
    ['Elemento', 'Naturaleza', 'Pregunta que responde']
))
story.append(Spacer(1, 8))
story.append(sub('Principios que sigue la plataforma'))
story.append(bullets([
    'Alineación en cascada: los objetivos de equipo e individuales se conectan explícitamente con los objetivos de empresa.',
    'Transparencia: cualquier persona de la organización puede consultar el avance de cualquier objetivo.',
    'Medición honesta: el progreso se calcula automáticamente a partir de los valores reales registrados en cada check-in.',
    'Ritmo de seguimiento: se recomienda actualizar cada resultado clave cada 1–2 semanas, no solo al cierre del ciclo.',
    'Complemento cualitativo: la evaluación de desempeño añade una capa de retroalimentación humana que el dato por sí solo no captura.',
]))
story.append(sub('Otros sistemas de gestión por objetivos disponibles'))
story.append(body('Además de OKR, la plataforma admite configurarse bajo enfoques afines de gestión por objetivos, seleccionables '
                   'desde <b>Configuración → Metodología aplicada</b>:'))
story.append(bullets([
    '<b>Administración por Objetivos (APO):</b> ciclo de definición conjunta de metas entre líder y colaborador, con evaluación periódica.',
    '<b>Balanced Scorecard (BSC) + OKR:</b> agrupa los objetivos por categoría estratégica (financiera, clientes, procesos, aprendizaje).',
    '<b>KPI de seguimiento continuo:</b> indicadores operativos sin fecha de cierre, usados para sostener la operación entre ciclos.',
]))
story.append(PageBreak())

# ---------------- 2. PRIMEROS PASOS ----------------
story.append(section_number(2, 'Primeros pasos y configuración inicial'))
story.append(sub('2.1 Acceso a la plataforma'))
story.append(body('Al ingresar a la aplicación encontrarás una pantalla de acceso con dos elementos a seleccionar:'))
story.append(numbered([
    '<b>Perfil:</b> selecciona la persona con la que deseas iniciar sesión.',
    '<b>Espacio de trabajo:</b> elige <i>Práctica</i> para explorar la plataforma con datos de ejemplo precargados, o '
    '<i>Producción</i> para comenzar a trabajar con los datos reales de tu organización.',
]))
story.append(body('Ambos espacios son completamente independientes: los cambios realizados en Práctica nunca afectan los '
                   'datos de Producción, por lo que puedes experimentar libremente antes de operar en tiempo real.'))
story.append(sub('2.2 Configurar el perfil de la organización'))
story.append(body('Desde <b>Configuración → Perfil de la organización</b>, define el nombre de la empresa, su sector, la '
                   'metodología a aplicar y la moneda utilizada para resultados clave monetarios.'))
story.append(sub('2.3 Crear el primer ciclo de evaluación'))
story.append(body('Un <b>ciclo</b> es el período de tiempo (trimestre, semestre o año) durante el cual se evalúan los '
                   'objetivos. Desde <b>Configuración → Ciclos de evaluación</b>, crea tu primer ciclo indicando nombre, '
                   'fecha de inicio y fecha de cierre, y actívalo. El ciclo activo se muestra en la barra superior de toda '
                   'la aplicación y determina qué objetivos se visualizan por defecto.'))
story.append(sub('2.4 Registrar equipos y personas'))
story.append(body('Desde <b>Equipos & personas</b>, crea la estructura organizacional: primero los equipos o áreas '
                   '(pueden anidarse bajo un área superior), y luego las personas, asignando su cargo, equipo y rol en la '
                   'plataforma:'))
story.append(status_table(
    [['Administrador', 'Control total: configuración, ciclos, todos los equipos y personas.'],
     ['Líder de equipo', 'Gestiona los objetivos y personas de su propio equipo.'],
     ['Colaborador', 'Gestiona sus objetivos individuales y registra sus propios check-ins.']],
    ['Rol', 'Alcance de permisos']
))
story.append(PageBreak())

# ---------------- 3. CREACIÓN DE OBJETIVOS ----------------
story.append(section_number(3, 'Creación de objetivos y resultados clave'))
story.append(sub('3.1 Crear un nuevo objetivo'))
story.append(body('Desde <b>Objetivos & KR → Nuevo objetivo</b>, completa el formulario:'))
story.append(bullets([
    '<b>Título:</b> redáctalo en forma cualitativa y ambiciosa (ej. "Consolidar el liderazgo regional en manufactura sostenible").',
    '<b>Nivel:</b> Empresa, Equipo o Individual.',
    '<b>Ciclo:</b> el período al que pertenece el objetivo.',
    '<b>Responsable:</b> la persona que rinde cuentas sobre el avance.',
    '<b>Equipo:</b> el área a la que pertenece (opcional para objetivos individuales).',
    '<b>Categoría:</b> etiqueta libre usada luego en los reportes por categoría estratégica.',
    '<b>Alineado a:</b> el objetivo superior al que contribuye, generando la cascada de alineación.',
]))
story.append(sub('3.2 Agregar resultados clave'))
story.append(body('Dentro del detalle de cada objetivo, agrega entre 2 y 5 resultados clave. La plataforma admite cuatro '
                   'tipos de métrica:'))
story.append(status_table(
    [['Numérica', 'Cantidades', 'Nuevas cuentas firmadas: 0 → 12'],
     ['Porcentaje', 'Tasas o proporciones', 'Tasa de conversión: 18% → 30%'],
     ['Monetaria', 'Valores financieros', 'Ingresos recurrentes: $2.4M → $3.2M'],
     ['Hito (Sí/No)', 'Logros binarios', 'Certificación ISO 14001 obtenida']],
    ['Tipo', 'Uso recomendado', 'Ejemplo']
))
story.append(body('Cada resultado clave puede recibir una <b>ponderación</b> (1 a 5) para reflejar su importancia relativa '
                   'dentro del objetivo; el progreso del objetivo se calcula como el promedio ponderado del avance de sus '
                   'resultados clave.'))
story.append(sub('3.3 Cómo se calcula el estado (semáforo)'))
story.append(body('El estado de cada resultado clave se determina automáticamente comparando el porcentaje de avance real '
                   'contra el avance esperado según el tiempo transcurrido del ciclo:'))
story.append(status_table(
    [['En curso', ON_TRACK.hexval()[2:].upper(), 'El avance real iguala o supera lo esperado para la fecha.'],
     ['En riesgo', AT_RISK.hexval()[2:].upper(), 'El avance está moderadamente por debajo de lo esperado.'],
     ['Retrasado', BEHIND.hexval()[2:].upper(), 'El avance está significativamente por debajo de lo esperado.'],
     ['Completado', '2B5FA8', 'El resultado clave alcanzó o superó su meta.']],
    ['Estado', 'Color', 'Criterio']
))
story.append(PageBreak())

# ---------------- 4. CHECK-INS ----------------
story.append(section_number(4, 'Check-ins y seguimiento de avance'))
story.append(body('Un <b>check-in</b> es una actualización periódica del valor real de un resultado clave, acompañada de un '
                   'nivel de confianza y un comentario de contexto. Se registra desde el botón <b>Registrar avance</b> en '
                   'cada resultado clave.'))
story.append(sub('4.1 Elementos de un buen check-in'))
story.append(numbered([
    '<b>Valor actual medido</b>, no una estimación aproximada.',
    '<b>Nivel de confianza</b> (escala 1–10) sobre la probabilidad real de alcanzar la meta al cierre del ciclo.',
    '<b>Comentario breve</b> describiendo qué avanzó, qué se aprendió o qué está bloqueando el progreso.',
]))
story.append(sub('4.2 Recomendación de frecuencia'))
story.append(body('Se recomienda registrar check-ins cada 1 a 2 semanas. La sección <b>Check-ins</b> del menú principal '
                   'muestra automáticamente los resultados clave que llevan más de 14 días sin actualizarse, para facilitar '
                   'el seguimiento del equipo completo.'))
story.append(sub('4.3 Historial'))
story.append(body('Cada resultado clave conserva el historial completo de check-ins, visible al expandir "Historial de '
                   'check-ins" dentro de su tarjeta, lo que permite auditar la evolución del indicador a lo largo de todo '
                   'el ciclo.'))
story.append(PageBreak())

# ---------------- 5. ALINEACIÓN ----------------
story.append(section_number(5, 'Mapa de alineación organizacional'))
story.append(body('La sección <b>Mapa de alineación</b> despliega un árbol jerárquico que conecta cada objetivo con el '
                   'objetivo superior al que contribuye, permitiendo verificar en un solo lugar que todo el esfuerzo de la '
                   'organización esté efectivamente encaminado hacia la estrategia de empresa.'))
story.append(bullets([
    'Los objetivos de nivel Empresa aparecen en la raíz del árbol.',
    'Los objetivos de Equipo se anidan bajo el objetivo de empresa al que fueron alineados.',
    'Los objetivos Individuales se anidan bajo el objetivo de equipo correspondiente.',
    'El color y el anillo de progreso de cada nodo reflejan su estado y avance actual.',
]))
story.append(body('Un objetivo sin alineación definida se muestra como raíz independiente: es recomendable revisar '
                   'periódicamente que todos los objetivos de equipo e individuales estén alineados a un objetivo superior.'))
story.append(PageBreak())

# ---------------- 6. KPI Y EVALUACIÓN ----------------
story.append(section_number(6, 'Indicadores KPI y evaluación de desempeño'))
story.append(sub('6.1 Indicadores KPI'))
story.append(body('A diferencia de los resultados clave —que tienen fecha de cierre dentro de un ciclo— los <b>KPI</b> son '
                   'métricas operativas continuas (ej. tasa de accidentalidad, costo de adquisición de cliente, liquidez '
                   'corriente) que sostienen la salud del negocio de forma permanente. Se gestionan desde <b>Indicadores '
                   '(KPI)</b>, donde puedes definir su meta, dirección deseada (mayor o menor es mejor) y frecuencia de '
                   'lectura, y registrar nuevas lecturas a lo largo del tiempo para visualizar su tendencia.'))
story.append(sub('6.2 Evaluación de desempeño'))
story.append(body('La sección <b>Evaluación de desempeño</b> complementa el seguimiento cuantitativo del OKR con una '
                   'revisión cualitativa periódica, siguiendo el enfoque clásico de Administración por Objetivos: cada '
                   'colaborador realiza una <b>autoevaluación</b> y su líder directo realiza una <b>evaluación</b> '
                   'independiente, ambas en una escala de 1 a 5. Comparar ambas puntuaciones ayuda a identificar brechas de '
                   'percepción y guiar la conversación de desarrollo.'))
story.append(status_table(
    [['Pendiente', 'La evaluación fue creada pero aún no inicia.'],
     ['En proceso', 'Autoevaluación y/o evaluación del líder en curso.'],
     ['Completada', 'Ambas puntuaciones fueron registradas.']],
    ['Estado', 'Significado']
))
story.append(PageBreak())

# ---------------- 7. REPORTES ----------------
story.append(section_number(7, 'Reportes, exportación y buenas prácticas'))
story.append(sub('7.1 Panel ejecutivo'))
story.append(body('El <b>Panel ejecutivo</b> resume el estado del ciclo activo: progreso general, distribución de '
                   'objetivos por estado, progreso promedio por equipo y actividad reciente de check-ins.'))
story.append(sub('7.2 Sección de reportes'))
story.append(body('La sección <b>Reportes</b> ofrece un análisis más profundo —progreso por categoría estratégica, '
                   'evolución del progreso general y el detalle completo de objetivos y resultados clave— junto con dos '
                   'opciones de exportación:'))
story.append(bullets([
    '<b>Exportar reporte ejecutivo (PDF):</b> genera un documento formal, listo para compartir con dirección o junta '
    'directiva, con el resumen del ciclo y el detalle de cada resultado clave.',
    '<b>Exportar datos (CSV):</b> descarga la totalidad de objetivos y resultados clave del ciclo activo en formato '
    'tabular, compatible con Excel, Google Sheets u otras herramientas de análisis.',
]))
story.append(sub('7.3 Buenas prácticas recomendadas'))
story.append(numbered([
    'Limita cada objetivo a 3–5 resultados clave: más elementos diluyen el foco.',
    'Redacta resultados clave verificables por un tercero sin ambigüedad ("aumentar" no es medible; "aumentar de 18% a 30%" sí lo es).',
    'Revisa el avance en una reunión breve de seguimiento (15–30 min) cada dos semanas.',
    'Al cierre del ciclo, documenta aprendizajes antes de definir los objetivos del siguiente período.',
    'Evita usar los OKR como única base de compensación: esto incentiva metas conservadoras en lugar de ambiciosas.',
]))
story.append(PageBreak())

# ---------------- 8. ROLES Y ADMINISTRACIÓN ----------------
story.append(section_number(8, 'Roles, permisos y administración'))
story.append(sub('8.1 Espacios de trabajo'))
story.append(body('La plataforma opera con dos espacios independientes, seleccionables al iniciar sesión:'))
story.append(status_table(
    [['Práctica', 'Datos de ejemplo de una empresa ficticia ("Aurora Manufactura S.A.") precargados para aprender sin '
      'riesgo. Puede restablecerse en cualquier momento desde Configuración.'],
     ['Producción', 'El espacio real de tu organización. Comienza con un usuario administrador básico, listo para que '
      'registres tus equipos, personas, ciclos y objetivos reales.']],
    ['Espacio', 'Descripción']
))
story.append(sub('8.2 Administración de datos'))
story.append(body('Desde <b>Configuración → Espacio de trabajo</b> puedes restablecer los datos de práctica a su estado '
                   'original, o —en producción— borrar permanentemente todos los datos si necesitas reiniciar la '
                   'implementación.'))
story.append(sub('8.3 Despliegue e infraestructura'))
story.append(body('Esta aplicación es un sitio estático (HTML, CSS y JavaScript) diseñado para publicarse en '
                   '<b>Netlify</b>. Los datos se almacenan localmente en el navegador de cada persona mediante '
                   '<i>localStorage</i>. Para un uso corporativo con múltiples personas colaborando sobre los mismos datos '
                   'en tiempo real, se recomienda conectar la aplicación a una base de datos o backend compartido '
                   '(por ejemplo, a través de Netlify Functions y una base de datos como Supabase, Firebase o Airtable), '
                   'sustituyendo el módulo de almacenamiento local por llamadas a dicho servicio.'))
story.append(sub('8.4 Soporte'))
story.append(body('Ante dudas adicionales sobre el uso de la metodología OKR o la operación de la plataforma, consulta '
                   'nuevamente este manual desde la sección <b>Manual de uso</b> dentro de la aplicación, disponible en '
                   'todo momento para descarga en formato PDF.'))
story.append(Spacer(1, 20))
story.append(HRFlowable(width='100%', color=colors.HexColor('#DFE4E9')))
story.append(Spacer(1, 10))
story.append(Paragraph('Brújula OKR — Plataforma de gestión por objetivos y resultados clave.', styles['Caption']))


def on_page(canvas_obj, doc):
    canvas_obj.saveState()
    page_num = canvas_obj.getPageNumber()
    if page_num == 1:
        # Cover background
        canvas_obj.setFillColor(INK_900)
        canvas_obj.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas_obj.setFillColor(CLAY)
        canvas_obj.circle(PAGE_W - 3.2*cm, PAGE_H - 3.2*cm, 1.1*cm, fill=1, stroke=0)
        canvas_obj.setFillColor(INK_900)
        canvas_obj.circle(PAGE_W - 3.2*cm, PAGE_H - 3.2*cm, 0.7*cm, fill=1, stroke=0)
        canvas_obj.setStrokeColor(ON_TRACK)
        canvas_obj.setLineWidth(3)
        canvas_obj.circle(PAGE_W - 3.2*cm, PAGE_H - 3.2*cm, 0.9*cm, fill=0, stroke=1)
    else:
        canvas_obj.setFillColor(INK_900)
        canvas_obj.rect(0, PAGE_H - 1.4*cm, PAGE_W, 1.4*cm, fill=1, stroke=0)
        canvas_obj.setFillColor(colors.white)
        canvas_obj.setFont('Helvetica-Bold', 9)
        canvas_obj.drawString(2*cm, PAGE_H - 0.9*cm, 'BRÚJULA OKR')
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.setFillColor(colors.HexColor('#D7E0E8'))
        canvas_obj.drawRightString(PAGE_W - 2*cm, PAGE_H - 0.9*cm, 'Manual de uso')
        # footer
        canvas_obj.setFillColor(INK_500)
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.drawString(2*cm, 1*cm, 'Brújula OKR · Manual de uso')
        canvas_obj.drawRightString(PAGE_W - 2*cm, 1*cm, f'Página {page_num}')
    canvas_obj.restoreState()


doc = SimpleDocTemplate(
    '../assets/manual-brujula-okr.pdf',  # ejecutar este script desde dentro de recursos-manual/
    pagesize=A4,
    topMargin=2.1*cm, bottomMargin=2*cm, leftMargin=2*cm, rightMargin=2*cm,
    title='Manual de uso — Brújula OKR', author='Brújula OKR',
)
doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
print('OK')
