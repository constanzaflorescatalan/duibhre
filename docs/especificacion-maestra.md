# DUIBHRÉ — Grimorio de un alma
## Documento maestro de UX/UI, arquitectura funcional y base de desarrollo

**Versión:** 1.0 — 17 de noviembre de 2026  
**Estado:** especificación para iniciar el repositorio y construir la base funcional.  
**Idioma de la interfaz:** español de Chile (`es-CL`).  
**Prioridad:** mobile-first; aplicación web responsive preparada para evolucionar a PWA.  
**Destino:** proyecto real de diseño UX/UI + front-end para portafolio, pero útil como grimorio personal.

> **Instrucción a Claude:** usa este documento como fuente de verdad para la estructura, los nombres, la navegación y el alcance. No sustituyas los 13 capítulos por listas genéricas, no inventes nuevas categorías ni cambies la identidad visual. Si hay decisiones técnicas no especificadas, elige la solución más simple, documenta la decisión y sigue adelante. **No afirmes haber creado un repositorio, hecho un push o conectado un servicio si no ocurrió realmente.**

---

## 1. Concepto y objetivos

DUIBHRÉ es un **grimorio digital vivo y personal**: un libro de conocimientos mágicos y un diario donde cada persona conserva sus descubrimientos, rituales, recetas, sueños, observaciones, ilustraciones y recuerdos. Debe sentirse como **estar dentro de un auténtico libro de bruja**, NO como un panel SaaS estándar con tarjetas genéricas.

El producto combina:

1. **Conocimiento organizado** en 13 capítulos distribuidos en **6 familias**.
2. **Fichas personales editables** para agregar información nueva a cualquier capítulo o subtema.
3. **Bitácora** integrada con cada ficha o práctica, además de sueños y notas libres.
4. **Calendario mágico** conectado con celebraciones, anotaciones, prácticas y recordatorios.
5. **Fotografía + ilustración de grimorio** como función creativa transversal a todas las fichas: subir o tomar una foto y, en una versión posterior con servicio de imagen, convertirla en una lámina ilustrada coherente con el libro.

**Metáfora de UX:** portada de cuero oscuro → abrir libro → rueda de seis familias → elegir familia → panel desplegable con capítulos → abrir capítulo → consultar o crear ficha → registrar experiencia y vincularla al calendario.

**Regla de contenido:** distinguir siempre los datos físicos/históricos de las **correspondencias simbólicas o creencias tradicionales**. La app no debe presentar propiedades esotéricas o medicinales como hechos clínicos probados. Para plantas, aceites, ingesta, humo y fuego deben existir campos de precaución.

---

## 2. Identidad visual aprobada — NO rediseñar desde cero

### 2.1 Portada definitiva

- Texto visible en portada: **DUIBHRÉ** y abajo, únicamente, **Grimorio de un alma**.
- **D** inicial capitular de ornamentación celta, con entrelazados y un pequeño detalle estelar en su interior; resto del título con serif ceremonial de inspiración celta, dorado antiguo.
- Cinco fases de la luna **arriba y separadas del título**; buena cantidad de espacio negativo.
- **NO** colocar plantas, flores ni ilustraciones botánicas en la portada; estos motivos sí aparecen en las páginas interiores.
- Fondo negro/verde bosque casi negro, textura de cuero envejecido; marcos y esquinas con nudos celtas discretos.
- Símbolo inferior **triquetra** con círculo y pequeños detalles geométricos sutiles. No reemplazarlo por un pentagrama grande ni duplicar lunas en el centro.
- Sin ornamentos pegados a los costados del título.
- NO imprimir las frases «La oscuridad de la luna» ni «Sustantivo femenino · Irlandés» en la portada.
- La imagen de portada aprobada por la usuaria es la **referencia de arte**. Se debe adjuntar a Claude junto a este documento. No es obligatorio reconstruir el lettering con HTML en la primera iteración: puede utilizarse una imagen optimizada con textos alternativos, dejando la futura vectorización como tarea posterior.

### 2.2 Interior del libro

- Páginas de **pergamino frío y luminoso**, no excesivamente amarillas.
- Ilustraciones de tinta, acuarela botánica, láminas de herbario, anotaciones en márgenes, objetos mágicos y capitulares.
- Márgenes y separadores de filigrana en dorado envejecido; cantidad moderada para no sacrificar lectura.
- Contraste alto: texto oscuro sobre papel claro; botones claros sobre fondo verde oscuro cuando sea necesario.
- Diseño primero para celulares; en tablet/desktop puede utilizarse disposición de doble página.

### 2.3 Tokens iniciales sugeridos (ajustables contra los artes reales)

| Token | Color | Uso |
|---|---|---|
| `--ink-night` | `#0B0F0D` | Fondo más oscuro |
| `--forest-deep` | `#12261D` | Cuero, navegación, cabeceras |
| `--forest-middle` | `#264739` | Selección, tarjetas oscuras |
| `--parchment` | `#E2D9C8` | Fondo interior |
| `--paper-light` | `#F3EDDF` | Paneles de lectura |
| `--ink-brown` | `#352B24` | Texto principal sobre pergamino |
| `--antique-gold` | `#A88A57` | Filigrana, bordes y acentos |
| `--moss` | `#768B72` | Resaltes secundarios |
| `--ritual-purple` | `#6B3E65` | Detalles en gemas y pociones |

Tipografía: títulos de estilo editorial/celta (por ejemplo, una fuente de licencia abierta para titulares más capitular D realizada como recurso gráfico); **Cormorant Garamond** o similar para lectura ceremonial; **DM Sans** o similar en formularios y elementos pequeños. Verificar las licencias de cada fuente antes de empaquetarla. El texto de interfaz siempre debe ser legible.

### 2.4 Reglas de interacción visual

- Selección de rueda: borde verde lumínico y reflejo dorado **muy suave**, no neón exagerado.
- Panel de familia: aparece **debajo** de la rueda, como pergamino desplegado, sin tapar la rueda.
- Transición entre capítulos: desplazamiento/fundido leve de página, ~180–280 ms; respetar `prefers-reduced-motion`.
- Objetivos táctiles de al menos 44×44 px, contraste revisado, foco de teclado visible.
- Nunca usar textura detrás de párrafos si disminuye la legibilidad.

