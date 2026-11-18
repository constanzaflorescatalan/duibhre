import { CalendarClock, CalendarPlus, Heart, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { EntryCard } from '../components/chapter/EntryCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Page } from '../components/common/Page';
import { Filigree } from '../components/ornaments/Ornaments';
import { noteKindLabel } from '../config/noteKinds';
import { getEntriesByIds } from '../data/repositories/allEntries';
import { deleteRecord, getRecord, toggleRecordFavorite } from '../data/repositories/journal';
import { useAsync } from '../hooks/useAsync';
import { EventCard } from '../components/calendar/EventCard';
import { listEventsForRecord } from '../data/repositories/events';
import { formatDate, formatDateTime } from '../utils/dates';
import { NotFoundPage } from './NotFoundPage';

/** Detalle de una memoria `/bitacora/:recordId`. */
export function RecordPage() {
  const { recordId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const justSaved = Boolean((location.state as { saved?: boolean } | null)?.saved);
  const [version, setVersion] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const data = useAsync(async () => {
    const record = await getRecord(recordId);
    return {
      record,
      entries: record ? await getEntriesByIds(record.linkedEntryIds) : [],
      events: record ? await listEventsForRecord(record.id) : [],
    };
  }, [recordId, version]);

  if (data.status === 'loading') {
    return (
      <Page>
        <p className="muted" role="status">
          Buscando la memoria…
        </p>
      </Page>
    );
  }
  if (data.status === 'error' || !data.data.record) return <NotFoundPage />;
  const { record, entries, events } = data.data;

  return (
    <Page>
      <header className="entry-header">
        <p className="page-header__eyebrow">
          <Link to="/bitacora">Memorias del alma</Link> · {noteKindLabel(record.kind)}
        </p>
        <h1 className="page-header__title">{record.title}</h1>
        <p className="entry-header__meta">
          <span>{formatDateTime(record.date)}</span>
          {record.mood && <span className="tag">{record.mood}</span>}
          <span className="tag">Privada</span>
        </p>
        <Filigree className="filigree" />
      </header>

      {justSaved && (
        <p className="success-text" role="status">
          Memoria guardada en tu bitácora.
        </p>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      <div className="button-row">
        <Link to={`/bitacora/${record.id}/editar`} className="btn btn--primary btn--small">
          <Pencil size={18} aria-hidden="true" />
          Editar
        </Link>
        <button
          type="button"
          className={`btn btn--secondary btn--small${record.isFavorite ? ' is-favorite' : ''}`}
          aria-pressed={Boolean(record.isFavorite)}
          onClick={async () => {
            try {
              await toggleRecordFavorite(record.id);
              setVersion((v) => v + 1);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'No se pudo actualizar.');
            }
          }}
        >
          <Heart size={18} aria-hidden="true" fill={record.isFavorite ? 'currentColor' : 'none'} />
          {record.isFavorite ? 'En favoritos' : 'Favorito'}
        </button>
      </div>

      <div className="button-row">
        <Link to={`/crear/evento?nota=${record.id}`} className="btn btn--secondary btn--small">
          <CalendarPlus size={18} aria-hidden="true" />
          Añadir a agenda
        </Link>
      </div>

      <article className="journal-page">
        {record.body ? (
          <p className="journal-page__body">{record.body}</p>
        ) : (
          <p className="muted">Sin texto.</p>
        )}
      </article>

      {record.tags.length > 0 && (
        <p className="entry-card__meta">
          {record.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </p>
      )}

      {record.followUpAt && (
        <p className="notice-line">
          <CalendarClock size={18} aria-hidden="true" />
          Fecha próxima: {formatDate(record.followUpAt)}. Aparece marcada en la Agenda.
        </p>
      )}

      {events.length > 0 && (
        <>
          <h2 className="section-title">En la agenda</h2>
          <ul className="journal-list">
            {events.map((ev) => (
              <li key={ev.id}>
                <EventCard event={ev} showDate />
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="section-title">Fichas vinculadas</h2>
      {entries.length > 0 ? (
        <ul className="entry-list">
          {entries.map((e) => (
            <li key={e.id}>
              <EntryCard entry={e} showChapter />
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Esta memoria no está vinculada a ninguna ficha.</p>
      )}

      <div className="danger-zone">
        <button type="button" className="btn btn--danger btn--small" onClick={() => setConfirmDelete(true)}>
          <Trash2 size={18} aria-hidden="true" />
          Eliminar memoria
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`¿Eliminar «${record.title}»?`}
        message="Se borrará esta memoria de la Bitácora y de las fichas vinculadas. Las fichas no se borran. No se puede deshacer."
        confirmLabel="Eliminar definitivamente"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setConfirmDelete(false);
          try {
            await deleteRecord(record.id);
            navigate('/bitacora', { replace: true });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
          }
        }}
      />
    </Page>
  );
}
