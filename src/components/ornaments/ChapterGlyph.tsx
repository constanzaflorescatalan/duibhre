import {
  BookHeart,
  Feather,
  Flame,
  FlaskConical,
  Gem,
  Hammer,
  Leaf,
  Orbit,
  Palette,
  Sparkles,
  SunMoon,
  Eye,
  Landmark,
  type LucideIcon,
} from 'lucide-react';
import type { ChapterId } from '../../types/domain';

/**
 * Mini ilustración de cada capítulo. Provisional: íconos Lucide en tinta dorada,
 * reemplazables por las ilustraciones propias del grimorio.
 */
const ICONS: Record<ChapterId, LucideIcon> = {
  herbolaria: Leaf,
  gemas: Gem,
  colores: Palette,
  velas: Flame,
  preparaciones: FlaskConical,
  cosmos: Orbit,
  'rueda-ano': SunMoon,
  hechiceria: Sparkles,
  adivinacion: Eye,
  conciencia: Feather,
  mitologia: Landmark,
  taller: Hammer,
  memorias: BookHeart,
};

export function ChapterGlyph({ chapterId, size = 26 }: { chapterId: ChapterId; size?: number }) {
  const Icon = ICONS[chapterId];
  return <Icon size={size} strokeWidth={1.4} aria-hidden="true" focusable="false" />;
}