---

## 3. Estructura exacta: 6 familias y 13 capítulos

**DECISIÓN APROBADA:** el índice móvil es una **rueda de seis fragmentos + panel de pergamino desplegable**; se descarta el mandala de 13 botones pequeños como navegación principal. Los 13 capítulos siguen intactos, accesibles desde sus familias.

| Familia (`familyId`) | Nombre visible | Bajada bajo el nombre | Capítulos incluidos |
|---|---|---|---|
| `naturaleza` | **Naturaleza** | *Plantas, gemas y correspondencias* | I, II, III |
| `alquimia` | **Alquimia** | *Velas, preparaciones y creaciones* | IV, V, XII |
| `cosmos` | **Cosmos** | *Astros, lunas y ciclos del año* | VI, VII |
| `adivinacion` | **Adivinación** | *Oráculos, símbolos y lecturas* | IX |
| `espiritu` | **Espíritu** | *Rituales, conciencia y mitología* | VIII, X, XI |
| `memorias` | **Memorias** | *Sueños, experiencias y bitácora* | XIII |

**Recuento: 3 + 3 + 2 + 1 + 3 + 1 = 13 capítulos exactos.** La colocación de capítulos no limita enlaces cruzados; una entrada puede relacionarse con tantas categorías como corresponda sin duplicarse.

### 3.1 Diseño de la rueda

- Encabezado interior: **«Índice del grimorio»** y pequeña bajada **«Escoge el sendero que deseas explorar»**.
- La portada completa **no** se repite dentro de cada pantalla: usar un encabezado discreto DUIBHRÉ cuando convenga.
- Rueda ilustrada sobre pergamino, con **seis sectores grandes**, separados por líneas de oro antiguo y centro con una triquetra.
- Cada sector muestra **ilustración pintada + nombre corto** (Naturaleza, Alquimia, Cosmos, Adivinación, Espíritu, Memorias). La bajada no necesita ir dentro del sector; aparece en el panel de abajo.
- Iconografía: Naturaleza (flores/herbas + cristal), Alquimia (frasco y vela), Cosmos (astrolabio/cuerpo celeste), Adivinación (cartas y péndulo), Espíritu (símbolo de meditación/geometría), Memorias (libro/pluma/sueño).
- Mostrar siempre la rueda completa, sin obligar a hacer zoom. Los nombres completos no se enciman; usar etiquetas breves y fuente legible.
- Al tocar un sector, seleccionar y **actualizar el panel inferior** sin navegar todavía. El panel puede desplazarse con scroll si no cabe.
- El sector seleccionado también debe poder manejarse con teclado; para lectores de pantalla exponer seis botones con nombres y estado `aria-pressed`.
- Valor inicial: **Naturaleza** o última familia visitada guardada localmente. No persistir datos sensibles sin consentimiento.

### 3.2 Panel desplegable de familia

Formato de página iluminada bajo la rueda:

1. Ilustración pequeña de cabecera de la familia.
2. Título: nombre de la familia.
3. Bajada: la indicada en tabla 3.
4. Texto breve de bienvenida (ver sección 4).
5. Tarjetas de los capítulos asignados: número romano, nombre, subtítulo, mini ilustración, flecha.
6. Acciones: **«Abrir capítulo»** en cada tarjeta; **«Contraer»** en la esquina del panel (opcional); al contraer se mantiene la rueda visible.
7. Estado accesible para las animaciones y foco; en móvil no abrir panel a un costado.

---

## 4. Textos exactos del menú de seis familias

Estos son el **copy inicial propuesto** que Claude debe usar como datos configurables, no escribir de forma repetida dentro de componentes.

### NATURALEZA
- Bajada: **Plantas, gemas y correspondencias.**
- Descripción: *«La sabiduría de la tierra: hojas, flores, minerales y los lenguajes simbólicos de sus colores».*
- Ilustración: lavanda, hojas, cristales y pigmentos.
- Botones del panel:
  - **I · Herbolaria y mundo vegetal** — *Plantas, flores y usos tradicionales*.
  - **II · Gemas y minerales** — *Cristales, minerales y gemoterapia*.
  - **III · Colores y correspondencias** — *Significados, asociaciones y vínculos mágicos*.

### ALQUIMIA
- Bajada: **Velas, preparaciones y creaciones.**
- Descripción: *«Transforma ingredientes, intenciones y materiales en fórmulas, objetos y memorias de tus prácticas».*
- Ilustración: botella con elixir, caldero y vela.
- Botones del panel:
  - **IV · Velas y velomancia** — *Fuego, cera y observación ritual*.
  - **V · Alquimia y preparaciones** — *Pociones, elíxires, aceites y cocina mágica*.
  - **XII · El taller de la bruja** — *Manualidades y objetos creados por ti*.

### COSMOS
- Bajada: **Astros, lunas y ciclos del año.**
- Descripción: *«Consulta ciclos, correspondencias celestes y celebraciones, y enlázalos con tu propio calendario».*
- Ilustración: astrolabio, planeta y rueda estacional.
- Botones del panel:
  - **VI · Astrología y cosmos** — *Planetas, lunas, días y elementos*.
  - **VII · La rueda del año** — *Sabbats, esbats y celebraciones*.

### ADIVINACIÓN
- Bajada: **Oráculos, símbolos y lecturas.**
- Descripción: *«Un archivo de sistemas simbólicos, tiradas y lecturas que puedes registrar en tu bitácora».*
- Ilustración: tarot, péndulo, espejo.
- Botón del panel:
  - **IX · Adivinación y oráculos** — *Tarot, péndulo, numerología y otras mancias*.

### ESPÍRITU
- Bajada: **Rituales, conciencia y mitología.**
- Descripción: *«Explora tus prácticas personales, tradiciones, símbolos, relatos y caminos contemplativos».*
- Ilustración: triquetra/geometría, altar, figura mitológica abstracta.
- Botones del panel:
  - **VIII · Artes mágicas y hechicería** — *Rituales, sigilos, amuletos y protección*.
  - **X · Conciencia y mundo espiritual** — *Chakras, meditación, visualización y metafísica*.
  - **XI · Dioses, seres y mitología** — *Dioses y diosas, elementales y tradiciones*.

