import { Copy } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Page, PageHeader } from '../components/common/Page';
import { EntryForm } from '../components/entry/EntryForm';
import { CHAPTERS, getChapter } from '../config/chapters';
import { UI } from '../config/uiCopy';
import { copySeedToPersonal, getEntry } from '../data/repositories/entries';
import { useAsync } from '../hooks/useAsync';
import { useBack } from '../hooks/useBack';
import { NotFoundPage } from './NotFoundPage';

/**
 * `/crear/ficha` (con `?capitulo=` y `?subtema=` para conservar el contexto)
 * y `/fichas/:entryId/editar` (sección 7.7).
 */
export function EntryFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { entryId = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const back = useBack(mode === 'edit' ? `/fichas/${entryId}` : '/crear');
  const loaded = useAsync(
    () => (mode === 'edit' ? getEntry(entryId) : Promise.resolve(undefined)),
    [mode, entryId],
  );
  const [copyError, setCopyError] = useState<string | null>(null);

  const chapterParam = getChapter(params.get('capitulo') ?? undefined);
  const initialChapterId = chapterParam?.id ?? CHAPTERS[0].id;
  const subtopicParam = params.get('subtema') ?? '';
  const initialSubtopicId = chapterParam?.subtopics.some((s) => s.id === subtopicParam) ? subtopicParam : '';

  if (mode === 'edit') {
    if (loaded.status === 'loading') {
      return (
        <Page>
          <p className="muted" role="status">
            Abriendo la página…
          </p>
        </Page>
      );
    }
    if (loaded.status === 'error' || !loaded.data) return <NotFoundPage />;
    if (loaded.data.origin === 'seed') {
      const seedId = loaded.data.id;
      return (
        <Page>
          <PageHeader title={UI.pages.editEntry.title} />
          <p className="content-note">
            Las fichas de ejemplo no se editan en origen. Cópiala a «Mis fichas» y edita tu propia versión.
          </p>
          {copyError && (
            <p className="error-text" role="alert">
              {copyError}
            </p>
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={async () => {
              try {
                const copy = await copySeedToPersonal(seedId);
                navigate(`/fichas/${copy.id}/editar`, { replace: true });
              } catch (err) {
                setCopyError(err instanceof Error ? err.message : 'No se pudo copiar la ficha.');
              }
            }}
          >
            <Copy size={18} aria-hidden="true" />
            Copiar a mis fichas
          </button>
        </Page>
      );
    }
  }

  const entry = mode === 'edit' && loaded.status === 'success' ? loaded.data : undefined;

  return (
    <Page>
      <PageHeader title={mode === 'edit' ? UI.pages.editEntry.title : UI.pages.createEntry.title} />
      <EntryForm
        key={entry?.id ?? 'nueva'}
        entry={entry}
        initialChapterId={initialChapterId}
        initialSubtopicId={initialSubtopicId}
        onCancel={back}
      />
    </Page>
  );
}
