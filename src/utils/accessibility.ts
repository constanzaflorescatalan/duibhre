import { readLocal, writeLocal } from './storage';

const KEY = 'reducir-animaciones';

export function isReduceMotionOn(): boolean {
  return readLocal(KEY) === 'true';
}

/** Aplica la preferencia de movimiento reducido además de `prefers-reduced-motion`. */
export function setReduceMotion(on: boolean): void {
  writeLocal(KEY, String(on));
  applyReduceMotion();
}

export function applyReduceMotion(): void {
  document.documentElement.dataset.reduceMotion = String(isReduceMotionOn());
}