### MEMORIAS
- Bajada: **Sueños, experiencias y bitácora.**
- Descripción: *«Aquí viven los fragmentos de tu historia: lo que soñaste, hiciste, sentiste y aprendiste».*
- Ilustración: cuaderno manuscrito, pluma, estrellas discretas.
- Botón del panel:
  - **XIII · Memorias del alma** — *Sueños, diario y registros personales*.
- Acceso secundario destacado: **«Abrir mi bitácora»** → `/bitacora`.

---

## 5. Índice de los 13 capítulos y subtemas

**Patrón universal de pantalla de capítulo:** título numeral romano + ilustración estilo pergamino + subtítulo + pestañas **«Explorar»**, **«Mis fichas»**, **«Mis notas»**; barra **«Buscar en este capítulo…»**, filtros por subtema, favoritos, y botón **«+ Crear ficha»**. Al tocar un subtema abre una colección de fichas con buscador y filtros, sin romper la ruta del capítulo. En cada ficha se puede **Consultar, Editar (si es propia), Guardar en favoritos, Añadir nota, Ver relaciones, Vincular al calendario**.

### I. Herbolaria y mundo vegetal (`herbolaria`)
**Subtítulo:** *«La sabiduría de las raíces, hojas y flores»*.  
**Subtemas:** Herbolaria general; Plantas mágicas; Plantas medicinales; Flores; Cultivo y cuidados.  
**Ficha específica:** nombre común, nombre científico opcional, fotografía original, ilustración, descripción, cultivo, luz, riego, partes utilizadas, referencias botánicas, usos tradicionales, correspondencias simbólicas, precauciones, fuentes, notas personales.  
**Acciones:** «Agregar planta», «Transformar foto en ilustración», «Registrar riego/cuidado», «Añadir observación», «Vincular actividad a agenda».

### II. Gemas y minerales (`gemas`)
**Subtítulo:** *«Piedras, cristales y memorias de la tierra»*.  
**Subtemas:** Gemas; Minerales; Cristales; Gemoterapia (como sistema de creencias, no tratamiento médico); Limpieza y cuidado físico de las piezas.  
**Ficha:** nombre, clasificación, color y composición si se conoce, procedencia, foto/ilustración, propiedades físicas, simbolismo tradicional, asociaciones, cuidados y precauciones, colección personal, notas.

### III. Colores y correspondencias (`colores`)
**Subtítulo:** *«El lenguaje simbólico del color»*.  
**Subtemas:** Paleta cromática; Significados simbólicos; Correspondencias con velas, gemas, plantas, chakras, planetas y días; Combinaciones para prácticas.  
**Importante:** **Colores es capítulo independiente y transversal**, NO está enterrado dentro de Gemas ni Alquimia.  
**Ficha:** nombre, valor hexadecimal opcional, muestra cromática, asociaciones por tradición, relaciones a otras fichas, usos personales y fuentes.

### IV. Velas y velomancia (`velas`)
**Subtítulo:** *«El fuego, la cera y sus símbolos»*.  
**Subtemas:** Tipos de velas; Colores de velas; Preparación ritual; Velomancia; Observación de llama y cera; Registro de velas.  
**Ficha:** tipo, color, material, intención, modo de uso, fecha, imágenes, observaciones y notas. Incluir advertencias de seguridad contra incendios, quemaduras y uso cerca de niños/mascotas.

### V. Alquimia y preparaciones (`preparaciones`)
**Subtítulo:** *«Fórmulas, ingredientes y recetas del grimorio»*.  
**Subtemas:** Cocina mágica; Pociones; Elíxires; Aceites; Sahumerios; Inciensos; Mezclas, sales y fórmulas artesanales.  
**Ficha:** nombre, tipo, intención simbólica, ingredientes y cantidades, herramientas, preparación por pasos, duración, fotos/ilustraciones, cuidados de almacenamiento, contraindicaciones y bitácora del resultado. **No sugerir ingestión ni aplicaciones corporales peligrosas; distinguir recetas comestibles de preparados rituales no ingeribles.**

### VI. Astrología y cosmos (`cosmos`)
**Subtítulo:** *«El cielo, sus ciclos y correspondencias»*.  
**Subtemas:** Astrología; Planetas; Fases lunares; Lunas vacías de curso; Días de la semana y correspondencias; Elementos; Signos, cartas y ciclos según tradiciones.  
**Ficha:** símbolo, descripción, ciclo/fecha si procede, tradición, correspondencias, relaciones y notas. Para cálculos astronómicos reales, usar una fuente/librería de efemérides verificada cuando se implemente; **no inventar fechas ni fases**.

### VII. La rueda del año (`rueda-ano`)
**Subtítulo:** *«El calendario de las estaciones y las celebraciones»*.  
**Subtemas:** Sabbats; Esbats; Rueda del año; Celebraciones; Días especiales; Tradiciones del hemisferio norte/sur; Preparación de celebraciones.  
**Ficha:** nombre, tradición, significado, fechas que correspondan al hemisferio y escuela elegidos, rituales relacionados, actividades, notas, vínculo con calendario. **No equiparar automáticamente todas las tradiciones paganas** ni fijar un calendario universal: permitir configuración y edición.

### VIII. Artes mágicas y hechicería (`hechiceria`)
**Subtítulo:** *«Rituales, símbolos y objetos de intención»*.  
**Subtemas:** Rituales; Hechizos; Invocaciones; Sigilos; Símbolos mágicos; Amuletos y talismanes; Protección y limpieza energética; Herramientas y altar.  
**Ficha:** nombre, tradición/origen, intención, materiales, pasos, advertencias, fecha sugerida (opcional), fotografías/ilustraciones y notas. Botón especial **«Registrar práctica»** que crea un evento de bitácora enlazado.

### IX. Adivinación y oráculos (`adivinacion`)
**Subtítulo:** *«Lecturas, símbolos y formas de interpretación»*.  
**Subtemas:** Tarot; Péndulo; Numerología; Oráculos; Runas; Otras mancias; Adivinación en espejo.  
**Ficha:** sistema, descripción de tirada/método, símbolos, contexto, fecha, interpretación personal, cartas/resultados y reflexiones. Separar fichas de aprendizaje de sesiones personales.

