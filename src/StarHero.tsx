import { useEffect, useRef } from 'react';
import { CornerDownLeft, Orbit, Terminal } from 'lucide-react';

function followPointer(hero: HTMLElement) {
  let frame = 0;
  let x = 0, y = 0;
  function draw() {
    frame = 0;
    const box = hero.getBoundingClientRect();
    const px = x - box.left, py = y - box.top;
    hero.style.setProperty('--lens-x', px + 'px');
    hero.style.setProperty('--lens-y', py + 'px');
    hero.style.setProperty('--drift-x', (px / box.width - .5) * 12 + 'px');
    hero.style.setProperty('--drift-y', (py / box.height - .5) * 10 + 'px');
    hero.dataset.exploring = '';
  }
  function track(event: PointerEvent) {
    x = event.clientX; y = event.clientY;
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    delete hero.dataset.exploring;
    hero.style.removeProperty('--drift-x');
    hero.style.removeProperty('--drift-y');
  }
  hero.addEventListener('pointermove', track);
  hero.addEventListener('pointerleave', reset);
  hero.addEventListener('pointercancel', reset);
  return () => {
    hero.removeEventListener('pointermove', track);
    hero.removeEventListener('pointerleave', reset);
    hero.removeEventListener('pointercancel', reset);
    reset();
  };
}

export function StarHero() {
  const scene = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = scene.current;
    if (!hero) return;
    const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let stop: (() => void) | undefined;
    function sync() {
      stop?.();
      stop = motion.matches && hero ? followPointer(hero) : undefined;
    }
    sync();
    motion.addEventListener('change', sync);
    return () => { motion.removeEventListener('change', sync); stop?.(); };
  }, []);
  return <header className="masthead relative isolate flex flex-col overflow-hidden" ref={scene}>
    <div className="sky-field absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="sky-photo sky-base absolute inset-0" />
      <div className="sky-photo sky-reveal absolute inset-0" />
      <div className="sky-stars" />
    </div>
    <div className="sky-copy wrap relative">
      <h1>Daydreamer’s<br /><em>Blog<span>.</span></em></h1>
      <p><span>把一闪而过的想法，</span><span>留在这片星空。</span></p>
      <a className="sky-command inline-flex items-center" href="#articles" aria-label="进入文章列表，cd ~/articles">
        <Terminal size={19} aria-hidden="true" />
        <code><span>cd</span> ~/articles</code>
        <kbd aria-hidden="true"><CornerDownLeft size={15} /></kbd>
      </a>
    </div>
    <div className="sky-legend wrap relative flex items-center justify-end">
      <span className="sky-target"><Orbit size={16} aria-hidden="true" />
        <span className="sky-day-target">M8 <i aria-hidden="true">/</i> 礁湖星云</span>
        <span className="sky-night-target">M16 <i aria-hidden="true">/</i> 创生之柱</span>
      </span>
    </div>
  </header>;
}
