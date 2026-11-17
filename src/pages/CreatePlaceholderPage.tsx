import { Page, PageHeader } from '../components/common/Page';
import { StageNotice } from '../components/common/StageNotice';
import { UI } from '../config/uiCopy';
import { useBack } from '../hooks/useBack';

const CONTENT = {
  evento: {
    title: UI.pages.createEvent.title,
    stage: 3 as const,
    fields: [
      'Título',
      'Tipo: ritual, tarea, recordatorio, cuidado de planta, personal…',
      'Inicio y término',
      'Zona horaria (por defecto America/Santiago)',
      'Ficha o memoria vinculada',
      'Notas',
    ],
    notice: 'Crear eventos y recordatorios en la Agenda se habilita en la Etapa 3.',
  },
};

/** `/crear/nota` y `/crear/evento`: estructura visible, sin simular guardado. */
export function CreatePlaceholderPage({ kind }: { kind: keyof typeof CONTENT }) {
  const cancel = useBack('/crear');
  const c = CONTENT[kind];
  return (
    <Page>
      <PageHeader title={c.title} />
      <section className="form-section">
        <h2 className="section-title">Esta página tendrá</h2>
        <ul className="template-fields">
          {c.fields.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>
      <StageNotice stage={c.stage}>{c.notice}</StageNotice>
      <div className="page-footer-actions">
        <button type="button" className="btn btn--ghost" onClick={cancel}>
          Cancelar
        </button>
      </div>
    </Page>
  );
}
