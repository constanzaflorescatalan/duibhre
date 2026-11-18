import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { BellPlus, CalendarClock, CalendarPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EventCard } from '../components/calendar/EventCard';
import { MagicCalendar, type DayMarker } from '../components/calendar/MagicCalendar';
import { SkyDay } from '../components/calendar/SkyDay';
import { EmptyState } from '../components/common/EmptyState';
import { Page, PageHeader } from '../components/common/Page';
import { JournalCard } from '../components/journal/JournalCard';
import { EVENT_KINDS, eventKind, NOTE_FOLLOWUP_COLOR } from '../config/eventKinds';
import { UI } from '../config/uiCopy';
import { listEventsBetween } from '../data/repositories/events';
import { listJournalRecords } from '../data/repositories/journal';
import { getPreferences } from '../data/repositories/preferences';
import { useAsync } from '../hooks/useAsync';
import { dayKey, todayInTimeZone } from '../utils/dates';
import { calendarGridRange, NO_LAYERS, skyForRange, type SkyLayers } from '../utils/sky';
import { readLocal, writeLocal } from '../utils/storage';
import { dayKeyInZone } from '../utils/timezone';

type View = 'hoy' | 'mes';

/** Este grimorio se usa en el hemisferio sur: lunas, esbats y sabbats se calculan para el sur. */
const HEMISPHERE = 'south' as const;
const LAYERS_KEY = 'agenda-capas';
const ALL_LAYERS: SkyLayers = { moons: true, esbats: true, sabbats: true, voc: true };

const LAYER_OPTIONS: { id: keyof SkyLayers; label: string; swatch: string }[] = [
  {
    id: 'moons',
    label: 'Fases de la luna',
    swatch: 'radial-gradient(circle at 35% 50%, #f2cf6e 55%, #3a3646 56%)',
  },
  { id: 'esbats', label: 'Esbats', swatch: '#6e5696' },
  { id: 'sabbats', label: 'Sabbats', swatch: '#c9a048' },
  {
    id: 'voc',
    label: 'Luna vacía de curso',
    swatch: 'repeating-linear-gradient(90deg, #8b3a2e 0 3px, transparent 3px 5px)',
  },
];

function readLayers(): SkyLayers {
  try {
    const raw = readLocal(LAYERS_KEY);
    return raw ? { ...NO_LAYERS, ...(JSON.parse(raw) as Partial<SkyLayers>) } : NO_LAYERS;
  } catch {
    return NO_LAYERS;
  }
}

/** Cede el hilo antes de un cálculo pesado (luna vacía) para no congelar la pantalla. */
const deferred = <T,>(fn: () => T) => new Promise<T>((resolve) => setTimeout(() => resolve(fn()), 0));

/**
 * Agenda `/agenda` (sección 7.9): eventos propios, fechas próximas de las
 * memorias y, si se encienden, las capas del cielo del hemisferio sur: fases
 * lunares, esbats, sabbats y luna vacía de curso (calculados con astronomy-engine).
 */
