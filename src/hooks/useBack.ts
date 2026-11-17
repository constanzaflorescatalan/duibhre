import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasInAppHistory } from '../utils/navigation';

/**
 * Volver con historial real; si la persona llegó por enlace directo (sin
 * historial dentro de la app) navega al padre lógico.
 */
export function useBack(fallback: string) {
  const navigate = useNavigate();
  return useCallback(() => {
    if (hasInAppHistory()) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}
