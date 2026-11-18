import { addMonths, eachDayOfInterval, format, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Hemisphere } from '../../types/domain';
import { PHASE_LABELS } from '../../utils/astro';
import { dayKey } from '../../utils/dates';
import { calendarGridRange, type DaySky } from '../../utils/sky';
import { MoonIcon } from './MoonIcon';

const WEEKDAYS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];
/** El día de una fase principal se dibuja con su forma exacta. */
const QUARTER_ANGLE: Record<string, number> = {
  nueva: 0,
  'cuarto-creciente': 90,
  llena: 180,
  'cuarto-menguante': 270,
};

export interface DayMarker {
  color: string;
}

interface Props {
  month: Date;
  today: Date;
  selected: Date;
  /** Marcas por día civil «YYYY-MM-DD» (ya calculado en la zona de cada evento). */
  markers: Map<string, DayMarker[]>;
  onMonthChange: (d: Date) => void;
  onSelect: (d: Date) => void;
  /** Capas del cielo por día civil (fases, esbats, sabbats, luna vacía). */
  sky?: Map<string, DaySky>;
  hemisphere?: Hemisphere;
}

function skyLabel(day: DaySky | undefined): string {
  if (!day) return '';
  const parts: string[] = [];
  if (day.quarter) parts.push(PHASE_LABELS[day.quarter.key]);
  for (const s of day.sabbats) parts.push(`sabbat ${s.name}`);
  for (const e of day.esbats) parts.push(`esbat, ${e.name}`);
  if (day.voc.length) parts.push('luna vacía de curso');
  return parts.length ? `, ${parts.join(', ')}` : '';
}

/** Vista mensual (semana comienza el lunes, es-CL). */
export function MagicCalendar({
  month,
  today,
  selected,
  markers,
  onMonthChange,
  onSelect,
  sky,
  hemisphere = 'south',
}: Props) {
  const days = eachDayOfInterval(calendarGridRange(month));
  const label = format(month, 'MMMM yyyy', { locale: es });

  return (
    <div className="calendar">
      <div className="calendar__head">
        <button
          type="button"
          className="icon-btn icon-btn--ink"
          onClick={() => onMonthChange(addMonths(month, -1))}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h2 className="calendar__month" aria-live="polite">
          {label}
        </h2>
        <button
          type="button"
          className="icon-btn icon-btn--ink"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="calendar__grid" role="grid" aria-label={`Calendario de ${label}`}>
        <div role="row" className="calendar__row">
          {WEEKDAYS.map((d) => (
            <span key={d} role="columnheader" className="calendar__weekday">
              {d}
            </span>
          ))}
        </div>
        {Array.from({ length: days.length / 7 }, (_, w) => (
          <div role="row" className="calendar__row" key={w}>
            {days.slice(w * 7, w * 7 + 7).map((day) => {
              const marks = markers.get(dayKey(day)) ?? [];
              const daySky = sky?.get(dayKey(day));
              const sabbat = daySky?.sabbats[0];
              const esbat = daySky?.esbats[0];
              const classes = [
                'calendar__day',
                !isSameMonth(day, month) && 'is-outside',
                isSameDay(day, today) && 'is-today',
                isSameDay(day, selected) && 'is-selected',
                sabbat && 'is-sabbat',
                esbat && 'is-esbat',
                daySky?.voc.length && 'has-voc',
                daySky?.quarter && 'has-quarter',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  role="gridcell"
                  className={classes}
                  aria-selected={isSameDay(day, selected)}
                  aria-current={isSameDay(day, today) ? 'date' : undefined}
                  aria-label={`${format(day, "EEEE d 'de' MMMM", { locale: es })}${marks.length ? `, ${marks.length} ${marks.length === 1 ? 'elemento' : 'elementos'}` : ''}${skyLabel(daySky)}`}
                  onClick={() => onSelect(day)}
                >
                  <span className="calendar__num">{format(day, 'd')}</span>
                  {daySky?.moon && (
                    <MoonIcon
                      className="calendar__moon"
                      angle={daySky.quarter ? QUARTER_ANGLE[daySky.quarter.key] : daySky.moon.angle}
                      hemisphere={hemisphere}
                      size={daySky.quarter ? 17 : 14}
                    />
                  )}
                  {(sabbat || esbat) && (
                    <span className="calendar__sky-label" aria-hidden="true">
                      {sabbat ? sabbat.name : 'Esbat'}
                    </span>
                  )}
                  {daySky?.voc.length ? <span className="calendar__voc" aria-hidden="true" /> : null}
                  {marks.length > 0 && (
                    <span className="calendar__dots" aria-hidden="true">
                      {marks.slice(0, 3).map((m, i) => (
                        <span key={i} className="calendar__dot" style={{ background: m.color }} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