export function AgendaPage() {
  const prefsState = useAsync(getPreferences, []);
  const tz = prefsState.status === 'success' ? prefsState.data.timeZone : 'America/Santiago';
  const today = todayInTimeZone(tz);
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState<View>('mes');
  const [layers, setLayers] = useState<SkyLayers>(readLayers);

  const toggleLayer = (id: keyof SkyLayers) => {
    setLayers((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeLocal(LAYERS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const data = useAsync(async () => {
    // Un día de margen a cada lado: el día civil depende de la zona de cada evento.
    const from = addDays(startOfMonth(month), -7).toISOString();
    const to = addDays(endOfMonth(month), 8).toISOString();
    const [events, records] = await Promise.all([listEventsBetween(from, to), listJournalRecords()]);
    return { events, followUps: records.filter((r) => r.followUpAt) };
  }, [month.getTime()]);

  const events = useMemo(() => (data.status === 'success' ? data.data.events : []), [data]);
  const followUps = useMemo(() => (data.status === 'success' ? data.data.followUps : []), [data]);

  const anyLayer = layers.moons || layers.esbats || layers.sabbats || layers.voc;
  const monthSky = useAsync(async () => {
    if (!anyLayer) return new Map();
    const { start, end } = calendarGridRange(month);
    return deferred(() => skyForRange(start, end, tz, HEMISPHERE, layers));
  }, [month.getTime(), tz, layers.moons, layers.esbats, layers.sabbats, layers.voc]);
  const sky = monthSky.status === 'success' ? monthSky.data : undefined;

  const todaySky = useAsync(
    () =>
      view === 'hoy'
        ? deferred(() => skyForRange(today, today, tz, HEMISPHERE, ALL_LAYERS))
        : Promise.resolve(null),
    [view, dayKey(today), tz],
  );

  const markers = useMemo(() => {
    const map = new Map<string, DayMarker[]>();
    const add = (key: string, color: string) => map.set(key, [...(map.get(key) ?? []), { color }]);
    for (const e of events) add(dayKeyInZone(e.startAt, e.timeZone), eventKind(e.kind).color);
    for (const r of followUps) add(dayKeyInZone(r.followUpAt!, tz), NOTE_FOLLOWUP_COLOR);
    return map;
  }, [events, followUps, tz]);

  const shownDay = view === 'hoy' ? today : selected;
  const shownKey = dayKey(shownDay);
  const dayEvents = events.filter((e) => dayKeyInZone(e.startAt, e.timeZone) === shownKey);
  const dayNotes = followUps.filter((r) => dayKeyInZone(r.followUpAt!, tz) === shownKey);
  const shownSky =
    view === 'hoy'
      ? todaySky.status === 'success'
        ? todaySky.data?.get(shownKey)
        : undefined
      : sky?.get(shownKey);

  const goToday = () => {
    setMonth(startOfMonth(today));
    setSelected(today);
  };

  return (
    <Page>
      <PageHeader title={UI.pages.agenda.title} subtitle={UI.pages.agenda.subtitle} />

      <div className="agenda-top">
        <div className="agenda-switch" role="group" aria-label="Vista de la agenda">
          {(['hoy', 'mes'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              className={`agenda-switch__btn${view === v ? ' is-active' : ''}`}
              aria-pressed={view === v}
              onClick={() => {
                setView(v);
                if (v === 'hoy') goToday();
              }}
            >
              {v === 'hoy' ? 'Hoy' : 'Mes'}
            </button>
          ))}
        </div>

        <div className="agenda-actions">
          <Link
            to={`/crear/evento?fecha=${shownKey}&tipo=recordatorio`}
            className="btn btn--secondary btn--small"
          >
            <BellPlus size={16} aria-hidden="true" />
            Agregar recordatorio
          </Link>
          <Link to={`/crear/evento?fecha=${shownKey}`} className="btn btn--primary btn--small">
            <CalendarPlus size={16} aria-hidden="true" />
            Nuevo evento
          </Link>
        </div>
      </div>

      {view === 'mes' && (
        <>
          <MagicCalendar
            month={month}
            today={today}
            selected={selected}
            markers={markers}
            onMonthChange={setMonth}
            onSelect={setSelected}
            sky={sky}
            hemisphere={HEMISPHERE}
          />

          <fieldset className="sky-layers">
            <legend>Mostrar en el calendario</legend>
            <div className="sky-layers__grid">
              {LAYER_OPTIONS.map((o) => (
                <label key={o.id} className="sky-layers__item">
                  <input type="checkbox" checked={layers[o.id]} onChange={() => toggleLayer(o.id)} />
                  <span className="sky-layers__swatch" style={{ background: o.swatch }} aria-hidden="true" />
                  {o.label}
                </label>
              ))}
            </div>
            {anyLayer && monthSky.status === 'loading' && (
              <p className="muted small">Calculando el cielo del mes…</p>
            )}
          </fieldset>
        </>
      )}

      <section className="day-detail" aria-live="polite">
        <h2 className="section-title">
          {view === 'hoy' ? 'Hoy, ' : ''}
          {format(shownDay, "EEEE d 'de' MMMM", { locale: es })}
        </h2>
        <SkyDay sky={shownSky} timeZone={tz} />
        {dayEvents.length === 0 && dayNotes.length === 0 ? (
          <EmptyState title="No hay nada agendado este día" />
        ) : (
          <ul className="journal-list">
            {dayEvents.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
            {dayNotes.map((r) => (
              <li key={r.id}>
                <p className="followup-label">
                  <CalendarClock size={14} aria-hidden="true" /> Fecha próxima de una memoria
                </p>
                <JournalCard record={r} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className="legend">
        <summary>Colores de la agenda</summary>
        <ul>
          {EVENT_KINDS.map((k) => (
            <li key={k.id}>
              <span className="calendar__dot" style={{ background: k.color }} aria-hidden="true" /> {k.label}
            </li>
          ))}
          <li>
            <span className="calendar__dot" style={{ background: NOTE_FOLLOWUP_COLOR }} aria-hidden="true" />{' '}
            Fecha próxima de una memoria
          </li>
          {LAYER_OPTIONS.map((o) => (
            <li key={o.id}>
              <span className="sky-layers__swatch" style={{ background: o.swatch }} aria-hidden="true" />{' '}
              {o.label}
            </li>
          ))}
        </ul>
      </details>

      <p className="muted small">
        Hemisferio sur · zona horaria {tz} (puedes cambiarla en Perfil). Fases, lunas llenas, solsticios,
        equinoccios y luna vacía de curso se calculan astronómicamente (precisión de minutos). Los nombres de
        las lunas y las fechas de Imbolc, Beltane, Lughnasadh y Samhain son convenciones tradicionales.
      </p>
    </Page>
  );
}