### X. Conciencia y mundo espiritual (`conciencia`)
**Subtítulo:** *«Prácticas interiores y caminos de contemplación»*.  
**Subtemas:** Metafísica; Chakras; Geometría sagrada; Meditación; Visualización; Canalización; Viaje astral; Experiencias subjetivas.  
**Ficha:** práctica, tradición o marco interpretativo, guía, duración, fecha, símbolos, diario de sensaciones, imágenes, reflexiones y fuentes. No presentar canalización o viaje astral como hechos verificables; usar lenguaje de experiencia personal y creencias.

### XI. Dioses, seres y mitología (`mitologia`)
**Subtítulo:** *«Relatos, deidades, seres y símbolos del mundo»*.  
**Subtemas:** Dioses y diosas (en un solo espacio); Elementales; Mitologías; Tradiciones; Animales y simbolismo; Panteones y correspondencias culturales.  
**Ficha:** nombre, cultura/tradición, historia, símbolos, representaciones, referencias, relaciones a otras fichas y notas. Evitar inventar genealogías o mezclar culturas sin fuente.

### XII. El taller de la bruja (`taller`)
**Subtítulo:** *«Objetos, manualidades y creaciones hechas por ti»*.  
**Subtemas:** Manualidades mágicas; Creación de objetos rituales; Velas artesanales; Jabones; Decoración de altar; Encuadernación y otros proyectos.  
**Ficha:** proyecto, objetivo, materiales, herramientas, pasos, fotos, ilustraciones, tiempo, costo opcional, notas y resultado. **No confundir este capítulo de manualidades con el servicio de IA para transformar fotos**; esa herramienta debe estar integrada en todas las fichas.

### XIII. Memorias del alma (`memorias`)
**Subtítulo:** *«Sueños, vivencias y páginas de tu propia historia»*.  
**Subtemas:** Sueños; Diario personal; Recuerdos; Aprendizajes; Experiencias espirituales; Registro de prácticas; Notas libres.  
**Ficha/registro:** título, fecha, hora opcional, texto libre, estado de ánimo opcional, símbolos, foto/ilustración, práctica vinculada, etiquetas, privacidad, próximo recordatorio opcional.  
**Regla central:** este capítulo reúne, además de los sueños y notas libres, los registros creados dentro de rituales, tarot, plantas, meditación, cocina mágica, etc. **No obligar a duplicar la nota**: vincular la misma entidad desde ambos lugares.

---

## 6. Navegación inferior y comportamiento

**Navbar fija inferior, exactamente cinco accesos** (scroll seguro por zona inferior del teléfono):

| Orden | Etiqueta | Ícono | Ruta | Comportamiento |
|---|---|---|---|---|
| 1 | **Inicio** | casa | `/inicio` | Panel personal de bienvenida y actividad reciente |
| 2 | **Índice** | libro/rueda | `/indice` | Rueda de seis familias + panel desplegable |
| 3 | **Crear** | círculo con `+` | `/crear` | Acción central destacada; abre selector de creación |
| 4 | **Agenda** | calendario | `/agenda` | Calendario de eventos, celebraciones y recordatorios |
| 5 | **Bitácora** | pluma/cuaderno | `/bitacora` | Diario y registros vinculados, con filtros |

**Perfil**: NO necesita un sexto botón en la navbar; acceso mediante avatar/ícono en la esquina superior derecha de las pantallas interiores. **Buscar**: lupa en header del Índice, también accesible desde cabeceras de capítulo. **Volver**: flecha superior izquierda cuando no se está en un destino raíz; funciona con historial real. Si alguien abre un enlace directo sin historial, vuelve a su padre lógico (`/indice`, `/capitulos/:id`, etc.).

### Reglas concretas de navegación

- Portada → «Abrir grimorio» (botón flotante de interfaz fuera de la ilustración o gesto de tocar portada) → `/inicio`.
- Inicio → «Explorar mi grimorio» → `/indice`.
- Índice → tocar familia → actualiza panel inferior; no cambia de ruta necesariamente; persistir familia seleccionada en query `?familia=...`.
- Panel → tocar capítulo → `/capitulos/:chapterId`.
- Capítulo → tocar subtema o ficha → `/capitulos/:chapterId/subtemas/:subtopicId` o `/fichas/:entryId`.
- Ficha → «Editar», «Añadir nota», «Relacionar», «Agregar a agenda», «Favorito»; al cerrar vuelve a origen conservando filtros, selección y scroll cuando sea viable.
- Botón «Crear» del menú siempre abre una **hoja/modal** con opciones: **«Nueva ficha de conocimiento»**, **«Nueva entrada de bitácora»**, **«Nuevo evento o recordatorio»**. Mantener contexto de capítulo cuando se crea desde dentro.
- En modal: botón visible **«Cancelar»**, cierre accesible, confirmación si hay cambios sin guardar.
- Menú inferior siempre con indicador de selección; en pantallas de detalle el origen activo permanece resaltado cuando corresponda.
- El botón de volver del sistema Android/gesto del navegador debe comportarse correctamente.

---

## 7. Pantallas completas, contenido y botones

### 7.1 Portada `/`
**Visual:** ilustración aprobada, cuero verde/negro, fases lunares espaciadas, DUIBHRÉ con D ornamentada, bajada «Grimorio de un alma», triquetra inferior. Sin botánica, sin texto etimológico adicional.  
**Acción:** tocar portada o botón UI «Abrir grimorio» situado **fuera del arte de portada**.  
**Transición:** apertura sutil de libro a Inicio, con alternativa sin animación.  
**Primer uso:** si todavía no hay registros, ofrecer crear primera ficha desde Inicio; no exigir cuenta.

### 7.2 Inicio `/inicio`
**Título:** «Mi grimorio»; bajada: *«Cada página guarda un fragmento de tu historia»*.  
**Bloques:** saludo opcional por alias, «Continuar donde quedaste», «Mi última página», «Próximos acontecimientos» (agenda), «Mis favoritos», acceso al Índice y una tarjeta «Escribir una nueva página». Un indicador de fase lunar solo cuando haya fuente astronómica válida; si no, no mostrar una fase ficticia.  
**Botones:** «Explorar índice», «Crear ficha», «Abrir agenda», «Ver mi bitácora», «Ver todos» por módulo.

