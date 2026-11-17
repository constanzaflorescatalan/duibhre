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

/** Valor para `<input type="datetime-local">` en la hora local del dispositivo. */
export function toDateTimeLocalValue(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Valor para `<input type="date">` en la hora local del dispositivo. */
export function toDateValue(date: Date): string {
  return toDateTimeLocalValue(date).slice(0, 10);
}

/** Fecha y hora legibles en es-CL. */
export function formatDateTime(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
}
