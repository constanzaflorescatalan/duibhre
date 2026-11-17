import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChapterHeader } from '../components/chapter/ChapterHeader';
import { EntryCard } from '../components/chapter/EntryCard';
import { EmptyState } from '../components/common/EmptyState';
import { Page } from '../components/common/Page';
import { getChapter, getSubtopic } from '../config/chapters';
import { UI } from '../config/uiCopy';
import { listPersonalEntries, listSeedEntries } from '../data/repositories/entries';
import { useAsync } from '../hooks/useAsync';
import { matches } from '../utils/search';
import { NotFoundPage } from './NotFoundPage';

type Order = 'alfabetico' | 'recientes';

/** Subtema `/capitulos/:chapterId/subtemas/:subtopicId` (sección 7.5). */
export function SubtopicPage() {
  const { chapterId, subtopicId } = useParams();
  const chapter = getChapter(chapterId);
  const subtopic = getSubtopic(chapterId, subtopicId);
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order>('alfabetico');

  const personal = useAsync(
    () => (chapter ? listPersonalEntries(chapter.id) : Promise.resolve([])),
    [chapter?.id],
  );

  if (!chapter || !subtopic) return <NotFoundPage />;

  const all = [...listSeedEntries(chapter.id), ...(personal.status === 'success' ? personal.data : [])]
    .filter((e) => e.subtopicId === subtopic.id)
    .filter((e) => matches(query, [e.title, e.description, ...e.tags]))
    .sort((a, b) =>
      order === 'alfabetico'
        ? a.title.localeCompare(b.title, 'es-CL')
        : b.updatedAt.localeCompare(a.updatedAt),
    );

  const createHref = `/crear/ficha?capitulo=${chapter.id}&subtema=${subtopic.id}`;

  return (
    <Page>
      <ChapterHeader chapter={chapter} eyebrow={`${chapter.romanNumeral} · ${chapter.title}`} />
      <h2 className="subtopic-title">{subtopic.title}</h2>
      {subtopic.description && <p className="content-note">{subtopic.description}</p>}

      <div className="chapter-actions">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Filtrar fichas de {subtopic.title}</span>
          <input
            type="search"
            placeholder={`Filtrar en ${subtopic.title}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="select-field">
          <span className="visually-hidden">Ordenar</span>
          <select value={order} onChange={(e) => setOrder(e.target.value as Order)}>
            <option value="alfabetico">Ordenar: A–Z</option>
            <option value="recientes">Ordenar: recientes</option>
          </select>
        </label>
      </div>

      {all.length > 0 ? (
        <ul className="entry-list">
          {all.map((e) => (
            <li key={e.id}>
              <EntryCard entry={e} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={query ? UI.empty.search.title : UI.empty.family.title}
          action={
            query ? (
              <button type="button" className="btn btn--secondary" onClick={() => setQuery('')}>
                {UI.empty.search.action}
              </button>
            ) : (
              <Link to={createHref} className="btn btn--primary">
                <Plus size={18} aria-hidden="true" />
                Agregar conocimiento
              </Link>
            )
          }
        />
      )}

      <div className="page-footer-actions">
        <Link to={`/capitulos/${chapter.id}`} className="btn btn--ghost">
          Volver al capítulo
        </Link>
      </div>
    </Page>
  );
}
