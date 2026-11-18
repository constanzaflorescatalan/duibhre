import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../app/router';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { db } from '../data/db';
import { getPreferences, removeAvatar, savePreferences, setAvatar } from '../data/repositories/preferences';
import { buildBackup, deleteAllData, restoreBackup } from '../utils/backup';
import { avatarInitial } from '../utils/initial';

beforeEach(async () => {
  await deleteAllData();
});

describe('imagen de perfil', () => {
  it('toma la inicial del nombre, sin tildes y con Ñ', () => {
    expect(avatarInitial('Constanza')).toBe('C');
    expect(avatarInitial('  ángela')).toBe('A');
    expect(avatarInitial('Ñusta')).toBe('Ñ');
    expect(avatarInitial('zoe')).toBe('Z');
    expect(avatarInitial('7 lunas')).toBeNull();
    expect(avatarInitial(undefined)).toBeNull();
  });

  it('muestra la letra capitular de la inicial, o un sello si no hay nombre', () => {
    const { rerender } = render(<ProfileAvatar name="Duna" />);
    expect(screen.getByRole('img', { name: 'Inicial D' })).toHaveAttribute(
      'src',
      expect.stringContaining('d.jpg'),
    );
    rerender(<ProfileAvatar name="Ñandú" />);
    expect(screen.getByRole('img', { name: 'Inicial Ñ' })).toHaveAttribute(
      'src',
      expect.stringContaining('enie.jpg'),
    );
    rerender(<ProfileAvatar />);
    expect(screen.getByRole('img', { name: 'Sin foto de perfil' })).toBeInTheDocument();
  });

  it('guarda, reemplaza y quita la foto sin dejar imágenes huérfanas', async () => {
    await setAvatar(new Blob(['uno'], { type: 'image/jpeg' }));
    const first = (await getPreferences()).avatarBlobId!;
    await setAvatar(new Blob(['dos'], { type: 'image/jpeg' }));
    const second = (await getPreferences()).avatarBlobId!;
    expect(second).not.toBe(first);
    expect(await db.blobs.get(first)).toBeUndefined();
    expect(await db.blobs.count()).toBe(1);
    await removeAvatar();
    expect((await getPreferences()).avatarBlobId).toBeUndefined();
    expect(await db.blobs.count()).toBe(0);
  });

  it('el respaldo conserva nombre, dedicatoria y foto de perfil', async () => {
    await savePreferences({ displayName: 'Coni', dedication: 'Para mí' });
    const exported = await buildBackup();
    expect(exported.data.preferences).toMatchObject({ displayName: 'Coni', dedication: 'Para mí' });

    // jsdom no clona Blobs en IndexedDB simulado: la foto se prueba con un respaldo ya armado.
    const backup = {
      ...exported,
      data: {
        ...exported.data,
        blobs: [
          { id: 'foto-1', mimeType: 'image/jpeg', createdAt: new Date().toISOString(), dataBase64: 'AAEC' },
        ],
        preferences: { ...exported.data.preferences, avatarBlobId: 'foto-1' },
      },
    };
    await deleteAllData();
    await restoreBackup(backup);
    const prefs = await getPreferences();
    expect(prefs.displayName).toBe('Coni');
    expect(prefs.dedication).toBe('Para mí');
    expect(prefs.avatarBlobId).toBe('foto-1');
    expect(await db.blobs.get('foto-1')).toBeTruthy();
  });

  it('el perfil ofrece subir una foto', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/perfil'] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole('button', { name: /Subir foto/ })).toBeInTheDocument();
  });
});
