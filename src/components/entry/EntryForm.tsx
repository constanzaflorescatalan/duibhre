import { AlertTriangle, Save, FilePen } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { CHAPTERS, getChapter, getChaptersByFamily } from '../../config/chapters';
import { ENTRY_TEMPLATES, type TemplateField } from '../../config/entryTemplates';
import { FAMILIES } from '../../config/families';
import { saveEntry, ValidationError, type EntryInput } from '../../data/repositories/entries';
import type { ChapterId, GrimorioEntry } from '../../types/domain';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { IllustrationTransform } from '../media/IllustrationTransform';
import { PhotoUploader, type FormImage } from '../media/PhotoUploader';
import { EntryLinker } from './EntryLinker';

/** Estado del formulario: todo como texto; las listas, una línea por elemento. */
interface FormState {
  chapterId: ChapterId;
  subtopicId: string;
  title: string;
  description: string;
  tags: string;
  sources: string;
  notes: string;
  related: string[];
  extra: Record<string, string>;
}

const NOTES_KEY = 'personalNotes';
const isListField = (f: TemplateField) => f.kind === 'list' || f.kind === 'steps';

function toFormState(entry: GrimorioEntry | undefined, chapterId: ChapterId, subtopicId: string): FormState {
  const extra: Record<string, string> = {};
  for (const [key, value] of Object.entries(entry?.extraFields ?? {})) {
    if (key === NOTES_KEY) continue;
    extra[key] = Array.isArray(value) ? value.join('\n') : value == null ? '' : String(value);
  }
  return {
    chapterId: entry?.chapterId ?? chapterId,
    subtopicId: entry?.subtopicId ?? subtopicId,
    title: entry?.title ?? '',
    description: entry?.description ?? '',
    tags: (entry?.tags ?? []).join(', '),
    sources: (entry?.sources ?? []).map((s) => (s.url ? `${s.title} | ${s.url}` : s.title)).join('\n'),
    notes: String(entry?.extraFields[NOTES_KEY] ?? ''),
    related: entry?.relatedEntryIds ?? [],
    extra,
  };
}

const lines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

function toInput(state: FormState, status: 'draft' | 'saved'): EntryInput {
  const template = ENTRY_TEMPLATES[getChapter(state.chapterId)!.templateId];
  const extraFields: Record<string, unknown> = {};
  for (const field of template.fields) {
    const raw = state.extra[field.key]?.trim() ?? '';
    if (!raw) continue;
    extraFields[field.key] = isListField(field) ? lines(raw) : raw;
  }
  if (state.notes.trim()) extraFields[NOTES_KEY] = state.notes.trim();
  return {
    chapterId: state.chapterId,
    subtopicId: state.subtopicId || undefined,
    title: state.title,
    description: state.description.trim() || undefined,
    tags: state.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    extraFields,
    sources: lines(state.sources).map((line) => {
      const [title, url] = line.split('|').map((p) => p.trim());
      return url ? { title, url } : { title };
    }),
    status,
    relatedEntryIds: state.related,
  };
}

interface Props {
  entry?: GrimorioEntry;
  initialChapterId: ChapterId;
  initialSubtopicId?: string;
  /** Fichas disponibles para relacionar (ejemplo + personales). */
  allEntries?: GrimorioEntry[];
  onCancel: () => void;
}

/**
 * Formulario de ficha (sección 7.7): secciones plegables, campos especiales
 * según la plantilla del capítulo, fotos y guardado transaccional.
 */
