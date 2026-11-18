import { Download, HardDrive, ImageIcon, ShieldCheck, Trash2, Upload, type LucideIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { UI } from '../../config/uiCopy';
import {
  BackupError,
  deleteAllData,
  downloadBackup,
  parseBackup,
  restoreBackup,
  summarize,
  type BackupFile,
  type BackupSummary,
} from '../../utils/backup';
import { formatDateTime } from '../../utils/dates';
import { ConfirmDialog } from '../common/ConfirmDialog';

type Status = { kind: 'ok' | 'error'; text: string } | null;

/** Explicaciones que solo aparecen al tocar su ícono. */
const INFO: { id: string; label: string; Icon: LucideIcon; text: string }[] = [
  {
    id: 'datos',
    label: 'Dónde se guardan tus datos',
    Icon: HardDrive,
    text: `${UI.localDataNotice}. Limpiar el navegador o cambiar de dispositivo puede borrar tus páginas: descarga un respaldo de vez en cuando.`,
  },
  {
    id: 'respaldo',
    label: 'Sobre el respaldo',
    Icon: ShieldCheck,
    text: 'El respaldo es un archivo JSON que queda solo en tu dispositivo; nada se envía a ningún servidor. Guárdalo en un lugar seguro: contiene tus notas y fotos.',
  },
  {
    id: 'ilustraciones',
    label: 'Sobre las ilustraciones',
    Icon: ImageIcon,
    text: 'Ninguna foto se sube a servicios externos. Cuando exista la transformación ilustrada, se pedirá tu consentimiento antes de enviar cualquier imagen.',
  },
];

const describe = (s: Omit<BackupSummary, 'exportedAt'>) =>
  `${s.entries} fichas, ${s.journal} memorias, ${s.events} eventos y ${s.images} imágenes`;

/** «Privacidad y datos» del Perfil: exportar, importar y borrar (secciones 7.11 y 11). */
export function DataSection({ onChanged }: { onChanged: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const info = INFO.find((i) => i.id === openInfo);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setStatus(null);
    try {
      await task();
    } catch (err) {
      setStatus({
        kind: 'error',
        text: err instanceof Error ? err.message : 'No se pudo completar la operación.',
      });
    } finally {
      setBusy(false);
    }
  };

  const onExport = () =>
    run(async () => {
      const summary = await downloadBackup();
      setStatus({ kind: 'ok', text: `Respaldo descargado: ${describe(summary)}.` });
    });

  const onFile = (file: File | undefined) => {
    if (!file) return;
    void run(async () => {
      if (file.size > 200 * 1024 * 1024)
        throw new BackupError('El archivo es demasiado grande (máximo 200 MB).');
      setPending(parseBackup(await file.text()));
    });
  };

  const pendingSummary = pending ? summarize(pending) : null;

  return (
    <section className="profile-section">
      <h2 className="section-title">Privacidad y datos</h2>
      <div className="info-icons" role="group" aria-label="Información de privacidad">
        {INFO.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`info-icons__btn${openInfo === id ? ' is-open' : ''}`}
            aria-label={label}
            title={label}
            aria-expanded={openInfo === id}
            aria-controls="info-privacidad"
            onClick={() => setOpenInfo((cur) => (cur === id ? null : id))}
          >
            <Icon size={20} aria-hidden="true" />
          </button>
        ))}
      </div>
      {info && (
        <p id="info-privacidad" className="info-icons__text" role="note">
          <strong>{info.label}.</strong> {info.text}
        </p>
      )}

      <div className="button-row button-row--wrap">
        <button type="button" className="btn btn--primary" onClick={onExport} disabled={busy}>
          <Download size={18} aria-hidden="true" />
          Exportar mis datos
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <Upload size={18} aria-hidden="true" />
          Importar respaldo
        </button>
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => setConfirmDelete(true)}
          disabled={busy}
        >
          <Trash2 size={18} aria-hidden="true" />
          Borrar mis datos
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        tabIndex={-1}
        aria-label="Elegir archivo de respaldo"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {busy && (
        <p className="muted small" role="status">
          Trabajando…
        </p>
      )}
      {status && (
        <p
          className={status.kind === 'ok' ? 'success-text' : 'error-text'}
          role={status.kind === 'ok' ? 'status' : 'alert'}
        >
          {status.text}
        </p>
      )}

      <ConfirmDialog
        open={pending !== null}
        title="¿Reemplazar tu grimorio con este respaldo?"
        message={
          pendingSummary
            ? `El respaldo del ${formatDateTime(pendingSummary.exportedAt)} contiene ${describe(pendingSummary)}. Todo lo que hay ahora en este dispositivo se reemplazará y no se puede deshacer.`
            : ''
        }
        confirmLabel="Reemplazar con el respaldo"
        danger
        onCancel={() => setPending(null)}
        onConfirm={() => {
          const backup = pending;
          setPending(null);
          if (!backup) return;
          void run(async () => {
            await restoreBackup(backup);
            setStatus({ kind: 'ok', text: `Respaldo importado: ${describe(summarize(backup))}.` });
            onChanged();
          });
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="¿Borrar todos tus datos?"
        message="Se borrarán de este dispositivo todas tus fichas, memorias, eventos y fotos. No se puede deshacer. Si quieres conservarlos, exporta antes un respaldo."
        confirmLabel="Borrar todo"
        confirmText="BORRAR"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          void run(async () => {
            await deleteAllData();
            setStatus({ kind: 'ok', text: 'Se borraron todos tus datos de este dispositivo.' });
            onChanged();
          });
        }}
      />
    </section>
  );
}
