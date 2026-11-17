import type { GrimorioEntry } from '../types/domain';

/**
 * Fichas de demostración etiquetadas «Ejemplo». Muestran la estructura de una
 * ficha y la separación entre datos físicos y correspondencias simbólicas.
 * No representan información personal real. En la Etapa 2 podrán copiarse a
 * «Mis fichas» en lugar de editarse en origen.
 */
const SEED_DATE = '2026-11-17T12:00:00.000Z';

export const SEED_ENTRIES: readonly GrimorioEntry[] = [
  {
    id: 'ejemplo-lavanda',
    chapterId: 'herbolaria',
    subtopicId: 'flores',
    title: 'Lavanda',
    description: 'Arbusto aromático mediterráneo de flores violáceas, muy presente en herbarios y jardines.',
    origin: 'seed',
    status: 'saved',
    tags: ['ejemplo', 'aromática', 'violeta'],
    isFavorite: false,
    blocks: [],
    extraFields: {
      commonName: 'Lavanda',
      scientificName: 'Lavandula angustifolia',
      light: 'Pleno sol.',
      watering: 'Moderado; tolera la sequía y no soporta el encharcamiento.',
      cultivation:
        'Suelo bien drenado, de preferencia pobre o calcáreo. Poda ligera después de la floración.',
      partsUsed: ['Flores', 'Sumidades floridas'],
      symbolicCorrespondences: [
        'Calma y descanso (asociación tradicional popular)',
        'Color violeta (ver capítulo III)',
      ],
      precautions:
        'El aceite esencial es muy concentrado: no ingerirlo y diluirlo antes de cualquier contacto con la piel. Mantener fuera del alcance de niños y mascotas. Ante cualquier duda de salud, consulta a un profesional.',
    },
    media: [],
    relatedEntryIds: ['ejemplo-verde'],
    sources: [{ title: 'Fuente pendiente: agrega tu referencia botánica' }],
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: 'ejemplo-cuarzo',
    chapterId: 'gemas',
    subtopicId: 'cristales',
    title: 'Cuarzo',
    description:
      'Mineral muy común en la corteza terrestre; su variedad incolora se conoce como cristal de roca.',
    origin: 'seed',
    status: 'saved',
    tags: ['ejemplo', 'mineral'],
    isFavorite: false,
    blocks: [],
    extraFields: {
      classification: 'Silicato (tectosilicato)',
      composition: 'Dióxido de silicio (SiO₂)',
      physicalProperties: 'Dureza 7 en la escala de Mohs. Sistema cristalino trigonal.',
      traditionalSymbolism:
        'En la gemoterapia se le asocia con la claridad. Es una creencia tradicional, no un tratamiento médico.',
      care: 'Limpiar con paño suave y agua; evitar golpes y cambios bruscos de temperatura.',
    },
    media: [],
    relatedEntryIds: [],
    sources: [{ title: 'Fuente pendiente: agrega tu referencia mineralógica' }],
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: 'ejemplo-verde',
    chapterId: 'colores',
    subtopicId: 'significados-simbolicos',
    title: 'Verde bosque',
    description: 'El verde profundo del cuero de este grimorio.',
    origin: 'seed',
    status: 'saved',
    tags: ['ejemplo', 'verde'],
    isFavorite: false,
    blocks: [],
    extraFields: {
      hex: '#264739',
      associationsByTradition: [
        'Naturaleza y crecimiento (asociación simbólica extendida en la cultura occidental)',
      ],
      personalUses: 'Escribe aquí cómo usas este color en tus prácticas.',
    },
    media: [],
    relatedEntryIds: ['ejemplo-lavanda'],
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
];
