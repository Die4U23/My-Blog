import { topics } from './archiveTopics';
import type { CSSProperties } from 'react';

// Keep the same sky for static rendering and hydration. The curves concentrate
// stars along a galactic band, with a sparser foreground for parallax.
function starPaths() {
  let seed = 73;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const distant: string[] = [], near: string[] = [];
  for (let i = 0; i < 290; i++) {
    const x = random() * 800 - 120;
    const band = 230 - .23 * x + 22 * Math.sin(x / 95);
    const y = i % 5 ? band + (random() + random() - 1) * 76 : random() * 340;
    const r = i % 9 ? .65 : 1.25;
    const star = `M${x.toFixed(1)} ${y.toFixed(1)}h${r}`;
    (i % 9 ? distant : near).push(star);
  }
  return [distant.join(''), near.join('')];
}
const [distant, near] = starPaths();

export function GalaxyField({ travel }: { travel: boolean }) {
  return <div className={'galaxy-field' + (travel ? ' in-transit' : '')} aria-hidden="true">
    <div className="galaxy-dust" />
    <svg viewBox="0 0 560 340" preserveAspectRatio="xMidYMid slice">
      <g className="galaxy-far"><path d={distant} /></g>
      <g className="galaxy-near"><path d={near} />
        <path className="galaxy-arches" d="M-50 278Q70 220 175 211T405 144T650 115 M-60 262Q65 218 170 207T437 136T650 113" />
      </g>
    </svg>
  </div>;
}

export function TopicPlanet({ index, departing, entering }: { index: number; departing: boolean; entering: boolean }) {
  const planet = topics[index].planet;
  return <div className={'world-layer ' + (departing ? 'departing-world' : entering ? 'current-world arriving-world' : 'current-world')}
    data-world={planet.name} style={{ '--world-color': planet.color, '--size-factor': planet.scale,
      '--axial-tilt': planet.tilt + 'deg', '--world-map': `url("${planet.map}")` } as CSSProperties}>
    <div className="planet-system">
      {planet.rings && <div className="saturn-ring" />}
      <div className="planet-globe"><canvas /><div className="planet-light" /></div>
      {planet.rings && <div className="saturn-ring ring-foreground" />}
    </div>
  </div>;
}
