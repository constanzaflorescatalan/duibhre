import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FamilyPanel } from '../components/index/FamilyPanel';
import { FamilyWheel } from '../components/index/FamilyWheel';
import { getFamily, isFamilyId } from '../config/families';
import { UI } from '../config/uiCopy';
import type { FamilyId } from '../types/domain';

/**
 * Índice `/indice?familia=…` (secciones 3 y 7.3). Solo la rueda: el panel de
 * una familia aparece al elegirla. El medallón central es «el índice» y vuelve
 * a dejar la rueda sola. La búsqueda vive en la cabecera.
 */
export function IndexPage() {
  const [params, setParams] = useSearchParams();
  const fromQuery = params.get('familia');
  const selected: FamilyId | null = isFamilyId(fromQuery) ? fromQuery : null;

  const scrollToPanel = useRef(false);

  const select = (id: FamilyId | null) => {
    // Al abrir una familia desde la rueda sola, acercar su panel para que se vea.
    scrollToPanel.current = id !== null && selected === null;
    setParams(id ? { familia: id } : {}, { replace: true, preventScrollReset: true });
  };

  useEffect(() => {
    if (!selected || !scrollToPanel.current) return;
    scrollToPanel.current = false;
    document.getElementById('panel-familia')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [selected]);

  return (
    <div className={`leather-page index-page${selected ? '' : ' index-page--wheel-only'}`}>
      <h1 className="visually-hidden">{UI.pages.index.title}</h1>
      <FamilyWheel selected={selected} onSelect={select} />
      {selected && <FamilyPanel family={getFamily(selected)} onCollapse={() => select(null)} />}
    </div>
  );
}
