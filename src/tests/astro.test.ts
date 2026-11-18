import { describe, expect, it } from 'vitest';
import { esbats, moonQuarters, moonStateAt, sabbatsOfYear, voidOfCourse } from '../utils/astro';

const monthOf = (d: Date) => ({ month: d.getUTCMonth(), key: d.toISOString().slice(0, 7) });

describe('Cielo de la agenda', () => {
  it('calcula fases principales reales', () => {
    const q = moonQuarters(new Date('2026-01-01T00:00Z'), new Date('2026-02-01T00:00Z'));
    // Luna llena del 3 de enero de 2026 (≈10:03 UTC) y luna nueva del 18 de enero (≈19:52 UTC).
    const full = q.find((x) => x.key === 'llena')!;
    const nueva = q.find((x) => x.key === 'nueva')!;
    expect(full.at.toISOString().slice(0, 13)).toBe('2026-01-03T10');
    expect(nueva.at.toISOString().slice(0, 13)).toBe('2026-01-18T19');
    expect(moonStateAt(full.at).key).toBe('llena');
    expect(moonStateAt(full.at).illumination).toBeGreaterThan(0.99);
  });

  it('nombra los esbats según el hemisferio y detecta la luna azul', () => {
    const north = esbats(new Date('2026-01-01T00:00Z'), new Date('2026-02-01T00:00Z'), 'north', monthOf);
    const south = esbats(new Date('2026-01-01T00:00Z'), new Date('2026-02-01T00:00Z'), 'south', monthOf);
    expect(north[0].name).toBe('Luna del lobo');
    expect(south[0].name).toBe('Luna del ciervo');
    // Mayo de 2026 tiene dos lunas llenas (1 y 31 de mayo).
    const may = esbats(new Date('2026-05-01T00:00Z'), new Date('2026-06-01T00:00Z'), 'north', monthOf);
    expect(may).toHaveLength(2);
    expect(may[1].isBlueMoon).toBe(true);
    expect(may[1].name).toBe('Luna azul');
  });

  it('ubica los sabbats astronómicos y tradicionales por hemisferio', () => {
    const south = sabbatsOfYear(2026, 'south');
    const north = sabbatsOfYear(2026, 'north');
    expect(
      south
        .find((s) => s.id === 'yule')!
        .at!.toISOString()
        .slice(0, 10),
    ).toBe('2026-06-21');
    expect(
      north
        .find((s) => s.id === 'litha')!
        .at!.toISOString()
        .slice(0, 10),
    ).toBe('2026-06-21');
    expect(south.find((s) => s.id === 'samhain')!.dayKey).toBe('2026-04-30');
    expect(north.find((s) => s.id === 'samhain')!.dayKey).toBe('2026-10-31');
    expect(south).toHaveLength(8);
  });

  it('encuentra periodos de luna vacía que terminan en un cambio de signo', () => {
    const from = new Date('2026-11-01T00:00Z');
    const to = new Date('2026-12-01T00:00Z');
    const t0 = Date.now();
    const vocs = voidOfCourse(from, to);
    const ms = Date.now() - t0;
    expect(vocs.length).toBeGreaterThanOrEqual(11);
    expect(vocs.length).toBeLessThanOrEqual(15);
    for (const v of vocs) {
      expect(v.end.getTime()).toBeGreaterThan(v.start.getTime());
      expect(v.end.getTime() - v.start.getTime()).toBeLessThan(2.8 * 24 * 3600_000);
      expect(v.fromSign).not.toBe(v.toSign);
    }
    console.log(
      'VOC nov 2026',
      ms,
      'ms',
      vocs.map(
        (v) => `${v.start.toISOString().slice(5, 16)} → ${v.end.toISOString().slice(5, 16)} ${v.toSign}`,
      ),
    );
  });
});
