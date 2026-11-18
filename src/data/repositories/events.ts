import { z } from 'zod';
import type { CalendarEvent, EventKind } from '../../types/domain';
import { newId } from '../../utils/ids';
import { isValidTimeZone, wallTimeToUtc } from '../../utils/timezone';
import { db } from '../db';

/**
 * Eventos de agenda (Etapa 3). Solo eventos creados por la persona; las
 * celebraciones también se crean a mano hasta tener una fuente revisada.
 * Se guardan en UTC con su zona horaria.
 */

// ---------- Lectura ----------

export async function listEventsBetween(startISO: string, endISO: string): Promise<CalendarEvent[]> {
  const events = await db.events.where('startAt').between(startISO, endISO, true, true).toArray();
  return events.sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export async function listUpcomingEvents(fromISO: string, limit = 5): Promise<CalendarEvent[]> {
  return db.events.where('startAt').aboveOrEqual(fromISO).limit(limit).toArray();
}

export async function listEventsForEntry(entryId: string): Promise<CalendarEvent[]> {
  return (await db.events.where('linkedEntryId').equals(entryId).toArray()).sort((a, b) =>
    a.startAt.localeCompare(b.startAt),
  );
}

export async function listEventsForRecord(recordId: string): Promise<CalendarEvent[]> {
  return db.events.where('linkedRecordId').equals(recordId).toArray();
}

export async function getEvent(id: string): Promise<CalendarEvent | undefined> {
  return db.events.get(id);
}

export async function countEvents(): Promise<number> {
  return db.events.count();
}

// ---------- Escritura ----------

const kinds = [
  'sabbat',
  'esbat',
  'lunar',
  'ritual',
  'cuidado-planta',
  'tarea',
  'recordatorio',
  'personal',
] as const satisfies readonly EventKind[];

const wall = z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, 'La fecha no es válida.');

export const eventInputSchema = z
  .object({
    title: z.string().trim().min(1, 'El título es obligatorio.').max(200),
    kind: z.enum(kinds),
    /** Hora de pared en `timeZone` («YYYY-MM-DDTHH:mm»). */
    start: wall,
    end: wall.optional(),
    timeZone: z.string().refine(isValidTimeZone, 'Zona horaria no válida.'),
    linkedEntryId: z.string().optional(),
    linkedRecordId: z.string().optional(),
    notes: z.string().trim().max(5000).optional(),
    remind: wall.optional(),
  })
  .refine((v) => !v.end || v.end >= v.start, {
    message: 'El término no puede ser antes del inicio.',
    path: ['end'],
  });

export type EventInput = z.infer<typeof eventInputSchema>;

export class EventValidationError extends Error {
  readonly fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>) {
    super(Object.values(fieldErrors)[0] ?? 'Datos no válidos.');
    this.name = 'EventValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export async function saveEvent({ id, input }: { id?: string; input: EventInput }): Promise<CalendarEvent> {
  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? 'form')] ??= issue.message;
    throw new EventValidationError(fieldErrors);
  }
  const d = parsed.data;
  return db.transaction('rw', db.events, async () => {
    const existing = id ? await db.events.get(id) : undefined;
    if (id && !existing) throw new Error('El evento que intentas editar ya no existe.');
    const event: CalendarEvent = {
      id: existing?.id ?? newId(),
      title: d.title,
      kind: d.kind,
      startAt: wallTimeToUtc(d.start, d.timeZone),
      endAt: d.end ? wallTimeToUtc(d.end, d.timeZone) : undefined,
      timeZone: d.timeZone,
      linkedEntryId: d.linkedEntryId || undefined,
      linkedRecordId: d.linkedRecordId || undefined,
      source: 'user',
      notes: d.notes || undefined,
      remindAt: d.remind ? wallTimeToUtc(d.remind, d.timeZone) : undefined,
    };
    await db.events.put(event);
    return event;
  });
}

/** Vincula una memoria a un evento (p. ej. «Registrar cómo resultó»). */
export async function linkRecordToEvent(eventId: string, recordId: string): Promise<void> {
  await db.events.update(eventId, { linkedRecordId: recordId });
}

/** Quita el vínculo con la ficha o la memoria sin borrar nada más. */
export async function unlinkEvent(eventId: string, what: 'entry' | 'record'): Promise<void> {
  await db.events.update(
    eventId,
    what === 'entry' ? { linkedEntryId: undefined } : { linkedRecordId: undefined },
  );
}

/** Elimina solo el evento; la ficha y la memoria vinculadas no se tocan. */
export async function deleteEvent(id: string): Promise<void> {
  await db.events.delete(id);
}
