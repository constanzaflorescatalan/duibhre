import { ImageOff, Maximize2, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import type { MediaAsset } from '../../types/domain';
import { IllustrationTransform } from './IllustrationTransform';

/** Fotos de una ficha en el detalle, con vista ampliada de la original. */
export function IllustrationPreview({ media }: { media: MediaAsset[] }) {
  const [viewing, setViewing] = useState<MediaAsset | null>(null);
  const images = media.filter((m) => m.originalBlobId);

  return (
    <section className="illustration" aria-labelledby="ilustracion-titulo">
      <h2 id="ilustracion-titulo" className="section-title">
        Foto e ilustración
      </h2>

      {images.length === 0 ? (
        <div className="illustration__frame">
          <ImageOff size={28} aria-hidden="true" />
          <p>Esta página aún no tiene imagen.</p>
        </div>
      ) : (
        <ul className="media-grid">
          {images.map((m) => (
            <li key={m.id}>
              <StoredImage media={m} onOpen={() => setViewing(m)} />
            </li>
          ))}
        </ul>
      )}

      <IllustrationTransform hasImage={images.length > 0} />

      {viewing && <ImageViewer media={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
}

function StoredImage({ media, onOpen }: { media: MediaAsset; onOpen: () => void }) {
  const url = useBlobUrl(media.originalBlobId);
  return (
    <figure className="media-card">
      <div className="media-card__frame">
        {url ? <img src={url} alt={media.alt} /> : <span className="muted small">Cargando…</span>}
      </div>
      {media.alt && <figcaption>{media.alt}</figcaption>}
      <button type="button" className="btn btn--ghost btn--small" onClick={onOpen}>
        <Maximize2 size={16} aria-hidden="true" />
        Ver imagen original
      </button>
    </figure>
  );
}

function ImageViewer({ media, onClose }: { media: MediaAsset; onClose: () => void }) {
  const url = useBlobUrl(media.originalBlobId);
  return createPortal(
    <div className="viewer" role="dialog" aria-modal="true" aria-label="Imagen original" onClick={onClose}>
      <button
        type="button"
        className="viewer__close icon-btn"
        aria-label="Cerrar"
        onClick={onClose}
        autoFocus
      >
        <X size={24} aria-hidden="true" />
      </button>
      {url && <img src={url} alt={media.alt} onClick={(e) => e.stopPropagation()} />}
    </div>,
    document.body,
  );
}
