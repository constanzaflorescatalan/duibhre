import { z } from 'zod';
import type { JournalRecord, NoteKind } from '../../types/domain';
import { newId } from '../../utils/ids';
import { db } from '../db';

/**
 * Bitácora central. Un registro se crea una sola vez y se vincula a fichas
 * mediante `linkedEntryIds`: aparece en la ficha y en la Bitácora sin duplicarse.
 */

// ---------- Lectura ----------

export async function listJournalRecords(): Promise<JournalRecord[]> {
  return db.journal.orderBy('date').reverse().toArray();
}

export async function listRecordsForEntry(entryId: string): Promise<JournalRecord[]> {
  const records = await db.journal.where('linkedEntryIds').equals(entryId).toArray();
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

/** Registros vinculados a cualquiera de estas fichas (p. ej. las de un capítulo). */
export async function listRecordsForEntries(entryIds: string[]): Promise<JournalRecord[]> {
  if (entryIds.length === 0) return [];
  const records = await db.journal.where('linkedEntryIds').anyOf(entryIds).distinct().toArray();
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getRecord(id: string): Promise<JournalRecord | undefined> {
  return db.journal.get(id);
}

export async function countJournalRecords(): Promise<number> {
  return db.journal.count();
}

// ---------- Escritura ----------

const kinds = ['sueno', 'ritual', 'tirada', 'meditacion', 'recuerdo', 'observacion', 'otro'] as const;

export const recordInputSchema = z.object({
  kind: z.enum(kinds satisfies readonly NoteKind[]),
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio.')
    .max(200, 'El título no puede superar los 200 caracteres.'),
  body: z.string().max(50000),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'La fecha no es válida.'),
  linkedEntryIds: z.array(z.string()),
  tags: z.array(z.string().trim().min(1)).max(50),
  mood: z.string().trim().max(200).optional(),
  followUpAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'La fecha de seguimiento no es válida.')
    .optional(),
});

export type RecordInput = z.infer<typeof recordInputSchema>;

export class RecordValidationError extends Error {
  readonly fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>) {
    super(Object.values(fieldErrors)[0] ?? 'Datos no válidos.');
    this.name = 'RecordValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export async function saveRecord({ id, input }: { id?: string; input: RecordInput }): Promise<JournalRecord> {
  const parsed = recordInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? 'form')] ??= issue.message;
    throw new RecordValidationError(fieldErrors);
  }
  const data = parsed.data;
  const now = new Date().toISOString();

  return db.transaction('rw', db.journal, async () => {
    const existing = id ? await db.journal.get(id) : undefined;
    if (id && !existing) throw new Error('La memoria que intentas editar ya no existe.');
    const record: JournalRecord = {
      id: existing?.id ?? newId(),
      kind: data.kind,
      title: data.title,
      body: data.body.trim(),
      date: new Date(data.date).toISOString(),
      linkedEntryIds: [...new Set(data.linkedEntryIds)],
      mediaIds: existing?.mediaIds ?? [],
      tags: data.tags,
      isPrivate: existing?.isPrivate ?? true,
      isFavorite: existing?.isFavorite ?? false,
      mood: data.mood || undefined,
      followUpAt: data.followUpAt ? new Date(data.followUpAt).toISOString() : undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await db.journal.put(record);
    return record;
  });
}

export async function toggleRecordFavorite(id: string): Promise<boolean> {
  return db.transaction('rw', db.journal, async () => {
    const record = await db.journal.get(id);
    if (!record) throw new Error('La memoria no existe.');
    const isFavorite = !record.isFavorite;
    await db.journal.update(id, { isFavorite });
    return isFavorite;
  });
}

/** Elimina solo la memoria; las fichas no se tocan y los eventos se desvinculan. */
export async function deleteRecord(id: string): Promise<void> {
  await db.transaction('rw', db.journal, db.events, async () => {
    await db.events
      .where('linkedRecordId')
      .equals(id)
      .modify((event) => {
        delete event.linkedRecordId;
      });
    await db.journal.delete(id);
  });
}
