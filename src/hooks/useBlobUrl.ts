import { useEffect, useState } from 'react';
import { db } from '../data/db';

/** URL temporal (object URL) de una imagen guardada en IndexedDB; se libera al desmontar. */
export function useBlobUrl(blobId: string | undefined): string | undefined {
  const [state, setState] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    if (!blobId) return;
    let url: string | undefined;
    let alive = true;
    db.blobs.get(blobId).then((stored) => {
      if (!alive || !stored) return;
      url = URL.createObjectURL(stored.blob);
      setState({ id: blobId, url });
    });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [blobId]);

  return state && state.id === blobId ? state.url : undefined;
}
