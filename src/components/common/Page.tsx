import type { ReactNode } from 'react';
import { CornerKnot, Filigree } from '../ornaments/Ornaments';

/** Hoja de pergamino con esquinas de nudo celta. */
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`page ${className}`}>
      <CornerKnot className="page__corner page__corner--tl" />
      <CornerKnot className="page__corner page__corner--tr" />
      <CornerKnot className="page__corner page__corner--bl" />
      <CornerKnot className="page__corner page__corner--br" />
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  illustration?: ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, illustration }: PageHeaderProps) {
  return (
    <header className="page-header">
      {illustration && <div className="page-header__illustration">{illustration}</div>}
      {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
      <h1 className="page-header__title">{title}</h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      <Filigree className="filigree" />
    </header>
  );
}
