import type { Chapter } from '../../types/domain';
import { Filigree } from '../ornaments/Ornaments';
import { ChapterArt } from '../ornaments/PaintedArt';

/** Cabecera ilustrada del capítulo: lámina pintada, numeral romano, título y subtítulo. */
export function ChapterHeader({ chapter, eyebrow }: { chapter: Chapter; eyebrow?: string }) {
  return (
    <header className="chapter-header">
      <div className="chapter-header__plate" aria-hidden="true">
        <ChapterArt chapterId={chapter.id} />
        <span className="chapter-header__numeral">{chapter.romanNumeral}</span>
      </div>
      {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
      <h1 className="page-header__title">
        <span className="visually-hidden">Capítulo {chapter.romanNumeral}: </span>
        {chapter.title}
      </h1>
      <p className="page-header__subtitle">«{chapter.subtitle}»</p>
      <Filigree className="filigree" />
    </header>
  );
}
