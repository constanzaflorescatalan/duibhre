import { z } from 'zod';
import type { Preferences } from '../../types/domain';
import { isValidTimeZone } from '../../utils/timezone';
import { db } from '../db';

/** Preferencias del grimorio (sección 11). Por defecto: hemisferio sur, America/Santiago. */
export const DEFAULT_PREFERENCES: Preferences = {
  hemisphere: 'south',
  timeZone: 'America/Santiago',
  locale: 'es-CL',
  reduceMotion: false,
  theme: 'dark-leather',
  preferredIllustrationStyle: 'botanico',
};

const prefsSchema = z.object({
  displayName: z.string().trim().max(60).optional(),
  dedication: z.string().trim().max(500).optional(),
  hemisphere: z.enum(['south', 'north']),
  timeZone: z.string().refine(isValidTimeZone, 'Zona horaria no válida.'),
});

export async function getPreferences(): Promise<Preferences> {
  const stored = await db.preferences.get('local');
  if (!stored) return { ...DEFAULT_PREFERENCES };
  const { id: _id, ...rest } = stored;
  return { ...DEFAULT_PREFERENCES, ...rest };
}

export async function savePreferences(patch: Partial<Preferences>): Promise<Preferences> {
  const next = { ...(await getPreferences()), ...patch };
  const parsed = prefsSchema.safeParse(next);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Preferencias no válidas.');
  const clean: Preferences = {
    ...next,
    displayName: parsed.data.displayName || undefined,
    dedication: parsed.data.dedication || undefined,
  };
  await db.preferences.put({ ...clean, id: 'local' });
  return clean;
}
