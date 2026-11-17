/**
 * Preferencias de navegación no sensibles en localStorage (p. ej. la última
 * familia visitada). Siempre protegido con try/catch: en modo privado puede fallar.
 */
const PREFIX = 'duibhre:';

export function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string): void {
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}
