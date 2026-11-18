import { ArrowLeft, Search, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import titleArt from '../../assets/cover/titulo-duibhre.jpg';
import { UI } from '../../config/uiCopy';
import { useBack } from '../../hooks/useBack';
import { ROOT_PATHS, logicalParent } from '../../utils/navigation';

/** Cabecera discreta: volver (fuera de destinos raíz), marca, búsqueda y perfil. */
export function TopBar() {
  const { pathname } = useLocation();
  const isRoot = ROOT_PATHS.includes(pathname);
  const goBack = useBack(logicalParent(pathname));
  const showSearch = pathname === '/indice' || pathname.startsWith('/capitulos');

  return (
    <header className="topbar">
      <div className="topbar__side">
        {!isRoot && (
          <button type="button" className="icon-btn" onClick={goBack} aria-label="Volver">
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
        )}
      </div>

      <Link to="/inicio" className="topbar__brand" aria-label={`${UI.appName}, ${UI.tagline}: ir a Inicio`}>
        <img className="topbar__title" src={titleArt} alt="" width={800} height={290} />
      </Link>

      <div className="topbar__side topbar__side--end">
        {showSearch && (
          <Link to="/buscar" className="icon-btn" aria-label="Buscar en mi grimorio">
            <Search size={21} aria-hidden="true" />
          </Link>
        )}
        <Link
          to="/perfil"
          className="icon-btn icon-btn--avatar"
          aria-label="Mi perfil"
          aria-current={pathname === '/perfil' ? 'page' : undefined}
        >
          <UserRound size={20} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
