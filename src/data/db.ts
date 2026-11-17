import Dexie, { type EntityTable } from 'dexie';
import type { CalendarEvent, GrimorioEntry, JournalRecord, Preferences, StoredBlob } from '../types/domain';

/**
 * Base de datos local (IndexedDB vía Dexie).
 * Etapa 1: el esquema existe y se puede leer; la escritura (CRUD) llega en la Etapa 2.
 * Las imágenes se guardan como Blob en `blobs`, nunca como base64 en localStorage.
 */
export class DuibhreDB extends Dexie {
  entries!: EntityTable<GrimorioEntry, 'id'>;
  journal!: EntityTable<JournalRecord, 'id'>;
  events!: EntityTable<CalendarEvent, 'id'>;
  blobs!: EntityTable<StoredBlob, 'id'>;
  preferences!: EntityTable<Preferences & { id: 'local' }, 'id'>;

  constructor() {
    super('duibhre');
    this.version(1).stores({
      entries: 'id, chapterId, subtopicId, status, isFavorite, updatedAt, *tags, *relatedEntryIds',
      journal: 'id, kind, date, updatedAt, *linkedEntryIds, *tags',
      events: 'id, kind, startAt, linkedEntryId, linkedRecordId',
      blobs: 'id, createdAt',
      preferences: 'id',
    });
  }
}

export const db = new DuibhreDB();
