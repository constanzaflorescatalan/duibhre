import { useRef, type KeyboardEvent } from 'react';
import { FAMILIES } from '../../config/families';
import type { FamilyId } from '../../types/domain';
import { FamilyGlyph } from '../ornaments/FamilyGlyph';
import { Triquetra } from '../ornaments/Ornaments';

/**
 * Rueda ilustrada de seis sectores sobre pergamino (sección 3.1).
 * Cada sector es un botón accesible con `aria-pressed`; flechas izquierda/derecha
 * recorren la rueda. Tocar un sector solo selecciona: no navega.
 */
interface Props {
  selected: FamilyId;
  onSelect: (id: FamilyId) => void;
}

const SIZE = 400;
const C = SIZE / 2;
const R_OUTER = 192;
const R_INNER = 50;
const R_GLYPH = 98;
const R_LABEL = 150;
const SWEEP = 360 / FAMILIES.length;

function polar(r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

function sectorPath(start: number, end: number) {
  const o1 = polar(R_OUTER, start);
  const o2 = polar(R_OUTER, end);
  const i1 = polar(R_INNER, end);
  const i2 = polar(R_INNER, start);
  return [
    `M${o1.x} ${o1.y}`,
    `A${R_OUTER} ${R_OUTER} 0 0 1 ${o2.x} ${o2.y}`,
    `L${i1.x} ${i1.y}`,
    `A${R_INNER} ${R_INNER} 0 0 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export function FamilyWheel({ selected, onSelect }: Props) {
  const refs = useRef<(SVGGElement | null)[]>([]);

  const handleKey = (event: KeyboardEvent<SVGGElement>, index: number) => {
    const n = FAMILIES.length;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % n;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + n) % n;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = n - 1;
    if (next !== null) {
      event.preventDefault();
      refs.current[next]?.focus();
      onSelect(FAMILIES[next].id);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(FAMILIES[index].id);
    }
  };

  return (
    <div className="wheel">
      <svg
        className="wheel__svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="group"
        aria-label="Rueda de las seis familias del grimorio"
      >
        <defs>
          <radialGradient id="wheelPaper" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#f7f2e6" />
            <stop offset="75%" stopColor="#ebe2cf" />
            <stop offset="100%" stopColor="#d9cdb4" />
          </radialGradient>
          <radialGradient id="wheelSelected" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#f3f5e8" />
            <stop offset="100%" stopColor="#dfe6d2" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Aro exterior de oro antiguo */}
        <circle cx={C} cy={C} r={R_OUTER + 5} fill="none" stroke="#a88a57" strokeWidth="1.5" />
        <circle cx={C} cy={C} r={R_OUTER + 2} fill="#12261d" />

        {FAMILIES.map((family, i) => {
          const start = i * SWEEP - SWEEP / 2;
          const end = start + SWEEP;
          const mid = start + SWEEP / 2;
          const glyph = polar(R_GLYPH, mid);
          const label = polar(R_LABEL, mid);
          const isSelected = family.id === selected;
          return (
            <g
              key={family.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`wheel__sector${isSelected ? ' is-selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${family.title}: ${family.subtitle}`}
              onClick={() => onSelect(family.id)}
              onKeyDown={(e) => handleKey(e, i)}
            >
              <path
                className="wheel__shape"
                d={sectorPath(start, end)}
                fill={isSelected ? 'url(#wheelSelected)' : 'url(#wheelPaper)'}
              />
              <g transform={`translate(${glyph.x - 29} ${glyph.y - 29})`}>
                <FamilyGlyph familyId={family.id} size={58} />
              </g>
              <text
                className="wheel__label"
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {family.title}
              </text>
            </g>
          );
        })}

        {/* Líneas separadoras de oro antiguo */}
        {FAMILIES.map((family, i) => {
          const angle = i * SWEEP - SWEEP / 2;
          const a = polar(R_INNER, angle);
          const b = polar(R_OUTER, angle);
          return (
            <line
              key={`sep-${family.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#a88a57"
              strokeWidth="1.6"
              pointerEvents="none"
            />
          );
        })}

        {/* Contorno luminoso del sector seleccionado (verde suave + reflejo dorado) */}
        {FAMILIES.map((family, i) =>
          family.id === selected ? (
            <path
              key={`hl-${family.id}`}
              d={sectorPath(i * SWEEP - SWEEP / 2, i * SWEEP + SWEEP / 2)}
              className="wheel__highlight"
              filter="url(#softGlow)"
              pointerEvents="none"
            />
          ) : null,
        )}

        {/* Medallón central con triquetra */}
        <circle
          cx={C}
          cy={C}
          r={R_INNER}
          fill="#12261d"
          stroke="#a88a57"
          strokeWidth="2"
          pointerEvents="none"
        />
        <g transform={`translate(${C - 36} ${C - 38})`} color="#c9ab72" pointerEvents="none">
          <Triquetra size={72} />
        </g>
      </svg>
    </div>
  );
}
