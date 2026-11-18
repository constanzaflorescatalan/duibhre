import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../app/router';
import { deleteEntry, getEntry, listEntriesRelatingTo, saveEntry } from '../data/repositories/entries';
import { getPreferences, savePreferences } from '../data/repositories/preferences';
import { deleteAllData } from '../utils/backup';

const base = {
  chapterId: 'herbolaria' as const,
  tags: [],
  extraFields: {},
  sources: [],
  status: 'saved' as const,
};

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(async () => {
  await deleteAllData();
});

describe('fichas relacionadas', () => {
  it('guarda relaciones, las muestra en ambos sentidos y limpia al borrar', async () => {
    const menta = await saveEntry({ input: { ...base, title: 'Menta' } });
    const romero = await saveEntry({
      input: { ...base, title: 'Romero', relatedEntryIds: [menta.id, 'ejemplo-lavanda', menta.id] },
    });
    expect(romero.relatedEntryIds).toEqual([menta.id, 'ejemplo-lavanda']);
    expect((await listEntriesRelatingTo(menta.id)).map((e) => e.title)).toEqual(['Romero']);

    renderAt(`/fichas/${menta.id}`);
    expect(await screen.findByRole('heading', { level: 1, name: 'Menta' })).toBeInTheDocument();

    await deleteEntry(menta.id);
    expect((await getEntry(romero.id))?.relatedEntryIds).toEqual(['ejemplo-lavanda']);
  });
});

describe('dedicatoria y estilo preferido', () => {
  it('la página de dedicatoria muestra el texto y la firma', async () => {
    await savePreferences({ dedication: 'Para quien fui y quien seré.', displayName: 'Coni' });
    renderAt('/dedicatoria');
    expect(await screen.findByText('Para quien fui y quien seré.')).toBeInTheDocument();
    expect(screen.getByText('— Coni')).toBeInTheDocument();
  });

  it('sin dedicatoria invita a escribirla', async () => {
    renderAt('/dedicatoria');
    expect(await screen.findByRole('link', { name: /Escribir dedicatoria/ })).toBeInTheDocument();
  });

  it('guarda el estilo de ilustración preferido', async () => {
    await savePreferences({ preferredIllustrationStyle: 'tinta-antigua' });
    expect((await getPreferences()).preferredIllustrationStyle).toBe('tinta-antigua');
  });
});
