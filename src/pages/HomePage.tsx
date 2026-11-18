import { BookOpen, CalendarDays, Feather, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { Page, PageHeader } from '../components/common/Page';
import { MoonPhases } from '../components/ornaments/Ornaments';
import { FAMILIES } from '../config/families';
import { FAMILY_ART } from '../config/illustrations';
import { UI } from '../config/uiCopy';
import { countPersonalEntries } from '../data/repositories/entries';
import { countJournalRecords, listJournalRecords } from '../data/repositories/journal';
import { JournalCard } from '../components/journal/JournalCard';
import { useAsync } from '../hooks/useAsync';
import { EventCard } from '../components/calendar/EventCard';
import { listUpcomingEvents } from '../data/repositories/events';
import { getPreferences } from '../data/repositories/preferences';

/**
 * Inicio (sección 7.2). Sin fase lunar: no hay todavía una fuente
 * astronómica verificada, así que no se muestra ninguna fase ficticia.
 */
export function HomePage() {
  const counts = useAsync(
    async () => ({ entries: await countPersonalEntries(), records: await countJournalRecords() }),
    [],
  );
  const upcoming = useAsync(() => listUpcomingEvents(new Date().toISOString(), 3), []);
  const prefs = useAsync(getPreferences, []);
  const lastRecord = useAsync(async () => (await listJournalRecords())[0], []);
  const isEmpty = counts.status === 'success' && counts.data.entries === 0 && counts.data.records === 0;

  return (
    <Page>
      <PageHeader
        title={UI.pages.home.title}
        subtitle={
          prefs.status === 'success' && prefs.data.displayName
            ? `Bienvenida, ${prefs.data.displayName}. ${UI.pages.home.subtitle}`
            : UI.pages.home.subtitle
        }
        illustration={<MoonPhases className="home-moons" />}
      />

      {isEmpty && (
        <EmptyState
          title={UI.empty.app.title}
          description="Comienza explorando el índice o escribe tu primera página."
          action={
            <Link to="/crear/ficha" className="btn btn--primary">
              <PenLine size={18} aria-hidden="true" />
              {UI.empty.app.action}
            </Link>
          }
        />
      )}

      {prefs.status === 'success' && prefs.data.dedication && (
        <blockquote className="dedication">
          <p>{prefs.data.dedication}</p>
        </blockquote>
      )}

      <nav className="home-paths" aria-labelledby="senderos-titulo">
        <h2 id="senderos-titulo" className="section-title">
          Senderos del grimorio
        </h2>
        <ul className="home-paths__grid">
          {FAMILIES.map((f) => (
            <li key={f.id}>
              <Link to={`/indice?familia=${f.id}`} className="path-tile">
                <img className="path-tile__art" src={FAMILY_ART[f.id].src} alt="" />
                <span className="path-tile__name">{f.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="home-grid">
        <section className="home-card">
          <h2 className="home-card__title">Continuar donde quedaste</h2>
          <p className="home-card__text">El índice guarda el último sendero que visitaste.</p>
          <Link to="/indice" className="btn btn--secondary">
            <BookOpen size={18} aria-hidden="true" />
            Explorar mi grimorio
          </Link>
        </section>

        <section className="home-card">
          <h2 className="home-card__title">Próximos acontecimientos</h2>
          {upcoming.status === 'success' && upcoming.data.length > 0 ? (
            <ul className="journal-list home-card__list">
              {upcoming.data.map((ev) => (
                <li key={ev.id}>
                  <EventCard event={ev} showDate />
                </li>
              ))}
            </ul>
          ) : (
            <p className="home-card__text">Aún no hay eventos próximos en tu agenda.</p>
          )}
          <Link to="/agenda" className="btn btn--secondary">
            <CalendarDays size={18} aria-hidden="true" />
            Abrir agenda
          </Link>
        </section>

        <section className="home-card">
          <h2 className="home-card__title">Mi última página</h2>
          {lastRecord.status === 'success' && lastRecord.data ? (
            <JournalCard record={lastRecord.data} />
          ) : (
            <p className="home-card__text">Tus memorias aparecerán aquí cuando escribas la primera.</p>
          )}
          <Link to="/bitacora" className="btn btn--secondary">
            <Feather size={18} aria-hidden="true" />
            Ver mi bitácora
          </Link>
        </section>

        <section className="home-card home-card--accent">
          <h2 className="home-card__title">Escribir una nueva página</h2>
          <p className="home-card__text">Una ficha, una memoria o un evento.</p>
          <Link to="/crear" className="btn btn--primary">
            <PenLine size={18} aria-hidden="true" />
            Crear
          </Link>
        </section>
      </div>
    </Page>
  );
}
