import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../app/router';
import { db } from '../data/db';
import {
  copySeedToPersonal,
  deleteEntry,
  getEntry,
  listPersonalEntries,
  saveEntry,
  setArchived,
  toggleFavorite,
  ValidationError,
} from '../data/repositories/entries';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const baseInput = {
  chapterId: 'herbolaria' as const,
  title: 'Menta',
  tags: [],
  extraFields: {},
  sources: [],
  status: 'saved' as const,
};

beforeEach(async () => {
  await db.entries.clear();
  await db.blobs.clear();
});

describe('repositorio de fichas', () => {
  it('exige título', async () => {
    await expect(saveEntry({ input: { ...baseInput, title: '   ' } })).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(await db.entries.count()).toBe(0);
  });

  it('crea, actualiza, marca favorita, archiva y elimina', async () => {
    const created = await saveEntry({ input: baseInput });
    expect(created.origin).toBe('personal');

    const updated = await saveEntry({ id: created.id, input: { ...baseInput, title: 'Menta piperita' } });
    expect(updated.createdAt).toBe(created.createdAt);
    expect((await getEntry(created.id))?.title).toBe('Menta piperita');

    expect(await toggleFavorite(created.id)).toBe(true);
    await setArchived(created.id, true);
    expect(await listPersonalEntries('herbolaria')).toHaveLength(0);

    await deleteEntry(created.id);
    expect(await getEntry(created.id)).toBeUndefined();
  });

  it('copia una ficha de ejemplo como borrador personal sin tocar el original', async () => {
    const copy = await copySeedToPersonal('ejemplo-lavanda');
    expect(copy.origin).toBe('personal');
    expect(copy.status).toBe('draft');
    expect(copy.tags).not.toContain('ejemplo');
    expect((await getEntry('ejemplo-lavanda'))?.origin).toBe('seed');
  });
});

describe('formulario de ficha', () => {
  it('crea la ficha «Menta» desde el capítulo y queda guardada', async () => {
    const router = renderAt('/crear/ficha?capitulo=herbolaria&subtema=plantas-medicinales');
    const user = userEvent.setup();

    expect(await screen.findByRole('heading', { name: 'Escribir una nueva página' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Capítulo/ })).toHaveValue('herbolaria');
    expect(screen.getByRole('combobox', { name: /Subtema/ })).toHaveValue('plantas-medicinales');

    await user.type(screen.getByRole('textbox', { name: /Título/ }), 'Menta');
    await user.type(screen.getByRole('textbox', { name: /Nombre científico/ }), 'Mentha spicata');
    await user.type(screen.getByRole('textbox', { name: /Precauciones/ }), 'No ingerir aceite esencial.');
    await user.click(screen.getByRole('button', { name: 'Guardar ficha' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Menta' })).toBeInTheDocument();
    expect(screen.getByText('Página guardada en este dispositivo.')).toBeInTheDocument();
    expect(router.state.location.pathname).toMatch(/^\/fichas\//);

    const [saved] = await listPersonalEntries('herbolaria');
    expect(saved.title).toBe('Menta');
    expect(saved.subtopicId).toBe('plantas-medicinales');
    expect(saved.extraFields.scientificName).toBe('Mentha spicata');
  });

  it('muestra el error si falta el título y no guarda', async () => {
    renderAt('/crear/ficha');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Guardar ficha' }));
    expect(await screen.findByText('El título es obligatorio.')).toBeInTheDocument();
    expect(await db.entries.count()).toBe(0);
  });

  it('pide confirmación al cancelar con cambios sin guardar', async () => {
    renderAt('/crear/ficha');
    const user = userEvent.setup();
    await user.type(await screen.findByRole('textbox', { name: /Título/ }), 'Romero');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    const dialog = screen.getByRole('alertdialog', { name: /Descartar los cambios/ });
    await user.click(within(dialog).getByRole('button', { name: 'Seguir escribiendo' }));
    expect(screen.getByRole('textbox', { name: /Título/ })).toHaveValue('Romero');
  });

  it('la ficha guardada aparece en «Mis fichas» del capítulo', async () => {
    await saveEntry({ input: baseInput });
    renderAt('/capitulos/herbolaria');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Mis fichas' }));
    expect(await screen.findByText('Menta')).toBeInTheDocument();
  });
});
