import type { GrimorioEntry } from '../../types/domain';
import { getEntry, listPersonalEntries, listSeedEntries } from './entries';

/** Fichas de ejemplo + personales (no archivadas), para selectores y búsquedas. */
export async function listAllEntries(): Promise<GrimorioEntry[]> {
  return [...listSeedEntries(), ...(await listPersonalEntries())];
}

export async function getEntriesByIds(ids: string[]): Promise<GrimorioEntry[]> {
  const found = await Promise.all(ids.map((id) => getEntry(id)));
  return found.filter((e): e is GrimorioEntry => e !== undefined);
}
