import { BookOpen, CalendarDays, Feather, House, Plus } from 'lucide-react';
import { UI } from './uiCopy';

/** Accesos de la navbar inferior: exactamente cinco (sección 6). */
export const NAV_ITEMS = [
  { to: '/inicio', label: UI.nav.home, Icon: House },
  { to: '/indice', label: UI.nav.index, Icon: BookOpen },
  { to: '/crear', label: UI.nav.create, Icon: Plus, featured: true },
  { to: '/agenda', label: UI.nav.agenda, Icon: CalendarDays },
  { to: '/bitacora', label: UI.nav.journal, Icon: Feather },
] as const;
