/**
 * Modelo de dominio de DUIBHRÉ (sección 8.1 de la especificación maestra).
 * Las familias y capítulos son configuración estática; fichas, registros,
 * eventos y preferencias se persistirán en IndexedDB (ver src/data/db.ts).
 */

export type FamilyId = 'naturaleza' | 'alquimia' | 'cosmos' | 'adivinacion' | 'espiritu' | 'memorias';

export type ChapterId =
  | 'herbolaria'
  | 'gemas'
  | 'colores'
  | 'velas'
  | 'preparaciones'
  | 'cosmos'
  | 'rueda-ano'
  | 'hechiceria'
  | 'adivinacion'
  | 'conciencia'
  | 'mitologia'
  | 'taller'
  | 'memorias';

export type NoteKind = 'sueno' | 'ritual' | 'tirada' | 'meditacion' | 'recuerdo' | 'observacion' | 'otro';

export type EventKind =
  'sabbat' | 'esbat' | 'lunar' | 'ritual' | 'cuidado-planta' | 'tarea' | 'recordatorio' | 'personal';

export type TemplateId =
  | 'planta'
  | 'gema'
  | 'color'
  | 'vela'
  | 'preparacion'
  | 'astro'
  | 'celebracion'
  | 'ritual'
  | 'lectura'
  | 'practica-interior'
  | 'mitologia'
  | 'manualidad'
  | 'memoria';

export interface Family {
  id: FamilyId;
  title: string;
  subtitle: string;
  description: string;
  chapterIds: ChapterId[];
  illustrationKey: string;
  /** Descripción de la ilustración pintada definitiva (para el equipo de arte). */
  illustrationBrief: string;
  /** Acceso secundario destacado del panel (p. ej. «Abrir mi bitácora»). */
  secondaryAction?: { label: string; to: string };
}

export interface Subtopic {
  id: string;
  title: string;
  description?: string;
}

export interface Chapter {
  id: ChapterId;
  romanNumeral: string;
  familyId: FamilyId;
  title: string;
  /** Subtítulo corto para la tarjeta del panel de familia (sección 4). */
  cardSubtitle: string;
  /** Subtítulo ceremonial de la página del capítulo (sección 5). */
  subtitle: string;
  subtopics: Subtopic[];
  templateId: TemplateId;
  /** Nota editorial obligatoria (seguridad, creencias, etc.). */
  contentNote?: string;
}

export interface MediaAsset {
  id: string;
  originalBlobId?: string; // IndexedDB, nunca base64 enorme en localStorage
  illustratedBlobId?: string;
  alt: string;
  style?: IllustrationStyle;
  status: 'original' | 'preview' | 'generated' | 'failed';
}

export type IllustrationStyle = 'botanico' | 'tinta-antigua' | 'acuarela-grimorio';

export type EntryBlock =
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'list'; content: string[] }
  | { id: string; type: 'steps'; content: string[] }
  | { id: string; type: 'quote'; content: string };

export interface GrimorioEntry {
  id: string;
  chapterId: ChapterId;
  subtopicId?: string;
  title: string;
  description?: string;
  origin: 'seed' | 'personal';
  status: 'draft' | 'saved' | 'archived';
  tags: string[];
  isFavorite: boolean;
  blocks: EntryBlock[];
  extraFields: Record<string, unknown>;
  media: MediaAsset[];
  relatedEntryIds: string[];
  sources?: { title: string; url?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalRecord {
  id: string;
  kind: NoteKind;
  title: string;
  body: string;
  date: string; // ISO local / con zona horaria en persistencia
  linkedEntryIds: string[];
  mediaIds: string[];
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
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

export interface Preferences {
  displayName?: string;
  dedication?: string;
  hemisphere: 'south' | 'north';
  timeZone: string; // por defecto America/Santiago; editable
  locale: 'es-CL';
  reduceMotion: boolean;
  theme: 'dark-leather';
  preferredIllustrationStyle: IllustrationStyle;
}

/** Blob local de imagen (foto original o ilustración) guardado en IndexedDB. */
export interface StoredBlob {
  id: string;
  blob: Blob;
  mimeType: string;
  createdAt: string;
}
