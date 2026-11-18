import type { EventKind } from '../types/domain';

/** Tipos de evento de la Agenda, visualmente distinguibles (sección 7.9). */
export const EVENT_KINDS: { id: EventKind; label: string; color: string }[] = [
  { id: 'ritual', label: 'Ritual personal', color: '#6b3e65' },
  { id: 'sabbat', label: 'Sabbat', color: '#a8742a' },
  { id: 'esbat', label: 'Esbat', color: '#3f5f8a' },
  { id: 'lunar', label: 'Fase lunar', color: '#8a8f99' },
  { id: 'cuidado-planta', label: 'Cuidado de plantas', color: '#4f7a45' },
  { id: 'tarea', label: 'Tarea', color: '#264739' },
  { id: 'recordatorio', label: 'Recordatorio', color: '#8a2f2a' },
  { id: 'personal', label: 'Actividad personal', color: '#5a4b3f' },
];

export function eventKind(kind: EventKind) {
  return EVENT_KINDS.find((k) => k.id === kind) ?? EVENT_KINDS[EVENT_KINDS.length - 1];
}

/** Color para las fechas próximas de memorias (anotación con fecha). */
export const NOTE_FOLLOWUP_COLOR = '#a88a57';
