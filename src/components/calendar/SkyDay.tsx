import { AlertTriangle, Flame, Moon } from 'lucide-react';
import { PHASE_LABELS } from '../../utils/astro';
import type { DaySky } from '../../utils/sky';
import { dayKeyInZone, formatInZone, formatTimeInZone } from '../../utils/timezone';
import { MoonIcon } from './MoonIcon';

interface Props {
  sky: DaySky | undefined;
  timeZone: string;
}

/** Lo que pasa en el cielo un día: fase, sabbat, esbat y luna vacía de curso (hemisferio sur). */
export function SkyDay({ sky, timeZone }: Props) {
  if (!sky) return null;
  const time = (d: Date) => formatTimeInZone(d.toISOString(), timeZone);
  const when = (d: Date) => formatInZone(d.toISOString(), timeZone);
  const items = [];

  if (sky.moon) {
    items.push(
      <li key="moon" className="sky-day__item">
        <MoonIcon angle={sky.moon.angle} hemisphere="south" size={24} />
        <div>
          <p className="sky-day__title">
            {sky.quarter ? PHASE_LABELS[sky.quarter.key] : PHASE_LABELS[sky.moon.key]}
          </p>
          <p className="sky-day__text">
            {sky.quarter
              ? `Exacta a las ${time(sky.quarter.at)}.`
              : `Iluminada al ${Math.round(sky.moon.illumination * 100)} % a mediodía.`}
          </p>
        </div>
      </li>,
    );
  }

  for (const s of sky.sabbats) {
    items.push(
      <li key={`sabbat-${s.id}`} className="sky-day__item sky-day__item--sabbat">
        <Flame size={22} aria-hidden="true" color="#8a6420" />
        <div>
          <p className="sky-day__title">Sabbat · {s.name}</p>
          <p className="sky-day__text">{s.meaning}</p>
          <p className="sky-day__note">
            {s.basis === 'astronomico' && s.at
              ? `Momento astronómico exacto: ${time(s.at)}.`
              : 'Fecha tradicional del hemisferio sur; algunas tradiciones la celebran un día antes o después.'}
          </p>
        </div>
      </li>,
    );
  }

  for (const e of sky.esbats) {
    items.push(
      <li key={`esbat-${e.at.toISOString()}`} className="sky-day__item sky-day__item--esbat">
        <Moon size={22} aria-hidden="true" color="#5a4585" />
        <div>
          <p className="sky-day__title">Esbat · {e.name}</p>
          <p className="sky-day__text">Luna llena exacta a las {time(e.at)}.</p>
          <p className="sky-day__note">
            {e.isBlueMoon
              ? 'Segunda luna llena del mes.'
              : 'Nombre tradicional del folclore, adaptado a las estaciones del sur (simbólico).'}
          </p>
        </div>
      </li>,
    );
  }

  for (const v of sky.voc) {
    items.push(
      <li key={`voc-${v.start.toISOString()}`} className="sky-day__item sky-day__item--voc" role="note">
        <AlertTriangle size={22} aria-hidden="true" color="#8b3a2e" />
        <div>
          <p className="sky-day__title">Luna vacía de curso</p>
          <p className="sky-day__text">
            {dayKeyInZone(v.start.toISOString(), timeZone) === dayKeyInZone(v.end.toISOString(), timeZone)
              ? `De ${time(v.start)} a ${time(v.end)}`
              : `Desde ${when(v.start)} hasta ${when(v.end)}`}
            , cuando la Luna entra en {v.toSign}.
          </p>
          <p className="sky-day__note">
            Tradicionalmente se evita iniciar proyectos o rituales importantes en este periodo.
          </p>
        </div>
      </li>,
    );
  }

  if (!items.length) return null;
  return (
    <ul className="sky-day" aria-label="El cielo de este día">
      {items}
    </ul>
  );
}
