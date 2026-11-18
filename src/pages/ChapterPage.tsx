import { Plus, Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChapterHeader } from '../components/chapter/ChapterHeader';
import { EntryCard } from '../components/chapter/EntryCard';
import { EmptyState } from '../components/common/EmptyState';
import { Page } from '../components/common/Page';
import { getChapter } from '../config/chapters';
import { getFamily } from '../config/families';
import { UI } from '../config/uiCopy';
import { listPersonalEntries, listSeedEntries } from '../data/repositories/entries';
import { JournalCard } from '../components/journal/JournalCard';
import { listRecordsForEntries } from '../data/repositories/journal';
import { useAsync } from '../hooks/useAsync';
import type { GrimorioEntry } from '../types/domain';
import { NotFoundPage } from './NotFoundPage';
import { matches } from '../utils/search';

type Tab = 'explorar' | 'fichas' | 'notas';
type Filter = 'todos' | 'favoritos' | 'recientes';

const TABS: { id: Tab; label: string }[] = [
  { id: 'explorar', label: 'Explorar' },
  { id: 'fichas', label: 'Mis fichas' },
  { id: 'notas', label: 'Mis notas' },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'favoritos', label: 'Favoritos' },
  { id: 'recientes', label: 'Recientes' },
];

/** Capítulo `/capitulos/:chapterId` (secciones 5 y 7.4). */
export function ChapterPage() {
  const { chapterId } = useParams();
  const chapter = getChapter(chapterId);
  const [tab, setTab] = useState<Tab>('explorar');
  const [filter, setFilter] = useState<Filter>('todos');
  const [query, setQuery] = useState('');
  const baseId = useId();

  const personal = useAsync(
    () => (chapter ? listPersonalEntries(chapter.id) : Promise.resolve([])),
    [chapter?.id],
  );

  const chapterNotes = useAsync(async () => {
    if (!chapter) return [];
    const ids = [...listSeedEntries(chapter.id), ...(await listPersonalEntries(chapter.id))].map((e) => e.id);
    return listRecordsForEntries(ids);
  }, [chapter?.id]);

  const seed = useMemo(() => (chapter ? listSeedEntries(chapter.id) : []), [chapter]);

  if (!chapter) return <NotFoundPage />;

  const family = getFamily(chapter.familyId);
  const createHref = `/crear/ficha?capitulo=${chapter.id}`;

  const applyFilters = (entries: GrimorioEntry[]) => {
    let list = entries.filter((e) => matches(query, [e.title, e.description, ...e.tags]));
    if (filter === 'favoritos') list = list.filter((e) => e.isFavorite);
    if (filter === 'recientes') list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return list;
  };

  const subtopics = chapter.subtopics.filter((s) => matches(query, [s.title, s.description]));
  const personalEntries = personal.status === 'success' ? personal.data : [];
  const explorarEntries = applyFilters([...seed, ...personalEntries]);

  return (
    <Page>
      <ChapterHeader chapter={chapter} eyebrow={family.title} />

      {chapter.contentNote && <p className="content-note">{chapter.contentNote}</p>}

      <div className="chapter-actions">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Buscar en este capítulo</span>
          <input
            type="search"
            placeholder="Buscar en este capítulo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <Link to={createHref} className="btn btn--primary">
          <Plus size={18} aria-hidden="true" />
          Crear ficha
        </Link>
      </div>

      <div className="tabs" role="tablist" aria-label="Secciones del capítulo">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${t.id}`}
            aria-controls={`${baseId}-panel-${t.id}`}
            aria-selected={tab === t.id}
            tabIndex={tab === t.id ? 0 : -1}
            className={`tabs__tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${baseId}-panel-${tab}`} aria-labelledby={`${baseId}-tab-${tab}`}>
        {tab === 'explorar' && (
          <>
            <h2 className="section-title">Subtemas</h2>
            {subtopics.length > 0 ? (
              <ul className="subtopic-list">
                {subtopics.map((s) => (
                  <li key={s.id}>
                    <Link to={`/capitulos/${chapter.id}/subtemas/${s.id}`} className="subtopic-chip">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Ningún subtema coincide con la búsqueda.</p>
            )}

            <h2 className="section-title">Páginas del capítulo</h2>
            <div className="chips" role="group" aria-label="Filtrar páginas">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`chip${filter === f.id ? ' is-active' : ''}`}
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {personal.status === 'loading' ? (
              <p className="muted" role="status">
                Abriendo las páginas…
              </p>
            ) : explorarEntries.length > 0 ? (
              <ul className="entry-list">
                {explorarEntries.map((e) => (
                  <li key={e.id}>
                    <EntryCard entry={e} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title={query || filter !== 'todos' ? UI.empty.search.title : UI.empty.family.title}
                action={
                  query || filter !== 'todos' ? (
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => {
                        setQuery('');
                        setFilter('todos');
                      }}
                    >
                      {UI.empty.search.action}
                    </button>
                  ) : (
                    <Link to={createHref} className="btn btn--primary">
                      {UI.empty.family.action}
                    </Link>
                  )
                }
              />
            )}
          </>
        )}

        {tab === 'fichas' &&
          (personalEntries.length > 0 ? (
            <ul className="entry-list">
              {applyFilters(personalEntries).map((e) => (
                <li key={e.id}>
                  <EntryCard entry={e} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title={UI.empty.family.title}
              action={
                <Link to={createHref} className="btn btn--primary">
                  {UI.empty.family.action}
                </Link>
              }
            />
          ))}

        {tab === 'notas' &&
          (chapterNotes.status === 'success' && chapterNotes.data.length > 0 ? (
            <ul className="journal-list">
              {chapterNotes.data.map((r) => (
                <li key={r.id}>
                  <JournalCard record={r} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title={UI.empty.notes.title}
              description="Las notas que escribas en las fichas de este capítulo también aparecerán en tu Bitácora, sin duplicarse."
              action={
                <Link to="/crear/nota" className="btn btn--primary">
                  {UI.empty.notes.action}
                </Link>
              }
            />
          ))}
      </div>

      <div className="page-footer-actions">
        <Link to={`/inicio?familia=${family.id}`} className="btn btn--ghost">
          Volver al índice
        </Link>
      </div>
    </Page>
  );
}
