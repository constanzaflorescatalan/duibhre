import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../app/router';
import { db } from '../data/db';
import { deleteRecord, saveRecord } from '../data/repositories/journal';
import { deleteAllData } from '../utils/backup';

const input = {
  kind: 'sueno' as const,
  title: 'Sueño del bosque',
  body: '',
  date: '2026-11-17T08:00',
  linkedEntryIds: [],
  tags: [],
};

beforeEach(async () => {
  await deleteAllData();
});

describe('fotos en memorias', () => {
  it('el editor de memorias ofrece tomar o subir fotos', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/crear/nota'] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole('button', { name: 'Tomar foto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subir imagen' })).toBeInTheDocument();
  });

  it('guarda las fotos con la memoria, permite quitarlas y las borra con ella', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' });
    const record = await saveRecord({
      input,
      newImages: [{ tempId: 't', blob, alt: 'niebla entre árboles' }],
    });
    expect(record.media).toHaveLength(1);
    expect(record.media?.[0].alt).toBe('niebla entre árboles');
    expect(record.mediaIds).toEqual([record.media?.[0].originalBlobId]);
    expect(await db.blobs.count()).toBe(1);

    const edited = await saveRecord({ id: record.id, input, keptMedia: [] });
    expect(edited.media).toEqual([]);
    expect(await db.blobs.count()).toBe(0);

    const again = await saveRecord({ input, newImages: [{ tempId: 'u', blob, alt: '' }] });
    await deleteRecord(again.id);
    expect(await db.blobs.count()).toBe(0);
  });
});
