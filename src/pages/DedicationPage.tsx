import { Feather } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Page } from '../components/common/Page';
import { Filigree, Sparkle, Triquetra } from '../components/ornaments/Ornaments';
import { getPreferences } from '../data/repositories/preferences';
import { useAsync } from '../hooks/useAsync';

/**
 * Página interior de dedicatoria (sección 11): personal y opcional, nunca en
 * la portada oficial.
 */
export function DedicationPage() {
  const prefs = useAsync(getPreferences, []);
  const text = prefs.status === 'success' ? prefs.data.dedication : undefined;
  const name = prefs.status === 'success' ? prefs.data.displayName : undefined;

  return (
    <Page className="dedication-page">
      <div className="dedication-page__inner">
        <span className="dedication-page__mark" aria-hidden="true">
          <Triquetra size={56} />
        </span>
        <h1 className="dedication-page__title">Dedicatoria</h1>
        <Filigree className="filigree" />
        {prefs.status === 'loading' ? (
          <p className="muted" role="status">
            Abriendo la página…
          </p>
        ) : text ? (
          <>
            <blockquote className="dedication-page__text">
              <p>{text}</p>
            </blockquote>
            {name && <p className="dedication-page__signature">— {name}</p>}
          </>
        ) : (
          <p className="muted dedication-page__empty">
            Esta página espera unas palabras para tu grimorio. Puedes escribirlas en tu perfil.
          </p>
        )}
        <Sparkle className="dedication-page__spark" size={16} />
        <Link to="/perfil" className="btn btn--ghost btn--small">
          <Feather size={16} aria-hidden="true" />
          {text ? 'Editar dedicatoria' : 'Escribir dedicatoria'}
        </Link>
      </div>
    </Page>
  );
}