### 7.3 Índice `/indice`
**Título:** «Índice del grimorio»; bajada *«Escoge el sendero que deseas explorar»*.  
**Elementos:** rueda 6 sectores, panel inferior seleccionado con textos de la sección 4, 1–3 capítulos por familia, buscador global en header, botón discreto «Mostrar índice en lista» como alternativa accesible a la rueda.  
**Botones:** sectores, «Abrir capítulo», «Contraer panel», «Ver índice en lista».

### 7.4 Capítulo `/capitulos/:chapterId`
**Visual:** página de pergamino con cabecera ilustrada específica; subtítulo.  
**Componentes:** pestañas «Explorar» / «Mis fichas» / «Mis notas»; subtemas; buscador local; tarjetas de conocimiento; filtros «Todos», «Favoritos», «Recientes»; estados vacío y cargando.  
**Botones:** «Crear ficha», «Abrir ficha», «Guardar favorito», «Volver al índice».

### 7.5 Subtema `/capitulos/:chapterId/subtemas/:subtopicId`
**Visual:** título y breve explicación; grid/lista de fichas con ilustraciones y etiquetas.  
**Botones:** «Agregar conocimiento», «Filtrar», «Ordenar», «Abrir ficha», «Volver al capítulo».

### 7.6 Detalle de ficha `/fichas/:entryId`
**Cabecera:** título, capítulo, subtema, categoría de contenido, fecha de actualización, ilustración principal, favorito.  
**Cuerpo:** campos específicos del tipo de ficha, bloques de texto, imágenes, fuentes y enlaces relacionados.  
**Pestañas/secciones:** «Conocimiento», «Mis anotaciones», «Relaciones».  
**Botones:** «Editar», «Añadir nota», «Crear recordatorio», «Vincular al calendario», «Ver imagen original», «Transformar imagen en ilustración» (solo activa si servicio disponible), «Compartir/exportar» (V2), «Archivar» y «Eliminar» para propios con confirmación. Las fichas de contenido de ejemplo pueden copiarse a «Mis fichas» en vez de editarse en origen.

### 7.7 Crear/editar ficha `/crear/ficha` y `/fichas/:entryId/editar`
**Título:** «Escribir una nueva página» / «Editar página».  
**Pasos visibles:** 1) Elegir familia/capítulo/subtema; 2) Datos principales; 3) Foto e ilustración; 4) Notas/correspondencias; 5) Guardar. Mantener formulario editable sin forzar cinco pantallas distintas; un asistente de secciones o acordeones es suficiente.  
**Campos comunes:** título (obligatorio), capítulo (obligatorio), subtema, descripción, etiquetas, estado borrador, fotos, ilustraciones, relaciones, fuentes/referencias, notas. Mostrar campos especiales según capítulo.  
**Botones:** «Tomar foto», «Subir imagen», «Previsualizar», «Transformar en ilustración» (si implementado), «Guardar borrador», «Guardar ficha», «Cancelar», «Volver».  
**Validaciones:** título requerido, confirmar pérdida de cambios, manejo de imágenes demasiado grandes, guardar transaccionalmente.

### 7.8 Crear registro de bitácora `/crear/nota`
**Título:** «Dejar una memoria».  
**Campos:** título, fecha/hora (por defecto hora local editable), tipo (sueño/ritual/tirada/meditación/recuerdo/otro), texto libre, emociones opcionales, fotos, ficha relacionada opcional, etiquetas, fecha próxima opcional.  
**Botones:** «Guardar en bitácora», «Vincular ficha», «Añadir a agenda», «Guardar borrador».

### 7.9 Agenda `/agenda`
**Título:** «Agenda mágica»; bajada: *«Tus ciclos, celebraciones y páginas por venir»*.  
**Vistas:** mes (default), semana/lista, detalle del día. Navegar meses con flechas.  
**Tipos de evento visualmente distinguibles:** sabbat, esbat, fase lunar (cuando se calcule correctamente), ritual personal, tarea/recordatorio, anotación con fecha, cuidado de plantas, actividad artesanal.  
**Botones:** «Nuevo evento», «Agregar recordatorio», «Hoy», «Ver nota relacionada», «Ver ficha relacionada», «Editar evento», «Eliminar evento».  
**Configuración:** hemisferio sur/norte, zona horaria, tradición/calendario opcional, recordatorios habilitados solo con permiso. Inicio por defecto: hemisferio sur, `America/Santiago`, editable en Perfil. **No asumir fechas de sabbats universalmente válidas; cargarlas de fuente revisada o permitir configuración manual.**  
**Sincronización interna:** notas o prácticas con fecha se muestran sin tener que copiarlas; cambios de fecha se reflejan. Integración externa con Google/Apple Calendar queda para V2 y requiere consentimiento explícito.

### 7.10 Bitácora `/bitacora`
**Título:** «Memorias del alma»; bajada: *«Todo lo que has vivido y conservado en tus páginas»*.  
**Visual:** entradas como pequeñas hojas manuscritas ordenadas cronológicamente; filtros «Todos», «Sueños», «Rituales», «Meditaciones», «Tiradas», «Notas» y «Favoritos».  
**Botones:** «Nueva entrada», «Buscar memorias», «Filtrar», «Abrir», «Editar», «Vincular al calendario». Mostrar registros creados desde cualquier capítulo; no duplicar.

### 7.11 Perfil `/perfil`
**Título:** «Mi perfil» o «Guardiana del grimorio».  
**Secciones y botones:**
- **Identidad del grimorio:** alias/nombre elegido, avatar o sello, dedicatoria personal editable. «Editar mi perfil».
- **Mi archivo:** número de fichas, memorias y favoritos (siempre datos reales, no estadísticas inventadas). «Ver mis fichas», «Ver favoritos».
- **Preferencias:** idioma, zona horaria, hemisferio, tradición/calendario opcional, formato de fecha, tema, accesibilidad, reducir animaciones. «Guardar preferencias».
- **Privacidad y datos:** «Exportar mis datos», «Importar respaldo», «Borrar mis datos» con confirmación fuerte, «Información sobre privacidad».
- **Ilustraciones:** estilos preferidos, decisión de subir fotos a un servicio externo cuando se habilite IA. «Administrar preferencias de ilustración».
- **Cuenta (V2):** iniciar sesión, cerrar sesión, sincronizar dispositivos; en V1 mostrar «Tus datos se guardan en este dispositivo» sin simular cuentas existentes.

