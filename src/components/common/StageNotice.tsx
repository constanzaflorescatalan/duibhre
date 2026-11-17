import type { ReactNode } from 'react';

/**
 * Aviso honesto de función que llega en una etapa posterior. Nunca se simula
 * el resultado de algo que todavía no existe.
 */
export function StageNotice({ stage, children }: { stage: 2 | 3 | 4; children: ReactNode }) {
  return (
    <aside className="stage-notice">
      <p className="stage-notice__label">Etapa {stage}</p>
      <p>{children}</p>
    </aside>
  );
}
