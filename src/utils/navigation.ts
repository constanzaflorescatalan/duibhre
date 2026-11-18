/** React Router guarda el índice de historial en `history.state.idx`. */
export function hasInAppHistory(): boolean {
  const state = window.history.state as { idx?: number } | null;
  return typeof state?.idx === 'number' && state.idx > 0;
}

/**
 * Padre lógico de cada ruta (sección 6): se usa cuando no hay historial.
 */
export function logicalParent(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'capitulos' && parts.length >= 4) return `/capitulos/${parts[1]}`;
  if (parts[0] === 'capitulos') return '/indice';
  if (parts[0] === 'fichas' && parts[2] === 'editar') return `/fichas/${parts[1]}`;
  if (parts[0] === 'fichas') return '/indice';
  if (parts[0] === 'crear' && parts.length > 1) return '/crear';
  if (parts[0] === 'agenda' && parts[3] === 'editar') return `/agenda/eventos/${parts[2]}`;
  if (parts[0] === 'agenda' && parts.length > 1) return '/agenda';
  if (parts[0] === 'bitacora' && parts[2] === 'editar') return `/bitacora/${parts[1]}`;
  if (parts[0] === 'bitacora' && parts.length > 1) return '/bitacora';
  if (parts[0] === 'dedicatoria') return '/perfil';
  return '/inicio';
}

/** Destinos raíz: muestran la navbar resaltada y no llevan flecha de volver. */
export const ROOT_PATHS = ['/inicio', '/indice', '/crear', '/agenda', '/bitacora'];

/** Qué pestaña de la navbar queda activa para una ruta de detalle. */
export function activeNavFor(pathname: string): string | null {
  if (pathname.startsWith('/inicio')) return '/inicio';
  if (pathname.startsWith('/indice') || pathname.startsWith('/capitulos') || pathname.startsWith('/fichas'))
    return '/indice';
  if (pathname.startsWith('/crear')) return '/crear';
  if (pathname.startsWith('/agenda')) return '/agenda';
  if (pathname.startsWith('/bitacora')) return '/bitacora';
  return null;
}