### 7.12 Buscar `/buscar`
**Título:** «Buscar en mi grimorio».  
**Buscar:** título, etiquetas, subtema, texto de fichas, notas propias; filtros familia, capítulo, tipo y favoritos.  
**Resultados:** ficha o nota + etiqueta de origen; estados vacío y sin resultados, accesibilidad.

### 7.13 Estados obligatorios

- App vacía: «Tu grimorio todavía espera su primera página» + «Crear mi primera ficha».
- Familia sin fichas: «Aún no has escrito sobre este sendero» + «Agregar conocimiento».
- Sin notas: «Todavía no hay memorias guardadas» + «Escribir una memoria».
- Sin resultados: «No encontramos páginas con esa búsqueda» + «Limpiar filtros».
- Fallo de guardado: mensaje real, conserva formulario, permite reintentar.
- Operación IA no configurada: «La transformación ilustrada estará disponible próximamente»; **no fingir que se generó una imagen**.

---

## 8. Diseño de contenido y modelos de datos

Construir configuración de familias y capítulos desde **arrays de datos tipados**; no duplicar textos en cada pantalla. Las fichas personales deben compartir un modelo base y extenderse con **campos específicos por plantilla**.

### 8.1 Tipos sugeridos en TypeScript

```ts
type FamilyId = 'naturaleza' | 'alquimia' | 'cosmos' | 'adivinacion' | 'espiritu' | 'memorias';
type ChapterId = 'herbolaria' | 'gemas' | 'colores' | 'velas' | 'preparaciones' |
  'cosmos' | 'rueda-ano' | 'hechiceria' | 'adivinacion' | 'conciencia' |
  'mitologia' | 'taller' | 'memorias';
type NoteKind = 'sueno' | 'ritual' | 'tirada' | 'meditacion' | 'recuerdo' |
  'observacion' | 'otro';
type EventKind = 'sabbat' | 'esbat' | 'lunar' | 'ritual' |
  'cuidado-planta' | 'tarea' | 'recordatorio' | 'personal';

interface Family {
  id: FamilyId;
  title: string;
  subtitle: string;
  description: string;
  chapterIds: ChapterId[];
  illustrationKey: string;
}
interface Chapter {
  id: ChapterId;
  romanNumeral: string;
  familyId: FamilyId;
  title: string;
  subtitle: string;
  subtopics: { id: string; title: string; description?: string }[];
  templateId: string;
}
interface MediaAsset {
  id: string;
  originalBlobId?: string;  // IndexedDB, nunca base64 enorme en localStorage
  illustratedBlobId?: string;
  alt: string;
  style?: 'botanico' | 'tinta-antigua' | 'acuarela-grimorio';
  status: 'original' | 'preview' | 'generated' | 'failed';
}
interface GrimorioEntry {
  id: string;
  chapterId: ChapterId;
  subtopicId?: string;
  title: string;
  description?: string;
  origin: 'seed' | 'personal';
  status: 'draft' | 'saved' | 'archived';
  tags: string[];
  isFavorite: boolean;
  blocks: { id: string; type: 'text' | 'list' | 'steps' | 'quote'; content: unknown }[];
  extraFields: Record<string, unknown>;
  media: MediaAsset[];
  relatedEntryIds: string[];
  sources?: { title: string; url?: string }[];
  createdAt: string;
  updatedAt: string;
}
interface JournalRecord {
  id: string;
  kind: NoteKind;
  title: string;
  body: string;
  date: string;      // ISO local / con zona horaria en persistencia
  linkedEntryIds: string[];
  mediaIds: string[];
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}
interface CalendarEvent {
  id: string;
  title: string;
  kind: EventKind;
  startAt: string;
  endAt?: string;
  timeZone: string;
  linkedEntryId?: string;
  linkedRecordId?: string;
  source: 'user' | 'calendar-dataset';
  notes?: string;
  recurrence?: string;
  remindAt?: string;
}
interface Preferences {
  displayName?: string;
  hemisphere: 'south' | 'north';
  timeZone: string; // por defecto America/Santiago; editable
  locale: 'es-CL';
  reduceMotion: boolean;
  theme: 'dark-leather';
  preferredIllustrationStyle: MediaAsset['style'];
}
```

**Relaciones:** `family → chapters → subtopics → entries`; `entries ↔ related entries`; `entries ↔ journalRecords`; `journalRecords ↔ calendarEvents`. Un mismo registro puede aparecer en Bitácora y en el detalle de su ritual sin duplicarse. Todas las categorías cruzadas se implementan con relaciones y etiquetas.

### 8.2 Plantillas de formulario

- **Planta:** taxonomía, luz, riego, usos simbólicos, precauciones, imagen.
- **Gema:** clasificación física, color, correspondencias, cuidados, colección.
- **Color:** muestra y código, significados por tradición, relaciones.
- **Vela:** color/material, intención, fechas, observaciones de llama/cera.
- **Preparación:** ingredientes, pasos, uso ritual/comestible, seguridad.
- **Astro/ciclo:** fenómeno, símbolo, referencias, fecha si es verificable.
- **Celebración:** tradición, hemisferio, fecha configurable, rituales y agenda.
- **Ritual:** intención, materiales, pasos, registro, próximo recordatorio.
- **Lectura oracular:** método, tirada, símbolos, interpretación, fecha.
- **Práctica interior:** guía/duración, experiencia, precauciones, reflexiones.
- **Deidad/mitología:** cultura, relatos, símbolos, fuentes.
- **Manualidad:** materiales, pasos, fotos, resultado.
- **Memoria/sueño:** fecha, relato libre, imágenes, emociones, vínculos.

Todas las fichas permiten foto original, imagen ilustrada, tags, favoritos, fuentes, notas y relaciones.

---

## 9. Fotografía → ilustración, sin engaños técnicos

