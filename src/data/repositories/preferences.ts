import { z } from 'zod';
import type { Preferences } from '../../types/domain';
import { isValidTimeZone } from '../../utils/timezone';
import { newId } from '../../utils/ids';
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
  preferredIllustrationStyle: z.enum(['botanico', 'tinta-antigua', 'acuarela-grimorio']),
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

/** Guarda la foto de perfil (ya preparada) y borra la anterior, en una sola transacción. */
export async function setAvatar(blob: Blob): Promise<Preferences> {
  const id = newId();
  let saved: Preferences = DEFAULT_PREFERENCES;
  await db.transaction('rw', [db.blobs, db.preferences], async () => {
    const prefs = await getPreferences();
    await db.blobs.add({
      id,
      blob,
      mimeType: blob.type || 'image/jpeg',
      createdAt: new Date().toISOString(),
    });
    if (prefs.avatarBlobId) await db.blobs.delete(prefs.avatarBlobId);
    saved = { ...prefs, avatarBlobId: id };
    await db.preferences.put({ ...saved, id: 'local' });
  });
  return saved;
}

/** Quita la foto de perfil: vuelve a mostrarse la inicial capitular. */
export async function removeAvatar(): Promise<Preferences> {
  let saved: Preferences = DEFAULT_PREFERENCES;
  await db.transaction('rw', [db.blobs, db.preferences], async () => {
    const prefs = await getPreferences();
    if (prefs.avatarBlobId) await db.blobs.delete(prefs.avatarBlobId);
    saved = { ...prefs, avatarBlobId: undefined };
    await db.preferences.put({ ...saved, id: 'local' });
  });
  return saved;
}
