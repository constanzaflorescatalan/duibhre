/**
 * Utilidades de zona horaria explícita (sección 7.9): los eventos se guardan en
 * UTC (ISO) junto con su `timeZone`, y se muestran y editan en esa zona, no en
 * la del navegador.
 */

function partsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  };
}

/** Desfase de la zona respecto de UTC en ese instante, en minutos. */
export function zoneOffsetMinutes(date: Date, timeZone: string): number {
  const p = partsInZone(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/** «YYYY-MM-DDTHH:mm» entendido como hora de pared en `timeZone` → ISO UTC. */
export function wallTimeToUtc(wall: string, timeZone: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(wall);
  if (!m) throw new Error('Fecha u hora no válida.');
  const [, y, mo, d, h = '0', mi = '0'] = m;
  const guess = Date.UTC(+y, +mo - 1, +d, +h, +mi);
  let offset = zoneOffsetMinutes(new Date(guess), timeZone);
  let utc = guess - offset * 60000;
  const corrected = zoneOffsetMinutes(new Date(utc), timeZone);
  if (corrected !== offset) {
    offset = corrected;
    utc = guess - offset * 60000;
  }
  return new Date(utc).toISOString();
}

/** ISO UTC → «YYYY-MM-DDTHH:mm» en `timeZone` (para `<input type="datetime-local">`). */
export function utcToWallTime(iso: string, timeZone: string): string {
  const p = partsInZone(new Date(iso), timeZone);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Día civil «YYYY-MM-DD» de un instante en `timeZone`. */
export function dayKeyInZone(iso: string, timeZone: string): string {
  return utcToWallTime(iso, timeZone).slice(0, 10);
}

/** Texto legible en es-CL dentro de la zona indicada. */
export function formatInZone(iso: string, timeZone: string, withTime = true): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } : {}),
  } as Intl.DateTimeFormatOptions).format(new Date(iso));
}

export function formatTimeInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Zonas horarias disponibles en el navegador (o una lista corta de respaldo). */
export function availableTimeZones(): string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  const list = intl.supportedValuesOf?.('timeZone') ?? [];
  const base = ['America/Santiago', 'America/Punta_Arenas', 'Pacific/Easter'];
  return [...new Set([...base, ...list])];
}
