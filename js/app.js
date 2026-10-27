import { startRouter } from './router.js';
import { state, readTheme, setTheme } from './state.js';
import { setupImportPreview } from './views/import-preview.js';
const toggle = document.querySelector('#theme-toggle');
function applyTheme(theme) {
  setTheme(theme);
  toggle.setAttribute('aria-pressed', String(theme === 'parchment'));
}
applyTheme(readTheme());
toggle.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'parchment' : 'dark'));
startRouter(route => { state.route = route; });
setupImportPreview();
const unavailable = [];
if (!('Worker' in window)) unavailable.push('background processing');
if (!('indexedDB' in window)) unavailable.push('persistent world storage');
if (location.protocol === 'file:') unavailable.push('HTTP hosting (open this app through a local server)');
if (unavailable.length) {
  const notice = document.querySelector('#capabilities');
  notice.hidden = false;
  notice.textContent = `Unavailable in this environment: ${unavailable.join(', ')}. Navigation and the field guide remain available.`;
}
