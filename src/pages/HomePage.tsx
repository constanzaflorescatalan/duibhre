import { PageHeader } from '../components/common/Page';
import { FamilyIndex } from '../components/index/FamilyIndex';
import { MoonPhases } from '../components/ornaments/Ornaments';
import { UI } from '../config/uiCopy';
import { getPreferences } from '../data/repositories/preferences';
import { useAsync } from '../hooks/useAsync';

/**
 * Inicio `/inicio?familia=…` (secciones 7.2 y 7.3, fusionadas): las lunas y
 * «Mi grimorio», y debajo la rueda de las seis familias. Sin fase lunar: no hay
 * todavía una fuente astronómica verificada, así que no se muestra ninguna
 * fase ficticia.
 */
export function HomePage() {
  const prefs = useAsync(getPreferences, []);
  const name = prefs.status === 'success' ? prefs.data.displayName : undefined;

  return (
    <div className="leather-page home-page">
      <PageHeader
        title={UI.pages.home.title}
        subtitle={name ? `Bienvenida, ${name}. ${UI.pages.home.subtitle}` : UI.pages.home.subtitle}
        illustration={<MoonPhases className="home-moons" />}
      />
      <FamilyIndex />
    </div>
  );
}
