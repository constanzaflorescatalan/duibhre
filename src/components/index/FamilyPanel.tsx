import { ChevronRight, ChevronUp, Feather } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getChaptersByFamily } from '../../config/chapters';
import { CHAPTER_ART, FAMILY_ART, FAMILY_PANEL_ART } from '../../config/illustrations';
import type { Family } from '../../types/domain';
import { ChapterGlyph } from '../ornaments/ChapterGlyph';

/**
 * Panel de pergamino desplegado bajo la rueda (sección 3.2), con lámina
 * botánica a la izquierda como en la imagen elegida. Nunca tapa la rueda.
 */
interface Props {
  family: Family;
  onCollapse: () => void;
}

function Sprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className="family-panel__sprig"
      viewBox="0 0 48 16"
      aria-hidden="true"
      focusable="false"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M2 8h44" stroke="#5f7a52" strokeWidth="1.2" fill="none" />
      {[10, 20, 30, 40].map((x) => (
        <g key={x} fill="#768b72">
          <path d={`M${x} 8c-2-5 2-7 5-7-1 3-2 6-5 7z`} />
          <path d={`M${x} 8c-2 5 2 7 5 7-1-3-2-6-5-7z`} />
        </g>
      ))}
    </svg>
  );
}

export function FamilyPanel({ family, onCollapse }: Props) {
  const chapters = getChaptersByFamily(family.id);
  const panelArt = FAMILY_PANEL_ART[family.id];
  const art = panelArt ?? FAMILY_ART[family.id];

  return (
    <section
      key={family.id}
      id="panel-familia"
      className="family-panel"
      aria-labelledby="panel-familia-titulo"
      aria-live="polite"
    >
      <button
        type="button"
        className="family-panel__collapse"
        onClick={onCollapse}
        aria-label="Contraer panel"
      >
        <ChevronUp size={22} aria-hidden="true" />
      </button>

      <header className="family-panel__head">
        <Sprig />
        <h2 id="panel-familia-titulo" className="family-panel__title">
          {family.title}
        </h2>
        <Sprig flip />
      </header>
      <p className="family-panel__subtitle">{family.subtitle}</p>

      <p className="family-panel__description">«{family.description}»</p>

      <div className={`family-panel__body${panelArt ? ' has-plate' : ''}`}>
        <div className={`family-panel__art${panelArt ? ' is-plate' : ''}`} aria-hidden="true">
          <img src={art.src} alt="" />
        </div>

        <div className="family-panel__content">
          <ul className="chapter-cards">
            {chapters.map((chapter) => {
              const chapterArt = CHAPTER_ART[chapter.id];
              return (
                <li key={chapter.id}>
                  <Link
                    to={`/capitulos/${chapter.id}`}
                    className="chapter-card"
                    aria-label={`Abrir capítulo ${chapter.romanNumeral}: ${chapter.title}`}
                  >
                    <span className="chapter-card__glyph" aria-hidden="true">
                      {chapterArt ? (
                        <img src={chapterArt.src} alt="" />
                      ) : (
                        <ChapterGlyph chapterId={chapter.id} />
                      )}
                    </span>
                    <span className="chapter-card__text">
                      <span className="chapter-card__title">
                        <span className="chapter-card__numeral">{chapter.romanNumeral} · </span>
                        {chapter.title}
                      </span>
                      <span className="chapter-card__subtitle">{chapter.cardSubtitle}</span>
                      <span className="chapter-card__cta">Abrir capítulo</span>
                    </span>
                    <ChevronRight className="chapter-card__arrow" size={22} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>

          {family.secondaryAction && (
            <Link to={family.secondaryAction.to} className="btn btn--primary btn--block">
              <Feather size={18} aria-hidden="true" />
              {family.secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
