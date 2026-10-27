import {renderAtlas,stopAtlas} from './views/atlas.js?v=0.5.1';
import {renderRecord,cancelExploration} from './views/explore.js?v=0.5.1';
import {stopExplorer} from './data/explorer-client.js?v=0.5.1';
import { startRouter } from './router.js?v=0.5.1';
import { state, readTheme, setTheme } from './state.js?v=0.5.1';
import { setupImportPreview } from './views/import-preview.js?v=0.5.1';
import { renderBookshelf, renderWorld, renderRecovery, cancelWorldView } from './views/worlds.js?v=0.5.1';
const toggle = document.querySelector('#theme-toggle');
function applyTheme(theme) {
  setTheme(theme);
  toggle.setAttribute('aria-pressed', String(theme === 'parchment'));
}
applyTheme(readTheme());
toggle.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'parchment' : 'dark'));
startRouter((route, parts, params) => {
  cancelWorldView();cancelExploration();stopAtlas();
  if(!['world','record'].includes(route))stopExplorer();
  const [id,kind,recordId]=parts;
  state.route = route;
  if(route === 'library') void renderBookshelf();
  if(route === 'world') void renderWorld(id,params);
  if(route === 'atlas') renderAtlas(id,params);
  if(route === 'record') void renderRecord(id,kind,recordId,params);
  if(route === 'import') void renderRecovery();
});
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

document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); document.querySelector('#main').focus(); });
