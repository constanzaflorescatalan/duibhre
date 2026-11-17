import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  /** Si se indica, hay que escribir este texto para habilitar la confirmación. */
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Diálogo de confirmación accesible (Escape cancela, foco en la acción segura). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  danger = false,
  confirmText,
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId();
  const textId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const [typed, setTyped] = useState('');
  const canConfirm = !confirmText || typed.trim() === confirmText;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="dialog-backdrop">
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
      >
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        <p id={textId} className="dialog__text">
          {message}
        </p>
        {confirmText && (
          <label className="form-field" htmlFor={inputId}>
            <span className="form-field__label">
              Escribe <strong>{confirmText}</strong> para confirmar
            </span>
            <input
              id={inputId}
              className="input"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
          </label>
        )}
        <div className="dialog__actions">
          <button
            ref={cancelRef}
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setTyped('');
              onCancel();
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn--danger-solid' : 'btn--primary'}`}
            disabled={!canConfirm}
            onClick={() => {
              setTyped('');
              onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
