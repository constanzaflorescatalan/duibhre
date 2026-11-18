import { UserRound } from 'lucide-react';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { avatarInitial, letterFile } from '../../utils/initial';

/** Letras capitulares (estilo de la D de DUIBHRÉ), una imagen por letra. */
const LETTERS = import.meta.glob<string>('../../assets/letras/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

function letterUrl(letter: string): string | undefined {
  return LETTERS[`../../assets/letras/${letterFile(letter)}.jpg`];
}

interface Props {
  name?: string;
  avatarBlobId?: string;
  size?: number;
  className?: string;
}

/**
 * Imagen de perfil: la foto subida o, si no hay, la inicial capitular del
 * nombre en el estilo de la D de DUIBHRÉ. Sin nombre, un sello neutro.
 */
export function ProfileAvatar({ name, avatarBlobId, size = 76, className = '' }: Props) {
  const photo = useBlobUrl(avatarBlobId);
  const initial = avatarInitial(name);
  const letter = initial ? letterUrl(initial) : undefined;
  const style = { width: size, height: size };

  if (avatarBlobId && photo) {
    return <img className={`profile-avatar ${className}`} src={photo} alt="Foto de perfil" style={style} />;
  }
  if (letter) {
    return (
      <img
        className={`profile-avatar profile-avatar--letter ${className}`}
        src={letter}
        alt={`Inicial ${initial}`}
        style={style}
      />
    );
  }
  return (
    <span
      className={`profile-avatar profile-avatar--empty ${className}`}
      style={style}
      role="img"
      aria-label="Sin foto de perfil"
    >
      <UserRound size={Math.round(size * 0.45)} strokeWidth={1.3} aria-hidden="true" />
    </span>
  );
}
