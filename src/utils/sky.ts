import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import type { Hemisphere } from '../types/domain';
import {
  esbats,
  moonQuarters,
  moonStateAt,
  sabbatsOfYear,
  voidOfCourse,
  type Esbat,
  type MoonState,
  type PhaseKey,
  type Sabbat,
  type VoidOfCourse,
} from './astro';
import { dayKey } from './dates';
import { dayKeyInZone, wallTimeToUtc } from './timezone';

/** Capas del cielo que se pueden encender en la agenda. */
export interface SkyLayers {
  moons: boolean;
  esbats: boolean;
  sabbats: boolean;
  voc: boolean;
}

export const NO_LAYERS: SkyLayers = { moons: false, esbats: false, sabbats: false, voc: false };

export interface DaySky {
  /** Fase a mediodía del día (hora local de la persona). */
  moon?: MoonState;
  /** Fase principal exacta que ocurre ese día, con su hora. */
  quarter?: { key: PhaseKey; at: Date };
  sabbats: Sabbat[];
  esbats: Esbat[];
  voc: VoidOfCourse[];
}

const emptyDay = (): DaySky => ({ sabbats: [], esbats: [], voc: [] });

/**
 * Cielo de cada día civil entre `start` y `end` (inclusive) en la zona
 * `timeZone`, solo con las capas pedidas.
 */
export function skyForRange(
  start: Date,
  end: Date,
  timeZone: string,
  hemisphere: Hemisphere,
  layers: SkyLayers,
): Map<string, DaySky> {
  const map = new Map<string, DaySky>();
  const days = eachDayOfInterval({ start, end }).map(dayKey);
  const get = (key: string) => {
    let d = map.get(key);
    if (!d) map.set(key, (d = emptyDay()));
    return d;
  };
  const from = new Date(wallTimeToUtc(days[0], timeZone));
  const to = new Date(wallTimeToUtc(dayKey(addDays(end, 1)), timeZone));
  const inRange = (key: string) => key >= days[0] && key <= days[days.length - 1];

  if (layers.moons) {
    for (const key of days) get(key).moon = moonStateAt(new Date(wallTimeToUtc(`${key}T12:00`, timeZone)));
    for (const q of moonQuarters(from, to)) {
      const key = dayKeyInZone(q.at.toISOString(), timeZone);
      if (inRange(key)) get(key).quarter = q;
    }
  }

  if (layers.esbats) {
    const monthOf = (d: Date) => {
      const key = dayKeyInZone(d.toISOString(), timeZone).slice(0, 7);
      return { key, month: Number(key.slice(5, 7)) - 1 };
    };
    for (const e of esbats(from, to, hemisphere, monthOf)) {
      const key = dayKeyInZone(e.at.toISOString(), timeZone);
      if (inRange(key)) get(key).esbats.push(e);
    }
  }

  if (layers.sabbats) {
    const years = new Set(days.map((k) => Number(k.slice(0, 4))));
    for (const y of years) {
      for (const s of sabbatsOfYear(y, hemisphere)) {
        const key = s.at ? dayKeyInZone(s.at.toISOString(), timeZone) : s.dayKey!;
        if (inRange(key)) get(key).sabbats.push(s);
      }
    }
  }

  if (layers.voc) {
    const periods = voidOfCourse(from, to);
    days.forEach((key, i) => {
      const dayStart = new Date(wallTimeToUtc(key, timeZone)).getTime();
      // El día siguiente se calcula por su propia medianoche (cambios de horario).
      const dayEnd =
        i + 1 < days.length ? new Date(wallTimeToUtc(days[i + 1], timeZone)).getTime() : to.getTime();
      const hits = periods.filter((p) => p.start.getTime() < dayEnd && p.end.getTime() > dayStart);
      if (hits.length) get(key).voc.push(...hits);
    });
  }

  return map;
}

/** Primer y último día visibles en la grilla del mes (semanas de lunes a domingo). */
export function calendarGridRange(month: Date) {
  return {
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  };
}
