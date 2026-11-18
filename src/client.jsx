import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme, automaticTheme, saveChoice, timePeriod } from './theme.js';

function ThemeToggle() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme);
  const period = useRef(timePeriod());
  const dark = theme === 'dark';
  const label = dark ? '切换到日间模式' : '切换到夜间模式';

  useEffect(() => {
    const timer = setInterval(() => {
      const next = timePeriod();
      if (next === period.current) return;
      period.current = next;
      saveChoice(null, next);
      const theme = automaticTheme(next);
      applyTheme(theme);
      setTheme(theme);
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  function toggle() {
    const next = dark ? 'light' : 'dark';
    period.current = timePeriod();
    saveChoice(next, period.current);
    const change = () => { applyTheme(next); setTheme(next); };
    if (document.startViewTransition && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      document.startViewTransition(change);
    } else {
      change();
    }
  }

  return <button type="button" className="theme-toggle" onClick={toggle}
    title={label} aria-label={label} aria-pressed={dark}>
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
        : <path d="M20.5 14.2A8.8 8.8 0 0 1 9.8 3.5a8.8 8.8 0 1 0 10.7 10.7Z" />}
    </svg>
  </button>;
}

function readOutline() {
  const roots = [];
  const stack = [];
  document.querySelectorAll('.content :is(h2, h3, h4)').forEach((heading, index) => {
    const text = heading.textContent.trim();
    if (!heading.id) {
      const base = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '') || `heading-${index}`;
      let id = base;
      let suffix = 1;
      while (document.getElementById(id)) id = `${base}-${suffix++}`;
      heading.id = id;
    }
    const level = Number(heading.tagName[1]);
    const item = { id: heading.id, level, text, children: [] };
    while (stack.length && stack.at(-1).level >= level) stack.pop();
    (stack.at(-1)?.children ?? roots).push(item);
    stack.push(item);
  });
  return roots;
}

function Contents({ items, nested = false }) {
  if (!items.length) return null;
  return <ul className={nested ? 'toc-sublist' : 'toc-list'}>{items.map(item =>
    <li key={item.id} className={`toc-item-h${item.level}`}>
      <a href={`#${item.id}`} className="toc-link">{item.text}</a>
      <Contents items={item.children} nested />
    </li>
  )}</ul>;
}

createRoot(document.getElementById('theme-control')).render(<ThemeToggle />);

const navbar = document.querySelector('.navbar');
let lastGlass = -1;
function updateNavGlass() {
  const glass = Math.min(1, Math.max(0, scrollY / 160));
  if (glass === lastGlass) return;
  navbar.style.setProperty('--glass', String(glass));
  lastGlass = glass;
}
updateNavGlass();
window.addEventListener('scroll', updateNavGlass, { passive: true });

function ArticleContents({ items }) {
  const details = useRef(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 801px)');
    const sync = () => { details.current.open = desktop.matches; };
    sync();
    desktop.addEventListener('change', sync);
    return () => desktop.removeEventListener('change', sync);
  }, []);
  return <details ref={details}><summary>文章目录</summary><Contents items={items} /></details>;
}

const toc = document.getElementById('toc-container');
if (toc) {
  const items = readOutline();
  if (items.length) createRoot(toc).render(<ArticleContents items={items} />);
}
