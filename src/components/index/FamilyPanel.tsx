import { ChevronRight, ChevronUp, Feather } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getChaptersByFamily } from '../../config/chapters';
import type { Family } from '../../types/domain';
import { ChapterGlyph } from '../ornaments/ChapterGlyph';
import { FamilyGlyph } from '../ornaments/FamilyGlyph';
import { Filigree } from '../ornaments/Ornaments';

/**
 * Panel de pergamino desplegado bajo la rueda (sección 3.2). Nunca la tapa.
 */
interface Props {
  family: Family;
  onCollapse: () => void;
}

export function FamilyPanel({ family, onCollapse }: Props) {
  const chapters = getChaptersByFamily(family.id);

  return (
    <section
      key={family.id}
      id="panel-familia"
      className="family-panel"
      aria-labelledby="panel-familia-titulo"
      aria-live="polite"
    >
      <button type="button" className="family-panel__collapse" onClick={onCollapse}>
        <ChevronUp size={18} aria-hidden="true" />
        Contraer
      </button>

      <div className="family-panel__head">
        <FamilyGlyph familyId={family.id} size={64} className="family-panel__glyph" />
        <h2 id="panel-familia-titulo" className="family-panel__title">
          {family.title}
        </h2>
        <p className="family-panel__subtitle">{family.subtitle}</p>
        <Filigree className="filigree" />
        <p className="family-panel__description">«{family.description}»</p>
      </div>

      <ul className="chapter-cards">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <Link
              to={`/capitulos/${chapter.id}`}
              className="chapter-card"
              aria-label={`Abrir capítulo ${chapter.romanNumeral}: ${chapter.title}`}
            >
              <span className="chapter-card__numeral" aria-hidden="true">
                {chapter.romanNumeral}
              </span>
              <span className="chapter-card__glyph">
                <ChapterGlyph chapterId={chapter.id} />
              </span>
              <span className="chapter-card__text">
                <span className="chapter-card__title">{chapter.title}</span>
                <span className="chapter-card__subtitle">{chapter.cardSubtitle}</span>
                <span className="chapter-card__cta">Abrir capítulo</span>
              </span>
              <ChevronRight className="chapter-card__arrow" size={20} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      {family.secondaryAction && (
        <Link to={family.secondaryAction.to} className="btn btn--primary btn--block">
          <Feather size={18} aria-hidden="true" />
          {family.secondaryAction.label}
        </Link>
      )}
    </section>
  );
}
