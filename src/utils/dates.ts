import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const DEFAULT_TIME_ZONE = 'America/Santiago';

/** Fecha legible en es-CL. */
export function formatDate(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Fecha civil «hoy» en una zona horaria explícita (no la del navegador),
 * devuelta como fecha local a medianoche para usar con date-fns.
 */
export function todayInTimeZone(timeZone: string = DEFAULT_TIME_ZONE, now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(get('year'), get('month') - 1, get('day'));
}
