import type { ReactNode } from 'react';
import { Sparkle } from '../ornaments/Ornaments';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Estado vacío ilustrado (sección 7.13). */
export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="empty-state" role="status">
      <Sparkle className="empty-state__spark" size={18} />
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__text">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
