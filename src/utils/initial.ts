/**
 * Inicial capitular para el avatar: primera letra del nombre, sin tildes
 * (Á → A) pero conservando la Ñ. Devuelve null si no empieza con una letra.
 */
export function avatarInitial(name: string | undefined): string | null {
  const first = (name ?? '').trim().charAt(0);
  if (!first) return null;
  const upper = first.toLocaleUpperCase('es-CL');
  if (upper === 'Ñ') return 'Ñ';
  const plain = upper.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return /^[A-Z]$/.test(plain) ? plain : null;
}

/** Nombre de archivo de cada letra capitular (la Ñ se guarda como «enie»). */
export const letterFile = (letter: string) => (letter === 'Ñ' ? 'enie' : letter.toLowerCase());
