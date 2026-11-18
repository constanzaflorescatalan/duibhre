import { Navigate, useLocation } from 'react-router-dom';

/** El índice vive ahora en Inicio: los enlaces antiguos a `/indice` se conservan. */
export function IndexRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/inicio${search}`} replace />;
}
