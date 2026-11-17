import { CHAPTER_ART, FAMILY_ART } from '../../config/illustrations';
import { getChapter } from '../../config/chapters';
import type { ChapterId } from '../../types/domain';
import { ChapterGlyph } from './ChapterGlyph';

/**
 * Ilustración pintada de un capítulo: su mini lámina si existe, si no la de su
 * familia. Decorativa (alt vacío). Con `fallback="glyph"` usa el ícono dorado.
 */
export function ChapterArt({
  chapterId,
  className = '',
  fallback = 'family',
}: {
  chapterId: ChapterId;
  className?: string;
  fallback?: 'family' | 'glyph';
}) {
  const own = CHAPTER_ART[chapterId];
  const chapter = getChapter(chapterId);
  if (!own && fallback === 'glyph') return <ChapterGlyph chapterId={chapterId} />;
  const art = own ?? (chapter ? FAMILY_ART[chapter.familyId] : undefined);
  if (!art) return <ChapterGlyph chapterId={chapterId} />;
  return <img className={`painted-art ${className}`} src={art.src} alt="" />;
}
