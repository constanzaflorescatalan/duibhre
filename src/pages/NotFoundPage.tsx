import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { Page } from '../components/common/Page';

export function NotFoundPage() {
  return (
    <Page>
      <EmptyState
        title="Esta página no existe en el grimorio"
        description="Puede que el enlace esté incompleto o que la página haya cambiado de lugar."
        action={
          <Link to="/inicio" className="btn btn--primary">
            Volver al índice
          </Link>
        }
      />
    </Page>
  );
}
