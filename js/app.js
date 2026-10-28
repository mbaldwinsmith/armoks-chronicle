import {renderChronicles,renderChronicle,cancelChronicles} from './views/chronicles.js?v=0.24.0';
import {renderGrudges,cancelGrudges} from './views/grudges.js?v=0.24.0';
import {renderDesk,cancelDesk} from './views/desk.js?v=0.24.0';
import {renderFactionWarfare,cancelFactionWarfare} from './views/faction-warfare.js?v=0.24.0';
import {renderWarfare,cancelWarfare} from './views/warfare.js?v=0.24.0';
import {renderRecordBook,cancelRecordBook} from './views/book-of-records.js?v=0.24.0';
import {renderResearch,cancelResearchView,allowResearchNavigation} from './views/research.js?v=0.24.0';
import {renderAtlas,stopAtlas} from './views/atlas.js?v=0.24.0';
import {renderRecord,cancelExploration} from './views/explore.js?v=0.24.0';
import {stopExplorer} from './data/explorer-client.js?v=0.24.0';
import { startRouter } from './router.js?v=0.24.0';
import { state, readTheme, setTheme } from './state.js?v=0.24.0';
import { setupImportPreview } from './views/import-preview.js?v=0.24.0';
import { renderBookshelf, renderWorld, renderRecovery, cancelWorldView } from './views/worlds.js?v=0.24.0';
const toggle = document.querySelector('#theme-toggle');
function applyTheme(theme) {
  setTheme(theme);
  toggle.setAttribute('aria-pressed', String(theme === 'parchment'));
}
applyTheme(readTheme());
toggle.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'parchment' : 'dark'));
startRouter((route, parts, params) => {
  cancelChronicles();cancelGrudges();cancelDesk();cancelFactionWarfare();cancelWarfare();cancelRecordBook();cancelResearchView();cancelWorldView();cancelExploration();stopAtlas();
  if(!['world','record','book','warfare','faction','desk','grudges'].includes(route))stopExplorer();
  const [id,kind,recordId]=parts;
  state.route = route;
  if(route === 'chronicles') void renderChronicles(params);
  if(route === 'chronicle') void renderChronicle(id);
  if(route === 'research') void renderResearch();
  if(route === 'library') void renderBookshelf();
  if(route === 'grudges') void renderGrudges(id,params);
  if(route === 'desk') void renderDesk(id,params);
  if(route === 'faction') void renderFactionWarfare(id,kind,params);
  if(route === 'warfare') void renderWarfare(id,params);
  if(route === 'book') void renderRecordBook(id,params);
  if(route === 'world') void renderWorld(id,params);
  if(route === 'atlas') renderAtlas(id,params);
  if(route === 'record') void renderRecord(id,kind,recordId,params);
  if(route === 'import') void renderRecovery();
},allowResearchNavigation);
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
