import type { Chapter, ChapterId } from '../types/domain';

/**
 * Los 13 capítulos del grimorio con todos sus subtemas (sección 5).
 * El orden del array sigue la numeración romana I–XIII.
 */
export const CHAPTERS: readonly Chapter[] = [
  {
    id: 'herbolaria',
    romanNumeral: 'I',
    familyId: 'naturaleza',
    title: 'Herbolaria y mundo vegetal',
    cardSubtitle: 'Plantas, flores y usos tradicionales',
    subtitle: 'La sabiduría de las raíces, hojas y flores',
    templateId: 'planta',
    contentNote:
      'Distingue los datos botánicos de las correspondencias simbólicas. Los usos tradicionales no son indicaciones médicas: registra siempre las precauciones.',
    subtopics: [
      { id: 'herbolaria-general', title: 'Herbolaria general' },
      { id: 'plantas-magicas', title: 'Plantas mágicas' },
      { id: 'plantas-medicinales', title: 'Plantas medicinales' },
      { id: 'flores', title: 'Flores' },
      { id: 'cultivo-cuidados', title: 'Cultivo y cuidados' },
    ],
  },
  {
    id: 'gemas',
    romanNumeral: 'II',
    familyId: 'naturaleza',
    title: 'Gemas y minerales',
    cardSubtitle: 'Cristales, minerales y gemoterapia',
    subtitle: 'Piedras, cristales y memorias de la tierra',
    templateId: 'gema',
    contentNote: 'La gemoterapia se presenta como sistema de creencias, no como tratamiento médico.',
    subtopics: [
      { id: 'gemas', title: 'Gemas' },
      { id: 'minerales', title: 'Minerales' },
      { id: 'cristales', title: 'Cristales' },
      {
        id: 'gemoterapia',
        title: 'Gemoterapia',
        description: 'Como sistema de creencias, no tratamiento médico.',
      },
      { id: 'limpieza-cuidado', title: 'Limpieza y cuidado físico de las piezas' },
    ],
  },
  {
    id: 'colores',
    romanNumeral: 'III',
    familyId: 'naturaleza',
    title: 'Colores y correspondencias',
    cardSubtitle: 'Significados, asociaciones y vínculos mágicos',
    subtitle: 'El lenguaje simbólico del color',
    templateId: 'color',
    contentNote:
      'Capítulo independiente y transversal: sus fichas se relacionan con velas, gemas, plantas, chakras, planetas y días.',
    subtopics: [
      { id: 'paleta-cromatica', title: 'Paleta cromática' },
      { id: 'significados-simbolicos', title: 'Significados simbólicos' },
      {
        id: 'correspondencias',
        title: 'Correspondencias',
        description: 'Con velas, gemas, plantas, chakras, planetas y días.',
      },
      { id: 'combinaciones', title: 'Combinaciones para prácticas' },
    ],
  },
  {
    id: 'velas',
    romanNumeral: 'IV',
    familyId: 'alquimia',
    title: 'Velas y velomancia',
    cardSubtitle: 'Fuego, cera y observación ritual',
    subtitle: 'El fuego, la cera y sus símbolos',
    templateId: 'vela',
    contentNote:
      'Seguridad ante todo: nunca dejes una vela encendida sin supervisión, ni cerca de niños, mascotas o materiales inflamables.',
    subtopics: [
      { id: 'tipos-velas', title: 'Tipos de velas' },
      { id: 'colores-velas', title: 'Colores de velas' },
      { id: 'preparacion-ritual', title: 'Preparación ritual' },
      { id: 'velomancia', title: 'Velomancia' },
      { id: 'observacion-llama-cera', title: 'Observación de llama y cera' },
      { id: 'registro-velas', title: 'Registro de velas' },
    ],
  },
  {
    id: 'preparaciones',
    romanNumeral: 'V',
    familyId: 'alquimia',
    title: 'Alquimia y preparaciones',
    cardSubtitle: 'Pociones, elíxires, aceites y cocina mágica',
    subtitle: 'Fórmulas, ingredientes y recetas del grimorio',
    templateId: 'preparacion',
    contentNote:
      'Distingue siempre las recetas comestibles de los preparados rituales no ingeribles. No ingieras ni apliques sobre la piel preparados sin seguridad comprobada.',
    subtopics: [
      { id: 'cocina-magica', title: 'Cocina mágica' },
      { id: 'pociones', title: 'Pociones' },
      { id: 'elixires', title: 'Elíxires' },
      { id: 'aceites', title: 'Aceites' },
      { id: 'sahumerios', title: 'Sahumerios' },
      { id: 'inciensos', title: 'Inciensos' },
      { id: 'mezclas-sales-formulas', title: 'Mezclas, sales y fórmulas artesanales' },
    ],
  },
  {
    id: 'cosmos',
    romanNumeral: 'VI',
    familyId: 'cosmos',
    title: 'Astrología y cosmos',
    cardSubtitle: 'Planetas, lunas, días y elementos',
    subtitle: 'El cielo, sus ciclos y correspondencias',
    templateId: 'astro',
    contentNote:
      'Las fechas y fases astronómicas solo se mostrarán cuando provengan de una fuente de efemérides verificada.',
    subtopics: [
      { id: 'astrologia', title: 'Astrología' },
      { id: 'planetas', title: 'Planetas' },
      { id: 'fases-lunares', title: 'Fases lunares' },
      { id: 'lunas-vacias', title: 'Lunas vacías de curso' },
      { id: 'dias-semana', title: 'Días de la semana y correspondencias' },
      { id: 'elementos', title: 'Elementos' },
      { id: 'signos-cartas-ciclos', title: 'Signos, cartas y ciclos según tradiciones' },
    ],
  },
  {
    id: 'rueda-ano',
    romanNumeral: 'VII',
    familyId: 'cosmos',
    title: 'La rueda del año',
    cardSubtitle: 'Sabbats, esbats y celebraciones',
    subtitle: 'El calendario de las estaciones y las celebraciones',
    templateId: 'celebracion',
    contentNote:
      'Las fechas dependen del hemisferio y de la tradición elegida; no existe un calendario universal. Todo es configurable y editable.',
    subtopics: [
      { id: 'sabbats', title: 'Sabbats' },
      { id: 'esbats', title: 'Esbats' },
      { id: 'rueda-del-ano', title: 'Rueda del año' },
      { id: 'celebraciones', title: 'Celebraciones' },
      { id: 'dias-especiales', title: 'Días especiales' },
      { id: 'hemisferios', title: 'Tradiciones del hemisferio norte/sur' },
      { id: 'preparacion-celebraciones', title: 'Preparación de celebraciones' },
    ],
  },
  {
    id: 'hechiceria',
    romanNumeral: 'VIII',
    familyId: 'espiritu',
    title: 'Artes mágicas y hechicería',
    cardSubtitle: 'Rituales, sigilos, amuletos y protección',
    subtitle: 'Rituales, símbolos y objetos de intención',
    templateId: 'ritual',
    subtopics: [
      { id: 'rituales', title: 'Rituales' },
      { id: 'hechizos', title: 'Hechizos' },
      { id: 'invocaciones', title: 'Invocaciones' },
      { id: 'sigilos', title: 'Sigilos' },
      { id: 'simbolos-magicos', title: 'Símbolos mágicos' },
      { id: 'amuletos-talismanes', title: 'Amuletos y talismanes' },
      { id: 'proteccion-limpieza', title: 'Protección y limpieza energética' },
      { id: 'herramientas-altar', title: 'Herramientas y altar' },
    ],
  },
  {
    id: 'adivinacion',
    romanNumeral: 'IX',
    familyId: 'adivinacion',
    title: 'Adivinación y oráculos',
    cardSubtitle: 'Tarot, péndulo, numerología y otras mancias',
    subtitle: 'Lecturas, símbolos y formas de interpretación',
    templateId: 'lectura',
    contentNote: 'Las fichas de aprendizaje se separan de tus sesiones personales de lectura.',
    subtopics: [
      { id: 'tarot', title: 'Tarot' },
      { id: 'pendulo', title: 'Péndulo' },
      { id: 'numerologia', title: 'Numerología' },
      { id: 'oraculos', title: 'Oráculos' },
      { id: 'runas', title: 'Runas' },
      { id: 'otras-mancias', title: 'Otras mancias' },
      { id: 'espejo', title: 'Adivinación en espejo' },
    ],
  },
  {
    id: 'conciencia',
    romanNumeral: 'X',
    familyId: 'espiritu',
    title: 'Conciencia y mundo espiritual',
    cardSubtitle: 'Chakras, meditación, visualización y metafísica',
    subtitle: 'Prácticas interiores y caminos de contemplación',
    templateId: 'practica-interior',
    contentNote:
      'Canalización, viaje astral y otras vivencias se registran como experiencias personales y creencias, no como hechos verificables.',
    subtopics: [
      { id: 'metafisica', title: 'Metafísica' },
      { id: 'chakras', title: 'Chakras' },
      { id: 'geometria-sagrada', title: 'Geometría sagrada' },
      { id: 'meditacion', title: 'Meditación' },
      { id: 'visualizacion', title: 'Visualización' },
      { id: 'canalizacion', title: 'Canalización' },
      { id: 'viaje-astral', title: 'Viaje astral' },
      { id: 'experiencias-subjetivas', title: 'Experiencias subjetivas' },
    ],
  },
  {
    id: 'mitologia',
    romanNumeral: 'XI',
    familyId: 'espiritu',
    title: 'Dioses, seres y mitología',
    cardSubtitle: 'Dioses y diosas, elementales y tradiciones',
    subtitle: 'Relatos, deidades, seres y símbolos del mundo',
    templateId: 'mitologia',
    contentNote: 'Cita tus fuentes y evita mezclar culturas o inventar genealogías.',
    subtopics: [
      { id: 'dioses-diosas', title: 'Dioses y diosas' },
      { id: 'elementales', title: 'Elementales' },
      { id: 'mitologias', title: 'Mitologías' },
      { id: 'tradiciones', title: 'Tradiciones' },
      { id: 'animales-simbolismo', title: 'Animales y simbolismo' },
      { id: 'panteones', title: 'Panteones y correspondencias culturales' },
    ],
  },
  {
    id: 'taller',
    romanNumeral: 'XII',
    familyId: 'alquimia',
    title: 'El taller de la bruja',
    cardSubtitle: 'Manualidades y objetos creados por ti',
    subtitle: 'Objetos, manualidades y creaciones hechas por ti',
    templateId: 'manualidad',
    subtopics: [
      { id: 'manualidades', title: 'Manualidades mágicas' },
      { id: 'objetos-rituales', title: 'Creación de objetos rituales' },
      { id: 'velas-artesanales', title: 'Velas artesanales' },
      { id: 'jabones', title: 'Jabones' },
      { id: 'decoracion-altar', title: 'Decoración de altar' },
      { id: 'encuadernacion', title: 'Encuadernación y otros proyectos' },
    ],
  },
  {
    id: 'memorias',
    romanNumeral: 'XIII',
    familyId: 'memorias',
    title: 'Memorias del alma',
    cardSubtitle: 'Sueños, diario y registros personales',
    subtitle: 'Sueños, vivencias y páginas de tu propia historia',
    templateId: 'memoria',
    contentNote:
      'Reúne tus sueños y notas libres, y también los registros creados desde rituales, tiradas, plantas o meditaciones, sin duplicarlos.',
    subtopics: [
      { id: 'suenos', title: 'Sueños' },
      { id: 'diario-personal', title: 'Diario personal' },
      { id: 'recuerdos', title: 'Recuerdos' },
      { id: 'aprendizajes', title: 'Aprendizajes' },
      { id: 'experiencias-espirituales', title: 'Experiencias espirituales' },
      { id: 'registro-practicas', title: 'Registro de prácticas' },
      { id: 'notas-libres', title: 'Notas libres' },
    ],
  },
] as const;

export function isChapterId(value: unknown): value is ChapterId {
  return typeof value === 'string' && CHAPTERS.some((c) => c.id === value);
}

export function getChapter(id: string | undefined): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getChaptersByFamily(familyId: string): Chapter[] {
  return CHAPTERS.filter((c) => c.familyId === familyId);
}

export function getSubtopic(chapterId: string | undefined, subtopicId: string | undefined) {
  return getChapter(chapterId)?.subtopics.find((s) => s.id === subtopicId);
}
