import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  CalendarPlus,
  Copy,
  Heart,
  NotebookPen,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useId, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EntryCard } from '../components/chapter/EntryCard';
import { EmptyState } from '../components/common/EmptyState';
import { Page } from '../components/common/Page';
import { IllustrationPreview } from '../components/media/IllustrationPreview';
import { ChapterGlyph } from '../components/ornaments/ChapterGlyph';
import { Filigree } from '../components/ornaments/Ornaments';
import { getChapter, getSubtopic } from '../config/chapters';
import { ENTRY_TEMPLATES } from '../config/entryTemplates';
import { UI } from '../config/uiCopy';
import {
  copySeedToPersonal,
  deleteEntry,
  getEntry,
  setArchived,
  toggleFavorite,
} from '../data/repositories/entries';
import { JournalCard } from '../components/journal/JournalCard';
import { listRecordsForEntry } from '../data/repositories/journal';
import { useAsync } from '../hooks/useAsync';
import { formatDate } from '../utils/dates';
import { NotFoundPage } from './NotFoundPage';

type Section = 'conocimiento' | 'anotaciones' | 'relaciones';

/** Detalle de ficha `/fichas/:entryId` (sección 7.6). */
export function EntryPage() {
  const { entryId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const savedStatus = (location.state as { saved?: 'draft' | 'saved' } | null)?.saved;
  const [version, setVersion] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const result = useAsync(() => getEntry(entryId), [entryId, version]);
  const related = useAsync(async () => {
    const entry = await getEntry(entryId);
    const list = await Promise.all((entry?.relatedEntryIds ?? []).map((id) => getEntry(id)));
    return list.filter((e) => e !== undefined);
  }, [entryId, version]);
  const notes = useAsync(() => listRecordsForEntry(entryId), [entryId, version]);
  const [section, setSection] = useState<Section>('conocimiento');
  const baseId = useId();

  if (result.status === 'loading') {
    return (
      <Page>
        <p className="muted" role="status">
          Buscando la página…
        </p>
      </Page>
    );
  }
  if (result.status === 'error' || !result.data) return <NotFoundPage />;

  const entry = result.data;
  const chapter = getChapter(entry.chapterId)!;
  const subtopic = getSubtopic(entry.chapterId, entry.subtopicId);
  const template = ENTRY_TEMPLATES[chapter.templateId];
  const isSeed = entry.origin === 'seed';

  const run = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
      setVersion((v) => v + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo completar la acción.');
    }
  };
  const copy = async () => {
    const created = await copySeedToPersonal(entry.id);
    navigate(`/fichas/${created.id}/editar`);
  };

  const fields = template.fields
    .map((f) => ({ field: f, value: entry.extraFields[f.key] }))
    .filter(({ value }) => value !== undefined && value !== '');

  const sections: { id: Section; label: string }[] = [
    { id: 'conocimiento', label: 'Conocimiento' },
    { id: 'anotaciones', label: 'Mis anotaciones' },
    { id: 'relaciones', label: 'Relaciones' },
  ];

  return (
    <Page>
      <header className="entry-header">
        <p className="page-header__eyebrow">
          <Link to={`/capitulos/${chapter.id}`}>
            {chapter.romanNumeral} · {chapter.title}
          </Link>
          {subtopic && (
            <>
              {' · '}
              <Link to={`/capitulos/${chapter.id}/subtemas/${subtopic.id}`}>{subtopic.title}</Link>
            </>
          )}
        </p>
        <div className="entry-header__seal" aria-hidden="true">
          <ChapterGlyph chapterId={chapter.id} size={34} />
        </div>
        <h1 className="page-header__title">{entry.title}</h1>
        {typeof entry.extraFields.scientificName === 'string' && (
          <p className="entry-header__latin">{entry.extraFields.scientificName}</p>
        )}
        <p className="entry-header__meta">
          {isSeed && <span className="tag tag--example">{UI.exampleBadge}</span>}
          {entry.status === 'draft' && <span className="tag tag--draft">Borrador</span>}
          {entry.status === 'archived' && <span className="tag">Archivada</span>}
          <span className="tag">Plantilla: {template.name}</span>
          <span>Actualizada el {formatDate(entry.updatedAt)}</span>
        </p>
        <Filigree className="filigree" />
      </header>

      {savedStatus && (
        <p className="success-text" role="status">
          {savedStatus === 'draft'
            ? 'Borrador guardado en este dispositivo.'
            : 'Página guardada en este dispositivo.'}
        </p>
      )}
      {actionError && (
        <p className="error-text" role="alert">
          {actionError}
        </p>
      )}

      <div className="button-row button-row--wrap">
        {isSeed ? (
          <button type="button" className="btn btn--primary btn--small" onClick={() => run(copy)}>
            <Copy size={18} aria-hidden="true" />
            Copiar a mis fichas
          </button>
        ) : (
          <>
            <Link to={`/fichas/${entry.id}/editar`} className="btn btn--primary btn--small">
              <Pencil size={18} aria-hidden="true" />
              Editar
            </Link>
            <button
              type="button"
              className={`btn btn--secondary btn--small${entry.isFavorite ? ' is-favorite' : ''}`}
              aria-pressed={entry.isFavorite}
              onClick={() => run(() => toggleFavorite(entry.id))}
            >
              <Heart size={18} aria-hidden="true" fill={entry.isFavorite ? 'currentColor' : 'none'} />
              {entry.isFavorite ? 'En favoritos' : 'Guardar en favoritos'}
            </button>
          </>
        )}
        <Link to={`/crear/nota?ficha=${entry.id}`} className="btn btn--secondary btn--small">
          <NotebookPen size={18} aria-hidden="true" />
          Añadir nota
        </Link>
        <button
          type="button"
          className="btn btn--secondary btn--small"
          disabled
          title="Disponible en la Etapa 3"
        >
          <CalendarPlus size={18} aria-hidden="true" />
          Vincular al calendario
        </button>
      </div>
      {isSeed && (
        <p className="muted small">
          Las fichas de ejemplo no se editan en origen: cópiala a «Mis fichas» para completarla con tus
          fuentes.
        </p>
      )}

      <div className="tabs" role="tablist" aria-label="Secciones de la ficha">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            id={`${baseId}-${s.id}`}
            aria-selected={section === s.id}
            aria-controls={`${baseId}-panel`}
            tabIndex={section === s.id ? 0 : -1}
            className={`tabs__tab${section === s.id ? ' is-active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-${section}`}>
        {section === 'conocimiento' && (
          <>
            {entry.description && <p className="lead">{entry.description}</p>}
            <dl className="field-list">
              {fields.map(({ field, value }) => (
                <div key={field.key} className={`field-list__item${field.caution ? ' is-caution' : ''}`}>
                  <dt>
                    {field.caution && <AlertTriangle size={16} aria-hidden="true" />}
                    {field.label}
                  </dt>
                  <dd>
                    {Array.isArray(value) ? (
                      <ul>
                        {value.map((v) => (
                          <li key={String(v)}>{String(v)}</li>
                        ))}
                      </ul>
                    ) : field.kind === 'color' ? (
                      <span className="swatch-row">
                        <span className="swatch" style={{ background: String(value) }} aria-hidden="true" />
                        {String(value)}
                      </span>
                    ) : (
                      String(value)
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <IllustrationPreview media={entry.media} />

            {entry.sources && entry.sources.length > 0 && (
              <>
                <h2 className="section-title">Fuentes</h2>
                <ul className="sources">
                  {entry.sources.map((s) => (
                    <li key={s.title}>{s.url ? <a href={s.url}>{s.title}</a> : s.title}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {section === 'anotaciones' && typeof entry.extraFields.personalNotes === 'string' && (
          <div className="personal-notes">
            <h2 className="section-title">Notas personales</h2>
            <p className="personal-notes__text">{entry.extraFields.personalNotes}</p>
          </div>
        )}
        {section === 'anotaciones' && (
          <>
            <h2 className="section-title">Memorias vinculadas</h2>
            {notes.status === 'success' && notes.data.length > 0 ? (
              <ul className="journal-list">
                {notes.data.map((r) => (
                  <li key={r.id}>
                    <JournalCard record={r} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title={UI.empty.notes.title}
                description="Las notas que escribas aquí vivirán en esta ficha y también en tu Bitácora, sin duplicarse."
                action={
                  <Link to={`/crear/nota?ficha=${entry.id}`} className="btn btn--primary">
                    {UI.empty.notes.action}
                  </Link>
                }
              />
            )}
          </>
        )}

        {section === 'relaciones' &&
          (related.status === 'success' && related.data.length > 0 ? (
            <ul className="entry-list">
              {related.data.map((e) => (
                <li key={e.id}>
                  <EntryCard entry={e} showChapter />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Esta página todavía no tiene relaciones" />
          ))}
      </div>

      {!isSeed && (
        <div className="danger-zone">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => run(() => setArchived(entry.id, entry.status !== 'archived'))}
          >
            {entry.status === 'archived' ? (
              <ArchiveRestore size={18} aria-hidden="true" />
            ) : (
              <Archive size={18} aria-hidden="true" />
            )}
            {entry.status === 'archived' ? 'Sacar del archivo' : 'Archivar'}
          </button>
          <button type="button" className="btn btn--danger btn--small" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={18} aria-hidden="true" />
            Eliminar
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`¿Eliminar «${entry.title}»?`}
        message="Se borrarán esta ficha y sus fotos de este dispositivo. No se puede deshacer."
        confirmLabel="Eliminar definitivamente"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setConfirmDelete(false);
          try {
            await deleteEntry(entry.id);
            navigate(`/capitulos/${chapter.id}`, { replace: true });
          } catch (err) {
            setActionError(err instanceof Error ? err.message : 'No se pudo eliminar.');
          }
        }}
      />
    </Page>
  );
}
