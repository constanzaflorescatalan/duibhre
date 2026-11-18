import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routes } from '../app/router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('Índice', () => {
  it('muestra seis sectores accesibles y Naturaleza seleccionada por defecto', async () => {
    renderAt('/indice');
    const wheel = await screen.findByRole('group', { name: /rueda de las seis familias/i });
    const sectors = within(wheel).getAllByRole('button');
    expect(sectors).toHaveLength(6);
    expect(within(wheel).getByRole('button', { name: /^Naturaleza/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: 'Naturaleza' })).toBeInTheDocument();
  });

  it('al tocar un sector actualiza el panel sin quitar la rueda', async () => {
    const router = renderAt('/indice');
    const wheel = await screen.findByRole('group', { name: /rueda/i });
    await userEvent.click(within(wheel).getByRole('button', { name: /^Espíritu/ }));
    expect(screen.getByRole('heading', { name: 'Espíritu' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Abrir capítulo/ })).toHaveLength(3);
    expect(within(wheel).getByRole('button', { name: /^Espíritu/ })).toHaveAttribute('aria-pressed', 'true');
    expect(router.state.location.search).toBe('?familia=espiritu');
    expect(screen.getByRole('group', { name: /rueda/i })).toBeInTheDocument();
  });

  it('respeta ?familia= y la tecla flecha recorre la rueda', async () => {
    renderAt('/indice?familia=cosmos');
    const wheel = await screen.findByRole('group', { name: /rueda/i });
    const cosmos = within(wheel).getByRole('button', { name: /^Cosmos/ });
    expect(cosmos).toHaveAttribute('aria-pressed', 'true');
    cosmos.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(within(wheel).getByRole('button', { name: /^Adivinación/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('ofrece el índice en lista con los 13 capítulos', async () => {
    renderAt('/indice');
    await userEvent.click(await screen.findByRole('button', { name: /ver índice en lista/i }));
    const list = screen.getByRole('navigation', { name: /índice en lista/i });
    expect(within(list).getAllByRole('link')).toHaveLength(13);
  });
});

describe('Navbar y capítulos', () => {
  it('tiene exactamente cinco accesos y resalta el destino activo', async () => {
    renderAt('/capitulos/velas');
    const nav = await screen.findByRole('navigation', { name: /navegación principal/i });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['Inicio', 'Índice', 'Crear', 'Agenda', 'Bitácora']);
    expect(within(nav).getByRole('link', { name: 'Índice' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });

  it('el capítulo muestra pestañas, subtemas, buscador y crear ficha', async () => {
    renderAt('/capitulos/conciencia');
    expect(
      await screen.findByRole('heading', { level: 1, name: /Conciencia y mundo espiritual/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Explorar',
      'Mis fichas',
      'Mis notas',
    ]);
    expect(screen.getByRole('link', { name: 'Chakras' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /buscar en este capítulo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear ficha/ })).toHaveAttribute(
      'href',
      '/crear/ficha?capitulo=conciencia',
    );
  });

  it('volver desde un enlace directo lleva al padre lógico', async () => {
    const router = renderAt('/capitulos/gemas/subtemas/cristales');
    await userEvent.click(await screen.findByRole('button', { name: 'Volver' }));
    expect(router.state.location.pathname).toBe('/capitulos/gemas');
  });

  it('la ilustración IA no finge resultados', async () => {
    renderAt('/fichas/ejemplo-lavanda');
    await userEvent.click(await screen.findByRole('button', { name: /transformar imagen en ilustración/i }));
    expect(screen.getByText(/no se ha generado ninguna imagen/i)).toBeInTheDocument();
  });
});

describe('Portada', () => {
  it('no tiene botón «Abrir grimorio» aparte: la triquetra abre el grimorio', async () => {
    const router = renderAt('/');
    const triquetra = await screen.findByRole('button', { name: 'Abrir grimorio' });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(triquetra.tagName.toLowerCase()).toBe('g');
    await userEvent.click(triquetra);
    await new Promise((r) => setTimeout(r, 750));
    expect(router.state.location.pathname).toBe('/inicio');
  });
});
