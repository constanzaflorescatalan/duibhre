import type { TemplateId } from '../types/domain';

/**
 * Plantillas de formulario por capítulo (sección 8.2). En la Etapa 2 el
 * formulario de fichas leerá estos campos para mostrar los especiales de cada
 * capítulo. Todos comparten los campos comunes de COMMON_FIELDS.
 */
export type FieldKind = 'text' | 'longtext' | 'list' | 'steps' | 'color' | 'date' | 'select';

export interface TemplateField {
  key: string;
  label: string;
  kind: FieldKind;
  /** Campo de precaución/seguridad: se destaca visualmente. */
  caution?: boolean;
  options?: string[];
}

export interface EntryTemplate {
  id: TemplateId;
  name: string;
  fields: TemplateField[];
}

export const COMMON_FIELDS: TemplateField[] = [
  { key: 'title', label: 'Título', kind: 'text' },
  { key: 'description', label: 'Descripción', kind: 'longtext' },
  { key: 'tags', label: 'Etiquetas', kind: 'list' },
  { key: 'sources', label: 'Fuentes y referencias', kind: 'list' },
  { key: 'notes', label: 'Notas personales', kind: 'longtext' },
];

export const ENTRY_TEMPLATES: Record<TemplateId, EntryTemplate> = {
  planta: {
    id: 'planta',
    name: 'Planta',
    fields: [
      { key: 'commonName', label: 'Nombre común', kind: 'text' },
      { key: 'scientificName', label: 'Nombre científico (opcional)', kind: 'text' },
      { key: 'cultivation', label: 'Cultivo', kind: 'longtext' },
      { key: 'light', label: 'Luz', kind: 'text' },
      { key: 'watering', label: 'Riego', kind: 'text' },
      { key: 'partsUsed', label: 'Partes utilizadas', kind: 'list' },
      { key: 'botanicalReferences', label: 'Referencias botánicas', kind: 'longtext' },
      { key: 'traditionalUses', label: 'Usos tradicionales', kind: 'longtext' },
      { key: 'symbolicCorrespondences', label: 'Correspondencias simbólicas', kind: 'list' },
      { key: 'precautions', label: 'Precauciones', kind: 'longtext', caution: true },
    ],
  },
  gema: {
    id: 'gema',
    name: 'Gema',
    fields: [
      { key: 'classification', label: 'Clasificación', kind: 'text' },
      { key: 'color', label: 'Color', kind: 'text' },
      { key: 'composition', label: 'Composición (si se conoce)', kind: 'text' },
      { key: 'provenance', label: 'Procedencia', kind: 'text' },
      { key: 'physicalProperties', label: 'Propiedades físicas', kind: 'longtext' },
      { key: 'traditionalSymbolism', label: 'Simbolismo tradicional', kind: 'longtext' },
      { key: 'associations', label: 'Asociaciones', kind: 'list' },
      { key: 'care', label: 'Cuidados y precauciones', kind: 'longtext', caution: true },
      { key: 'collection', label: 'Colección personal', kind: 'longtext' },
    ],
  },
  color: {
    id: 'color',
    name: 'Color',
    fields: [
      { key: 'hex', label: 'Valor hexadecimal (opcional)', kind: 'color' },
      { key: 'associationsByTradition', label: 'Asociaciones por tradición', kind: 'list' },
      { key: 'personalUses', label: 'Usos personales', kind: 'longtext' },
    ],
  },
  vela: {
    id: 'vela',
    name: 'Vela',
    fields: [
      { key: 'candleType', label: 'Tipo', kind: 'text' },
      { key: 'color', label: 'Color', kind: 'text' },
      { key: 'material', label: 'Material', kind: 'text' },
      { key: 'intention', label: 'Intención', kind: 'text' },
      { key: 'usage', label: 'Modo de uso', kind: 'longtext' },
      { key: 'date', label: 'Fecha', kind: 'date' },
      { key: 'observations', label: 'Observaciones de llama y cera', kind: 'longtext' },
      { key: 'safety', label: 'Advertencias de seguridad', kind: 'longtext', caution: true },
    ],
  },
  preparacion: {
    id: 'preparacion',
    name: 'Preparación',
    fields: [
      { key: 'preparationType', label: 'Tipo', kind: 'text' },
      {
        key: 'edibility',
        label: 'Uso',
        kind: 'select',
        options: ['Receta comestible', 'Preparado ritual no ingerible'],
      },
      { key: 'intention', label: 'Intención simbólica', kind: 'text' },
      { key: 'ingredients', label: 'Ingredientes y cantidades', kind: 'list' },
      { key: 'tools', label: 'Herramientas', kind: 'list' },
      { key: 'steps', label: 'Preparación por pasos', kind: 'steps' },
      { key: 'duration', label: 'Duración', kind: 'text' },
      { key: 'storage', label: 'Cuidados de almacenamiento', kind: 'longtext' },
      { key: 'contraindications', label: 'Contraindicaciones', kind: 'longtext', caution: true },
      { key: 'result', label: 'Bitácora del resultado', kind: 'longtext' },
    ],
  },
  astro: {
    id: 'astro',
    name: 'Astro o ciclo',
    fields: [
      { key: 'symbol', label: 'Símbolo', kind: 'text' },
      { key: 'cycle', label: 'Ciclo o fecha (solo si es verificable)', kind: 'text' },
      { key: 'tradition', label: 'Tradición', kind: 'text' },
      { key: 'correspondences', label: 'Correspondencias', kind: 'list' },
    ],
  },
  celebracion: {
    id: 'celebracion',
    name: 'Celebración',
    fields: [
      { key: 'tradition', label: 'Tradición', kind: 'text' },
      { key: 'hemisphere', label: 'Hemisferio', kind: 'select', options: ['Sur', 'Norte'] },
      { key: 'meaning', label: 'Significado', kind: 'longtext' },
      { key: 'dates', label: 'Fechas (configurables)', kind: 'text' },
      { key: 'relatedRituals', label: 'Rituales relacionados', kind: 'list' },
      { key: 'activities', label: 'Actividades', kind: 'list' },
    ],
  },
  ritual: {
    id: 'ritual',
    name: 'Ritual',
    fields: [
      { key: 'tradition', label: 'Tradición u origen', kind: 'text' },
      { key: 'intention', label: 'Intención', kind: 'text' },
      { key: 'materials', label: 'Materiales', kind: 'list' },
      { key: 'steps', label: 'Pasos', kind: 'steps' },
      { key: 'warnings', label: 'Advertencias', kind: 'longtext', caution: true },
      { key: 'suggestedDate', label: 'Fecha sugerida (opcional)', kind: 'date' },
    ],
  },
  lectura: {
    id: 'lectura',
    name: 'Lectura oracular',
    fields: [
      { key: 'system', label: 'Sistema', kind: 'text' },
      { key: 'method', label: 'Tirada o método', kind: 'longtext' },
      { key: 'symbols', label: 'Símbolos', kind: 'list' },
      { key: 'context', label: 'Contexto', kind: 'longtext' },
      { key: 'date', label: 'Fecha', kind: 'date' },
      { key: 'results', label: 'Cartas o resultados', kind: 'list' },
      { key: 'interpretation', label: 'Interpretación personal', kind: 'longtext' },
      { key: 'reflections', label: 'Reflexiones', kind: 'longtext' },
    ],
  },
  'practica-interior': {
    id: 'practica-interior',
    name: 'Práctica interior',
    fields: [
      { key: 'framework', label: 'Tradición o marco interpretativo', kind: 'text' },
      { key: 'guide', label: 'Guía', kind: 'longtext' },
      { key: 'duration', label: 'Duración', kind: 'text' },
      { key: 'date', label: 'Fecha', kind: 'date' },
      { key: 'symbols', label: 'Símbolos', kind: 'list' },
      { key: 'sensations', label: 'Diario de sensaciones', kind: 'longtext' },
      { key: 'precautions', label: 'Precauciones', kind: 'longtext', caution: true },
      { key: 'reflections', label: 'Reflexiones', kind: 'longtext' },
    ],
  },
  mitologia: {
    id: 'mitologia',
    name: 'Deidad o mitología',
    fields: [
      { key: 'culture', label: 'Cultura o tradición', kind: 'text' },
      { key: 'story', label: 'Historia y relatos', kind: 'longtext' },
      { key: 'symbols', label: 'Símbolos', kind: 'list' },
      { key: 'representations', label: 'Representaciones', kind: 'longtext' },
    ],
  },
  manualidad: {
    id: 'manualidad',
    name: 'Manualidad',
    fields: [
      { key: 'goal', label: 'Objetivo', kind: 'text' },
      { key: 'materials', label: 'Materiales', kind: 'list' },
      { key: 'tools', label: 'Herramientas', kind: 'list' },
      { key: 'steps', label: 'Pasos', kind: 'steps' },
      { key: 'time', label: 'Tiempo', kind: 'text' },
      { key: 'cost', label: 'Costo (opcional)', kind: 'text' },
      { key: 'result', label: 'Resultado', kind: 'longtext' },
    ],
  },
  memoria: {
    id: 'memoria',
    name: 'Memoria o sueño',
    fields: [
      { key: 'date', label: 'Fecha', kind: 'date' },
      { key: 'time', label: 'Hora (opcional)', kind: 'text' },
      { key: 'body', label: 'Relato libre', kind: 'longtext' },
      { key: 'mood', label: 'Estado de ánimo (opcional)', kind: 'text' },
      { key: 'symbols', label: 'Símbolos', kind: 'list' },
      { key: 'linkedPractice', label: 'Práctica vinculada', kind: 'text' },
    ],
  },
};
