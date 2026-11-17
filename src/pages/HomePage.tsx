import { BookOpen, CalendarDays, Feather, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { Page, PageHeader } from '../components/common/Page';
import { MoonPhases } from '../components/ornaments/Ornaments';
import { UI } from '../config/uiCopy';
import { countPersonalEntries } from '../data/repositories/entries';
import { countJournalRecords } from '../data/repositories/journal';
import { useAsync } from '../hooks/useAsync';

/**
 * Inicio (sección 7.2). Sin fase lunar: no hay todavía una fuente
 * astronómica verificada, así que no se muestra ninguna fase ficticia.
 */
export function HomePage() {
  const counts = useAsync(
    async () => ({ entries: await countPersonalEntries(), records: await countJournalRecords() }),
    [],
  );
  const isEmpty = counts.status === 'success' && counts.data.entries === 0 && counts.data.records === 0;

  return (
    <Page>
      <PageHeader
        title={UI.pages.home.title}
        subtitle={UI.pages.home.subtitle}
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
          <p className="home-card__text">Aún no hay eventos en tu agenda.</p>
          <Link to="/agenda" className="btn btn--secondary">
            <CalendarDays size={18} aria-hidden="true" />
            Abrir agenda
          </Link>
        </section>

        <section className="home-card">
          <h2 className="home-card__title">Mi última página</h2>
          <p className="home-card__text">Tus memorias aparecerán aquí cuando escribas la primera.</p>
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
