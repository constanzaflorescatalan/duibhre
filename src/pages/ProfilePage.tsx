import { Camera, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Page, PageHeader } from '../components/common/Page';
import { DataSection } from '../components/profile/DataSection';
import { PreferencesForm } from '../components/profile/PreferencesForm';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { getPreferences, removeAvatar, setAvatar } from '../data/repositories/preferences';
import { prepareSquareImage } from '../utils/images';
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
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoMsg, setPhotoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const savedPrefs = prefs.status === 'success' ? prefs.data : undefined;

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoMsg(null);
    const prepared = await prepareSquareImage(file);
    if (!prepared.ok) {
      setPhotoMsg({ ok: false, text: prepared.error });
      return;
    }
    try {
      await setAvatar(prepared.blob);
      setPhotoMsg({ ok: true, text: 'Foto de perfil guardada.' });
      setVersion((v) => v + 1);
    } catch {
      setPhotoMsg({ ok: false, text: 'No se pudo guardar la foto.' });
    }
  };

  return (
    <Page>
      <PageHeader
        title={UI.pages.profile.title}
        subtitle="Mi perfil"
        illustration={
          <ProfileAvatar
            className="profile-avatar--header"
            name={savedPrefs?.displayName}
            avatarBlobId={savedPrefs?.avatarBlobId}
            size={96}
          />
        }
      />

      <div className="avatar-actions">
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={() => photoRef.current?.click()}
        >
          <Camera size={16} aria-hidden="true" />
          {savedPrefs?.avatarBlobId ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {savedPrefs?.avatarBlobId && (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={async () => {
              await removeAvatar();
              setPhotoMsg({ ok: true, text: 'Se quitó la foto: se muestra tu inicial.' });
              setVersion((v) => v + 1);
            }}
          >
            <X size={16} aria-hidden="true" />
            Usar mi inicial
          </button>
        )}
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          tabIndex={-1}
          aria-label="Elegir foto de perfil"
          onChange={(e) => {
            void onPhoto(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        {!savedPrefs?.avatarBlobId && (
          <p className="muted small avatar-actions__hint">
            Sin foto, se muestra la inicial de tu nombre con la letra capitular del grimorio.
          </p>
        )}
        {photoMsg && (
          <p className={photoMsg.ok ? 'success-text' : 'error-text'} role={photoMsg.ok ? 'status' : 'alert'}>
            {photoMsg.text}
          </p>
        )}
      </div>

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
    </Page>
  );
}
