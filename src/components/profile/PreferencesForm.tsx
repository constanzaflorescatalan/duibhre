import { Save } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { savePreferences } from '../../data/repositories/preferences';
import type { Preferences } from '../../types/domain';
import { availableTimeZones } from '../../utils/timezone';
import { Link } from 'react-router-dom';
import { DictationButton } from '../common/DictationButton';

/** Identidad (alias y dedicatoria) y preferencias de agenda (secciones 7.11 y 11). */
export function PreferencesForm({ prefs, onSaved }: { prefs: Preferences; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(prefs.displayName ?? '');
  const [dedication, setDedication] = useState(prefs.dedication ?? '');
  const [timeZone, setTimeZone] = useState(prefs.timeZone);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const zones = useMemo(() => availableTimeZones(), []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await savePreferences({
        displayName,
        dedication,
        // Este grimorio se usa solo en el hemisferio sur.
        hemisphere: 'south',
        timeZone,
        // El estilo de ilustración ya está definido (tinta y acuarela del grimorio); se conserva el guardado.
        preferredIllustrationStyle: prefs.preferredIllustrationStyle,
      });
      setStatus({ ok: true, text: 'Preferencias guardadas.' });
      onSaved();
    } catch (err) {
      setStatus({ ok: false, text: err instanceof Error ? err.message : 'No se pudieron guardar.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <section className="profile-section">
        <h2 className="section-title">Identidad del grimorio</h2>
        <label className="form-field">
          <span className="form-field__label">Alias o nombre elegido (se muestra en Inicio)</span>
          <input
            className="input"
            maxLength={60}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">
            Dedicatoria del libro (página interior, nunca en la portada)
          </span>
          <textarea
            className="input input--journal"
            rows={5}
            maxLength={500}
            value={dedication}
            onChange={(e) => setDedication(e.target.value)}
          />
        </label>
        <div className="field-actions">
          <DictationButton
            label="Dictar dedicatoria"
            value={dedication}
            onChange={setDedication}
            maxLength={500}
          />
          <Link to="/dedicatoria" className="btn btn--ghost btn--small">
            Ver la página de dedicatoria
          </Link>
        </div>
      </section>

      <section className="profile-section">
        <h2 className="section-title">Preferencias</h2>
        <label className="form-field">
          <span className="form-field__label">Zona horaria de la agenda</span>
          <select className="input" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
        <dl className="pref-list">
          <div>
            <dt>Hemisferio</dt>
            <dd>Sur (lunas, esbats y sabbats se calculan para el sur)</dd>
          </div>
          <div>
            <dt>Idioma</dt>
            <dd>Español de Chile</dd>
          </div>
        </dl>
        {status && (
          <p className={status.ok ? 'success-text' : 'error-text'} role={status.ok ? 'status' : 'alert'}>
            {status.text}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={saving}>
          <Save size={18} aria-hidden="true" />
          Guardar preferencias
        </button>
      </section>
    </form>
  );
}
