import { db } from '../db';
import { SEED_ENTRIES } from '../seedDemo';
import type { ChapterId, GrimorioEntry } from '../../types/domain';

/**
 * Repositorio de fichas. Las fichas de ejemplo («seed») viven en código y las
 * personales en IndexedDB. Etapa 1 implementa solo lectura; save/archive/delete
 * se agregan en la Etapa 2.
 */

export function listSeedEntries(chapterId?: ChapterId): GrimorioEntry[] {
  return chapterId ? SEED_ENTRIES.filter((e) => e.chapterId === chapterId) : [...SEED_ENTRIES];
}

export async function listPersonalEntries(chapterId?: ChapterId): Promise<GrimorioEntry[]> {
  const query = chapterId ? db.entries.where('chapterId').equals(chapterId) : db.entries.toCollection();
  const entries = await query.toArray();
  return entries.filter((e) => e.status !== 'archived');
}

export async function getEntry(id: string): Promise<GrimorioEntry | undefined> {
  return SEED_ENTRIES.find((e) => e.id === id) ?? (await db.entries.get(id));
}

export async function countPersonalEntries(): Promise<number> {
  return db.entries.count();
}

export async function countFavorites(): Promise<number> {
  return db.entries.filter((e) => e.isFavorite).count();
}
