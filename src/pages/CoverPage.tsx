import { useEffect, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import cover from '../assets/cover/portada-duibhre.jpg';
import { UI } from '../config/uiCopy';

/**
 * Portada `/` (sección 7.1): el libro aprobado se ve completo y llena toda la
 * pantalla. En pantallas más altas que el libro (celulares) se intercala cuero
 * liso —entre las lunas y el título, y entre la bajada y la triquetra—, repitiendo
 * un trozo de la propia tapa, de modo que el arte, el título y los marcos quedan
 * intactos.
 * La triquetra es el botón que abre el grimorio.
 */
const W = 1024;
const H = 1536;
/** Cortes donde se intercala cuero liso (en px de la imagen). */
const GAP_A = 440;
const GAP_B = 762;
/** Trozo de cuero liso (con los filetes laterales) que se repite como relleno. */
const TILE = { from: 330, height: 110 };
/** Centro y radio de la triquetra en la imagen aprobada. */
const TRIQUETRA = { cx: 532, cy: 1000, r: 150 };

function useViewportRatio() {
  const read = () => window.innerHeight / Math.max(1, window.innerWidth);
  const [ratio, setRatio] = useState(read);
  useEffect(() => {
    const onResize = () => setRatio(read());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return ratio;
}

/** Trozo de la portada entre `y0` y `y1`, dibujado en `top`. */
function Band({ y0, y1, top }: { y0: number; y1: number; top: number }) {
  return (
    <svg x="0" y={top} width={W} height={y1 - y0} viewBox={`0 ${y0} ${W} ${y1 - y0}`}>
      <image href={cover} x="0" y="0" width={W} height={H} />
    </svg>
  );
}

export function CoverPage() {
  const navigate = useNavigate();
  const ratio = useViewportRatio();
  const [opening, setOpening] = useState(false);

  // Altura del lienzo para llenar la pantalla con el ancho completo del libro.
  const canvasH = Math.max(H, Math.round(W * ratio));
  const extra = canvasH - H;
  const eA = Math.round(extra / 2);
  const eB = extra - eA;

  const open = () => {
    if (opening) return;
    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.reduceMotion === 'true';
    if (reduce) {
      navigate('/inicio');
      return;
    }
    setOpening(true);
    window.setTimeout(() => navigate('/inicio'), 650);
  };

  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  const triquetraY = TRIQUETRA.cy + eA + eB;

  return (
    <main className={`cover${opening ? ' is-opening' : ''}`}>
      <h1 className="visually-hidden">
        {UI.appName} — {UI.tagline}
      </h1>
      <svg className="cover__stage" viewBox={`0 0 ${W} ${canvasH}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="triquetraGlow">
            <stop offset="0%" stopColor="#f3d79a" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#d9b56a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#d9b56a" stopOpacity="0" />
          </radialGradient>
          {/* Cuero liso repetido; cada segunda copia va invertida para que no se noten las uniones. */}
          <pattern id="leatherTile" patternUnits="userSpaceOnUse" width={W} height={TILE.height * 2}>
            <svg width={W} height={TILE.height} viewBox={`0 ${TILE.from} ${W} ${TILE.height}`}>
              <image href={cover} x="0" y="0" width={W} height={H} />
            </svg>
            <g transform={`translate(0 ${TILE.height * 2}) scale(1 -1)`}>
              <svg width={W} height={TILE.height} viewBox={`0 ${TILE.from} ${W} ${TILE.height}`}>
                <image href={cover} x="0" y="0" width={W} height={H} />
              </svg>
            </g>
          </pattern>
        </defs>

        <g role="img" aria-label={UI.coverAlt}>
          {extra === 0 ? (
            <image href={cover} x="0" y="0" width={W} height={H} />
          ) : (
            <>
              <Band y0={0} y1={GAP_A} top={0} />
              <rect x="0" y={GAP_A} width={W} height={eA} fill="url(#leatherTile)" />
              <Band y0={GAP_A} y1={GAP_B} top={GAP_A + eA} />
              <rect x="0" y={GAP_B + eA} width={W} height={eB} fill="url(#leatherTile)" />
              <Band y0={GAP_B} y1={H} top={GAP_B + eA + eB} />
            </>
          )}
        </g>

        <g
          className="cover__triquetra"
          role="button"
          tabIndex={0}
          aria-label={UI.openGrimoire}
          onClick={open}
          onKeyDown={onKey}
        >
          <circle
            className="cover__glow"
            cx={TRIQUETRA.cx}
            cy={triquetraY}
            r={TRIQUETRA.r}
            fill="url(#triquetraGlow)"
          />
          <circle cx={TRIQUETRA.cx} cy={triquetraY} r={TRIQUETRA.r} fill="transparent" />
          <circle
            className="cover__focus"
            cx={TRIQUETRA.cx}
            cy={triquetraY}
            r={TRIQUETRA.r - 8}
            fill="none"
          />
        </g>
      </svg>
    </main>
  );
}
