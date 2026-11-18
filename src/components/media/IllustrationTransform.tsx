import { Wand2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { getPreferences } from '../../data/repositories/preferences';
import { ILLUSTRATION_STYLES } from '../../config/illustrationStyles';
import { UI } from '../../config/uiCopy';
import type { IllustrationStyle } from '../../types/domain';

/**
 * Selector de estilo y botón «Transformar en ilustración» (sección 9).
 * Sin servicio configurado explica la situación: nunca muestra una imagen
 * fija como si hubiera sido generada.
 */
export function IllustrationTransform({ hasImage }: { hasImage: boolean }) {
  const [style, setStyle] = useState<IllustrationStyle>('botanico');
  const touched = useRef(false);

  // Parte con el estilo preferido del Perfil, salvo que la persona ya haya elegido otro.
  useEffect(() => {
    let alive = true;
    getPreferences().then((p) => {
      if (alive && !touched.current) setStyle(p.preferredIllustrationStyle);
    });
    return () => {
      alive = false;
    };
  }, []);
  const [showNotice, setShowNotice] = useState(false);
  const name = useId();
  const noticeId = useId();

  return (
    <div className="illustration-transform">
      <fieldset className="illustration__styles">
        <legend>Estilo de ilustración</legend>
        {ILLUSTRATION_STYLES.map((s) => (
          <label key={s.id} className={`chip${style === s.id ? ' is-active' : ''}`}>
            <input
              type="radio"
              name={name}
              value={s.id}
              checked={style === s.id}
              onChange={() => {
                touched.current = true;
                setStyle(s.id);
              }}
              className="visually-hidden"
            />
            {s.label}
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        className="btn btn--secondary"
        aria-describedby={showNotice ? noticeId : undefined}
        onClick={() => setShowNotice(true)}
      >
        <Wand2 size={18} aria-hidden="true" />
        Transformar imagen en ilustración
      </button>
      {showNotice && (
        <p id={noticeId} className="stage-notice" role="status">
          {!hasImage && 'Primero agrega una foto. '}
          {UI.empty.aiUnavailable}. Para generar ilustraciones hace falta configurar un servicio real desde un
          servidor seguro; no se ha generado ninguna imagen.
        </p>
      )}
    </div>
  );
}
