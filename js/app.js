import {renderResearch,cancelResearchView,allowResearchNavigation} from './views/research.js?v=0.33.0';
import {stopExplorer} from './data/explorer-client.js?v=0.33.0';
import { startRouter } from './router.js?v=0.33.0';
import { state, readTheme, setTheme } from './state.js?v=0.33.0';
import { setupImportPreview } from './views/import-preview.js?v=0.33.0';
import { renderBookshelf, renderWorld, renderRecovery, cancelWorldView } from './views/worlds.js?v=0.33.0';
// Native imports keep specialist code off the bookshelf's initial dependency graph.
const loadedViews=new Map();let routeGeneration=0;
const views={
 reports:[()=>import('./views/reports.js?v=0.33.0'),'renderReports','cancelReports'],
 structures:[()=>import('./views/structures.js?v=0.33.0'),'renderStructures','cancelStructures'],
 intrigue:[()=>import('./views/intrigue.js?v=0.33.0'),'renderIntrigue','cancelIntrigue'],
 religion:[()=>import('./views/religion.js?v=0.33.0'),'renderReligion','cancelReligion'],
 bestiary:[()=>import('./views/bestiary.js?v=0.33.0'),'renderBestiary','cancelBestiary'],
 artifacts:[()=>import('./views/artifacts.js?v=0.33.0'),'renderArtifacts','cancelArtifacts'],
 chronicles:[()=>import('./views/chronicles.js?v=0.33.0'),'renderChronicles','cancelChronicles'],
 chronicle:[()=>import('./views/chronicles.js?v=0.33.0'),'renderChronicle','cancelChronicles'],
 grudges:[()=>import('./views/grudges.js?v=0.33.0'),'renderGrudges','cancelGrudges'],
 desk:[()=>import('./views/desk.js?v=0.33.0'),'renderDesk','cancelDesk'],
 faction:[()=>import('./views/faction-warfare.js?v=0.33.0'),'renderFactionWarfare','cancelFactionWarfare'],
 warfare:[()=>import('./views/warfare.js?v=0.33.0'),'renderWarfare','cancelWarfare'],
 book:[()=>import('./views/book-of-records.js?v=0.33.0'),'renderRecordBook','cancelRecordBook'],
 atlas:[()=>import('./views/atlas.js?v=0.33.0'),'renderAtlas','stopAtlas'],
 record:[()=>import('./views/explore.js?v=0.33.0'),'renderRecord','cancelExploration'],
 world:[()=>import('./views/explore.js?v=0.33.0'),null,'cancelExploration']
};
const toggle = document.querySelector('#theme-toggle');
function applyTheme(theme) {
  setTheme(theme);
  toggle.setAttribute('aria-pressed', String(theme === 'parchment'));
}
applyTheme(readTheme());
toggle.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'parchment' : 'dark'));
startRouter((route, parts, params) => {
  const ticket=++routeGeneration;
  for(const [cancel,module] of loadedViews)module[cancel]();
  cancelResearchView();cancelWorldView();
  if(!['world','record','book','warfare','faction','desk','grudges','artifacts','bestiary','religion','intrigue','structures','reports'].includes(route))stopExplorer();
  const [id,kind,recordId]=parts;state.route=route;
  if(route==='research')void renderResearch();
  if(route==='library')void renderBookshelf();
  if(route==='import')void renderRecovery();
  if(views[route])void openView();
  async function openView(){
    const [load,render,cancel]=views[route],view=document.querySelector('#view-'+route);
    view.querySelector('.view-load-error')?.remove();view.setAttribute('aria-busy','true');
    try{
      const module=await load();loadedViews.set(cancel,module);
      if(ticket!==routeGeneration)return;
      // Live progress messages remain available while the view reads local data.
      view.removeAttribute('aria-busy');
      if(route==='world')await renderWorld(id,params);
      else if(route==='record')await module[render](id,kind,recordId,params);
      else if(route==='faction')await module[render](id,kind,params);
      else if(route==='chronicle')await module[render](id);
      else if(route==='chronicles')await module[render](params);
      else await module[render](id,params);
    }catch(error){if(ticket===routeGeneration){let notice=view.querySelector('.view-load-error');if(!notice){notice=document.createElement('p');notice.className='notice view-load-error';notice.setAttribute('role','alert');view.append(notice);}notice.textContent='This view could not load. Check your connection and reload the page. '+error.message;}}
    finally{if(ticket===routeGeneration)view.removeAttribute('aria-busy');}
  }
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
