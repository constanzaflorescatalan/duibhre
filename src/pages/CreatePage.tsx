import { BookPlus, CalendarPlus, Feather, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { UI } from '../config/uiCopy';
import { useBack } from '../hooks/useBack';

/**
 * Hoja de creación `/crear` (sección 6): tres opciones y «Cancelar».
 * Se presenta como hoja inferior sobre el pergamino; Escape la cierra.
 */
export function CreatePage() {
  const close = useBack('/inicio');
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sheetRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const options = [
    {
      to: '/crear/ficha',
      label: UI.createOptions.entry,
      hint: 'Agrega conocimiento a cualquier capítulo',
      Icon: BookPlus,
    },
    {
      to: '/crear/nota',
      label: UI.createOptions.note,
      hint: 'Un sueño, un ritual, una tirada o un recuerdo',
      Icon: Feather,
    },
    {
      to: '/crear/evento',
      label: UI.createOptions.event,
      hint: 'Una práctica o recordatorio en tu agenda',
      Icon: CalendarPlus,
    },
  ];

  // Portal: la hoja se monta sobre <body> para no depender de transformaciones del contenido.
  return createPortal(
    <div className="sheet-backdrop">
      <div ref={sheetRef} className="sheet" role="dialog" aria-modal="true" aria-labelledby="crear-titulo">
        <div className="sheet__handle" aria-hidden="true" />
        <h1 id="crear-titulo" className="sheet__title">
          {UI.pages.create.subtitle}
        </h1>
        <ul className="sheet__options">
          {options.map(({ to, label, hint, Icon }) => (
            <li key={to}>
              <Link to={to} className="sheet__option" replace>
                <span className="sheet__option-icon">
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span>
                  <span className="sheet__option-label">{label}</span>
                  <span className="sheet__option-hint">{hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn--ghost btn--block" onClick={close}>
          <X size={18} aria-hidden="true" />
          Cancelar
        </button>
      </div>
    </div>,
    document.body,
  );
}
