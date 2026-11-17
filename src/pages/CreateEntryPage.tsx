import { AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Page, PageHeader } from '../components/common/Page';
import { StageNotice } from '../components/common/StageNotice';
import { CHAPTERS, getChapter, getChaptersByFamily } from '../config/chapters';
import { COMMON_FIELDS, ENTRY_TEMPLATES } from '../config/entryTemplates';
import { FAMILIES } from '../config/families';
import { UI } from '../config/uiCopy';
import { useBack } from '../hooks/useBack';

/**
 * `/crear/ficha` y `/fichas/:id/editar` (sección 7.7).
 * Etapa 1: el paso 1 (familia/capítulo/subtema) funciona y conserva el contexto
 * del capítulo de origen; muestra qué campos tendrá la plantilla. El guardado
 * transaccional en IndexedDB se implementa en la Etapa 2: no hay botón que
 * aparente guardar.
 */
export function CreateEntryPage({ mode = 'create' }: { mode?: 'create' | 'edit' }) {
  const [params, setParams] = useSearchParams();
  const cancel = useBack('/crear');
  const chapter = getChapter(params.get('capitulo') ?? undefined) ?? CHAPTERS[0];
  const subtopicId = params.get('subtema') ?? '';
  const template = ENTRY_TEMPLATES[chapter.templateId];

  const update = (next: Record<string, string>) => {
    const merged = { capitulo: chapter.id, subtema: subtopicId, ...next };
    if (!merged.subtema) delete (merged as Partial<typeof merged>).subtema;
    setParams(merged, { replace: true });
  };

  return (
    <Page>
      <PageHeader title={mode === 'edit' ? UI.pages.editEntry.title : UI.pages.createEntry.title} />

      <ol className="steps" aria-label="Pasos para escribir una página">
        <li className="is-current">Elegir familia, capítulo y subtema</li>
        <li>Datos principales</li>
        <li>Foto e ilustración</li>
        <li>Notas y correspondencias</li>
        <li>Guardar</li>
      </ol>

      <fieldset className="form-section">
        <legend>1 · ¿Dónde vivirá esta página?</legend>
        <label className="form-field">
          <span>Capítulo (obligatorio)</span>
          <select value={chapter.id} onChange={(e) => update({ capitulo: e.target.value, subtema: '' })}>
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
          <span>Subtema</span>
          <select value={subtopicId} onChange={(e) => update({ subtema: e.target.value })}>
            <option value="">Sin subtema</option>
            {chapter.subtopics.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <section className="form-section">
        <h2 className="section-title">Campos de la plantilla «{template.name}»</h2>
        <p className="muted small">Comunes a todas las fichas y específicos de este capítulo:</p>
        <ul className="template-fields">
          {[...COMMON_FIELDS, ...template.fields].map((f) => (
            <li key={f.key} className={f.caution ? 'is-caution' : undefined}>
              {f.caution && <AlertTriangle size={14} aria-hidden="true" />}
              {f.label}
            </li>
          ))}
          <li>Fotos e ilustraciones</li>
          <li>Relaciones con otras fichas</li>
        </ul>
      </section>

      <StageNotice stage={2}>
        El formulario completo, la subida de fotos y el guardado en este dispositivo se habilitan en la Etapa
        2. Por ahora nada se guarda.
      </StageNotice>

      <div className="page-footer-actions">
        <button type="button" className="btn btn--ghost" onClick={cancel}>
          Cancelar
        </button>
      </div>
    </Page>
  );
}
