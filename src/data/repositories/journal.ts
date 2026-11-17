import { db } from '../db';
import type { JournalRecord } from '../../types/domain';

/**
 * Bitácora central. Un registro se crea una sola vez y se vincula a fichas
 * mediante `linkedEntryIds`, de modo que aparece en la ficha y en la Bitácora
 * sin duplicarse. Escritura: Etapa 2.
 */
export async function listJournalRecords(): Promise<JournalRecord[]> {
  return db.journal.orderBy('date').reverse().toArray();
}

export async function listRecordsForEntry(entryId: string): Promise<JournalRecord[]> {
  return db.journal.where('linkedEntryIds').equals(entryId).toArray();
}

export async function countJournalRecords(): Promise<number> {
  return db.journal.count();
}
