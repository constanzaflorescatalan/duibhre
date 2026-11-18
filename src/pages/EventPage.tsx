import { BellRing, NotebookPen, Pencil, Trash2, Unlink } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { EntryCard } from '../components/chapter/EntryCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Page } from '../components/common/Page';
import { JournalCard } from '../components/journal/JournalCard';
import { Filigree } from '../components/ornaments/Ornaments';
import { eventKind } from '../config/eventKinds';
import { getEntry } from '../data/repositories/entries';
import { deleteEvent, getEvent, unlinkEvent } from '../data/repositories/events';
import { getRecord } from '../data/repositories/journal';
import { useAsync } from '../hooks/useAsync';
import { formatInZone } from '../utils/timezone';
import { NotFoundPage } from './NotFoundPage';

/** Detalle de evento `/agenda/eventos/:eventId` (secciones 7.9 y 10). */
export function EventPage() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const justSaved = Boolean((location.state as { saved?: boolean } | null)?.saved);
  const [version, setVersion] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const data = useAsync(async () => {
    const event = await getEvent(eventId);
    if (!event) return { event };
    const [entry, record] = await Promise.all([
      event.linkedEntryId ? getEntry(event.linkedEntryId) : undefined,
      event.linkedRecordId ? getRecord(event.linkedRecordId) : undefined,
    ]);
    return { event, entry, record };
  }, [eventId, version]);

  if (data.status === 'loading') {
    return (
      <Page>
        <p className="muted" role="status">
          Buscando el evento…
        </p>
      </Page>
    );
  }
  if (data.status === 'error' || !data.data.event) return <NotFoundPage />;
  const { event, entry, record } = data.data;
  const kind = eventKind(event.kind);

  const unlink = async (what: 'entry' | 'record') => {
    try {
      await unlinkEvent(event.id, what);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desvincular.');
    }
  };

  const recordHref = `/crear/nota?evento=${event.id}${event.linkedEntryId ? `&ficha=${event.linkedEntryId}` : ''}${event.kind === 'ritual' ? '&tipo=ritual' : ''}`;

  return (
    <Page>
      <header className="entry-header">
        <p className="page-header__eyebrow">
          <Link to="/agenda">Agenda mágica</Link> · <span style={{ color: kind.color }}>{kind.label}</span>
        </p>
        <h1 className="page-header__title">{event.title}</h1>
        <p className="entry-header__meta">
          <span>{formatInZone(event.startAt, event.timeZone)}</span>
          {event.endAt && <span>hasta {formatInZone(event.endAt, event.timeZone)}</span>}
          <span className="tag">{event.timeZone}</span>
        </p>
        <Filigree className="filigree" />
      </header>

      {justSaved && (
        <p className="success-text" role="status">
          Evento guardado en tu agenda.
        </p>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      <div className="button-row">
        <Link to={`/agenda/eventos/${event.id}/editar`} className="btn btn--primary btn--small">
          <Pencil size={18} aria-hidden="true" />
          Editar evento
        </Link>
        <Link to={recordHref} className="btn btn--secondary btn--small">
          <NotebookPen size={18} aria-hidden="true" />
          Registrar cómo resultó
        </Link>
      </div>

      {event.notes && <p className="personal-notes__text">{event.notes}</p>}
      {event.remindAt && (
        <p className="notice-line">
          <BellRing size={18} aria-hidden="true" />
          Recordatorio anotado: {formatInZone(event.remindAt, event.timeZone)} (sin notificación automática).
        </p>
      )}

      <h2 className="section-title">Ficha relacionada</h2>
      {entry ? (
        <>
          <EntryCard entry={entry} showChapter />
          <button
            type="button"
            className="btn btn--ghost btn--small link-action"
            onClick={() => unlink('entry')}
          >
            <Unlink size={16} aria-hidden="true" />
            Desvincular ficha
          </button>
        </>
      ) : (
        <p className="muted">Sin ficha vinculada.</p>
      )}

      <h2 className="section-title">Memoria relacionada</h2>
      {record ? (
        <>
          <JournalCard record={record} />
          <button
            type="button"
            className="btn btn--ghost btn--small link-action"
            onClick={() => unlink('record')}
          >
            <Unlink size={16} aria-hidden="true" />
            Desvincular memoria
          </button>
        </>
      ) : (
        <p className="muted">Sin memoria vinculada. Usa «Registrar cómo resultó» para escribirla.</p>
      )}

      <div className="danger-zone">
        <button type="button" className="btn btn--danger btn--small" onClick={() => setConfirmDelete(true)}>
          <Trash2 size={18} aria-hidden="true" />
          Eliminar evento
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`¿Eliminar «${event.title}»?`}
        message="Se borrará solo el evento de la agenda. La ficha y la memoria vinculadas no se tocan."
        confirmLabel="Eliminar evento"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setConfirmDelete(false);
          try {
            await deleteEvent(event.id);
            navigate('/agenda', { replace: true });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
          }
        }}
      />
    </Page>
  );
}
