# DUIBHRÉ — Grimorio de un alma

Grimorio digital vivo y personal: un libro de conocimientos mágicos y un diario donde se conservan
descubrimientos, rituales, recetas, sueños, observaciones, ilustraciones y recuerdos.
Proyecto de diseño UX/UI + front-end (portafolio) y grimorio de uso personal.

- Interfaz en español de Chile (`es-CL`), **mobile-first**, preparada para evolucionar a PWA.
- Especificación completa: [`docs/especificacion-maestra.md`](docs/especificacion-maestra.md).

## Estado: Etapa 2 en curso — guardado local

Ya funciona: crear, editar, guardar como borrador, marcar favoritas, archivar y eliminar fichas propias; copiar fichas de ejemplo a «Mis fichas»; tomar o subir fotos con texto alternativo editable. Todo se guarda en IndexedDB y persiste al recargar.

Bitácora: memorias (sueños, rituales, tiradas, meditaciones, recuerdos…) que se guardan una sola vez y aparecen en la Bitácora, en cada ficha vinculada y en «Mis notas» del capítulo. Borrar una ficha conserva sus memorias (solo las desvincula). Rutas nuevas: `/bitacora/:recordId` y `/bitacora/:recordId/editar`.

Pendiente de la Etapa 2: exportar/importar respaldo JSON y fotos en las memorias.

### Etapa 1 — base navegable

| Funciona hoy                                                                       | Llega después                                                                                                   |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Portada aprobada con «Abrir grimorio»                                              | Etapa 2: crear/editar/archivar fichas, notas, favoritos, fotos, exportar JSON                                   |
| Navbar de cinco accesos + perfil desde el avatar                                   | Etapa 3: eventos de agenda, recordatorios, vínculos nota ↔ ficha ↔ evento, ajustes de hemisferio y zona horaria |
| Rueda de 6 familias + panel de pergamino (con teclado y lector de pantalla)        | Etapa 4: ilustración por IA desde backend, cuentas, sincronización, calendarios externos                        |
| Índice alternativo en lista                                                        |                                                                                                                 |
| 13 capítulos y todos sus subtemas desde configuración                              |                                                                                                                 |
| Páginas de capítulo (pestañas, buscador, filtros, estados vacíos), subtema y ficha |                                                                                                                 |
| Búsqueda global en capítulos, subtemas y fichas                                    |                                                                                                                 |
| Agenda mensual real (sin fechas inventadas), Bitácora y Perfil con datos reales    |                                                                                                                 |
| Esquema IndexedDB (Dexie) y repositorios de lectura                                |                                                                                                                 |

Las funciones que todavía no existen se muestran con un aviso de etapa: **no se simulan** guardados,
cuentas, fases lunares ni ilustraciones generadas.

## Requisitos e instalación

Node.js 20.19 o superior (probado con Node 25).

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Script            | Qué hace                                      |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                        |
| `npm run build`   | Verificación de tipos + compilación a `dist/` |
| `npm run preview` | Sirve la compilación                          |
| `npm run lint`    | Lint con oxlint                               |
| `npm run test`    | Tests con Vitest + Testing Library            |
| `npm run format`  | Formatea con Prettier                         |

## Rutas

```text
/                                            Portada
/inicio                                      Inicio
/indice?familia=naturaleza                   Rueda de 6 familias + panel
/capitulos/:chapterId                        Capítulo
/capitulos/:chapterId/subtemas/:subtopicId   Subtema
/fichas/:entryId                             Detalle de ficha
/fichas/:entryId/editar                      Edición (Etapa 2)
/crear                                       Hoja de creación
/crear/ficha · /crear/nota · /crear/evento   Formularios (Etapas 2 y 3)
/agenda                                      Agenda mágica
/bitacora                                    Memorias del alma
/buscar                                      Búsqueda global
/perfil                                      Perfil y configuración
```

## Organización de carpetas

```text
src/
  app/            Arranque de la app y definición de rutas (router.tsx)
  assets/         Imágenes empaquetadas (cover/ = portada aprobada)
  components/     Piezas de interfaz reutilizables, agrupadas por zona:
    layout/         Armazón: AppShell, TopBar, BottomNav
    index/          Rueda de familias y panel desplegable
    chapter/        Cabecera de capítulo y tarjetas de ficha
    calendar/       Calendario mensual
    media/          Bloque foto → ilustración
    common/         Página de pergamino, estados vacíos, avisos de etapa
    ornaments/      Triquetra, lunas, filigranas e ilustraciones provisionales
  config/         Datos del grimorio: familias, capítulos, plantillas, textos de interfaz
  data/           Base de datos local (Dexie/IndexedDB), repositorios y fichas de ejemplo
  hooks/          Hooks de React (volver con historial, lecturas asíncronas)
  pages/          Una pantalla por ruta
  styles/         CSS: tokens (colores/tipos), global, layout, components, pages
  types/          Modelo de dominio en TypeScript
  utils/          Fechas, búsqueda, navegación, accesibilidad, almacenamiento
  tests/          Tests automáticos
public/           Archivos servidos tal cual (favicon, redirecciones de Netlify)
docs/             Especificación maestra y flujo de CI pendiente de activar
```

## Decisiones técnicas

- **Vite + React 19 + TypeScript + React Router 7**, SPA con `createBrowserRouter`.
- **CSS con variables + hojas globales por capa** (`tokens → global → layout → components → pages`,
  nombres tipo BEM) en lugar de CSS Modules: menos archivos y los tokens del arte en un solo lugar.
- **oxlint** (incluido por la plantilla de Vite) en lugar de ESLint: compatible con las reglas de React y
  mucho más rápido. **Prettier** para formato.
- **Dexie** sobre IndexedDB; las imágenes se guardarán como `Blob`, nunca en base64 en localStorage.
  localStorage solo guarda preferencias no sensibles (última familia, reducir animaciones).
- **date-fns** con la zona horaria explícita `America/Santiago` (hemisferio sur por defecto).
- **Tipografías** (licencia SIL OFL, empaquetadas con `@fontsource`): Cinzel Decorative (títulos),
  Cormorant Garamond (lectura), Crimson Text itálica (bajadas) y DM Sans (formularios).
- **Íconos** Lucide (licencia ISC) como provisionales.
- **Índice con el estilo de la imagen elegida** (`03_Indice_Movil_Rueda_6_Familias_ELEGIDA.png`): cuero
  verde con marco dorado, rueda pintada y panel de pergamino con lámina botánica. Las ilustraciones
  pintadas están recortadas de esa imagen y son provisionales; la lista de láminas definitivas que faltan
  está en [`docs/ilustraciones-pendientes.md`](docs/ilustraciones-pendientes.md).
- La portada usa la **imagen aprobada** optimizada (`src/assets/cover/portada-duibhre.jpg`); vectorizar el
  lettering queda como tarea posterior.
- Volver usa el historial real y, sin historial (enlace directo), el padre lógico de la ruta.

## Despliegue

Compatible con Vercel (`vercel.json`) y Netlify (`public/_redirects`): ambas reescriben todas las rutas a
`index.html`. Comando de compilación `npm run build`, carpeta `dist`.

## Privacidad

En la Etapa 1 nada sale del dispositivo. No subas fotos privadas ni datos personales al repositorio.
Nunca pongas claves de API en variables `VITE_*` (ver `.env.example`).

## Integración continua (pendiente)

El flujo de GitHub Actions (lint, tests y build) está en `docs/ci-github-actions.yml`. Para activarlo,
muévelo a `.github/workflows/ci.yml`. Subirlo con un token requiere el permiso **Workflows: Read and write**.