export function EntryForm({
  entry,
  initialChapterId,
  initialSubtopicId = '',
  allEntries = [],
  onCancel,
}: Props) {
  const navigate = useNavigate();
  const initial = useMemo(
    () => toFormState(entry, initialChapterId, initialSubtopicId),
    [entry, initialChapterId, initialSubtopicId],
  );
  const initialImages = useMemo<FormImage[]>(
    () => (entry?.media ?? []).map((m) => ({ key: m.id, kind: 'kept', media: m, alt: m.alt })),
    [entry],
  );
  const [state, setState] = useState<FormState>(initial);
  const [images, setImages] = useState<FormImage[]>(initialImages);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const leavingRef = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const chapter = getChapter(state.chapterId) ?? CHAPTERS[0];
  const template = ENTRY_TEMPLATES[chapter.templateId];
  const dirty =
    JSON.stringify(state) !== JSON.stringify(initial) ||
    JSON.stringify(images.map((i) => [i.key, i.alt])) !==
      JSON.stringify(initialImages.map((i) => [i.key, i.alt]));

  // Confirmar antes de salir con cambios sin guardar (navegación interna y cierre de pestaña).
  const blocker = useBlocker(() => dirty && !leavingRef.current);
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));
  const setExtra = (key: string, value: string) =>
    setState((s) => ({ ...s, extra: { ...s.extra, [key]: value } }));

  const submit = async (status: 'draft' | 'saved') => {
    setSaving(true);
    setSaveError(null);
    setErrors({});
    try {
      const saved = await saveEntry({
        id: entry?.id,
        input: toInput(state, status),
        keptMedia: images.flatMap((i) => (i.kind === 'kept' ? [{ ...i.media, alt: i.alt.trim() }] : [])),
        newImages: images.flatMap((i) =>
          i.kind === 'new' ? [{ tempId: i.key, blob: i.blob, alt: i.alt }] : [],
        ),
      });
      leavingRef.current = true;
      navigate(`/fichas/${saved.id}`, { replace: true, state: { saved: status } });
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrors(err.fieldErrors);
        if (err.fieldErrors.title) titleRef.current?.focus();
      } else {
        setSaveError(
          err instanceof Error
            ? `No se pudo guardar: ${err.message}. Tus cambios siguen aquí; puedes reintentar.`
            : 'No se pudo guardar. Tus cambios siguen aquí; puedes reintentar.',
        );
      }
      setSaving(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit('saved');
  };

  const cancel = () => (dirty ? setConfirmCancel(true) : onCancel());

  return (
    <form className="entry-form" onSubmit={onSubmit} noValidate>
      <ol className="steps" aria-label="Secciones de la página">
        <li>Familia, capítulo y subtema</li>
        <li>Datos principales</li>
        <li>Foto e ilustración</li>
        <li>Notas y correspondencias</li>
        <li>Guardar</li>
      </ol>

      <details className="form-section" open>
        <summary>1 · ¿Dónde vivirá esta página?</summary>
        <label className="form-field">
          <span className="form-field__label">Capítulo (obligatorio)</span>
          <select
            className="input"
            value={state.chapterId}
            onChange={(e) =>
              setState((s) => ({ ...s, chapterId: e.target.value as ChapterId, subtopicId: '' }))
            }
          >
            {FAMILIES.map((f) => (
              <optgroup key={f.id} label={f.title}>
                {getChaptersByFamily(f.id).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.romanNumeral} · {c.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="form-field__label">Subtema</span>
          <select
            className="input"
            value={state.subtopicId}
            onChange={(e) => set('subtopicId', e.target.value)}
          >
            <option value="">Sin subtema</option>
            {chapter.subtopics.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        {chapter.contentNote && <p className="content-note small">{chapter.contentNote}</p>}
      </details>

      <details className="form-section" open>
        <summary>2 · Datos principales · {template.name}</summary>
        <label className="form-field">
          <span className="form-field__label">Título (obligatorio)</span>
          <input
            ref={titleRef}
            className="input"
            value={state.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'error-titulo' : undefined}
            required
          />
          {errors.title && (
            <span id="error-titulo" className="error-text" role="alert">
              {errors.title}
            </span>
          )}
        </label>
        <label className="form-field">
          <span className="form-field__label">Descripción</span>
          <textarea
            className="input"
            rows={3}
            value={state.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </label>
        {template.fields.map((field) => (
          <TemplateInput
            key={`${template.id}-${field.key}`}
            field={field}
            value={state.extra[field.key] ?? ''}
            onChange={(v) => setExtra(field.key, v)}
          />
        ))}
      </details>

      <details className="form-section" open>
        <summary>3 · Foto e ilustración</summary>
        <PhotoUploader images={images} onChange={setImages} />
        <IllustrationTransform hasImage={images.length > 0} />
      </details>

      <details className="form-section" open>
        <summary>4 · Notas y correspondencias</summary>
        <div className="form-field">
          <span className="form-field__label">Fichas relacionadas</span>
          <EntryLinker
            label="Relacionar con otra ficha"
            entries={allEntries}
            value={state.related}
            excludeId={entry?.id}
            onChange={(ids) => set('related', ids)}
          />
        </div>
        <label className="form-field">
          <span className="form-field__label">Etiquetas (separadas por comas)</span>
          <input className="input" value={state.tags} onChange={(e) => set('tags', e.target.value)} />
        </label>
        <label className="form-field">
          <span className="form-field__label">Fuentes y referencias (una por línea; «título | enlace»)</span>
          <textarea
            className="input"
            rows={3}
            value={state.sources}
            onChange={(e) => set('sources', e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">Notas personales</span>
          <textarea
            className="input"
            rows={4}
            value={state.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </label>
      </details>

      <div className="form-section form-section--actions">
        <p className="form-section__heading">5 · Guardar</p>
        {saveError && (
          <p className="error-text" role="alert">
            {saveError}
          </p>
        )}
        {Object.keys(errors).length > 0 && !errors.title && (
          <p className="error-text" role="alert">
            {Object.values(errors)[0]}
          </p>
        )}
        <div className="button-row">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            <Save size={18} aria-hidden="true" />
            {saving ? 'Guardando…' : 'Guardar ficha'}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={saving}
            onClick={() => void submit('draft')}
          >
            <FilePen size={18} aria-hidden="true" />
            Guardar borrador
          </button>
          <button type="button" className="btn btn--ghost" onClick={cancel} disabled={saving}>
            Cancelar
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel || blocker.state === 'blocked'}
        title="¿Descartar los cambios?"
        message="Hay cambios sin guardar en esta página. Si sales ahora se perderán."
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

function TemplateInput({
  field,
  value,
  onChange,
}: {
  field: TemplateField;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = (
    <span className={`form-field__label${field.caution ? ' is-caution' : ''}`}>
      {field.caution && <AlertTriangle size={14} aria-hidden="true" />}
      {field.label}
      {isListField(field) && <span className="muted"> (uno por línea)</span>}
    </span>
  );

  if (field.kind === 'select') {
    return (
      <label className="form-field">
        {label}
        <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Sin indicar</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (field.kind === 'color') {
    const valid = /^#[0-9a-f]{6}$/i.test(value);
    return (
      <label className="form-field">
        {label}
        <span className="color-input">
          <input
            type="color"
            aria-label={`${field.label}: selector`}
            value={valid ? value : '#264739'}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            className="input"
            value={value}
            placeholder="#264739"
            onChange={(e) => onChange(e.target.value)}
          />
        </span>
      </label>
    );
  }
  if (field.kind === 'longtext' || isListField(field)) {
    return (
      <label className="form-field">
        {label}
        <textarea
          className={`input${field.caution ? ' input--caution' : ''}`}
          rows={isListField(field) ? 4 : 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }
  return (
    <label className="form-field">
      {label}
      <input
        className="input"
        type={field.kind === 'date' ? 'date' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
