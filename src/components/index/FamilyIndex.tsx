import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFamily, isFamilyId } from '../../config/families';
import type { FamilyId } from '../../types/domain';
import { FamilyPanel } from './FamilyPanel';
import { FamilyWheel } from './FamilyWheel';

/**
 * El índice del grimorio (sección 3): la rueda y, solo si hay una familia
 * elegida (`?familia=`), su panel de capítulos. El medallón central es «el
 * índice» y vuelve a dejar la rueda sola.
 */
export function FamilyIndex() {
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
    <>
      <FamilyWheel selected={selected} onSelect={select} />
      {selected && <FamilyPanel family={getFamily(selected)} onCollapse={() => select(null)} />}
    </>
  );
}
