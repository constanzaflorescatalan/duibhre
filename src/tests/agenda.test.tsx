import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../app/router';
import { db } from '../data/db';
import { deleteEntry, saveEntry } from '../data/repositories/entries';
import {
  deleteEvent,
  EventValidationError,
  getEvent,
  listEventsForEntry,
  saveEvent,
} from '../data/repositories/events';
import { deleteRecord, saveRecord } from '../data/repositories/journal';
import { getPreferences, savePreferences } from '../data/repositories/preferences';
import { deleteAllData } from '../utils/backup';
import { dayKeyInZone, utcToWallTime, wallTimeToUtc } from '../utils/timezone';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const ritual = {
  chapterId: 'hechiceria' as const,
  title: 'Ritual de luna llena',
  tags: [],
  extraFields: {},
  sources: [],
  status: 'saved' as const,
};

beforeEach(async () => {
  await deleteAllData();
});

describe('zonas horarias', () => {
  it('convierte la hora de pared de Santiago a UTC y de vuelta, con y sin horario de verano', () => {
    // Noviembre: Chile continental en UTC-3.
    expect(wallTimeToUtc('2026-11-24T21:00', 'America/Santiago')).toBe('2026-11-25T00:00:00.000Z');
    // Junio: UTC-4.
    expect(wallTimeToUtc('2026-06-20T21:00', 'America/Santiago')).toBe('2026-06-21T01:00:00.000Z');
    expect(utcToWallTime('2026-11-25T00:00:00.000Z', 'America/Santiago')).toBe('2026-11-24T21:00');
    expect(dayKeyInZone('2026-11-25T00:00:00.000Z', 'America/Santiago')).toBe('2026-11-24');
    expect(dayKeyInZone('2026-11-25T00:00:00.000Z', 'Europe/Madrid')).toBe('2026-11-25');
  });
});

describe('preferencias', () => {
  it('usa hemisferio sur y America/Santiago por defecto y valida la zona', async () => {
    expect(await getPreferences()).toMatchObject({ hemisphere: 'south', timeZone: 'America/Santiago' });
    await savePreferences({ hemisphere: 'north', timeZone: 'Europe/Madrid', displayName: 'Conita' });
    expect(await getPreferences()).toMatchObject({ hemisphere: 'north', timeZone: 'Europe/Madrid' });
    await expect(savePreferences({ timeZone: 'Marte/Olympus' })).rejects.toThrow(/Zona horaria/);
  });
});

describe('eventos vinculados', () => {
  it('valida título y que el término no sea antes del inicio', async () => {
    const base = {
      title: 'X',
      kind: 'ritual' as const,
      start: '2026-11-24T21:00',
      timeZone: 'America/Santiago',
    };
    await expect(saveEvent({ input: { ...base, title: '' } })).rejects.toBeInstanceOf(EventValidationError);
    await expect(saveEvent({ input: { ...base, end: '2026-11-24T20:00' } })).rejects.toThrow(/término/);
  });

  it('borrar la ficha o la memoria desvincula el evento; borrar el evento no toca la ficha', async () => {
    const entry = await saveEntry({ input: ritual });
    const record = await saveRecord({
      input: {
        kind: 'ritual',
        title: 'Cómo resultó',
        body: '',
        date: '2026-11-25T10:00',
        linkedEntryIds: [],
        tags: [],
      },
    });
    const ev = await saveEvent({
      input: {
        title: 'Luna llena',
        kind: 'esbat',
        start: '2026-11-24T21:00',
        timeZone: 'America/Santiago',
        linkedEntryId: entry.id,
        linkedRecordId: record.id,
      },
    });
    expect((await listEventsForEntry(entry.id)).map((e) => e.id)).toEqual([ev.id]);

    await deleteRecord(record.id);
    expect((await getEvent(ev.id))?.linkedRecordId).toBeUndefined();
    await deleteEntry(entry.id);
    const after = await getEvent(ev.id);
    expect(after).toBeDefined();
    expect(after?.linkedEntryId).toBeUndefined();

    const entry2 = await saveEntry({ input: ritual });
    const ev2 = await saveEvent({
      input: {
        title: 'Otro',
        kind: 'ritual',
        start: '2026-11-26T21:00',
        timeZone: 'America/Santiago',
        linkedEntryId: entry2.id,
      },
    });
    await deleteEvent(ev2.id);
    expect(await db.entries.get(entry2.id)).toBeDefined();
  });
});

describe('flujo de la sección 10', () => {
  it('ritual → agendar → registrar cómo resultó → la memoria aparece en el evento y en la bitácora', async () => {
    const entry = await saveEntry({ input: ritual });
    const router = renderAt(`/fichas/${entry.id}`);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('link', { name: 'Vincular al calendario' }));
    expect(await screen.findByRole('heading', { name: 'Nuevo evento o recordatorio' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Ficha relacionada' })).toHaveValue(entry.id);
    await user.type(screen.getByRole('textbox', { name: /Título/ }), 'Luna llena de noviembre');
    await user.click(screen.getByRole('button', { name: 'Guardar evento' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Luna llena de noviembre' }),
    ).toBeInTheDocument();
    const eventPath = router.state.location.pathname;
    expect(eventPath).toMatch(/^\/agenda\/eventos\//);

    await user.click(screen.getByRole('link', { name: 'Registrar cómo resultó' }));
    expect(await screen.findByText(/Registrando cómo resultó/)).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: /Título/ }), 'La luna salió entre nubes');
    await user.click(screen.getByRole('button', { name: 'Guardar en bitácora' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'La luna salió entre nubes' }),
    ).toBeInTheDocument();

    const [event] = await db.events.toArray();
    const [record] = await db.journal.toArray();
    expect(event.linkedRecordId).toBe(record.id);
    expect(record.linkedEntryIds).toEqual([entry.id]);
    expect(await db.journal.count()).toBe(1);

    await router.navigate(eventPath);
    expect(await screen.findByText('La luna salió entre nubes')).toBeInTheDocument();
  });
});
