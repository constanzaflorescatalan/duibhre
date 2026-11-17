import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EntryCard } from '../components/chapter/EntryCard';
import { EmptyState } from '../components/common/EmptyState';
import { Page, PageHeader } from '../components/common/Page';
import { CHAPTERS } from '../config/chapters';
import { FAMILIES, isFamilyId } from '../config/families';
import { UI } from '../config/uiCopy';
import { listPersonalEntries, listSeedEntries } from '../data/repositories/entries';
import { JournalCard } from '../components/journal/JournalCard';
import { listJournalRecords } from '../data/repositories/journal';
import { useAsync } from '../hooks/useAsync';
import { matches } from '../utils/search';

/**
 * Búsqueda global `/buscar` (sección 7.12): capítulos, subtemas y fichas
 * (de ejemplo y personales). Filtro por familia; la consulta vive en `?q=`.
 */
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const familyParam = params.get('familia');
  const family = isFamilyId(familyParam) ? familyParam : '';
  const personal = useAsync(() => listPersonalEntries(), []);
  const records = useAsync(listJournalRecords, []);

  const sync = (q: string, f: string) => {
    const next: Record<string, string> = {};
    if (q) next.q = q;
    if (f) next.familia = f;
    setParams(next, { replace: true });
  };

  const chapters = CHAPTERS.filter((c) => !family || c.familyId === family);
  const chapterIds = new Set(chapters.map((c) => c.id));
  const hasQuery = query.trim().length > 0;

  const chapterHits = hasQuery
    ? chapters.filter((c) => matches(query, [c.title, c.subtitle, c.cardSubtitle]))
    : [];
  const subtopicHits = hasQuery
    ? chapters.flatMap((c) =>
        c.subtopics
          .filter((s) => matches(query, [s.title, s.description]))
          .map((s) => ({ chapter: c, subtopic: s })),
      )
    : [];
  const entries = [...listSeedEntries(), ...(personal.status === 'success' ? personal.data : [])];
  const entryHits = hasQuery
    ? entries.filter(
        (e) =>
          chapterIds.has(e.chapterId) &&
          matches(query, [e.title, e.description, ...e.tags, ...Object.values(e.extraFields).map(String)]),
      )
    : [];
  const recordHits =
    hasQuery && !family && records.status === 'success'
      ? records.data.filter((r) => matches(query, [r.title, r.body, r.mood, ...r.tags]))
      : [];
  const total = chapterHits.length + subtopicHits.length + entryHits.length + recordHits.length;

  return (
    <Page>
      <PageHeader title={UI.pages.search.title} />

      <form className="search-form" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="search-field search-field--large">
          <Search size={20} aria-hidden="true" />
          <span className="visually-hidden">Buscar</span>
          <input
            type="search"
            autoFocus
            placeholder="Título, etiqueta, subtema o texto…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              sync(e.target.value, family);
            }}
          />
        </label>
        <label className="select-field">
          <span className="visually-hidden">Familia</span>
          <select value={family} onChange={(e) => sync(query, e.target.value)}>
            <option value="">Todas las familias</option>
            {FAMILIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </label>
      </form>

      {!hasQuery ? (
        <p className="muted">Escribe para buscar en los 13 capítulos, sus subtemas y tus páginas.</p>
      ) : total === 0 ? (
        <EmptyState
          title={UI.empty.search.title}
          action={
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setQuery('');
                sync('', '');
              }}
            >
              {UI.empty.search.action}
            </button>
          }
        />
      ) : (
        <div aria-live="polite">
          <p className="muted small">
            {total} {total === 1 ? 'resultado' : 'resultados'}
          </p>
          {chapterHits.length > 0 && (
            <>
              <h2 className="section-title">Capítulos</h2>
              <ul className="result-list">
                {chapterHits.map((c) => (
                  <li key={c.id}>
                    <Link to={`/capitulos/${c.id}`} className="result-link">
                      <span className="index-list__numeral">{c.romanNumeral}</span>
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {subtopicHits.length > 0 && (
            <>
              <h2 className="section-title">Subtemas</h2>
              <ul className="result-list">
                {subtopicHits.map(({ chapter, subtopic }) => (
                  <li key={`${chapter.id}-${subtopic.id}`}>
                    <Link to={`/capitulos/${chapter.id}/subtemas/${subtopic.id}`} className="result-link">
                      {subtopic.title}
                      <span className="tag">
                        {chapter.romanNumeral} · {chapter.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {recordHits.length > 0 && (
            <>
              <h2 className="section-title">Memorias</h2>
              <ul className="journal-list">
                {recordHits.map((r) => (
                  <li key={r.id}>
                    <JournalCard record={r} />
                  </li>
                ))}
              </ul>
            </>
          )}
          {entryHits.length > 0 && (
            <>
              <h2 className="section-title">Fichas</h2>
              <ul className="entry-list">
                {entryHits.map((e) => (
                  <li key={e.id}>
                    <EntryCard entry={e} showChapter />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </Page>
  );
}
