import { AlertTriangle, CalendarPlus, Copy, Heart, NotebookPen, Pencil } from 'lucide-react';
import { useId, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EntryCard } from '../components/chapter/EntryCard';
import { EmptyState } from '../components/common/EmptyState';
import { Page } from '../components/common/Page';
import { StageNotice } from '../components/common/StageNotice';
import { IllustrationPreview } from '../components/media/IllustrationPreview';
import { ChapterGlyph } from '../components/ornaments/ChapterGlyph';
import { Filigree } from '../components/ornaments/Ornaments';
import { getChapter, getSubtopic } from '../config/chapters';
import { ENTRY_TEMPLATES } from '../config/entryTemplates';
import { UI } from '../config/uiCopy';
import { getEntry } from '../data/repositories/entries';
import { useAsync } from '../hooks/useAsync';
import { formatDate } from '../utils/dates';
import { NotFoundPage } from './NotFoundPage';

type Section = 'conocimiento' | 'anotaciones' | 'relaciones';

/** Detalle de ficha `/fichas/:entryId` (sección 7.6). */
export function EntryPage() {
  const { entryId = '' } = useParams();
  const result = useAsync(() => getEntry(entryId), [entryId]);
  const related = useAsync(async () => {
    const entry = await getEntry(entryId);
    const list = await Promise.all((entry?.relatedEntryIds ?? []).map((id) => getEntry(id)));
    return list.filter((e) => e !== undefined);
  }, [entryId]);
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
          <span className="tag">Plantilla: {template.name}</span>
          <span>Actualizada el {formatDate(entry.updatedAt)}</span>
        </p>
        <Filigree className="filigree" />
      </header>

      <div className="button-row button-row--wrap">
        {isSeed ? (
          <button type="button" className="btn btn--secondary btn--small" disabled title={UI.stage2}>
            <Copy size={18} aria-hidden="true" />
            Copiar a mis fichas
          </button>
        ) : (
          <Link to={`/fichas/${entry.id}/editar`} className="btn btn--secondary">
            <Pencil size={18} aria-hidden="true" />
            Editar
          </Link>
        )}
        <button type="button" className="btn btn--secondary btn--small" disabled title={UI.stage2}>
          <Heart size={18} aria-hidden="true" />
          Favorito
        </button>
        <button type="button" className="btn btn--secondary btn--small" disabled title={UI.stage2}>
          <NotebookPen size={18} aria-hidden="true" />
          Añadir nota
        </button>
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
      <p className="muted small">
        Copiar, favoritos y notas llegan en la Etapa 2; los vínculos con la agenda, en la Etapa 3.
      </p>

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

        {section === 'anotaciones' && (
          <EmptyState
            title={UI.empty.notes.title}
            description="Las notas que escribas aquí vivirán en esta ficha y también en tu Bitácora, sin duplicarse."
          />
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

      {isSeed && (
        <StageNotice stage={2}>
          Las fichas de ejemplo no se editan en origen: en la Etapa 2 podrás copiarlas a «Mis fichas» y
          completarlas con tus fuentes.
        </StageNotice>
      )}
    </Page>
  );
}
