import { ImageOff, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { UI } from '../../config/uiCopy';
import { ILLUSTRATION_STYLES } from '../../config/illustrationStyles';
import type { IllustrationStyle, MediaAsset } from '../../types/domain';

/**
 * Bloque foto → ilustración (sección 9). Etapa 1: muestra el estado real
 * (sin imagen) y explica que la transformación necesita un servicio que aún no
 * está configurado. Nunca muestra una imagen fija como si fuera generada.
 */
export function IllustrationPreview({ media }: { media: MediaAsset[] }) {
  const [style, setStyle] = useState<IllustrationStyle>('botanico');
  const [showNotice, setShowNotice] = useState(false);
  const hasOriginal = media.some((m) => m.originalBlobId);

  return (
    <section className="illustration" aria-labelledby="ilustracion-titulo">
      <h2 id="ilustracion-titulo" className="section-title">
        Foto e ilustración
      </h2>
      <div className="illustration__frame">
        <ImageOff size={28} aria-hidden="true" />
        <p>{hasOriginal ? 'Imagen guardada en este dispositivo.' : 'Esta página aún no tiene imagen.'}</p>
      </div>

      <fieldset className="illustration__styles">
        <legend>Estilo de ilustración</legend>
        {ILLUSTRATION_STYLES.map((s) => (
          <label key={s.id} className={`chip${style === s.id ? ' is-active' : ''}`}>
            <input
              type="radio"
              name="estilo-ilustracion"
              value={s.id}
              checked={style === s.id}
              onChange={() => setStyle(s.id)}
              className="visually-hidden"
            />
            {s.label}
          </label>
        ))}
      </fieldset>

      <div className="button-row">
        <button type="button" className="btn btn--secondary" disabled={!hasOriginal}>
          Ver imagen original
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          aria-describedby={showNotice ? 'aviso-ia' : undefined}
          onClick={() => setShowNotice(true)}
        >
          <Wand2 size={18} aria-hidden="true" />
          Transformar imagen en ilustración
        </button>
      </div>
      {showNotice && (
        <p id="aviso-ia" className="stage-notice" role="status">
          {UI.empty.aiUnavailable}. Para generar ilustraciones hace falta configurar un servicio real desde un
          servidor seguro; no se ha generado ninguna imagen.
        </p>
      )}
    </section>
  );
}
