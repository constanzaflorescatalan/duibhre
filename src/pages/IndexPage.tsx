import { ChevronDown, List, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filigree, MoonPhases } from '../components/ornaments/Ornaments';
import { FamilyPanel } from '../components/index/FamilyPanel';
import { FamilyWheel } from '../components/index/FamilyWheel';
import { getChaptersByFamily } from '../config/chapters';
import { DEFAULT_FAMILY_ID, FAMILIES, getFamily, isFamilyId } from '../config/families';
import { UI } from '../config/uiCopy';
import type { FamilyId } from '../types/domain';
import { readLocal, writeLocal } from '../utils/storage';

const LAST_FAMILY_KEY = 'ultima-familia';

/** Índice `/indice?familia=…` (secciones 3 y 7.3). */
export function IndexPage() {
  const [params, setParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [listView, setListView] = useState(false);

  const fromQuery = params.get('familia');
  const fromStorage = readLocal(LAST_FAMILY_KEY);
  const selected: FamilyId = isFamilyId(fromQuery)
    ? fromQuery
    : isFamilyId(fromStorage)
      ? fromStorage
      : DEFAULT_FAMILY_ID;

  const select = (id: FamilyId) => {
    writeLocal(LAST_FAMILY_KEY, id);
    setCollapsed(false);
    setParams({ familia: id }, { replace: true, preventScrollReset: true });
  };

  return (
    <div className="leather-page">
      <span className="leather-page__corner leather-page__corner--tl" aria-hidden="true" />
      <span className="leather-page__corner leather-page__corner--tr" aria-hidden="true" />
      <div className="index-tools">
        <Link to="/buscar" className="search-pill">
          <Search size={18} aria-hidden="true" />
          Buscar en mi grimorio…
        </Link>
      </div>

      <header className="leather-header">
        <MoonPhases className="leather-header__moons" />
        <h1 className="leather-header__title">{UI.pages.index.title}</h1>
        <p className="leather-header__subtitle">{UI.pages.index.subtitle}</p>
        <Filigree className="filigree filigree--light" />
      </header>

      <button
        type="button"
        className="btn btn--ghost btn--small index-toggle"
        aria-pressed={listView}
        onClick={() => setListView((v) => !v)}
      >
        <List size={16} aria-hidden="true" />
        {listView ? 'Ver rueda' : 'Ver índice en lista'}
      </button>

      {listView ? (
        <IndexList />
      ) : (
        <>
          <FamilyWheel selected={selected} onSelect={select} />
          {collapsed ? (
            <button
              type="button"
              className="btn btn--secondary btn--block"
              onClick={() => setCollapsed(false)}
              aria-controls="panel-familia"
              aria-expanded={false}
            >
              <ChevronDown size={18} aria-hidden="true" />
              Mostrar {getFamily(selected).title}
            </button>
          ) : (
            <FamilyPanel family={getFamily(selected)} onCollapse={() => setCollapsed(true)} />
          )}
        </>
      )}
    </div>
  );
}

/** Alternativa accesible a la rueda: las seis familias y sus 13 capítulos en lista. */
function IndexList() {
  return (
    <nav aria-label="Índice en lista" className="index-list paper-card">
      {FAMILIES.map((family) => (
        <section key={family.id} className="index-list__family">
          <h2 className="index-list__family-title">{family.title}</h2>
          <p className="index-list__family-subtitle">{family.subtitle}</p>
          <ol className="index-list__chapters">
            {getChaptersByFamily(family.id).map((c) => (
              <li key={c.id}>
                <Link to={`/capitulos/${c.id}`} className="index-list__link">
                  <span className="index-list__numeral">{c.romanNumeral}</span>
                  <span>{c.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </nav>
  );
}
