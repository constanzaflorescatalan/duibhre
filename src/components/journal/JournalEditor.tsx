import { CalendarPlus, Link2, Save, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { CHAPTERS } from '../../config/chapters';
import { NOTE_KINDS } from '../../config/noteKinds';
import { RecordValidationError, saveRecord } from '../../data/repositories/journal';
import type { GrimorioEntry, JournalRecord, NoteKind } from '../../types/domain';
import { toDateTimeLocalValue, toDateValue } from '../../utils/dates';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface FormState {
  kind: NoteKind;
  title: string;
  date: string;
  body: string;
  mood: string;
  tags: string;
  linkedEntryIds: string[];
  followUp: string;
}

function toState(record: JournalRecord | undefined, linkedEntryId?: string, kind?: NoteKind): FormState {
  return {
    kind: record?.kind ?? kind ?? 'otro',
    title: record?.title ?? '',
    date: toDateTimeLocalValue(record ? new Date(record.date) : new Date()),
    body: record?.body ?? '',
    mood: record?.mood ?? '',
    tags: (record?.tags ?? []).join(', '),
    linkedEntryIds: record?.linkedEntryIds ?? (linkedEntryId ? [linkedEntryId] : []),
    followUp: record?.followUpAt ? toDateValue(new Date(record.followUpAt)) : '',
  };
}

interface Props {
  record?: JournalRecord;
  entries: GrimorioEntry[];
  initialLinkedEntryId?: string;
  initialKind?: NoteKind;
  onCancel: () => void;
}

/** «Dejar una memoria» (sección 7.8): un solo registro, vinculable a varias fichas. */
export function JournalEditor({ record, entries, initialLinkedEntryId, initialKind, onCancel }: Props) {
  const navigate = useNavigate();
  const initial = useMemo(
    () => toState(record, initialLinkedEntryId, initialKind),
    [record, initialLinkedEntryId, initialKind],
  );
  const [state, setState] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showLinker, setShowLinker] = useState(false);
  const leavingRef = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);

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

  const entryById = new Map(entries.map((e) => [e.id, e]));
  const available = entries.filter((e) => !state.linkedEntryIds.includes(e.id));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSaveError(null);
    try {
      const saved = await saveRecord({
        id: record?.id,
        input: {
          kind: state.kind,
          title: state.title,
          body: state.body,
          date: state.date,
          linkedEntryIds: state.linkedEntryIds,
          tags: state.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          mood: state.mood.trim() || undefined,
          followUpAt: state.followUp ? `${state.followUp}T09:00` : undefined,
        },
      });
      leavingRef.current = true;
      navigate(`/bitacora/${saved.id}`, { replace: true, state: { saved: true } });
    } catch (err) {
      if (err instanceof RecordValidationError) {
        setErrors(err.fieldErrors);
        if (err.fieldErrors.title) titleRef.current?.focus();
      } else {
        setSaveError(
          `No se pudo guardar${err instanceof Error ? `: ${err.message}` : ''}. Tu memoria sigue aquí; puedes reintentar.`,
        );
      }
      setSaving(false);
    }
  };

  return (
    <form className="entry-form" onSubmit={onSubmit} noValidate>
      <div className="form-section">
        <label className="form-field">
          <span className="form-field__label">Título (obligatorio)</span>
          <input
            ref={titleRef}
            className="input"
            value={state.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'error-titulo-memoria' : undefined}
          />
          {errors.title && (
            <span id="error-titulo-memoria" className="error-text" role="alert">
              {errors.title}
            </span>
          )}
        </label>

        <div className="form-row">
          <label className="form-field">
            <span className="form-field__label">Tipo</span>
            <select
              className="input"
              value={state.kind}
              onChange={(e) => set('kind', e.target.value as NoteKind)}
            >
              {NOTE_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span className="form-field__label">Fecha y hora</span>
            <input
              type="datetime-local"
              className="input"
              value={state.date}
              onChange={(e) => set('date', e.target.value)}
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </label>
        </div>

        <label className="form-field">
          <span className="form-field__label">Lo que viviste, soñaste o aprendiste</span>
          <textarea
            className="input input--journal"
            rows={8}
            value={state.body}
            onChange={(e) => set('body', e.target.value)}
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">Emociones o estado de ánimo (opcional)</span>
          <input className="input" value={state.mood} onChange={(e) => set('mood', e.target.value)} />
        </label>
        <label className="form-field">
          <span className="form-field__label">Etiquetas (separadas por comas)</span>
          <input className="input" value={state.tags} onChange={(e) => set('tags', e.target.value)} />
        </label>
      </div>

      <div className="form-section">
        <p className="form-section__heading">Fichas relacionadas</p>
        <p className="muted small">
          La memoria se guarda una sola vez: aparecerá en la Bitácora y también en cada ficha que vincules.
        </p>
        {state.linkedEntryIds.length > 0 && (
          <ul className="linked-list">
            {state.linkedEntryIds.map((id) => (
              <li key={id} className="linked-chip">
                <span>{entryById.get(id)?.title ?? 'Ficha eliminada'}</span>
                <button
                  type="button"
                  className="icon-btn icon-btn--ink"
                  aria-label={`Desvincular ${entryById.get(id)?.title ?? 'ficha'}`}
                  onClick={() =>
                    set(
                      'linkedEntryIds',
                      state.linkedEntryIds.filter((x) => x !== id),
                    )
                  }
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {showLinker ? (
          <label className="form-field">
            <span className="form-field__label">Elegir ficha</span>
            <select
              className="input"
              value=""
              onChange={(e) => {
                if (e.target.value) set('linkedEntryIds', [...state.linkedEntryIds, e.target.value]);
                setShowLinker(false);
              }}
            >
              <option value="">Selecciona una ficha…</option>
              {CHAPTERS.map((c) => {
                const options = available.filter((e) => e.chapterId === c.id);
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
        ) : (
          <button
            type="button"
            className="btn btn--secondary btn--small"
            onClick={() => setShowLinker(true)}
            disabled={available.length === 0}
          >
            <Link2 size={16} aria-hidden="true" />
            Vincular ficha
          </button>
        )}
      </div>

      <div className="form-section">
        <label className="form-field">
          <span className="form-field__label">
            <CalendarPlus size={14} aria-hidden="true" /> Fecha próxima (opcional)
          </span>
          <input
            type="date"
            className="input"
            value={state.followUp}
            onChange={(e) => set('followUp', e.target.value)}
          />
        </label>
        <p className="muted small">
          Queda anotada en la memoria. Mostrarla en la Agenda llegará en la Etapa 3.
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
            {saving ? 'Guardando…' : 'Guardar en bitácora'}
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
        title="¿Descartar esta memoria?"
        message="Hay cambios sin guardar. Si sales ahora se perderán."
        confirmLabel="Descartar cambios"
        cancelLabel="Seguir escribiendo"
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
