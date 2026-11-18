/**
 * Cielo de la agenda: fases lunares, esbats, sabbats y luna vacía de curso.
 *
 * Lo astronómico (fases, lunas llenas, solsticios, equinoccios, posiciones de
 * la Luna y los planetas) se calcula con astronomy-engine (licencia MIT,
 * precisión del orden de un minuto). Lo simbólico —nombres tradicionales de
 * las lunas y fechas fijas de los sabbats intermedios— es una convención y la
 * interfaz lo indica como tal.
 */
import {
  Body,
  Ecliptic,
  EclipticGeoMoon,
  GeoVector,
  MoonPhase,
  SearchMoonQuarter,
  Seasons,
  SunPosition,
} from 'astronomy-engine';
import type { Hemisphere } from '../types/domain';

const HOUR = 3_600_000;

// ---------------------------------------------------------------------------
// Fases lunares
// ---------------------------------------------------------------------------

export type PhaseKey =
  | 'nueva'
  | 'creciente'
  | 'cuarto-creciente'
  | 'gibosa-creciente'
  | 'llena'
  | 'gibosa-menguante'
  | 'cuarto-menguante'
  | 'menguante';

export const PHASE_LABELS: Record<PhaseKey, string> = {
  nueva: 'Luna nueva',
  creciente: 'Luna creciente',
  'cuarto-creciente': 'Cuarto creciente',
  'gibosa-creciente': 'Gibosa creciente',
  llena: 'Luna llena',
  'gibosa-menguante': 'Gibosa menguante',
  'cuarto-menguante': 'Cuarto menguante',
  menguante: 'Luna menguante',
};

const PHASE_ORDER: PhaseKey[] = [
  'nueva',
  'creciente',
  'cuarto-creciente',
  'gibosa-creciente',
  'llena',
  'gibosa-menguante',
  'cuarto-menguante',
  'menguante',
];

/** Las cuatro fases principales, en el orden de astronomy-engine (0 = nueva). */
const QUARTER_KEYS: PhaseKey[] = ['nueva', 'cuarto-creciente', 'llena', 'cuarto-menguante'];

export interface MoonState {
  /** Ángulo de fase eclíptico Sol–Luna en grados (0 nueva, 180 llena). */
  angle: number;
  /** Fracción iluminada del disco, 0–1. */
  illumination: number;
  key: PhaseKey;
}

export function moonStateAt(date: Date): MoonState {
  const angle = MoonPhase(date);
  const illumination = (1 - Math.cos((angle * Math.PI) / 180)) / 2;
  const key = PHASE_ORDER[Math.floor(((angle + 22.5) % 360) / 45)];
  return { angle, illumination, key };
}

export interface MoonQuarter {
  key: PhaseKey;
  at: Date;
}

