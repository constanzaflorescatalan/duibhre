import type { NoteKind } from '../types/domain';

/** Tipos de memoria de la Bitácora (sección 7.8). */
export const NOTE_KINDS: { id: NoteKind; label: string }[] = [
  { id: 'sueno', label: 'Sueño' },
  { id: 'ritual', label: 'Ritual' },
  { id: 'tirada', label: 'Tirada' },
  { id: 'meditacion', label: 'Meditación' },
  { id: 'recuerdo', label: 'Recuerdo' },
  { id: 'observacion', label: 'Observación' },
  { id: 'otro', label: 'Otro' },
];

export function noteKindLabel(kind: NoteKind): string {
  return NOTE_KINDS.find((k) => k.id === kind)?.label ?? 'Nota';
}
