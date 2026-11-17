import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cover from '../assets/cover/portada-duibhre.jpg';
import { UI } from '../config/uiCopy';

/**
 * Portada `/` (sección 7.1). Usa la imagen aprobada tal cual; el botón
 * «Abrir grimorio» queda fuera del arte. Tocar la portada también la abre.
 */
export function CoverPage() {
  const navigate = useNavigate();
  const [opening, setOpening] = useState(false);

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
    window.setTimeout(() => navigate('/inicio'), 480);
  };

  return (
    <main className={`cover${opening ? ' is-opening' : ''}`}>
      <h1 className="visually-hidden">
        {UI.appName} — {UI.tagline}
      </h1>
      <button type="button" className="cover__book" onClick={open} aria-label={UI.openGrimoire}>
        <img className="cover__art" src={cover} alt={UI.coverAlt} width={900} height={1350} />
      </button>
      <button type="button" className="btn btn--gold cover__open" onClick={open}>
        {UI.openGrimoire}
      </button>
    </main>
  );
}