/** Instantes exactos de las fases principales entre `from` y `to`. */
export function moonQuarters(from: Date, to: Date): MoonQuarter[] {
  const out: MoonQuarter[] = [];
  let q = SearchMoonQuarter(from);
  while (q.time.date < to) {
    out.push({ key: QUARTER_KEYS[q.quarter], at: q.time.date });
    q = SearchMoonQuarter(new Date(q.time.date.getTime() + HOUR));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Esbats (lunas llenas) y sus nombres tradicionales
// ---------------------------------------------------------------------------

/**
 * Nombres tradicionales del folclore del hemisferio norte, por mes de la luna
 * llena. En el hemisferio sur se usan desplazados seis meses, para que sigan
 * a las estaciones.
 */
const MOON_NAMES_NORTH = [
  'Luna del lobo',
  'Luna de nieve',
  'Luna del gusano',
  'Luna rosa',
  'Luna de las flores',
  'Luna de la fresa',
  'Luna del ciervo',
  'Luna del esturión',
  'Luna de la cosecha',
  'Luna del cazador',
  'Luna del castor',
  'Luna fría',
];

export interface Esbat {
  at: Date;
  /** Nombre tradicional (simbólico). */
  name: string;
  /** Segunda luna llena del mismo mes civil. */
  isBlueMoon: boolean;
}

/**
 * Lunas llenas entre `from` y `to`. `monthOf` devuelve el mes civil (0–11) y la
 * clave «YYYY-MM» de un instante en la zona de la persona.
 */
export function esbats(
  from: Date,
  to: Date,
  hemisphere: Hemisphere,
  monthOf: (d: Date) => { month: number; key: string },
): Esbat[] {
  // Se mira desde 32 días antes para detectar lunas azules en el borde.
  const fulls = moonQuarters(new Date(from.getTime() - 32 * 24 * HOUR), to).filter((q) => q.key === 'llena');
  const out: Esbat[] = [];
  fulls.forEach((q, i) => {
    if (q.at < from) return;
    const m = monthOf(q.at);
    const prev = fulls[i - 1];
    const isBlueMoon = Boolean(prev && monthOf(prev.at).key === m.key);
    const idx = hemisphere === 'south' ? (m.month + 6) % 12 : m.month;
    out.push({ at: q.at, name: isBlueMoon ? 'Luna azul' : MOON_NAMES_NORTH[idx], isBlueMoon });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Sabbats de la rueda del año
// ---------------------------------------------------------------------------

export type SabbatId =
  'imbolc' | 'ostara' | 'beltane' | 'litha' | 'lughnasadh' | 'mabon' | 'samhain' | 'yule';

export interface Sabbat {
  id: SabbatId;
  name: string;
  meaning: string;
  /** «astronomico»: instante exacto de solsticio/equinoccio. «tradicional»: fecha fija por convención. */
  basis: 'astronomico' | 'tradicional';
  /** Instante exacto (astronómicos). */
  at?: Date;
  /** Día civil «YYYY-MM-DD» (tradicionales). */
  dayKey?: string;
}

const SABBAT_INFO: Record<SabbatId, { name: string; meaning: string }> = {
  imbolc: { name: 'Imbolc', meaning: 'Despertar de la luz; purificación y primeras semillas.' },
  ostara: { name: 'Ostara', meaning: 'Equinoccio de primavera; equilibrio y renacer.' },
  beltane: { name: 'Beltane', meaning: 'Fuego y fertilidad; plenitud de la primavera.' },
  litha: { name: 'Litha', meaning: 'Solsticio de verano; el día más largo del año.' },
  lughnasadh: { name: 'Lughnasadh', meaning: 'Primera cosecha; gratitud por los frutos.' },
  mabon: { name: 'Mabon', meaning: 'Equinoccio de otoño; segunda cosecha y balance.' },
  samhain: { name: 'Samhain', meaning: 'Fin de la cosecha; memoria de los ancestros.' },
  yule: { name: 'Yule', meaning: 'Solsticio de invierno; la noche más larga y el regreso del sol.' },
};

/** Los ocho sabbats de un año civil para el hemisferio indicado. */
export function sabbatsOfYear(year: number, hemisphere: Hemisphere): Sabbat[] {
  const s = Seasons(year);
  const north = hemisphere === 'north';
  const astro = (id: SabbatId, at: Date): Sabbat => ({ id, ...SABBAT_INFO[id], basis: 'astronomico', at });
  const fixed = (id: SabbatId, mmdd: string): Sabbat => ({
    id,
    ...SABBAT_INFO[id],
    basis: 'tradicional',
    dayKey: `${year}-${mmdd}`,
  });
  const list = north
    ? [
        fixed('imbolc', '02-01'),
        astro('ostara', s.mar_equinox.date),
        fixed('beltane', '05-01'),
        astro('litha', s.jun_solstice.date),
        fixed('lughnasadh', '08-01'),
        astro('mabon', s.sep_equinox.date),
        fixed('samhain', '10-31'),
        astro('yule', s.dec_solstice.date),
      ]
    : [
        fixed('lughnasadh', '02-01'),
        astro('mabon', s.mar_equinox.date),
        fixed('samhain', '04-30'),
        astro('yule', s.jun_solstice.date),
        fixed('imbolc', '08-01'),
        astro('ostara', s.sep_equinox.date),
        fixed('beltane', '10-31'),
        astro('litha', s.dec_solstice.date),
      ];
  return list;
}

// ---------------------------------------------------------------------------
// Luna vacía de curso
// ---------------------------------------------------------------------------

export const SIGNS = [
  'Aries',
  'Tauro',
  'Géminis',
  'Cáncer',
  'Leo',
  'Virgo',
  'Libra',
  'Escorpio',
  'Sagitario',
  'Capricornio',
  'Acuario',
  'Piscis',
];

const ASPECT_BODIES: Body[] = [
  Body.Sun,
  Body.Mercury,
  Body.Venus,
  Body.Mars,
  Body.Jupiter,
  Body.Saturn,
  Body.Uranus,
  Body.Neptune,
  Body.Pluto,
];
/** Aspectos mayores (ptolemaicos), medidos como separación Luna − astro. */
const ASPECT_ANGLES = [0, 60, 90, 120, 180, 240, 270, 300];

const moonLon = (t: number) => EclipticGeoMoon(new Date(t)).lon;
const bodyLon = (body: Body, t: number) =>
  body === Body.Sun ? SunPosition(new Date(t)).elon : Ecliptic(GeoVector(body, new Date(t), true)).elon;
const wrap180 = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180;
const signOf = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30);

function bisect(lo: number, hi: number, isAfter: (t: number) => boolean): number {
  while (hi - lo > 20_000) {
    const mid = (lo + hi) / 2;
    if (isAfter(mid)) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/** Ingresos de la Luna a cada signo entre `from` y `to` (ms). */
function moonIngresses(from: number, to: number): { at: number; sign: number }[] {
  const out: { at: number; sign: number }[] = [];
  let t = from;
  let s = signOf(moonLon(t));
  while (t < to) {
    const next = t + HOUR;
    const ns = signOf(moonLon(next));
    if (ns !== s) {
      const prevSign = s;
      const at = bisect(t, next, (x) => signOf(moonLon(x)) !== prevSign);
      out.push({ at, sign: ns });
      s = ns;
    }
    t = next;
  }
  return out;
}

/** Último aspecto mayor exacto de la Luna dentro de [a, b], o null. */
function lastAspect(a: number, b: number): number | null {
  let last: number | null = null;
  for (const body of ASPECT_BODIES) {
    let t = a;
    let prevSep = wrap180(moonLon(t) - bodyLon(body, t));
    while (t < b) {
      const next = Math.min(t + HOUR, b);
      const sep = wrap180(moonLon(next) - bodyLon(body, next));
      for (const angle of ASPECT_ANGLES) {
        const f0 = wrap180(prevSep - angle);
        const f1 = wrap180(sep - angle);
        // La Luna avanza más rápido que cualquier astro: el aspecto se perfecciona de − a +.
        if (f0 < 0 && f1 >= 0 && f1 - f0 < 30) {
          const exact = bisect(t, next, (x) => wrap180(moonLon(x) - bodyLon(body, x) - angle) >= 0);
          if (last === null || exact > last) last = exact;
        }
      }
      prevSep = sep;
      t = next;
    }
  }
  return last;
}

export interface VoidOfCourse {
  start: Date;
  end: Date;
  /** Signo que deja la Luna y signo al que entra al terminar el periodo. */
  fromSign: string;
  toSign: string;
}

const vocCache = new Map<string, VoidOfCourse[]>();

/**
 * Periodos de Luna vacía de curso que se cruzan con [from, to]: desde el
 * último aspecto mayor exacto de la Luna con el Sol o un planeta (Mercurio a
 * Plutón) hasta su ingreso al signo siguiente.
 */
export function voidOfCourse(from: Date, to: Date): VoidOfCourse[] {
  const cacheKey = `${from.toISOString()}|${to.toISOString()}`;
  const cached = vocCache.get(cacheKey);
  if (cached) return cached;
  // La Luna pasa ~2,5 días por signo: margen de 3 días para tener el ingreso anterior.
  const ingresses = moonIngresses(from.getTime() - 3 * 24 * HOUR, to.getTime() + 3 * 24 * HOUR);
  const out: VoidOfCourse[] = [];
  for (let i = 1; i < ingresses.length; i++) {
    const a = ingresses[i - 1].at;
    const b = ingresses[i].at;
    if (b < from.getTime() || a > to.getTime()) continue;
    const start = lastAspect(a, b) ?? a;
    if (b < from.getTime() || start > to.getTime()) continue;
    out.push({
      start: new Date(start),
      end: new Date(b),
      fromSign: SIGNS[ingresses[i - 1].sign],
      toSign: SIGNS[ingresses[i].sign],
    });
  }
  vocCache.set(cacheKey, out);
  return out;
}
