import { Feather } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { Page, PageHeader } from '../components/common/Page';
import { UI } from '../config/uiCopy';
import { listJournalRecords } from '../data/repositories/journal';
import { useAsync } from '../hooks/useAsync';
import type { NoteKind } from '../types/domain';
import { JournalCard } from '../components/journal/JournalCard';

type JournalFilter = 'todos' | 'favoritos' | NoteKind;

const FILTERS: { id: JournalFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'sueno', label: 'Sueños' },
  { id: 'ritual', label: 'Rituales' },
  { id: 'meditacion', label: 'Meditaciones' },
  { id: 'tirada', label: 'Tiradas' },
  { id: 'otro', label: 'Notas' },
  { id: 'favoritos', label: 'Favoritos' },
];

/**
 * Bitácora `/bitacora` (sección 7.10): lee los registros reales de IndexedDB,
 * incluidos los creados desde cualquier capítulo, sin duplicarlos.
 */
export function JournalPage() {
  const [filter, setFilter] = useState<JournalFilter>('todos');
  const records = useAsync(listJournalRecords, []);
  const all = records.status === 'success' ? records.data : [];
  const visible = all.filter((r) => {
    if (filter === 'todos') return true;
    if (filter === 'favoritos') return Boolean(r.isFavorite);
    if (filter === 'otro') return r.kind === 'otro' || r.kind === 'recuerdo' || r.kind === 'observacion';
    return r.kind === filter;
  });

  return (
    <Page>
      <PageHeader title={UI.pages.journal.title} subtitle={UI.pages.journal.subtitle} />

      <div className="button-row">
        <Link to="/crear/nota" className="btn btn--primary btn--small">
          <Feather size={16} aria-hidden="true" />
          Nueva entrada
        </Link>
        <Link to="/buscar" className="btn btn--secondary btn--small">
          Buscar memorias
        </Link>
      </div>

      <div className="chips" role="group" aria-label="Filtrar memorias">
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

      {records.status === 'loading' ? (
        <p className="muted" role="status">
          Abriendo la bitácora…
        </p>
      ) : visible.length > 0 ? (
        <ul className="journal-list">
          {visible.map((r) => (
            <li key={r.id}>
              <JournalCard record={r} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={all.length > 0 ? 'No hay memorias con este filtro' : UI.empty.notes.title}
          action={
            <Link to="/crear/nota" className="btn btn--primary">
              {UI.empty.notes.action}
            </Link>
          }
        />
      )}
    </Page>
  );
}
