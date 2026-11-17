import type { ReactNode } from 'react';
import type { FamilyId } from '../../types/domain';

/**
 * Ilustraciones provisionales de tinta y acuarela para cada familia.
 * Se reemplazarán por las ilustraciones pintadas definitivas (ver
 * `illustrationBrief` en src/config/families.ts) sin cambiar la API.
 */
interface Props {
  familyId: FamilyId;
  size?: number;
  className?: string;
}

const INK = '#352b24';
const GOLD = '#a88a57';
const PURPLE = '#6b3e65';
const MOSS = '#768b72';
const LAV = '#9c7bb5';

export function FamilyGlyph({ familyId, size = 56, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke={INK}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[familyId]}
    </svg>
  );
}

const GLYPHS: Record<FamilyId, ReactNode> = {
  naturaleza: (
    <>
      {/* Lavanda */}
      <path d="M22 60V18" />
      <path d="M22 44c-7-2-11-7-12-13 6 1 11 5 12 10" fill={MOSS} fillOpacity=".55" />
      <path d="M22 50c6-2 9-6 10-11-5 1-9 4-10 8" fill={MOSS} fillOpacity=".55" />
      {[14, 19, 24, 29, 34].map((y, i) => (
        <g key={y} fill={LAV} fillOpacity=".8" stroke={PURPLE} strokeWidth={0.9}>
          <ellipse cx={19.5 - i * 0.2} cy={y} rx="2.4" ry="3" />
          <ellipse cx={24.5 + i * 0.2} cy={y + 1.5} rx="2.4" ry="3" />
        </g>
      ))}
      <ellipse
        cx="22"
        cy="9.5"
        rx="2"
        ry="2.8"
        fill={LAV}
        fillOpacity=".8"
        stroke={PURPLE}
        strokeWidth={0.9}
      />
      {/* Cristal */}
      <path d="M40 60l-3-14 5-16 6-6 7 8-1 15-3 13z" fill={PURPLE} fillOpacity=".28" />
      <path d="M42 30l4 6 9-4M46 36l-2 24M46 36l8 9" strokeWidth={1} />
      <path d="M49 21l1.2 3 3 1.2-3 1.2L49 29l-1.2-3.6-3-1.2 3-1.2z" fill={GOLD} stroke="none" />
    </>
  ),
  alquimia: (
    <>
      {/* Frasco */}
      <path d="M21 14h10M23 14v12a14 14 0 1 0 6 0V14" />
      <path d="M13.5 42a12.5 12.5 0 0 0 25 0z" fill={PURPLE} fillOpacity=".55" stroke="none" />
      <rect x="22" y="8" width="8" height="6" rx="1.5" fill={GOLD} fillOpacity=".6" />
      <circle cx="21" cy="46" r="1.4" fill="#fff" fillOpacity=".7" stroke="none" />
      <circle cx="29" cy="50" r="1" fill="#fff" fillOpacity=".7" stroke="none" />
      {/* Vela */}
      <path d="M44 34h10v24H44z" fill="#f3eddf" />
      <path d="M44 38c2 2 3 0 4 3s3-1 6 1" strokeWidth={1} />
      <path d="M49 34v-4" />
      <path d="M49 30c-3-3-2-7 0-11 2 4 3 8 0 11z" fill={GOLD} fillOpacity=".85" />
      <circle cx="49" cy="25" r="8" fill={GOLD} fillOpacity=".15" stroke="none" />
      <path d="M40 58h18" />
    </>
  ),
  cosmos: (
    <>
      {/* Astrolabio */}
      <circle cx="32" cy="32" r="25" />
      <circle cx="32" cy="32" r="21" strokeWidth={0.8} strokeDasharray="1 3" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <path
            key={i}
            d={`M${32 + Math.cos(a) * 25} ${32 + Math.sin(a) * 25}L${32 + Math.cos(a) * 28} ${32 + Math.sin(a) * 28}`}
            stroke={GOLD}
          />
        );
      })}
      {/* Planeta y anillo */}
      <circle cx="32" cy="32" r="10" fill={MOSS} fillOpacity=".6" />
      <ellipse cx="32" cy="32" rx="18" ry="5" transform="rotate(-20 32 32)" stroke={GOLD} strokeWidth={1.6} />
      <path d="M50 12l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill={GOLD} stroke="none" />
      <circle cx="12" cy="50" r="1.3" fill={GOLD} stroke="none" />
    </>
  ),
  adivinacion: (
    <>
      {/* Cartas */}
      <rect x="8" y="16" width="20" height="32" rx="2" transform="rotate(-12 18 32)" fill="#f3eddf" />
      <rect x="20" y="14" width="20" height="32" rx="2" transform="rotate(6 30 30)" fill="#f3eddf" />
      <rect
        x="22.5"
        y="17"
        width="15"
        height="26"
        rx="1"
        transform="rotate(6 30 30)"
        strokeWidth={0.8}
        stroke={GOLD}
      />
      <path
        d="M30 23l1.4 4 4 1.4-4 1.4-1.4 4-1.4-4-4-1.4 4-1.4z"
        fill={PURPLE}
        fillOpacity=".75"
        stroke="none"
      />
      <path d="M31 38a4 4 0 1 1-4-4 3 3 0 1 0 4 4z" fill={GOLD} fillOpacity=".7" stroke="none" />
      {/* Péndulo */}
      <path d="M50 6v30" strokeWidth={1} />
      <circle cx="50" cy="6" r="1.6" fill={GOLD} stroke="none" />
      <path d="M50 36l-4 6 4 10 4-10z" fill={PURPLE} fillOpacity=".45" />
      <path d="M46 42h8" strokeWidth={0.8} />
    </>
  ),
  espiritu: (
    <>
      <circle cx="32" cy="32" r="26" strokeWidth={0.8} strokeDasharray="1 3" stroke={GOLD} />
      <g transform="translate(6 4) scale(0.52)" strokeWidth={3.6} stroke={INK}>
        <circle cx="50" cy="52" r="21" fill={MOSS} fillOpacity=".25" strokeWidth={2.6} />
        <path d="M50 66A24.25 24.25 0 0 1 50 24A24.25 24.25 0 0 1 50 66Z" />
        <path d="M37.88 45A24.25 24.25 0 0 1 74.25 66A24.25 24.25 0 0 1 37.88 45Z" />
        <path d="M62.12 45A24.25 24.25 0 0 1 25.75 66A24.25 24.25 0 0 1 62.12 45Z" />
      </g>
      <path d="M32 2l1.2 3 3 1.2-3 1.2L32 10.4l-1.2-3-3-1.2 3-1.2z" fill={GOLD} stroke="none" />
      <circle cx="32" cy="60" r="1.6" fill={GOLD} stroke="none" />
      <circle cx="6" cy="32" r="1.2" fill={GOLD} stroke="none" />
      <circle cx="58" cy="32" r="1.2" fill={GOLD} stroke="none" />
    </>
  ),
  memorias: (
    <>
      {/* Libro abierto */}
      <path d="M6 44c9-3 18-3 26 2 8-5 17-5 26-2V22c-9-3-18-3-26 2-8-5-17-5-26-2z" fill="#f3eddf" />
      <path d="M32 24v22" />
      <path
        d="M11 29c5-1.5 10-1.5 15 0M11 34c5-1.5 10-1.5 15 0M11 39c5-1.5 10-1.5 15 0"
        strokeWidth={0.7}
        stroke={MOSS}
      />
      {/* Pluma */}
      <path d="M38 40C42 26 50 14 60 6c-2 12-8 24-20 32z" fill={MOSS} fillOpacity=".35" />
      <path d="M60 6L36 44" strokeWidth={1} />
      <path d="M46 6l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" fill={GOLD} stroke="none" />
      <circle cx="12" cy="14" r="1.2" fill={GOLD} stroke="none" />
      <path d="M6 50h52" strokeWidth={0.8} stroke={GOLD} />
    </>
  ),
};
