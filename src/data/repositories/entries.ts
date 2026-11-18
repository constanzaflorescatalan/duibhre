import { z } from 'zod';
import { CHAPTERS } from '../../config/chapters';
import type { ChapterId, GrimorioEntry, MediaAsset } from '../../types/domain';
import { newId } from '../../utils/ids';
import { db } from '../db';
import { SEED_ENTRIES } from '../seedDemo';

/**
 * Repositorio de fichas. Las fichas de ejemplo («seed») viven en código y no se
 * editan en origen: se copian a «Mis fichas». Las personales viven en IndexedDB.
 */

// ---------- Lectura ----------

export function listSeedEntries(chapterId?: ChapterId): GrimorioEntry[] {
  return chapterId ? SEED_ENTRIES.filter((e) => e.chapterId === chapterId) : [...SEED_ENTRIES];
}

export async function listPersonalEntries(chapterId?: ChapterId): Promise<GrimorioEntry[]> {
  const query = chapterId ? db.entries.where('chapterId').equals(chapterId) : db.entries.toCollection();
  const entries = await query.toArray();
  return entries
    .filter((e) => e.status !== 'archived')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getEntry(id: string): Promise<GrimorioEntry | undefined> {
  return SEED_ENTRIES.find((e) => e.id === id) ?? (await db.entries.get(id));
}

/** Fichas personales que mencionan a esta como relacionada (relación inversa). */
export async function listEntriesRelatingTo(id: string): Promise<GrimorioEntry[]> {
  return (await db.entries.where('relatedEntryIds').equals(id).toArray()).filter(
    (e) => e.status !== 'archived',
  );
}

export async function countPersonalEntries(): Promise<number> {
  return db.entries.filter((e) => e.status !== 'archived').count();
}

export async function countFavorites(): Promise<number> {
  return db.entries.filter((e) => e.isFavorite && e.status !== 'archived').count();
}

// ---------- Validación ----------

const chapterIds = CHAPTERS.map((c) => c.id) as [ChapterId, ...ChapterId[]];

export const entryInputSchema = z.object({
  chapterId: z.enum(chapterIds, { message: 'Elige un capítulo.' }),
  subtopicId: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio.')
    .max(200, 'El título no puede superar los 200 caracteres.'),
  description: z.string().trim().max(5000).optional(),
  tags: z.array(z.string().trim().min(1)).max(50),
  extraFields: z.record(z.string(), z.unknown()),
  sources: z.array(z.object({ title: z.string().trim().min(1), url: z.string().optional() })),
  status: z.enum(['draft', 'saved']),
  relatedEntryIds: z.array(z.string()).max(100).optional(),
});

export type EntryInput = z.infer<typeof entryInputSchema>;

/** Imagen nueva aún no guardada: se escribe en la misma transacción que la ficha. */
export interface PendingImage {
  tempId: string;
  blob: Blob;
  alt: string;
}

export interface SaveEntryOptions {
  /** Id de la ficha a actualizar; sin id se crea una nueva. */
  id?: string;
  input: EntryInput;
  /** Imágenes ya guardadas que se conservan (con su `alt` posiblemente editado). */
  keptMedia?: MediaAsset[];
  newImages?: PendingImage[];
}

export class ValidationError extends Error {
  readonly fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>) {
    super(Object.values(fieldErrors)[0] ?? 'Datos no válidos.');
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export function validateEntryInput(input: unknown): EntryInput {
  const result = entryInputSchema.safeParse(input);
  if (result.success) return result.data;
  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    fieldErrors[key] ??= issue.message;
  }
  throw new ValidationError(fieldErrors);
}

// ---------- Escritura ----------

/**
 * Guarda una ficha personal de forma transaccional: imágenes nuevas, imágenes
 * eliminadas y la ficha se escriben juntas o no se escribe nada.
 */
export async function saveEntry({ id, input, keptMedia = [], newImages = [] }: SaveEntryOptions) {
  const data = validateEntryInput(input);
  const now = new Date().toISOString();

  return db.transaction('rw', db.entries, db.blobs, async () => {
    const existing = id ? await db.entries.get(id) : undefined;
    if (id && !existing) throw new Error('La ficha que intentas editar ya no existe.');

    const keptIds = new Set(keptMedia.map((m) => m.id));
    const removed = (existing?.media ?? []).filter((m) => !keptIds.has(m.id));
    for (const media of removed) {
      if (media.originalBlobId) await db.blobs.delete(media.originalBlobId);
      if (media.illustratedBlobId) await db.blobs.delete(media.illustratedBlobId);
    }

    const added: MediaAsset[] = [];
    for (const image of newImages) {
      const blobId = newId();
      await db.blobs.add({ id: blobId, blob: image.blob, mimeType: image.blob.type, createdAt: now });
      added.push({ id: newId(), originalBlobId: blobId, alt: image.alt.trim(), status: 'original' });
    }

    const entry: GrimorioEntry = {
      id: existing?.id ?? newId(),
      chapterId: data.chapterId,
      subtopicId: data.subtopicId || undefined,
      title: data.title,
      description: data.description || undefined,
      origin: 'personal',
      status: data.status,
      tags: data.tags,
      isFavorite: existing?.isFavorite ?? false,
      blocks: existing?.blocks ?? [],
      extraFields: data.extraFields,
      media: [...keptMedia, ...added],
      relatedEntryIds: data.relatedEntryIds
        ? [...new Set(data.relatedEntryIds)].filter((rid) => rid !== existing?.id)
        : (existing?.relatedEntryIds ?? []),
      sources: data.sources,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await db.entries.put(entry);
    return entry;
  });
}

export async function toggleFavorite(id: string): Promise<boolean> {
  return db.transaction('rw', db.entries, async () => {
    const entry = await db.entries.get(id);
    if (!entry) throw new Error('Solo puedes marcar como favoritas tus propias fichas.');
    const isFavorite = !entry.isFavorite;
    await db.entries.update(id, { isFavorite, updatedAt: new Date().toISOString() });
    return isFavorite;
  });
}

export async function setArchived(id: string, archived: boolean): Promise<void> {
  const entry = await db.entries.get(id);
  if (!entry) throw new Error('La ficha no existe.');
  await db.entries.update(id, {
    status: archived ? 'archived' : 'saved',
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Elimina la ficha y sus imágenes. Las memorias y eventos vinculados se
 * conservan: solo se desvinculan de esta ficha.
 */
export async function deleteEntry(id: string): Promise<void> {
  await db.transaction('rw', [db.entries, db.blobs, db.journal, db.events], async () => {
    const entry = await db.entries.get(id);
    if (!entry) return;
    await db.events
      .where('linkedEntryId')
      .equals(id)
      .modify((event) => {
        delete event.linkedEntryId;
      });
    await db.journal
      .where('linkedEntryIds')
      .equals(id)
      .modify((record) => {
        record.linkedEntryIds = record.linkedEntryIds.filter((linked) => linked !== id);
      });
    await db.entries
      .where('relatedEntryIds')
      .equals(id)
      .modify((other) => {
        other.relatedEntryIds = other.relatedEntryIds.filter((rid) => rid !== id);
      });
    for (const media of entry.media) {
      if (media.originalBlobId) await db.blobs.delete(media.originalBlobId);
      if (media.illustratedBlobId) await db.blobs.delete(media.illustratedBlobId);
    }
    await db.entries.delete(id);
  });
}

/** Copia una ficha de ejemplo a «Mis fichas» como borrador editable. */
export async function copySeedToPersonal(seedId: string): Promise<GrimorioEntry> {
  const seed = SEED_ENTRIES.find((e) => e.id === seedId);
  if (!seed) throw new Error('La ficha de ejemplo no existe.');
  return saveEntry({
    input: {
      chapterId: seed.chapterId,
      subtopicId: seed.subtopicId,
      title: seed.title,
      description: seed.description,
      tags: seed.tags.filter((t) => t !== 'ejemplo'),
      extraFields: structuredClone(seed.extraFields),
      sources: seed.sources ? structuredClone(seed.sources) : [],
      status: 'draft',
      relatedEntryIds: [...seed.relatedEntryIds],
    },
  });
}
