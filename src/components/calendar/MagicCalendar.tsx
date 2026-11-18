import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dayKey } from '../../utils/dates';

const WEEKDAYS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];

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
}

/** Vista mensual (semana comienza el lunes, es-CL). */
export function MagicCalendar({ month, today, selected, markers, onMonthChange, onSelect }: Props) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
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
              const classes = [
                'calendar__day',
                !isSameMonth(day, month) && 'is-outside',
                isSameDay(day, today) && 'is-today',
                isSameDay(day, selected) && 'is-selected',
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
                  aria-label={`${format(day, "EEEE d 'de' MMMM", { locale: es })}${marks.length ? `, ${marks.length} ${marks.length === 1 ? 'elemento' : 'elementos'}` : ''}`}
                  onClick={() => onSelect(day)}
                >
                  {format(day, 'd')}
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
