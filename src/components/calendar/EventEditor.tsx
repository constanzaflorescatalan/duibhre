import { Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { CHAPTERS } from '../../config/chapters';
import { EVENT_KINDS } from '../../config/eventKinds';
import { EventValidationError, saveEvent } from '../../data/repositories/events';
import type { CalendarEvent, EventKind, GrimorioEntry, JournalRecord } from '../../types/domain';
import { availableTimeZones, utcToWallTime } from '../../utils/timezone';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface FormState {
  title: string;
  kind: EventKind;
  start: string;
  end: string;
  timeZone: string;
  linkedEntryId: string;
  linkedRecordId: string;
  notes: string;
  remind: string;
}

interface Props {
  event?: CalendarEvent;
  defaults: Partial<FormState> & { timeZone: string; start: string };
  entries: GrimorioEntry[];
  records: JournalRecord[];
  onCancel: () => void;
}

function toState(event: CalendarEvent | undefined, defaults: Props['defaults']): FormState {
  if (event) {
    const tz = event.timeZone;
    return {
      title: event.title,
      kind: event.kind,
      start: utcToWallTime(event.startAt, tz),
      end: event.endAt ? utcToWallTime(event.endAt, tz) : '',
      timeZone: tz,
      linkedEntryId: event.linkedEntryId ?? '',
      linkedRecordId: event.linkedRecordId ?? '',
      notes: event.notes ?? '',
      remind: event.remindAt ? utcToWallTime(event.remindAt, tz) : '',
    };
  }
  return {
    title: '',
    kind: 'ritual',
    end: '',
    linkedEntryId: '',
    linkedRecordId: '',
    notes: '',
    remind: '',
    ...defaults,
  };
}

/** «Nuevo evento o recordatorio» (sección 7.9). */
export function EventEditor({ event, defaults, entries, records, onCancel }: Props) {
  const navigate = useNavigate();
  const initial = useMemo(() => toState(event, defaults), [event, defaults]);
  const [state, setState] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const leavingRef = useRef(false);
  const timeZones = useMemo(() => availableTimeZones(), []);

  const dirty = JSON.stringify(state) !== JSON.stringify(initial);
  const blocker = useBlocker(() => dirty && !leavingRef.current);
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSaveError(null);
    try {
      const saved = await saveEvent({
        id: event?.id,
        input: {
          title: state.title,
          kind: state.kind,
          start: state.start,
          end: state.end || undefined,
          timeZone: state.timeZone,
          linkedEntryId: state.linkedEntryId || undefined,
          linkedRecordId: state.linkedRecordId || undefined,
          notes: state.notes || undefined,
          remind: state.remind || undefined,
        },
      });
      leavingRef.current = true;
      navigate(`/agenda/eventos/${saved.id}`, { replace: true, state: { saved: true } });
    } catch (err) {
      if (err instanceof EventValidationError) setErrors(err.fieldErrors);
      else
        setSaveError(
          `No se pudo guardar${err instanceof Error ? `: ${err.message}` : ''}. Tus datos siguen aquí; puedes reintentar.`,
        );
      setSaving(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? (
      <span className="error-text" role="alert">
        {errors[key]}
      </span>
    ) : null;

  return (
    <form className="entry-form" onSubmit={onSubmit} noValidate>
      <div className="form-section">
        <label className="form-field">
          <span className="form-field__label">Título (obligatorio)</span>
          <input
            className="input"
            value={state.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={Boolean(errors.title)}
          />
          {fieldError('title')}
        </label>
        <label className="form-field">
          <span className="form-field__label">Tipo</span>
          <select
            className="input"
            value={state.kind}
            onChange={(e) => set('kind', e.target.value as EventKind)}
          >
            {EVENT_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        {(state.kind === 'sabbat' || state.kind === 'esbat' || state.kind === 'lunar') && (
          <p className="content-note small">
            Las fechas de celebraciones y fases dependen de tu hemisferio y tradición. Revísalas en una fuente
            confiable antes de agendarlas; la app no las calcula.
          </p>
        )}
        <div className="form-row">
          <label className="form-field">
            <span className="form-field__label">Inicio</span>
            <input
              type="datetime-local"
              className="input"
              value={state.start}
              onChange={(e) => set('start', e.target.value)}
              aria-invalid={Boolean(errors.start)}
            />
            {fieldError('start')}
          </label>
          <label className="form-field">
            <span className="form-field__label">Término (opcional)</span>
            <input
              type="datetime-local"
              className="input"
              value={state.end}
              onChange={(e) => set('end', e.target.value)}
              aria-invalid={Boolean(errors.end)}
            />
            {fieldError('end')}
          </label>
        </div>
        <label className="form-field">
          <span className="form-field__label">Zona horaria</span>
          <select className="input" value={state.timeZone} onChange={(e) => set('timeZone', e.target.value)}>
            {timeZones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-section">
        <p className="form-section__heading">Vínculos</p>
        <label className="form-field">
          <span className="form-field__label">Ficha relacionada</span>
          <select
            className="input"
            value={state.linkedEntryId}
            onChange={(e) => set('linkedEntryId', e.target.value)}
          >
            <option value="">Sin ficha</option>
            {CHAPTERS.map((c) => {
              const options = entries.filter((e) => e.chapterId === c.id);
              return options.length ? (
                <optgroup key={c.id} label={`${c.romanNumeral} · ${c.title}`}>
                  {options.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                      {e.origin === 'seed' ? ' (ejemplo)' : ''}
                    </option>
                  ))}
                </optgroup>
              ) : null;
            })}
          </select>
        </label>
        <label className="form-field">
          <span className="form-field__label">Memoria relacionada</span>
          <select
            className="input"
            value={state.linkedRecordId}
            onChange={(e) => set('linkedRecordId', e.target.value)}
          >
            <option value="">Sin memoria</option>
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-section">
        <label className="form-field">
          <span className="form-field__label">Notas</span>
          <textarea
            className="input"
            rows={3}
            value={state.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">Recordatorio (opcional)</span>
          <input
            type="datetime-local"
            className="input"
            value={state.remind}
            onChange={(e) => set('remind', e.target.value)}
          />
        </label>
        <p className="muted small">
          El recordatorio queda anotado en el evento. Las notificaciones del teléfono no están activas
          todavía.
        </p>
      </div>

      <div className="form-section form-section--actions">
        {saveError && (
          <p className="error-text" role="alert">
            {saveError}
          </p>
        )}
        <div className="button-row">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            <Save size={18} aria-hidden="true" />
            {saving ? 'Guardando…' : 'Guardar evento'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={saving}
            onClick={() => (dirty ? setConfirmCancel(true) : onCancel())}
          >
            Cancelar
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel || blocker.state === 'blocked'}
        title="¿Descartar este evento?"
        message="Hay cambios sin guardar. Si sales ahora se perderán."
        confirmLabel="Descartar cambios"
        cancelLabel="Seguir editando"
        danger
        onConfirm={() => {
          leavingRef.current = true;
          setConfirmCancel(false);
          if (blocker.state === 'blocked') blocker.proceed();
          else onCancel();
        }}
        onCancel={() => {
          setConfirmCancel(false);
          if (blocker.state === 'blocked') blocker.reset();
        }}
      />
    </form>
  );
}
