import type { Family, FamilyId } from '../types/domain';

/**
 * Las seis familias del índice (secciones 3 y 4). El copy vive aquí, no en los
 * componentes. Recuento de capítulos: 3 + 3 + 2 + 1 + 3 + 1 = 13.
 */
export const FAMILIES: readonly Family[] = [
  {
    id: 'naturaleza',
    title: 'Naturaleza',
    subtitle: 'Plantas, gemas y correspondencias.',
    description:
      'La sabiduría de la tierra: hojas, flores, minerales y los lenguajes simbólicos de sus colores.',
    chapterIds: ['herbolaria', 'gemas', 'colores'],
    illustrationKey: 'naturaleza',
    sectorKeywords: ['Herbolaria · Gemas', 'Colores'],
    illustrationBrief: 'Lavanda, hojas, cristales y pigmentos.',
  },
  {
    id: 'alquimia',
    title: 'Alquimia',
    subtitle: 'Velas, preparaciones y creaciones.',
    description:
      'Transforma ingredientes, intenciones y materiales en fórmulas, objetos y memorias de tus prácticas.',
    chapterIds: ['velas', 'preparaciones', 'taller'],
    illustrationKey: 'alquimia',
    sectorKeywords: ['Velas · Preparaciones', 'Taller'],
    illustrationBrief: 'Botella con elixir, caldero y vela.',
  },
  {
    id: 'cosmos',
    title: 'Cosmos',
    subtitle: 'Astros, lunas y ciclos del año.',
    description:
      'Consulta ciclos, correspondencias celestes y celebraciones, y enlázalos con tu propio calendario.',
    chapterIds: ['cosmos', 'rueda-ano'],
    illustrationKey: 'cosmos',
    sectorKeywords: ['Astrología · Lunas', 'Rueda del año'],
    illustrationBrief: 'Astrolabio, planeta y rueda estacional.',
  },
  {
    id: 'adivinacion',
    title: 'Adivinación',
    subtitle: 'Oráculos, símbolos y lecturas.',
    description: 'Un archivo de sistemas simbólicos, tiradas y lecturas que puedes registrar en tu bitácora.',
    chapterIds: ['adivinacion'],
    illustrationKey: 'adivinacion',
    sectorKeywords: ['Tarot · Péndulo', 'Oráculos'],
    illustrationBrief: 'Tarot, péndulo, espejo.',
  },
  {
    id: 'espiritu',
    title: 'Espíritu',
    subtitle: 'Rituales, conciencia y mitología.',
    description: 'Explora tus prácticas personales, tradiciones, símbolos, relatos y caminos contemplativos.',
    chapterIds: ['hechiceria', 'conciencia', 'mitologia'],
    illustrationKey: 'espiritu',
    sectorKeywords: ['Rituales · Conciencia', 'Mitología'],
    illustrationBrief: 'Triquetra/geometría, altar, figura mitológica abstracta.',
  },
  {
    id: 'memorias',
    title: 'Memorias',
    subtitle: 'Sueños, experiencias y bitácora.',
    description: 'Aquí viven los fragmentos de tu historia: lo que soñaste, hiciste, sentiste y aprendiste.',
    chapterIds: ['memorias'],
    illustrationKey: 'memorias',
    sectorKeywords: ['Sueños · Diario', 'Registros'],
    illustrationBrief: 'Cuaderno manuscrito, pluma, estrellas discretas.',
    secondaryAction: { label: 'Abrir mi bitácora', to: '/bitacora' },
  },
] as const;

export const FAMILY_IDS = FAMILIES.map((f) => f.id);

export const DEFAULT_FAMILY_ID: FamilyId = 'naturaleza';

export function isFamilyId(value: unknown): value is FamilyId {
  return typeof value === 'string' && (FAMILY_IDS as string[]).includes(value);
}

export function getFamily(id: FamilyId): Family {
  const family = FAMILIES.find((f) => f.id === id);
  if (!family) throw new Error(`Familia desconocida: ${id}`);
  return family;
}