**Experiencia objetivo:** en cualquier ficha, por ejemplo al agregar «Menta», la persona puede tocar «Tomar foto» o «Subir imagen», previsualizarla, elegir estilo de dibujo antiguo y obtener una ilustración botánica integrada al grimorio. Se conserva la foto original para consulta.

**V1 (base funcional sin API externa):** implementar subida, previsualización, eliminación, guardado local de imagen, selector de estilo y un componente visual preparado para la futura generación. Si se incorpora un filtro local tipo boceto, llamarlo **«Vista previa estilizada»**, no «IA generada». El botón «Transformar en ilustración» debe explicar que necesita configurar un servicio real; no usar imágenes fijas para fingir el resultado.

**V2:** añadir endpoint backend seguro (`POST /api/illustrations/transform`) con modelo proveedor elegido después, subida por consentimiento, límites de tamaño y coste, estados de progreso/error, manejo de datos y almacenamiento seguro. **Jamás poner API keys en el bundle del navegador.** Preservar la foto fuente y permitir aceptar o descartar el resultado.

**Estilos:** «Lámina botánica», «Tinta antigua», «Acuarela de grimorio»; un mismo lenguaje visual en todo DUIBHRÉ.

---

## 10. Calendario y bitácora conectados

Reglas explícitas:

1. Se puede escribir una nota dentro de cualquier ficha **sin** crear una cita en calendario.
2. Si la nota tiene fecha de seguimiento, puede generar o vincular un evento con «Añadir a agenda».
3. Un ritual programado en agenda puede abrir su ficha y permitir **«Registrar cómo resultó»**, creando una nota enlazada.
4. Las celebraciones y ciclos se muestran en el calendario solo cuando exista una **fuente o configuración válida**; su zona horaria, hemisferio y tradición son configurables.
5. Una nota de sueño aparece en Bitácora y opcionalmente en calendario, nunca se crea por duplicado.
6. Se puede editar, eliminar y desvincular un evento sin borrar accidentalmente el contenido de la ficha.
7. Los datos personales se consideran privados por defecto.
8. Las notificaciones y la sincronización con calendarios externos no son requisito de la primera versión.

**Ejemplo de flujo:** «Ritual de luna llena» → «Programar en agenda» → agenda muestra evento → al finalizar «Registrar práctica» → guardar observaciones → aparecen en detalle del ritual **y** en Bitácora.

---

## 11. Perfil, privacidad y personalización

**Perfil no es una red social.** Es un espacio privado para definir el grimorio propio:

- Nombre/alias mostrado en Inicio.
- Avatar o sello personal opcional.
- Dedicatoria del libro, visible en una página interior personal, **no en la portada oficial**.
- Preferencias de lectura, accesibilidad, tamaño de letra, movimiento reducido.
- Configuración de hemisferio (`south` por defecto), zona horaria, idioma, fechas, tradición si corresponde.
- Estadísticas verdaderas: cuántas fichas, notas y eventos creó.
- Mis favoritos, mis fichas, mis memorias.
- Respaldo: **exportar JSON** con contenido y, si es viable, media como ZIP; **importar** con validación; confirmar antes de sobrescribir datos.
- Borrado de datos con aviso y confirmación explícita.
- En V1 todo es local; comunicar que limpiar navegador o cambiar de dispositivo puede perder datos sin respaldo.
- V2: login opcional, sincronización en nube, control de privacidad, exportación de datos y políticas adecuadas.

---

## 12. Propuesta técnica para empezar el repositorio GitHub

### Stack recomendado

- **Vite + React + TypeScript** (SPA con rutas internas).
- **React Router** para navegación y back/forward.
- **CSS variables + CSS Modules** (o solución CSS equivalente documentada), responsive y accesible.
- **Lucide React** como iconos temporales, reemplazables por ilustraciones/símbolos propios.
- **Dexie + IndexedDB** para fichas, registros, eventos, preferencias e imágenes locales.
- **Zod** para validación de formularios y respaldos.
- **date-fns** o librería de fechas equivalente para calendario local; resolver zonas horarias de manera explícita.
- **Vitest + React Testing Library**, ESLint y Prettier.
- Preparar despliegue a Vercel/Netlify; base orientada a PWA, pero no exigir offline avanzado para la primera iteración.

### Rutas

```text
/                           Portada
/inicio                     Inicio
/indice                     Rueda 6 familias + panel (?familia=naturaleza)
/capitulos/:chapterId       Capítulo seleccionado
/capitulos/:chapterId/subtemas/:subtopicId
/fichas/:entryId            Detalle
/fichas/:entryId/editar     Edición
/crear                      Menú de creación
/crear/ficha                Formulario ficha
/crear/nota                 Crear memoria
/crear/evento               Evento o recordatorio
/agenda                     Calendario
/bitacora                   Memorias del alma
/buscar                     Búsqueda global
/perfil                     Perfil y configuración
```

### Estructura sugerida del código

```text
src/
  app/
    App.tsx
    router.tsx
    providers/
  assets/
    cover/
    illustrations/
    textures/
  components/
    layout/AppShell.tsx
    layout/BottomNav.tsx
    layout/TopBar.tsx
    index/FamilyWheel.tsx
    index/FamilyPanel.tsx
    chapter/ChapterHeader.tsx
    chapter/EntryCard.tsx
    entry/EntryForm.tsx
    entry/EntryDetail.tsx
    media/PhotoUploader.tsx
    media/IllustrationPreview.tsx
    calendar/MagicCalendar.tsx
    journal/JournalEditor.tsx
    common/EmptyState.tsx
    common/ConfirmDialog.tsx
  config/
    families.ts
    chapters.ts
    entryTemplates.ts
    uiCopy.ts
  data/
    db.ts
    repositories/
    seedDemo.ts
  hooks/
  pages/
    CoverPage.tsx
    HomePage.tsx
    IndexPage.tsx
    ChapterPage.tsx
    SubtopicPage.tsx
    EntryPage.tsx
    EditEntryPage.tsx
    CreatePage.tsx
    AgendaPage.tsx
    JournalPage.tsx
    SearchPage.tsx
    ProfilePage.tsx
  styles/
    tokens.css
    global.css
  types/
    domain.ts
  utils/
    dates.ts
    backup.ts
    accessibility.ts
  tests/
public/
  icons/
README.md
.env.example
```

