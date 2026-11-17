/**
 * Ornamentos vectoriales reutilizables: triquetra, fases lunares, filigranas.
 * Son decorativos (aria-hidden) salvo que se indique un título.
 */

interface OrnamentProps {
  className?: string;
  size?: number;
}

/**
 * Triquetra construida con tres lentes (vesica piscis) cuyos centros forman un
 * triángulo equilátero, más un círculo, como en la portada aprobada.
 */
export function Triquetra({
  className,
  size = 64,
  withCircle = true,
}: OrnamentProps & { withCircle?: boolean }) {
  const r = 24.25;
  const lens = (ix: number, iy: number, ox: number, oy: number) =>
    `M${ix} ${iy} A${r} ${r} 0 0 1 ${ox} ${oy} A${r} ${r} 0 0 1 ${ix} ${iy}Z`;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {withCircle && <circle cx="50" cy="52" r="21" strokeWidth={2.4} />}
      <path d={lens(50, 66, 50, 24)} />
      <path d={lens(37.88, 45, 74.25, 66)} />
      <path d={lens(62.12, 45, 25.75, 66)} />
    </svg>
  );
}

/** Cinco fases lunares: creciente, cuarto creciente, llena, cuarto menguante, menguante. */
export function MoonPhases({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 40" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="moonGlow" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#efdcab" />
          <stop offset="100%" stopColor="#a88a57" />
        </radialGradient>
        <mask id="m1">
          <circle cx="24" cy="20" r="8" fill="#fff" />
          <circle cx="20" cy="20" r="8" fill="#000" />
        </mask>
        <mask id="m2">
          <circle cx="62" cy="20" r="11" fill="#fff" />
          <circle cx="56" cy="20" r="10" fill="#000" />
        </mask>
        <mask id="m4">
          <circle cx="138" cy="20" r="11" fill="#fff" />
          <circle cx="144" cy="20" r="10" fill="#000" />
        </mask>
        <mask id="m5">
          <circle cx="176" cy="20" r="8" fill="#fff" />
          <circle cx="180" cy="20" r="8" fill="#000" />
        </mask>
      </defs>
      <g fill="url(#moonGlow)">
        <circle cx="24" cy="20" r="8" mask="url(#m1)" />
        <circle cx="62" cy="20" r="11" mask="url(#m2)" />
        <circle cx="100" cy="20" r="15" />
        <circle cx="138" cy="20" r="11" mask="url(#m4)" />
        <circle cx="176" cy="20" r="8" mask="url(#m5)" />
      </g>
    </svg>
  );
}

/** Separador de filigrana dorada con estrella central. */
export function Filigree({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 16" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M8 8h86M146 8h86" />
        <path d="M94 8c6-6 12-6 16 0M130 8c4 6 10 6 16 0" />
        <circle cx="4" cy="8" r="1.6" fill="currentColor" />
        <circle cx="236" cy="8" r="1.6" fill="currentColor" />
      </g>
      <path d="M120 1l1.8 5.2L127 8l-5.2 1.8L120 15l-1.8-5.2L113 8l5.2-1.8z" fill="currentColor" />
    </svg>
  );
}

/** Esquina con nudo celta discreto; se rota con CSS para las cuatro esquinas. */
export function CornerKnot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M2 38V10a8 8 0 0 1 8-8h28" />
        <path d="M6 38V14a8 8 0 0 1 8-8h24" opacity=".6" />
        <path d="M10 22c0-7 5-12 12-12M14 26c3-8 4-9 12-12" />
        <circle cx="13" cy="13" r="3.2" />
      </g>
    </svg>
  );
}

/** Estrella de cuatro puntas usada como chispa. */
export function Sparkle({ className, size = 14 }: OrnamentProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 0l1.6 6.4L16 8l-6.4 1.6L8 16l-1.6-6.4L0 8l6.4-1.6z" fill="currentColor" />
    </svg>
  );
}
