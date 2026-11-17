import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../app/router';
import { db } from '../data/db';
import { deleteEntry, saveEntry } from '../data/repositories/entries';
import {
  deleteRecord,
  listJournalRecords,
  listRecordsForEntry,
  RecordValidationError,
  saveRecord,
} from '../data/repositories/journal';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const menta = {
  chapterId: 'herbolaria' as const,
  title: 'Menta',
  tags: [],
  extraFields: {},
  sources: [],
  status: 'saved' as const,
};

const note = (linkedEntryIds: string[]) => ({
  kind: 'observacion' as const,
  title: 'Brotó la menta',
  body: 'Aparecieron tres hojas nuevas.',
  date: '2026-11-17T10:00',
  linkedEntryIds,
  tags: [],
});

beforeEach(async () => {
  await Promise.all([db.entries.clear(), db.journal.clear(), db.blobs.clear()]);
});

describe('repositorio de bitácora', () => {
  it('exige título', async () => {
    await expect(saveRecord({ input: { ...note([]), title: ' ' } })).rejects.toBeInstanceOf(
      RecordValidationError,
    );
  });

  it('una nota vinculada existe una sola vez y aparece en la ficha y en la bitácora', async () => {
    const entry = await saveEntry({ input: menta });
    const record = await saveRecord({ input: note([entry.id, entry.id]) });
    expect(record.linkedEntryIds).toEqual([entry.id]);
    expect(await db.journal.count()).toBe(1);
    expect((await listRecordsForEntry(entry.id)).map((r) => r.id)).toEqual([record.id]);
    expect((await listJournalRecords()).map((r) => r.id)).toEqual([record.id]);
  });

  it('borrar la ficha conserva la nota y solo la desvincula; borrar la nota no toca la ficha', async () => {
    const entry = await saveEntry({ input: menta });
    const record = await saveRecord({ input: note([entry.id]) });
    await deleteEntry(entry.id);
    expect((await db.journal.get(record.id))?.linkedEntryIds).toEqual([]);

    const entry2 = await saveEntry({ input: menta });
    const record2 = await saveRecord({ input: note([entry2.id]) });
    await deleteRecord(record2.id);
    expect(await db.entries.get(entry2.id)).toBeDefined();
  });
});

describe('flujo de notas', () => {
  it('«Añadir nota» desde una ficha crea una memoria que aparece en la ficha y en la Bitácora sin duplicarse', async () => {
    const entry = await saveEntry({ input: menta });
    const router = renderAt(`/fichas/${entry.id}`);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('link', { name: 'Añadir nota' }));
    expect(await screen.findByRole('heading', { name: 'Dejar una memoria' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desvincular Menta' })).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /Título/ }), 'Brotó la menta');
    await user.type(screen.getByRole('textbox', { name: /Lo que viviste/ }), 'Tres hojas nuevas.');
    await user.click(screen.getByRole('button', { name: 'Guardar en bitácora' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Brotó la menta' })).toBeInTheDocument();
    expect(screen.getByText('Memoria guardada en tu bitácora.')).toBeInTheDocument();
    expect(await db.journal.count()).toBe(1);

    await router.navigate(`/fichas/${entry.id}`);
    await user.click(await screen.findByRole('tab', { name: 'Mis anotaciones' }));
    expect(await screen.findByText('Brotó la menta')).toBeInTheDocument();

    await router.navigate('/bitacora');
    expect(await screen.findAllByText('Brotó la menta')).toHaveLength(1);
  });

  it('la Bitácora filtra por tipo', async () => {
    await saveRecord({ input: { ...note([]), kind: 'sueno', title: 'Sueño del bosque' } });
    await saveRecord({ input: note([]) });
    renderAt('/bitacora');
    const user = userEvent.setup();
    expect(await screen.findByText('Sueño del bosque')).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('group', { name: /Filtrar memorias/ })).getByRole('button', { name: 'Sueños' }),
    );
    expect(screen.getByText('Sueño del bosque')).toBeInTheDocument();
    expect(screen.queryByText('Brotó la menta')).not.toBeInTheDocument();
  });
});
