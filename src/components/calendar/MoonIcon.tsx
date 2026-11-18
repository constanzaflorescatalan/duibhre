import type { Hemisphere } from '../../types/domain';

interface Props {
  /** Ángulo de fase en grados (0 nueva, 180 llena). */
  angle: number;
  hemisphere: Hemisphere;
  size?: number;
  className?: string;
}

/**
 * Disco lunar dibujado según el ángulo de fase. En el hemisferio sur la Luna
 * se ve invertida (la creciente se ilumina por la izquierda).
 */
export function MoonIcon({ angle, hemisphere, size = 14, className }: Props) {
  const r = 10;
  const c = 12;
  const a = ((angle % 360) + 360) % 360;
  const waxing = a < 180;
  const phase = waxing ? a : 360 - a; // 0–180
  const rx = Math.abs(Math.cos((phase * Math.PI) / 180)) * r;
  const crescent = phase < 90;
  // Mitad iluminada a la derecha (creciente, hemisferio norte) y terminador elíptico.
  const lit = `M${c} ${c - r} A${r} ${r} 0 0 1 ${c} ${c + r} A${rx} ${r} 0 0 ${crescent ? 0 : 1} ${c} ${c - r} Z`;
  const flip = waxing !== (hemisphere === 'north');

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="#3a3646" stroke="#5c4a2a" strokeWidth="1.2" />
      {phase > 1 && (
        <path d={lit} fill="#f2cf6e" transform={flip ? `translate(24 0) scale(-1 1)` : undefined} />
      )}
    </svg>
  );
}
