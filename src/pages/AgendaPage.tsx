import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { BellPlus, CalendarClock, CalendarPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EventCard } from '../components/calendar/EventCard';
import { MagicCalendar, type DayMarker } from '../components/calendar/MagicCalendar';
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
import { dayKeyInZone } from '../utils/timezone';

type View = 'mes' | 'lista';

/**
 * Agenda `/agenda` (sección 7.9): eventos propios y fechas próximas de las
 * memorias, mostrados sin copiarlos. No se calculan celebraciones ni fases.
 */
export function AgendaPage() {
  const prefsState = useAsync(getPreferences, []);
  const tz = prefsState.status === 'success' ? prefsState.data.timeZone : 'America/Santiago';
  const today = todayInTimeZone(tz);
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState<View>('mes');

  const data = useAsync(async () => {
    // Un día de margen a cada lado: el día civil depende de la zona de cada evento.
    const from = addDays(startOfMonth(month), -1).toISOString();
    const to = addDays(endOfMonth(month), 2).toISOString();
    const [events, records] = await Promise.all([listEventsBetween(from, to), listJournalRecords()]);
    return { events, followUps: records.filter((r) => r.followUpAt) };
  }, [month.getTime()]);

  const events = useMemo(() => (data.status === 'success' ? data.data.events : []), [data]);
  const followUps = useMemo(() => (data.status === 'success' ? data.data.followUps : []), [data]);

  const markers = useMemo(() => {
    const map = new Map<string, DayMarker[]>();
    const add = (key: string, color: string) => map.set(key, [...(map.get(key) ?? []), { color }]);
    for (const e of events) add(dayKeyInZone(e.startAt, e.timeZone), eventKind(e.kind).color);
    for (const r of followUps) add(dayKeyInZone(r.followUpAt!, tz), NOTE_FOLLOWUP_COLOR);
    return map;
  }, [events, followUps, tz]);

  const selectedKey = dayKey(selected);
  const dayEvents = events.filter((e) => dayKeyInZone(e.startAt, e.timeZone) === selectedKey);
  const dayNotes = followUps.filter((r) => dayKeyInZone(r.followUpAt!, tz) === selectedKey);
  const monthKey = format(month, 'yyyy-MM');
  const monthEvents = events.filter((e) => dayKeyInZone(e.startAt, e.timeZone).startsWith(monthKey));

  return (
    <Page>
      <PageHeader title={UI.pages.agenda.title} subtitle={UI.pages.agenda.subtitle} />

      <div className="button-row">
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={() => {
            setMonth(startOfMonth(today));
            setSelected(today);
          }}
        >
          Hoy
        </button>
        <Link to={`/crear/evento?fecha=${selectedKey}`} className="btn btn--primary btn--small">
          <CalendarPlus size={16} aria-hidden="true" />
          Nuevo evento
        </Link>
        <Link
          to={`/crear/evento?fecha=${selectedKey}&tipo=recordatorio`}
          className="btn btn--secondary btn--small"
        >
          <BellPlus size={16} aria-hidden="true" />
          Agregar recordatorio
        </Link>
      </div>

      <div className="chips" role="group" aria-label="Vista de la agenda">
        {(['mes', 'lista'] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            className={`chip${view === v ? ' is-active' : ''}`}
            aria-pressed={view === v}
            onClick={() => setView(v)}
          >
            {v === 'mes' ? 'Mes' : 'Lista del mes'}
          </button>
        ))}
      </div>

      {view === 'mes' ? (
        <>
          <MagicCalendar
            month={month}
            today={today}
            selected={selected}
            markers={markers}
            onMonthChange={setMonth}
            onSelect={setSelected}
          />

          <section className="day-detail" aria-live="polite">
            <h2 className="section-title">{format(selected, "EEEE d 'de' MMMM", { locale: es })}</h2>
            {dayEvents.length === 0 && dayNotes.length === 0 ? (
              <EmptyState
                title="No hay nada agendado este día"
                action={
                  <Link to={`/crear/evento?fecha=${selectedKey}`} className="btn btn--primary btn--small">
                    Agendar algo este día
                  </Link>
                }
              />
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
        </>
      ) : (
        <section aria-label={`Eventos de ${format(month, 'MMMM yyyy', { locale: es })}`}>
          <div className="calendar__head">
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => setMonth(startOfMonth(addDays(month, -1)))}
            >
              ‹ Mes anterior
            </button>
            <h2 className="calendar__month">{format(month, 'MMMM yyyy', { locale: es })}</h2>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => setMonth(startOfMonth(addDays(endOfMonth(month), 1)))}
            >
              Mes siguiente ›
            </button>
          </div>
          {monthEvents.length > 0 ? (
            <ul className="journal-list">
              {monthEvents.map((e) => (
                <li key={e.id}>
                  <EventCard event={e} showDate />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No hay eventos este mes" />
          )}
        </section>
      )}

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
        </ul>
      </details>

      <p className="muted small">
        Hemisferio{' '}
        {prefsState.status === 'success' && prefsState.data.hemisphere === 'north' ? 'norte' : 'sur'} · zona
        horaria {tz} (puedes cambiarlos en Perfil). La app no calcula sabbats ni fases lunares: agéndalos tú a
        partir de una fuente confiable.
      </p>
    </Page>
  );
}
