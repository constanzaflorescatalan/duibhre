import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { EventEditor } from '../components/calendar/EventEditor';
import { Page, PageHeader } from '../components/common/Page';
import { EVENT_KINDS } from '../config/eventKinds';
import { UI } from '../config/uiCopy';
import { listAllEntries } from '../data/repositories/allEntries';
import { getEvent } from '../data/repositories/events';
import { getRecord, listJournalRecords } from '../data/repositories/journal';
import { getPreferences } from '../data/repositories/preferences';
import { useAsync } from '../hooks/useAsync';
import { useBack } from '../hooks/useBack';
import type { EventKind } from '../types/domain';
import { utcToWallTime } from '../utils/timezone';
import { NotFoundPage } from './NotFoundPage';

/**
 * `/crear/evento` (acepta `?fecha=YYYY-MM-DD`, `?ficha=`, `?nota=` y `?tipo=`)
 * y `/agenda/eventos/:eventId/editar`.
 */
export function EventFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { eventId = '' } = useParams();
  const [params] = useSearchParams();
  const back = useBack(mode === 'edit' ? `/agenda/eventos/${eventId}` : '/agenda');
  const fecha = params.get('fecha') ?? '';
  const ficha = params.get('ficha') ?? '';
  const nota = params.get('nota') ?? '';
  const tipo = params.get('tipo') ?? '';
  const [nowIso] = useState(() => new Date().toISOString());

  const data = useAsync(async () => {
    const [prefs, entries, records] = await Promise.all([
      getPreferences(),
      listAllEntries(),
      listJournalRecords(),
    ]);
    const event = mode === 'edit' ? await getEvent(eventId) : undefined;
    const linkedRecord = nota ? await getRecord(nota) : undefined;
    return { prefs, entries, records, event, linkedRecord };
  }, [mode, eventId, nota]);

  const defaults = useMemo(() => {
    if (data.status !== 'success') return null;
    const { prefs, linkedRecord } = data.data;
    const tz = prefs.timeZone;
    let start = utcToWallTime(nowIso, tz).slice(0, 11) + '20:00';
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) start = `${fecha}T20:00`;
    else if (linkedRecord?.followUpAt)
      start = utcToWallTime(linkedRecord.followUpAt, tz).slice(0, 11) + '09:00';
    const kind = EVENT_KINDS.some((k) => k.id === tipo)
      ? (tipo as EventKind)
      : linkedRecord
        ? 'recordatorio'
        : 'ritual';
    return {
      timeZone: tz,
      start,
      kind,
      title: linkedRecord ? linkedRecord.title : '',
      linkedEntryId: ficha || linkedRecord?.linkedEntryIds[0] || '',
      linkedRecordId: linkedRecord?.id ?? '',
    };
  }, [data, fecha, ficha, tipo, nowIso]);

  if (data.status === 'loading' || !defaults) {
    return (
      <Page>
        <p className="muted" role="status">
          Abriendo la agenda…
        </p>
      </Page>
    );
  }
  if (data.status === 'error' || (mode === 'edit' && !data.data.event)) return <NotFoundPage />;

  return (
    <Page>
      <PageHeader title={mode === 'edit' ? 'Editar evento' : UI.pages.createEvent.title} />
      <EventEditor
        key={data.data.event?.id ?? 'nuevo'}
        event={data.data.event}
        defaults={defaults}
        entries={data.data.entries}
        records={data.data.records}
        onCancel={back}
      />
    </Page>
  );
}
