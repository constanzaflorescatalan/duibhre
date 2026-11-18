/** Preparación local de fotos antes de guardarlas en IndexedDB. */

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB antes de reducir
const MAX_SIDE = 1600;

export type PreparedImage = { ok: true; blob: Blob } | { ok: false; error: string };

/**
 * Valida tipo y tamaño y reduce la imagen a un máximo de 1600 px por lado
 * (JPEG 85 %) para no llenar el almacenamiento del dispositivo. Si el navegador
 * no puede reducirla, se guarda la original.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: `«${file.name}» no es una imagen.` };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: `«${file.name}» pesa ${(file.size / 1024 / 1024).toFixed(1)} MB; el máximo es 15 MB.`,
    };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
      bitmap.close();
      return { ok: true, blob: file };
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    return { ok: true, blob: blob ?? file };
  } catch {
    return { ok: true, blob: file };
  }
}

/** Recorta al centro en un cuadrado de hasta `side` px (JPEG 88 %), para la foto de perfil. */
export async function prepareSquareImage(file: File, side = 512): Promise<PreparedImage> {
  const checked = await prepareImage(file);
  if (!checked.ok) return checked;
  try {
    const bitmap = await createImageBitmap(checked.blob);
    const crop = Math.min(bitmap.width, bitmap.height);
    const out = Math.min(side, crop);
    const canvas = document.createElement('canvas');
    canvas.width = out;
    canvas.height = out;
    canvas
      .getContext('2d')
      ?.drawImage(bitmap, (bitmap.width - crop) / 2, (bitmap.height - crop) / 2, crop, crop, 0, 0, out, out);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    return { ok: true, blob: blob ?? checked.blob };
  } catch {
    return checked;
  }
}
