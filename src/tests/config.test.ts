import { describe, expect, it } from 'vitest';
import { CHAPTERS, getChaptersByFamily } from '../config/chapters';
import { ENTRY_TEMPLATES } from '../config/entryTemplates';
import { FAMILIES } from '../config/families';

describe('estructura del grimorio', () => {
  it('tiene exactamente 6 familias en el orden aprobado', () => {
    expect(FAMILIES.map((f) => f.title)).toEqual([
      'Naturaleza',
      'Alquimia',
      'Cosmos',
      'Adivinación',
      'Espíritu',
      'Memorias',
    ]);
  });

  it('tiene exactamente 13 capítulos numerados I–XIII', () => {
    expect(CHAPTERS).toHaveLength(13);
    expect(CHAPTERS.map((c) => c.romanNumeral)).toEqual([
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
      'XI',
      'XII',
      'XIII',
    ]);
  });

  it('agrupa los capítulos 3/3/2/1/3/1', () => {
    expect(FAMILIES.map((f) => getChaptersByFamily(f.id).length)).toEqual([3, 3, 2, 1, 3, 1]);
  });

  it('cada familia referencia capítulos que pertenecen a ella', () => {
    for (const family of FAMILIES) {
      const ids = getChaptersByFamily(family.id)
        .map((c) => c.id)
        .sort();
      expect([...family.chapterIds].sort()).toEqual(ids);
    }
  });

  it('Colores es el capítulo III independiente en Naturaleza', () => {
    const colores = CHAPTERS.find((c) => c.id === 'colores');
    expect(colores?.romanNumeral).toBe('III');
    expect(colores?.familyId).toBe('naturaleza');
  });

  it('los temas acordados aparecen en los subtemas correctos', () => {
    const has = (chapterId: string, title: string) =>
      CHAPTERS.find((c) => c.id === chapterId)!.subtopics.some((s) => s.title === title);
    expect(has('conciencia', 'Chakras')).toBe(true);
    expect(has('conciencia', 'Canalización')).toBe(true);
    expect(has('conciencia', 'Visualización')).toBe(true);
    expect(has('conciencia', 'Viaje astral')).toBe(true);
    expect(has('adivinacion', 'Adivinación en espejo')).toBe(true);
    expect(has('mitologia', 'Dioses y diosas')).toBe(true);
    expect(has('mitologia', 'Elementales')).toBe(true);
    expect(has('rueda-ano', 'Sabbats')).toBe(true);
    expect(has('rueda-ano', 'Esbats')).toBe(true);
    expect(has('cosmos', 'Lunas vacías de curso')).toBe(true);
  });

  it('ids de subtemas únicos dentro de cada capítulo y plantilla existente', () => {
    for (const c of CHAPTERS) {
      const ids = c.subtopics.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ENTRY_TEMPLATES[c.templateId]).toBeDefined();
    }
  });
});
