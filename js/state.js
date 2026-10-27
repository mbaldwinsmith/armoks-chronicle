const preferenceKey = 'armoks-chronicle:theme';
export const state = { route: 'library', theme: 'dark' };
export function readTheme() {
  try { return localStorage.getItem(preferenceKey) === 'parchment' ? 'parchment' : 'dark'; }
  catch { return 'dark'; }
}
export function setTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(preferenceKey, theme); } catch { /* Session preference still works. */ }
}
