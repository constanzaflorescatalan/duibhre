import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../app/router';
import { db } from '../data/db';
import { saveEntry } from '../data/repositories/entries';
import { saveRecord } from '../data/repositories/journal';
import {
  base64ToBlob,
  blobToBase64,
  buildBackup,
  deleteAllData,
  parseBackup,
  restoreBackup,
  summarize,
} from '../utils/backup';

const menta = {
  chapterId: 'herbolaria' as const,
  title: 'Menta',
  tags: ['aromática'],
  extraFields: { scientificName: 'Mentha spicata' },
  sources: [],
  status: 'saved' as const,
};

beforeEach(async () => {
  await deleteAllData();
});

describe('respaldo', () => {
  it('convierte imágenes a base64 y de vuelta sin perder bytes', async () => {
    const original = new Blob([new Uint8Array([0, 1, 2, 250, 255])], { type: 'image/png' });
    const back = base64ToBlob(await blobToBase64(original), 'image/png');
    expect(new Uint8Array(await back.arrayBuffer())).toEqual(new Uint8Array([0, 1, 2, 250, 255]));
    expect(back.type).toBe('image/png');
  });

  it('exporta, valida e importa fichas y memorias con sus vínculos', async () => {
    const entry = await saveEntry({ input: menta });
    await saveRecord({
      input: {
        kind: 'observacion',
        title: 'Brotó la menta',
        body: 'Hojas nuevas',
        date: '2026-11-17T10:00',
        linkedEntryIds: [entry.id],
        tags: [],
      },
    });

    const text = JSON.stringify(await buildBackup());
    const parsed = parseBackup(text);
    expect(summarize(parsed)).toMatchObject({ entries: 1, journal: 1, events: 0, images: 0 });

    await deleteAllData();
    expect(await db.entries.count()).toBe(0);

    await restoreBackup(parsed);
    const restored = await db.entries.get(entry.id);
    expect(restored?.extraFields.scientificName).toBe('Mentha spicata');
    const [record] = await db.journal.toArray();
    expect(record.linkedEntryIds).toEqual([entry.id]);
  });

  it('rechaza archivos que no son respaldos válidos sin tocar los datos', async () => {
    await saveEntry({ input: menta });
    expect(() => parseBackup('no es json')).toThrow(/no es JSON/);
    expect(() => parseBackup(JSON.stringify({ app: 'otra' }))).toThrow(/no es un respaldo de DUIBHRÉ/);
    expect(() =>
      parseBackup(
        JSON.stringify({
          app: 'duibhre',
          version: 1,
          exportedAt: new Date().toISOString(),
          data: { entries: [{ id: 'x', title: '' }], journal: [], events: [], blobs: [] },
        }),
      ),
    ).toThrow(/datos no válidos/);
    expect(await db.entries.count()).toBe(1);
  });

  it('«Borrar mis datos» exige escribir BORRAR', async () => {
    await saveEntry({ input: menta });
    const router = createMemoryRouter(routes, { initialEntries: ['/perfil'] });
    render(<RouterProvider router={router} />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /Borrar mis datos/ }));
    const dialog = screen.getByRole('alertdialog', { name: /Borrar todos tus datos/ });
    const confirm = within(dialog).getByRole('button', { name: 'Borrar todo' });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByRole('textbox'), 'BORRAR');
    expect(confirm).toBeEnabled();
    await user.click(confirm);

    expect(await screen.findByText('Se borraron todos tus datos de este dispositivo.')).toBeInTheDocument();
    expect(await db.entries.count()).toBe(0);
  });
});
