const storageKey = 'daydreamer-theme';

export function timePeriod() {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 6 ? 'night' : 'day';
}

export function automaticTheme(period) {
  return period === 'night' ? 'dark' : 'light';
}

export function initialTheme(period) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.period === period && ['light', 'dark'].includes(saved.theme)) return saved.theme;
  } catch { /* Storage is optional. */ }
  return automaticTheme(period);
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#111724' : '#e9e9e3';
}

export function saveChoice(theme, period) {
  try {
    if (theme) localStorage.setItem(storageKey, JSON.stringify({ theme, period }));
    else localStorage.removeItem(storageKey);
    return true;
  } catch {
    return false;
  }
}
