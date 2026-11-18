import { UserRound } from 'lucide-react';
import { useState } from 'react';
import { Page, PageHeader } from '../components/common/Page';
import { DataSection } from '../components/profile/DataSection';
import { PreferencesForm } from '../components/profile/PreferencesForm';
import { getPreferences } from '../data/repositories/preferences';
import { StageNotice } from '../components/common/StageNotice';
import { UI } from '../config/uiCopy';
import { countFavorites, countPersonalEntries } from '../data/repositories/entries';
import { countEvents } from '../data/repositories/events';
import { countJournalRecords } from '../data/repositories/journal';
import { useAsync } from '../hooks/useAsync';
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
  const prefs = useAsync(getPreferences, [version]);
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

      {prefs.status === 'success' && (
        <PreferencesForm prefs={prefs.data} onSaved={() => setVersion((v) => v + 1)} />
      )}

      <section className="profile-section">
        <h2 className="section-title">Accesibilidad</h2>
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
        <p className="muted small">Se aplica de inmediato en este dispositivo.</p>
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
