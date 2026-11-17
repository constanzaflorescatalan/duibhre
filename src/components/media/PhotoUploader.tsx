import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import type { MediaAsset } from '../../types/domain';
import { newId } from '../../utils/ids';
import { prepareImage } from '../../utils/images';

/** Imagen en el formulario: ya guardada («kept») o recién elegida («new»). */
export type FormImage =
  | { key: string; kind: 'kept'; media: MediaAsset; alt: string }
  | { key: string; kind: 'new'; blob: Blob; previewUrl: string; alt: string };

interface Props {
  images: FormImage[];
  onChange: (images: FormImage[]) => void;
}

/** «Tomar foto» / «Subir imagen», vista previa, texto alternativo editable y quitar. */
export function PhotoUploader({ images, onChange }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const nextErrors: string[] = [];
    const added: FormImage[] = [];
    for (const file of Array.from(files)) {
      const prepared = await prepareImage(file);
      if (prepared.ok)
        added.push({
          key: newId(),
          kind: 'new',
          blob: prepared.blob,
          previewUrl: URL.createObjectURL(prepared.blob),
          alt: '',
        });
      else nextErrors.push(prepared.error);
    }
    setErrors(nextErrors);
    setBusy(false);
    if (added.length) onChange([...images, ...added]);
  };

  const update = (key: string, alt: string) =>
    onChange(images.map((img) => (img.key === key ? { ...img, alt } : img)));
  const remove = (key: string) => {
    const target = images.find((img) => img.key === key);
    if (target?.kind === 'new') URL.revokeObjectURL(target.previewUrl);
    onChange(images.filter((img) => img.key !== key));
  };

  // Liberar las vistas previas al salir del formulario.
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(
    () => () => {
      for (const img of imagesRef.current) if (img.kind === 'new') URL.revokeObjectURL(img.previewUrl);
    },
    [],
  );

  return (
    <div className="photo-uploader">
      <div className="button-row">
        <button type="button" className="btn btn--secondary" onClick={() => cameraRef.current?.click()}>
          <Camera size={18} aria-hidden="true" />
          Tomar foto
        </button>
        <button type="button" className="btn btn--secondary" onClick={() => fileRef.current?.click()}>
          <ImagePlus size={18} aria-hidden="true" />
          Subir imagen
        </button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        tabIndex={-1}
        aria-label="Subir imagen"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {busy && (
        <p className="muted small" role="status">
          Preparando imagen…
        </p>
      )}
      {errors.map((err) => (
        <p key={err} className="error-text" role="alert">
          {err}
        </p>
      ))}

      {images.length > 0 && (
        <ul className="media-grid">
          {images.map((img) => (
            <li key={img.key}>
              <ImageField
                image={img}
                onAlt={(alt) => update(img.key, alt)}
                onRemove={() => remove(img.key)}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="muted small">
        Las fotos se guardan solo en este dispositivo. Describe cada imagen para quien use lector de pantalla.
      </p>
    </div>
  );
}

function ImageField({
  image,
  onAlt,
  onRemove,
}: {
  image: FormImage;
  onAlt: (alt: string) => void;
  onRemove: () => void;
}) {
  const storedUrl = useBlobUrl(image.kind === 'kept' ? image.media.originalBlobId : undefined);
  const url = image.kind === 'kept' ? storedUrl : image.previewUrl;
  const altId = useId();

  return (
    <figure className="media-card">
      <div className="media-card__frame">
        {url ? <img src={url} alt={image.alt || 'Vista previa'} /> : null}
      </div>
      <label htmlFor={altId} className="form-field__label">
        Descripción de la imagen (texto alternativo)
      </label>
      <input
        id={altId}
        className="input"
        value={image.alt}
        placeholder="Ej.: ramita de menta en una maceta"
        onChange={(e) => onAlt(e.target.value)}
      />
      <button type="button" className="btn btn--danger btn--small" onClick={onRemove}>
        <Trash2 size={16} aria-hidden="true" />
        Quitar imagen
      </button>
    </figure>
  );
}
