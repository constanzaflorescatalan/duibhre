import { UserRound } from 'lucide-react';
import { useState } from 'react';
import { Page, PageHeader } from '../components/common/Page';
import { DataSection } from '../components/profile/DataSection';
import { StageNotice } from '../components/common/StageNotice';
import { UI } from '../config/uiCopy';
import { countFavorites, countPersonalEntries } from '../data/repositories/entries';
import { countEvents } from '../data/repositories/events';
import { countJournalRecords } from '../data/repositories/journal';
import { useAsync } from '../hooks/useAsync';
import { DEFAULT_TIME_ZONE } from '../utils/dates';
import { isReduceMotionOn, setReduceMotion } from '../utils/accessibility';

/** Perfil `/perfil` (secciones 7.11 y 11). Espacio privado, no red social. */
export function ProfilePage() {
  const [version, setVersion] = useState(0);
  const stats = useAsync(
    async () => ({
      entries: await countPersonalEntries(),
      records: await countJournalRecords(),
      favorites: await countFavorites(),
      events: await countEvents(),
    }),
    [version],
  );
  const [reduceMotion, setReduce] = useState(isReduceMotionOn());

  return (
    <Page>
      <PageHeader
        title={UI.pages.profile.title}
        subtitle="Mi perfil"
        illustration={
          <span className="avatar-seal" aria-hidden="true">
            <UserRound size={34} strokeWidth={1.3} />
          </span>
        }
      />

      <section className="profile-section">
        <h2 className="section-title">Identidad del grimorio</h2>
        <p className="muted">Aún no has elegido un alias, sello ni dedicatoria.</p>
        <button type="button" className="btn btn--secondary" disabled title={UI.stage2}>
          Editar mi perfil
        </button>
      </section>

      <section className="profile-section">
        <h2 className="section-title">Mi archivo</h2>
        {stats.status === 'success' ? (
          <dl className="stats">
            <div>
              <dt>Fichas</dt>
              <dd>{stats.data.entries}</dd>
            </div>
            <div>
              <dt>Memorias</dt>
              <dd>{stats.data.records}</dd>
            </div>
            <div>
              <dt>Favoritos</dt>
              <dd>{stats.data.favorites}</dd>
            </div>
            <div>
              <dt>Eventos</dt>
              <dd>{stats.data.events}</dd>
            </div>
          </dl>
        ) : stats.status === 'error' ? (
          <p className="error-text">No se pudo leer el archivo local: {stats.error.message}</p>
        ) : (
          <p className="muted" role="status">
            Contando páginas…
          </p>
        )}
      </section>

      <section className="profile-section">
        <h2 className="section-title">Preferencias</h2>
        <dl className="pref-list">
          <div>
            <dt>Idioma</dt>
            <dd>Español de Chile</dd>
          </div>
          <div>
            <dt>Hemisferio</dt>
            <dd>Sur</dd>
          </div>
          <div>
            <dt>Zona horaria</dt>
            <dd>{DEFAULT_TIME_ZONE}</dd>
          </div>
          <div>
            <dt>Tema</dt>
            <dd>Cuero oscuro</dd>
          </div>
        </dl>
        <label className="switch">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => {
              setReduceMotion(e.target.checked);
              setReduce(e.target.checked);
            }}
          />
          <span>Reducir animaciones</span>
        </label>
        <p className="muted small">
          «Reducir animaciones» se aplica de inmediato. Editar hemisferio, zona horaria y formato de fecha
          llega en la Etapa 3.
        </p>
      </section>

      <DataSection onChanged={() => setVersion((v) => v + 1)} />

      <section className="profile-section">
        <h2 className="section-title">Ilustraciones</h2>
        <p className="muted">
          Ninguna foto se sube a servicios externos. Cuando exista la transformación ilustrada, se pedirá tu
          consentimiento antes de enviar cualquier imagen.
        </p>
      </section>

      <StageNotice stage={4}>
        Cuentas, inicio de sesión y sincronización entre dispositivos llegarán más adelante. Hoy no existe
        ninguna cuenta.
      </StageNotice>
    </Page>
  );
}
