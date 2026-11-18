import { useParams, useSearchParams } from 'react-router-dom';
import { Page, PageHeader } from '../components/common/Page';
import { JournalEditor } from '../components/journal/JournalEditor';
import { NOTE_KINDS } from '../config/noteKinds';
import { UI } from '../config/uiCopy';
import { listAllEntries } from '../data/repositories/allEntries';
import { getRecord } from '../data/repositories/journal';
import { getEvent, linkRecordToEvent } from '../data/repositories/events';
import { useAsync } from '../hooks/useAsync';
import { useBack } from '../hooks/useBack';
import type { NoteKind } from '../types/domain';
import { NotFoundPage } from './NotFoundPage';

/** `/crear/nota` (con `?ficha=` y `?tipo=`) y `/bitacora/:recordId/editar`. */
export function JournalFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { recordId = '' } = useParams();
  const [params] = useSearchParams();
  const linkedEntryId = params.get('ficha') ?? undefined;
  const eventId = params.get('evento') ?? undefined;
  const kindParam = params.get('tipo');
  const initialKind = NOTE_KINDS.some((k) => k.id === kindParam) ? (kindParam as NoteKind) : undefined;
  const back = useBack(
    mode === 'edit' ? `/bitacora/${recordId}` : linkedEntryId ? `/fichas/${linkedEntryId}` : '/crear',
  );

  const data = useAsync(
    async () => ({
      entries: await listAllEntries(),
      record: mode === 'edit' ? await getRecord(recordId) : undefined,
      event: eventId ? await getEvent(eventId) : undefined,
    }),
    [mode, recordId, eventId],
  );

  if (data.status === 'loading') {
    return (
      <Page>
        <p className="muted" role="status">
          Abriendo la bitácora…
        </p>
      </Page>
    );
  }
  if (data.status === 'error' || (mode === 'edit' && !data.data.record)) return <NotFoundPage />;

  return (
    <Page>
      <PageHeader title={mode === 'edit' ? 'Editar memoria' : UI.pages.createNote.title} />
      {data.data.event && (
        <p className="content-note">
          Registrando cómo resultó «{data.data.event.title}». La memoria quedará vinculada al evento.
        </p>
      )}
      <JournalEditor
        key={data.data.record?.id ?? 'nueva'}
        record={data.data.record}
        entries={data.data.entries}
        initialLinkedEntryId={linkedEntryId}
        initialKind={initialKind}
        afterSave={
          data.data.event
            ? async (saved) => {
                if (!data.data.event!.linkedRecordId) await linkRecordToEvent(data.data.event!.id, saved.id);
              }
            : undefined
        }
        onCancel={back}
      />
    </Page>
  );
}
