import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

/**
 * Armazón de las pantallas interiores: cabecera discreta, contenido de
 * pergamino y navbar inferior fija. La portada queda fuera de este shell.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Al cambiar de ruta, llevar el foco al contenido para lectores de pantalla.
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="app-shell">
      <div className="paper-sheet" aria-hidden="true" />
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <TopBar />
      <main id="contenido" ref={mainRef} tabIndex={-1} className="app-main" key={pathname}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
