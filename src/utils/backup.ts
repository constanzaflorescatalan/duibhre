import { z } from 'zod';
import { CHAPTERS } from '../config/chapters';
import { db } from '../data/db';
import type { CalendarEvent, ChapterId, GrimorioEntry, JournalRecord, StoredBlob } from '../types/domain';

/**
 * Respaldo local (sección 11): un archivo JSON con fichas, memorias, eventos e
 * imágenes (en base64). Se valida con Zod antes de importar y la importación
 * reemplaza todo en una sola transacción.
 */

export const BACKUP_APP = 'duibhre';
export const BACKUP_VERSION = 1;

// ---------- Esquemas ----------

const chapterIds = CHAPTERS.map((c) => c.id) as [ChapterId, ...ChapterId[]];
const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha no válida');

const mediaSchema = z.object({
  id: z.string().min(1),
  originalBlobId: z.string().optional(),
  illustratedBlobId: z.string().optional(),
  alt: z.string(),
  style: z.enum(['botanico', 'tinta-antigua', 'acuarela-grimorio']).optional(),
  status: z.enum(['original', 'preview', 'generated', 'failed']),
});

const entrySchema = z.object({
  id: z.string().min(1),
  chapterId: z.enum(chapterIds),
  subtopicId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  origin: z.literal('personal'),
  status: z.enum(['draft', 'saved', 'archived']),
  tags: z.array(z.string()),
  isFavorite: z.boolean(),
  blocks: z.array(z.any()),
  extraFields: z.record(z.string(), z.unknown()),
  media: z.array(mediaSchema),
  relatedEntryIds: z.array(z.string()),
  sources: z.array(z.object({ title: z.string(), url: z.string().optional() })).optional(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

const recordSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['sueno', 'ritual', 'tirada', 'meditacion', 'recuerdo', 'observacion', 'otro']),
  title: z.string().min(1),
  body: z.string(),
  date: isoDate,
  linkedEntryIds: z.array(z.string()),
  mediaIds: z.array(z.string()),
  tags: z.array(z.string()),
  isPrivate: z.boolean(),
  isFavorite: z.boolean().optional(),
  mood: z.string().optional(),
  followUpAt: isoDate.optional(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: z.enum(['sabbat', 'esbat', 'lunar', 'ritual', 'cuidado-planta', 'tarea', 'recordatorio', 'personal']),
  startAt: isoDate,
  endAt: isoDate.optional(),
  timeZone: z.string(),
  linkedEntryId: z.string().optional(),
  linkedRecordId: z.string().optional(),
  source: z.enum(['user', 'calendar-dataset']),
  notes: z.string().optional(),
  recurrence: z.string().optional(),
  remindAt: isoDate.optional(),
});

const blobSchema = z.object({
  id: z.string().min(1),
  mimeType: z.string().regex(/^image\//, 'Solo se aceptan imágenes'),
  createdAt: isoDate,
  dataBase64: z.string(),
});

export const backupSchema = z.object({
  app: z.literal(BACKUP_APP),
  version: z.literal(BACKUP_VERSION),
  exportedAt: isoDate,
  data: z.object({
    entries: z.array(entrySchema),
    journal: z.array(recordSchema),
    events: z.array(eventSchema),
    blobs: z.array(blobSchema),
  }),
});

export type BackupFile = z.infer<typeof backupSchema>;

export interface BackupSummary {
  entries: number;
  journal: number;
  events: number;
  images: number;
  exportedAt: string;
}

// ---------- Conversión de imágenes ----------

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

// ---------- Exportar ----------

export async function buildBackup(): Promise<BackupFile> {
  const [entries, journal, events, blobs] = await Promise.all([
    db.entries.toArray(),
    db.journal.toArray(),
    db.events.toArray(),
    db.blobs.toArray(),
  ]);
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      entries: entries as BackupFile['data']['entries'],
      journal: journal as BackupFile['data']['journal'],
      events: events as BackupFile['data']['events'],
      blobs: await Promise.all(
        blobs.map(async (b) => ({
          id: b.id,
          mimeType: b.mimeType || b.blob.type || 'image/jpeg',
          createdAt: b.createdAt,
          dataBase64: await blobToBase64(b.blob),
        })),
      ),
    },
  };
}

export function summarize(backup: BackupFile): BackupSummary {
  return {
    entries: backup.data.entries.length,
    journal: backup.data.journal.length,
    events: backup.data.events.length,
    images: backup.data.blobs.length,
    exportedAt: backup.exportedAt,
  };
}

export function backupFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `duibhre-respaldo-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

/** Descarga el respaldo como archivo en el dispositivo. */
export async function downloadBackup(): Promise<BackupSummary> {
  const backup = await buildBackup();
  const file = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return summarize(backup);
}

// ---------- Importar ----------

export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupError';
  }
}

/** Lee y valida un archivo de respaldo; no escribe nada todavía. */
export function parseBackup(text: string): BackupFile {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new BackupError('El archivo no es un respaldo válido (no es JSON).');
  }
  if (typeof json === 'object' && json !== null && (json as { app?: unknown }).app !== BACKUP_APP) {
    throw new BackupError('Este archivo no es un respaldo de DUIBHRÉ.');
  }
  const result = backupSchema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new BackupError(
      `El respaldo tiene datos no válidos${issue ? ` (${issue.path.join('.')}: ${issue.message})` : ''}.`,
    );
  }
  return result.data;
}

/** Reemplaza todos los datos locales por los del respaldo, en una sola transacción. */
export async function restoreBackup(backup: BackupFile): Promise<void> {
  const blobs: StoredBlob[] = backup.data.blobs.map((b) => ({
    id: b.id,
    mimeType: b.mimeType,
    createdAt: b.createdAt,
    blob: base64ToBlob(b.dataBase64, b.mimeType),
  }));
  await db.transaction('rw', [db.entries, db.journal, db.events, db.blobs], async () => {
    await Promise.all([db.entries.clear(), db.journal.clear(), db.events.clear(), db.blobs.clear()]);
    await db.entries.bulkAdd(backup.data.entries as GrimorioEntry[]);
    await db.journal.bulkAdd(backup.data.journal as JournalRecord[]);
    await db.events.bulkAdd(backup.data.events as CalendarEvent[]);
    await db.blobs.bulkAdd(blobs);
  });
}

// ---------- Borrar ----------

/** Borra fichas, memorias, eventos e imágenes de este dispositivo. */
export async function deleteAllData(): Promise<void> {
  await db.transaction('rw', [db.entries, db.journal, db.events, db.blobs, db.preferences], async () => {
    await Promise.all([
      db.entries.clear(),
      db.journal.clear(),
      db.events.clear(),
      db.blobs.clear(),
      db.preferences.clear(),
    ]);
  });
}
