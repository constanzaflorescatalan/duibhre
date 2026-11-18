import { Link2, X } from 'lucide-react';
import { useState } from 'react';
import { CHAPTERS } from '../../config/chapters';
import type { GrimorioEntry } from '../../types/domain';

interface Props {
  label: string;
  entries: GrimorioEntry[];
  value: string[];
  onChange: (ids: string[]) => void;
  /** Ficha que no debe ofrecerse (la propia). */
  excludeId?: string;
}

/** Selector de fichas vinculadas: chips con «quitar» y un desplegable agrupado por capítulo. */
export function EntryLinker({ label, entries, value, onChange, excludeId }: Props) {
  const [open, setOpen] = useState(false);
  const byId = new Map(entries.map((e) => [e.id, e]));
  const available = entries.filter((e) => e.id !== excludeId && !value.includes(e.id));

  return (
    <div className="entry-linker">
      {value.length > 0 && (
        <ul className="linked-list">
          {value.map((id) => (
            <li key={id} className="linked-chip">
              <span>{byId.get(id)?.title ?? 'Ficha eliminada'}</span>
              <button
                type="button"
                className="icon-btn icon-btn--ink"
                aria-label={`Quitar ${byId.get(id)?.title ?? 'ficha'}`}
                onClick={() => onChange(value.filter((x) => x !== id))}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <label className="form-field">
          <span className="form-field__label">{label}</span>
          <select
            className="input"
            value=""
            onChange={(e) => {
              if (e.target.value) onChange([...value, e.target.value]);
              setOpen(false);
            }}
          >
            <option value="">Selecciona una ficha…</option>
            {CHAPTERS.map((c) => {
              const options = available.filter((e) => e.chapterId === c.id);
              return options.length ? (
                <optgroup key={c.id} label={`${c.romanNumeral} · ${c.title}`}>
                  {options.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                      {e.origin === 'seed' ? ' (ejemplo)' : ''}
                    </option>
                  ))}
                </optgroup>
              ) : null;
            })}
          </select>
        </label>
      ) : (
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={() => setOpen(true)}
          disabled={available.length === 0}
        >
          <Link2 size={16} aria-hidden="true" />
          {label}
        </button>
      )}
    </div>
  );
}
