import { endOfMonth, format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagicCalendar } from '../components/calendar/MagicCalendar';
import { EmptyState } from '../components/common/EmptyState';
import { Page, PageHeader } from '../components/common/Page';
import { UI } from '../config/uiCopy';
import { listEventsBetween } from '../data/repositories/events';
import { useAsync } from '../hooks/useAsync';
import { DEFAULT_TIME_ZONE, todayInTimeZone } from '../utils/dates';

/**
 * Agenda `/agenda` (sección 7.9). El calendario mensual funciona; solo muestra
 * eventos reales guardados. No se cargan sabbats ni fases lunares: requieren
 * una fuente revisada y configuración de hemisferio/tradición (Etapa 3).
 */
export function AgendaPage() {
  const today = todayInTimeZone(DEFAULT_TIME_ZONE);
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(today);

  const events = useAsync(
    () => listEventsBetween(startOfMonth(month).toISOString(), endOfMonth(month).toISOString()),
    [month.getTime()],
  );
  const list = events.status === 'success' ? events.data : [];

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
        <Link to="/crear/evento" className="btn btn--primary btn--small">
          <CalendarPlus size={16} aria-hidden="true" />
          Nuevo evento
        </Link>
      </div>

      <MagicCalendar
        month={month}
        today={today}
        selected={selected}
        events={list}
        onMonthChange={setMonth}
        onSelect={setSelected}
      />

      <section className="day-detail" aria-live="polite">
        <h2 className="section-title">{format(selected, "EEEE d 'de' MMMM", { locale: es })}</h2>
        <EmptyState title="No hay eventos para este día" />
      </section>

      <p className="muted small">
        Hemisferio sur · zona horaria {DEFAULT_TIME_ZONE} (editable en Perfil en la Etapa 3). Las
        celebraciones y fases lunares solo aparecerán cuando provengan de una fuente verificada o de tu propia
        configuración.
      </p>
    </Page>
  );
}
