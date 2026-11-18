import { initialView, planetSurface, type PlanetView } from './planetSurface';
import { topics } from './archiveTopics';

export function mountPlanet(section: HTMLElement, stage: HTMLElement, index: number, onStep: (step: number) => void) {
  const planet = topics[index].planet;
  const canvas = stage.querySelector<HTMLCanvasElement>('.current-world canvas')!;
  const surface = planetSurface(canvas, planet.map);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const { signal } = listeners;
  const nearby = stage.parentElement!;
  let hovering = matchMedia('(hover: hover)').matches && nearby.matches(':hover');
  let visible = false;
  let frame = 0, last = 0;
  let view = { ...initialView, longitude: planet.longitude };
  let gesture: { id: number; x: number; y: number; start: PlanetView; dragging: boolean } | undefined;

  function paint(next: PlanetView) {
    view = next;
    surface.draw(view);
    if (planet.rings) canvas.parentElement?.parentElement?.style.setProperty('--ring-height', Math.sin(view.latitude * Math.PI / 180) * 168 + '%');
  }
  function tick(now: number) {
    if (!last || now - last >= 32) {
      paint({ ...view, longitude: view.longitude + (last ? Math.min(now - last, 80) * .005 : 0) });
      last = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const run = visible && !document.hidden && !motion.matches && !gesture && !hovering && !section.querySelector(':focus-visible');
    if (run && !frame) { last = 0; frame = requestAnimationFrame(tick); }
    if (!run && frame) { cancelAnimationFrame(frame); frame = 0; }
  }
  function release() {
    if (!gesture) return;
    const id = gesture.id;
    gesture = undefined;
    delete stage.dataset.dragging;
    if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
    sync();
  }
  stage.addEventListener('pointerdown', e => {
    if (!e.isPrimary || e.button !== 0 || gesture) return;
    gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, start: view, dragging: false };
    stage.setPointerCapture(e.pointerId);
    sync();
  }, { signal });
  stage.addEventListener('pointermove', e => {
    if (gesture?.id !== e.pointerId) return;
    const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.hypot(dx, dy) < 6) return;
      if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) { release(); return; }
      gesture.dragging = true;
      stage.dataset.dragging = '';
    }
    const tilt = e.pointerType === 'touch' ? 0 : dy * .12;
    paint({ longitude: gesture.start.longitude - dx * .55, latitude: Math.max(5, Math.min(34, gesture.start.latitude + tilt)) });
  }, { signal });
  stage.addEventListener('pointerup', e => {
    if (gesture?.id !== e.pointerId) return;
    const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
    const travel = gesture.dragging && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy);
    release();
    if (travel) onStep(dx < 0 ? 1 : -1);
  }, { signal });
  stage.addEventListener('lostpointercapture', release, { signal });
  stage.addEventListener('pointercancel', release, { signal });
  window.addEventListener('blur', release, { signal });
  nearby.addEventListener('pointerenter', e => { hovering = e.pointerType !== 'touch'; sync(); }, { signal });
  nearby.addEventListener('pointerleave', () => { hovering = false; sync(); }, { signal });
  section.addEventListener('focusin', sync, { signal });
  section.addEventListener('focusout', sync, { signal });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(stage);
  document.addEventListener('visibilitychange', () => { if (document.hidden) release(); sync(); }, { signal });
  motion.addEventListener('change', sync, { signal });
  paint(view);
  return () => {
    listeners.abort(); observer.disconnect(); surface.dispose(); cancelAnimationFrame(frame);
    if (gesture && stage.hasPointerCapture(gesture.id)) stage.releasePointerCapture(gesture.id);
    delete stage.dataset.dragging;
  };
}
