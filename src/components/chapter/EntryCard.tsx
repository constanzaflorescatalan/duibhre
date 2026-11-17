import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getChapter, getSubtopic } from '../../config/chapters';
import { UI } from '../../config/uiCopy';
import type { GrimorioEntry } from '../../types/domain';
import { ChapterGlyph } from '../ornaments/ChapterGlyph';

/** Tarjeta de ficha en listas de capítulo, subtema y búsqueda. */
export function EntryCard({ entry, showChapter = false }: { entry: GrimorioEntry; showChapter?: boolean }) {
  const chapter = getChapter(entry.chapterId);
  const subtopic = getSubtopic(entry.chapterId, entry.subtopicId);
  const hex = typeof entry.extraFields.hex === 'string' ? entry.extraFields.hex : undefined;

  return (
    <Link to={`/fichas/${entry.id}`} className="entry-card">
      <span className="entry-card__thumb" style={hex ? { background: hex } : undefined} aria-hidden="true">
        {!hex && <ChapterGlyph chapterId={entry.chapterId} size={28} />}
      </span>
      <span className="entry-card__body">
        <span className="entry-card__title">{entry.title}</span>
        {entry.description && <span className="entry-card__desc">{entry.description}</span>}
        <span className="entry-card__meta">
          {entry.origin === 'seed' && <span className="tag tag--example">{UI.exampleBadge}</span>}
          {entry.status === 'draft' && <span className="tag tag--draft">Borrador</span>}
          {entry.isFavorite && <span className="tag tag--example">Favorito</span>}
          {showChapter && chapter && (
            <span className="tag">
              {chapter.romanNumeral} · {chapter.title}
            </span>
          )}
          {subtopic && <span className="tag">{subtopic.title}</span>}
        </span>
      </span>
      <ChevronRight size={18} className="entry-card__arrow" aria-hidden="true" />
    </Link>
  );
}