### Datos de ejemplo y repositorio

- Cargar **seis familias, trece capítulos y todos sus subtemas** desde configuración estática.
- Usar unas pocas fichas de demostración editables/copiables, etiquetadas **«Ejemplo»** para no fingir información personal real ni rellenar el grimorio con afirmaciones esotéricas sin fuentes.
- Crear `README.md` con propósito, instalación (`npm install`, `npm run dev`), scripts, capturas futuras, alcance y decisiones.
- Crear `.gitignore`, `.env.example` sin claves, licencias de recursos, `LICENSE` si la autora la elige, lint/test/build.
- Añadir flujo GitHub Actions para lint/test/build como mejora recomendable.
- No publicar fotografías privadas o datos personales en el repositorio.
- Si Claude tiene acceso autorizado a GitHub, puede crear rama/repositorio y commits; si no, debe crear archivos localmente y entregar instrucciones de `git init`, commit y push, sin simular acceso.

---

## 13. Alcance por entregas para no perder el proyecto

### Etapa 1 — Base navegable y fiel a la identidad visual (PRIORIDAD)

**Debe quedar funcionando:** portada, shell responsive, navbar de cinco acciones, perfil accesible por avatar, rueda SVG/ilustrada de seis familias, selección real de segmento, panel inferior dinámico, trece capítulos y subtemas cargados por configuración, páginas de capítulo, búsqueda sencilla, estados vacíos y navegación de regreso correcta. Pantallas internas de pergamino y diseño fiel a referencia.

**No implementar en esta etapa:** cuentas falsas, IA falsa, calendarios astronómicos inventados, pagos, APIs sin claves, animaciones pesadas.

### Etapa 2 — CRUD y persistencia local

Crear/editar/archivar/eliminar fichas; notas vinculadas a fichas; favoritos; búsqueda y filtros; subida de fotos; IndexedDB; bitácora central y exportación JSON.

### Etapa 3 — Agenda vinculada

Calendario mensual/listado, eventos propios, recordatorios manuales, vínculos bidireccionales con notas y fichas, ajustes hemisferio y zona horaria.

### Etapa 4 — Ilustraciones por IA y nube (POSTERIOR)

Integrar generador real de imágenes desde backend con consentimiento, cuentas opcionales, sincronización, calendario externo y notificaciones; no bloquear MVP por esto.

---

## 14. Criterios de aceptación verificables

- [ ] Portada muestra **solo** «DUIBHRÉ» y «Grimorio de un alma» como texto de arte, con fases lunares arriba, triquetra y sin plantas.
- [ ] UI mobile-first funciona a 320, 375, 390, 430 px y en desktop.
- [ ] Índice contiene **6** sectores accesibles; al seleccionar cambia el panel sin tapar la rueda.
- [ ] Paneles listan **exactamente 13 capítulos**, agrupados 3/3/2/1/3/1.
- [ ] Existe alternativa de **índice en lista** accesible.
- [ ] Cada capítulo tiene subtemas, pestañas, buscador local, estado vacío y botón de crear.
- [ ] Navbar tiene **Inicio, Índice, Crear, Agenda, Bitácora** y resalta destino activo.
- [ ] Perfil se abre desde ícono superior, nunca está oculto detrás de la navegación.
- [ ] Volver funciona correctamente, también con enlaces profundos.
- [ ] Se crea una ficha (ejemplo «Menta») y persiste al recargar.
- [ ] Se sube una fotografía y se guarda con la ficha, con `alt` editable.
- [ ] Si IA no está configurada, no se representa una transformación falsa como si fuera real.
- [ ] Una nota creada en una ficha aparece en Bitácora **sin duplicación**.
- [ ] Un evento vinculado se ve en Agenda y navega a su nota/ficha.
- [ ] Colores es capítulo III independiente, con enlaces transversales.
- [ ] Chakras, canalización, visualización, viaje astral, espejo, dioses y diosas, elementales, sabbats/esbats, lunas vacías y demás temas acordados aparecen en los subtemas correctos.
- [ ] Contraste, texto, teclado, lector de pantalla y movimiento reducido reciben atención.
- [ ] `npm run lint`, `npm run test`, `npm run build` pasan, o se documentan claramente los bloqueos reales.

---

## 15. Entregable que se debe pedir a Claude AHORA

> **Claude, comienza la Etapa 1.** Construye la base del repositorio de DUIBHRÉ usando esta especificación. Necesito un proyecto **React + TypeScript + Vite** que arranque de verdad; rutas, componentes, tokens de diseño, 6 familias configuradas, 13 capítulos completos, navegación inferior, selector circular de seis sectores con panel de pergamino desplegable, páginas de capítulo, estados vacíos y vista de perfil inicial. Usa la portada aprobada que te adjunto como referencia visual y, si puedes usar el archivo como asset, introdúcelo respetando el texto exacto y sin añadir frases. Diseña mobile-first y con accesibilidad básica. Prepara la estructura para IndexedDB, agenda, bitácora, foto→ilustración y búsqueda, pero **no simules funciones que aún no existen**. Ejecuta instalación, lint, tests y build; describe lo que sí verificaste. Si tienes permisos de GitHub, trabaja en una rama y haz commits claros; si no, déjame el proyecto listo para subir y explícame cómo hacerlo. Al terminar, enséñame el árbol de archivos, las rutas creadas, los comandos de ejecución y qué corresponde a la siguiente etapa.

### Notas finales innegociables

- El nombre es **DUIBHRÉ**, bajada **Grimorio de un alma**; conservar ortografía y tilde.
- Portada sin plantas; plantas e ilustraciones **por dentro**.
- No reducir a 6 capítulos: son **6 familias y 13 capítulos**.
- No usar UI genérica tipo dashboard corporativo: el interior debe sentirse como páginas ilustradas de un grimorio.
- Las imágenes estilizadas son **una acción transversal** cuando se crea una ficha, no un capítulo nuevo.
- Las notas de rituales y otros registros deben vivir **en su contexto** y también agregarse a la Bitácora central.
- La agenda debe vincularse con notas, celebraciones y prácticas, respetando hemisferio y zona horaria.
- No necesito que todo esté terminado de golpe: **primero una base sólida, clara, usable y preparada para crecer**.
