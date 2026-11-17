# Ilustraciones pendientes para DUIBHRÉ

Las ilustraciones actuales del índice están **recortadas de la imagen aprobada**
`03_Indice_Movil_Rueda_6_Familias_ELEGIDA.png`. Funcionan, pero tienen baja resolución
(unos 90–200 px) y faltan varias. Las definitivas se generan aparte (ChatGPT) y se reemplazan
en `src/assets/illustrations/` con el **mismo nombre de archivo**; no hay que tocar código.

## Formato para todas

- Estilo: acuarela botánica y tinta antigua sobre pergamino claro, como el tablero de UI aprobado.
- Fondo: pergamino claro liso (se funde con la rueda) o, mejor, PNG con fondo transparente.
- Sin texto, sin marcos, sin bordes, objeto centrado con aire alrededor.
- Tamaño mínimo: 600 × 400 px (horizontal 3:2) para la rueda y las tarjetas; 600 × 1300 px (vertical) para las láminas de panel.

## Lista

| Archivo                                               | Qué debe mostrar                                               | Estado                                                      |
| ----------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| `familias/naturaleza.jpg`                             | Equinácea o lavanda con un pequeño cristal                     | provisional (recorte)                                       |
| `familias/alquimia.jpg`                               | Frasco con elixir violeta, vela encendida, pequeño caldero     | provisional (recorte)                                       |
| `familias/cosmos.jpg`                                 | Astrolabio o luna con estrellas y rueda estacional             | provisional (recorte)                                       |
| `familias/adivinacion.jpg`                            | Cartas de tarot, péndulo y espejo                              | provisional (recorte)                                       |
| `familias/espiritu.jpg`                               | Triquetra o geometría sagrada con altar sencillo               | provisional (recorte: loto)                                 |
| `familias/memorias.jpg`                               | Cuaderno manuscrito abierto, pluma y estrellas discretas       | provisional (recorte)                                       |
| `familias/panel-naturaleza.jpg`                       | Lámina botánica vertical (equinácea y milenrama)               | provisional (recorte)                                       |
| `familias/panel-alquimia.jpg`                         | Lámina vertical: botellas, hierbas secas, vela                 | **falta**                                                   |
| `familias/panel-cosmos.jpg`                           | Lámina vertical: astrolabio y fases lunares                    | **falta**                                                   |
| `familias/panel-adivinacion.jpg`                      | Lámina vertical: tarot y péndulo                               | **falta**                                                   |
| `familias/panel-espiritu.jpg`                         | Lámina vertical: triquetra, altar, figura mitológica abstracta | **falta**                                                   |
| `familias/panel-memorias.jpg`                         | Lámina vertical: cuaderno, pluma, luna                         | **falta**                                                   |
| `capitulos/herbolaria.jpg` … `capitulos/memorias.jpg` | Una mini ilustración por capítulo (13)                         | 3 provisionales (herbolaria, gemas, colores); **faltan 10** |

Cuando lleguen las láminas de panel que faltan, se agregan en `src/config/illustrations.ts`
(`FAMILY_PANEL_ART` y `CHAPTER_ART`).
