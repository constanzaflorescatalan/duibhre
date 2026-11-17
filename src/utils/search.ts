/** Normaliza texto en español para búsqueda: minúsculas y sin tildes. */
export function normalize(text: string): string {
  return text.toLocaleLowerCase('es-CL').normalize('NFD').replace(/\p{M}/gu, '').trim();
}

/** ¿Algún campo contiene la consulta? Una consulta vacía coincide con todo. */
export function matches(query: string, fields: (string | undefined)[]): boolean {
  const q = normalize(query);
  if (!q) return true;
  return fields.some((f) => f !== undefined && normalize(f).includes(q));
}
