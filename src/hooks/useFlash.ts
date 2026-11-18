import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Lee un aviso pasado en el estado de navegación (p. ej. «guardado») una sola
 * vez y lo borra del historial, para que no reaparezca al recargar o volver.
 */
export function useFlash<T>(key: string): T | undefined {
  const location = useLocation();
  const navigate = useNavigate();
  const [value] = useState<T | undefined>(
    () => (location.state as Record<string, T> | null)?.[key] ?? undefined,
  );

  useEffect(() => {
    if ((location.state as Record<string, unknown> | null)?.[key] !== undefined) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [key, location.pathname, location.search, location.state, navigate]);

  return value;
}
