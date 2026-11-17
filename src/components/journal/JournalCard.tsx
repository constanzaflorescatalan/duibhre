import { ChevronRight, Heart, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { noteKindLabel } from '../../config/noteKinds';
import type { JournalRecord } from '../../types/domain';
import { formatDateTime } from '../../utils/dates';

/** Memoria como pequeña hoja manuscrita (sección 7.10). */
export function JournalCard({ record }: { record: JournalRecord }) {
  return (
    <Link to={`/bitacora/${record.id}`} className="journal-leaf">
      <span className="journal-leaf__meta">
        <span className="tag">{noteKindLabel(record.kind)}</span>
        <span>{formatDateTime(record.date)}</span>
        {record.isFavorite && <Heart size={14} aria-label="Favorita" fill="currentColor" />}
      </span>
      <span className="journal-leaf__title">{record.title}</span>
      {record.body && <span className="journal-leaf__excerpt">{record.body}</span>}
      {record.linkedEntryIds.length > 0 && (
        <span className="journal-leaf__links">
          <Link2 size={14} aria-hidden="true" />
          {record.linkedEntryIds.length === 1
            ? '1 ficha vinculada'
            : `${record.linkedEntryIds.length} fichas vinculadas`}
        </span>
      )}
      <ChevronRight className="journal-leaf__arrow" size={18} aria-hidden="true" />
    </Link>
  );
}
