import { ChevronRight, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventKind } from '../../config/eventKinds';
import type { CalendarEvent } from '../../types/domain';
import { formatInZone, formatTimeInZone } from '../../utils/timezone';

/** Evento en listas de Agenda, Inicio y fichas. */
export function EventCard({ event, showDate = false }: { event: CalendarEvent; showDate?: boolean }) {
  const kind = eventKind(event.kind);
  const linked = Number(Boolean(event.linkedEntryId)) + Number(Boolean(event.linkedRecordId));
  return (
    <Link to={`/agenda/eventos/${event.id}`} className="event-card" style={{ borderLeftColor: kind.color }}>
      <span className="event-card__time">
        {showDate
          ? formatInZone(event.startAt, event.timeZone, true)
          : formatTimeInZone(event.startAt, event.timeZone)}
      </span>
      <span className="event-card__title">{event.title}</span>
      <span className="event-card__meta">
        <span className="tag" style={{ borderColor: kind.color, color: kind.color }}>
          {kind.label}
        </span>
        {linked > 0 && (
          <span className="event-card__links">
            <Link2 size={14} aria-hidden="true" />
            {linked === 1 ? '1 vínculo' : `${linked} vínculos`}
          </span>
        )}
      </span>
      <ChevronRight className="event-card__arrow" size={18} aria-hidden="true" />
    </Link>
  );
}
