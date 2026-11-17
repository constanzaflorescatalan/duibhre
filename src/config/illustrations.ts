import type { ChapterId, FamilyId } from '../types/domain';
import adivinacion from '../assets/illustrations/familias/adivinacion.jpg';
import alquimia from '../assets/illustrations/familias/alquimia.jpg';
import cosmos from '../assets/illustrations/familias/cosmos.jpg';
import espiritu from '../assets/illustrations/familias/espiritu.jpg';
import memorias from '../assets/illustrations/familias/memorias.jpg';
import naturaleza from '../assets/illustrations/familias/naturaleza.jpg';
import panelNaturaleza from '../assets/illustrations/familias/panel-naturaleza.jpg';
import capColores from '../assets/illustrations/capitulos/colores.jpg';
import capGemas from '../assets/illustrations/capitulos/gemas.jpg';
import capHerbolaria from '../assets/illustrations/capitulos/herbolaria.jpg';

/**
 * Ilustraciones pintadas recortadas de la imagen aprobada del índice
 * (`03_Indice_Movil_Rueda_6_Familias_ELEGIDA.png`). Son provisionales y de baja
 * resolución: se reemplazan por láminas definitivas generadas aparte (ver
 * docs/ilustraciones-pendientes.md) sin cambiar los componentes.
 */
export const FAMILY_ART: Record<FamilyId, { src: string; alt: string }> = {
  naturaleza: { src: naturaleza, alt: 'Equinácea pintada en acuarela' },
  alquimia: { src: alquimia, alt: 'Frasco con elixir violeta y vela encendida' },
  cosmos: { src: cosmos, alt: 'Luna entre nubes y estrellas' },
  adivinacion: { src: adivinacion, alt: 'Tres cartas de tarot con estrella y lunas' },
  espiritu: { src: espiritu, alt: 'Flor de loto con chakras' },
  memorias: { src: memorias, alt: 'Libro abierto con pluma' },
};

/** Lámina grande del panel de familia (solo existe la de Naturaleza por ahora). */
export const FAMILY_PANEL_ART: Partial<Record<FamilyId, { src: string; alt: string }>> = {
  naturaleza: { src: panelNaturaleza, alt: 'Lámina botánica de equinácea y milenrama' },
};

/** Mini ilustraciones de capítulo disponibles; el resto usa su ícono provisional. */
export const CHAPTER_ART: Partial<Record<ChapterId, { src: string; alt: string }>> = {
  herbolaria: { src: capHerbolaria, alt: 'Ramita de lavanda' },
  gemas: { src: capGemas, alt: 'Drusa de amatista' },
  colores: { src: capColores, alt: 'Pinceladas verde, violeta y ocre' },
};
