import { describe, expect, it } from 'vitest';
import { activeNavFor, logicalParent } from '../utils/navigation';
import { matches } from '../utils/search';
import { todayInTimeZone } from '../utils/dates';

describe('navegación', () => {
  it('resuelve el padre lógico para enlaces directos', () => {
    expect(logicalParent('/capitulos/gemas')).toBe('/indice');
    expect(logicalParent('/capitulos/gemas/subtemas/cristales')).toBe('/capitulos/gemas');
    expect(logicalParent('/fichas/x/editar')).toBe('/fichas/x');
    expect(logicalParent('/crear/ficha')).toBe('/crear');
    expect(logicalParent('/perfil')).toBe('/inicio');
  });

  it('mantiene resaltado el origen en pantallas de detalle', () => {
    expect(activeNavFor('/capitulos/velas')).toBe('/indice');
    expect(activeNavFor('/fichas/ejemplo-lavanda')).toBe('/indice');
    expect(activeNavFor('/crear/nota')).toBe('/crear');
    expect(activeNavFor('/perfil')).toBeNull();
  });
});

describe('utilidades', () => {
  it('busca sin distinguir tildes ni mayúsculas', () => {
    expect(matches('adivinacion', ['Adivinación y oráculos'])).toBe(true);
    expect(matches('', ['x'])).toBe(true);
    expect(matches('zz', ['Gemas'])).toBe(false);
  });

  it('calcula hoy en America/Santiago y no en la zona del navegador', () => {
    const d = todayInTimeZone('America/Santiago', new Date('2026-11-17T02:00:00Z'));
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate()]).toEqual([2026, 11, 16]);
  });
});
