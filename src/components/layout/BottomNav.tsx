import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';
import { activeNavFor } from '../../utils/navigation';

/** Navbar fija inferior con exactamente cinco accesos (sección 6). */
export function BottomNav() {
  const { pathname } = useLocation();
  const active = activeNavFor(pathname);

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <ul className="bottom-nav__list">
        {NAV_ITEMS.map(({ to, label, Icon, ...rest }) => {
          const isActive = active === to;
          const featured = 'featured' in rest && rest.featured;
          return (
            <li key={to}>
              <Link
                to={to}
                className={`bottom-nav__item${isActive ? ' is-active' : ''}${featured ? ' bottom-nav__item--create' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="bottom-nav__icon">
                  <Icon size={featured ? 26 : 22} strokeWidth={featured ? 1.8 : 1.6} aria-hidden="true" />
                </span>
                <span className="bottom-nav__label">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
