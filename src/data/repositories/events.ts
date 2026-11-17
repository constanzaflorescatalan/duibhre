import { db } from '../db';
import type { CalendarEvent } from '../../types/domain';

/**
 * Eventos de agenda. Solo eventos creados por la persona o cargados desde un
 * dataset revisado (`source: 'calendar-dataset'`); nunca fechas inventadas.
 * Escritura y vínculos bidireccionales: Etapa 3.
 */
export async function listEventsBetween(startISO: string, endISO: string): Promise<CalendarEvent[]> {
  return db.events.where('startAt').between(startISO, endISO, true, true).toArray();
}

export async function countEvents(): Promise<number> {
  return db.events.count();
}
