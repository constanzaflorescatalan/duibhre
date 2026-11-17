import { useEffect, useState } from 'react';

type AsyncState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };

type Settled<T> = { key: string } & ({ ok: true; data: T } | { ok: false; error: Error });

/**
 * Ejecuta una lectura asíncrona (repositorios IndexedDB) y expone su estado real.
 * `deps` deben ser valores primitivos; el estado «cargando» se deriva al
 * cambiar sus valores, sin setState síncrono dentro del efecto.
 */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const key = JSON.stringify(deps);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    let alive = true;
    load().then(
      (data) => alive && setSettled({ key, ok: true, data }),
      (error: unknown) =>
        alive &&
        setSettled({ key, ok: false, error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      alive = false;
    };
  }, [key]); // oxlint-disable-line react-hooks/exhaustive-deps -- `load` se recrea en cada render; `key` resume sus dependencias

  if (!settled || settled.key !== key) return { status: 'loading' };
  return settled.ok ? { status: 'success', data: settled.data } : { status: 'error', error: settled.error };
}
