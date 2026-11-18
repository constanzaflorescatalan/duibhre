import { useRef, type KeyboardEvent } from 'react';
import { FAMILIES } from '../../config/families';
import { FAMILY_ART } from '../../config/illustrations';
import type { FamilyId } from '../../types/domain';
import { Triquetra } from '../ornaments/Ornaments';

/**
 * Rueda ilustrada de seis sectores (sección 3.1), con el estilo de la imagen
 * elegida: pergamino pintado, separadores y aro de oro antiguo, sector activo
 * con luz verde suave y medallón central con triquetra.
 * Cada sector es un botón accesible con `aria-pressed`; las flechas recorren
 * la rueda. Tocar un sector solo selecciona: no navega.
 */
interface Props {
  selected: FamilyId;
  onSelect: (id: FamilyId) => void;
}

const SIZE = 400;
const C = SIZE / 2;
const R_OUTER = 190;
const R_INNER = 48;
/** Distancia del centro del bloque ilustración+nombre por sector (arriba hay más espacio). */
const R_CENTROID = [130, 118, 118, 122, 118, 118];
const IMG_W = 72;
const IMG_H = 72;
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

/** Estrella de cuatro puntas centrada en (x, y). */
function star(x: number, y: number, r: number) {
  const k = r * 0.28;
  return `M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z`;
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
        viewBox={`-6 -6 ${SIZE + 12} ${SIZE + 12}`}
        role="group"
        aria-label="Rueda de las seis familias del grimorio"
      >
        <defs>
          <radialGradient id="wheelPaper" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#efe5cf" />
            <stop offset="70%" stopColor="#e6d9bb" />
            <stop offset="100%" stopColor="#cdb98f" />
          </radialGradient>
          <radialGradient id="wheelSelected" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#2f5a2a" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#c9df9e" />
            <stop offset="100%" stopColor="#7fae58" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Aro exterior de oro antiguo */}
        <circle
          cx={C}
          cy={C}
          r={R_OUTER + 5}
          fill="rgba(92, 62, 28, 0.14)"
          stroke="#a88a57"
          strokeWidth="2.2"
        />
        <circle cx={C} cy={C} r={R_OUTER + 1.5} fill="none" stroke="#7d6538" strokeWidth="1" />

        {FAMILIES.map((family, i) => {
          const start = i * SWEEP - SWEEP / 2;
          const end = start + SWEEP;
          const c = polar(R_CENTROID[i] ?? 118, start + SWEEP / 2);
          const isSelected = family.id === selected;
          const art = FAMILY_ART[family.id];
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
              <path className="wheel__shape" d={sectorPath(start, end)} fill="url(#wheelPaper)" />
              {isSelected && (
                <path
                  d={sectorPath(start, end)}
                  fill="url(#wheelSelected)"
                  opacity="0.85"
                  pointerEvents="none"
                />
              )}
              <image
                className="wheel__art"
                href={art.src}
                x={c.x - IMG_W / 2}
                y={c.y - 62}
                width={IMG_W}
                height={IMG_H}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              />
              <text className="wheel__label" x={c.x} y={c.y + 25} textAnchor="middle">
                {family.title}
              </text>
              <text className="wheel__keywords" x={c.x} y={c.y + 42} textAnchor="middle">
                {family.sectorKeywords.map((line, n) => (
                  <tspan key={n} x={c.x} dy={n === 0 ? 0 : 12}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* Separadores dorados y estrellas en el aro */}
        {FAMILIES.map((family, i) => {
          const angle = i * SWEEP - SWEEP / 2;
          const a = polar(R_INNER, angle);
          const b = polar(R_OUTER, angle);
          const s = polar(R_OUTER + 3, angle);
          return (
            <g key={`sep-${family.id}`} pointerEvents="none">
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#b8975c" strokeWidth="2" />
              <path d={star(s.x, s.y, 9)} fill="#d8bd84" stroke="#7d6538" strokeWidth="0.6" />
            </g>
          );
        })}

        {/* Contorno luminoso del sector seleccionado */}
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
        <g pointerEvents="none">
          <circle cx={C} cy={C} r={R_INNER} fill="#12261d" stroke="#c9ab72" strokeWidth="2.4" />
          <circle
            cx={C}
            cy={C}
            r={R_INNER - 7}
            fill="none"
            stroke="#a88a57"
            strokeWidth="1"
            strokeDasharray="1 3.2"
          />
          <g transform={`translate(${C - 33} ${C - 35})`} color="#d4b77c">
            <Triquetra size={66} withCircle={false} />
          </g>
        </g>
      </svg>
    </div>
  );
}
