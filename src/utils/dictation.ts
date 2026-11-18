/** Une un fragmento dictado al texto existente, con espacio y mayúscula inicial cuando corresponde. */
export function appendDictation(current: string, piece: string, maxLength?: number): string {
  const startsSentence = current.trim() === '' || /[.!?¡¿\n]\s*$/.test(current);
  const text = startsSentence ? piece.charAt(0).toLocaleUpperCase('es-CL') + piece.slice(1) : piece;
  const sep = current === '' || /\s$/.test(current) ? '' : ' ';
  const next = current + sep + text;
  return maxLength ? next.slice(0, maxLength) : next;
}
