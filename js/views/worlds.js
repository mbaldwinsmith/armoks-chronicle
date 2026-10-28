import {titleCase} from '../data/language.js?v=0.26.0';
import {renderDirectory} from './explore.js?v=0.26.0';
import {openDatabase,listWorlds,getWorld,deleteWorld} from '../data/database.js?v=0.26.0';
let generation=0;
export function cancelWorldView(){generation++;}
export async function renderBookshelf() {
  const target=document.querySelector('#world-list');
  const empty=document.querySelector('#empty-archive');
  let db;
  try {
    db=await openDatabase();const worlds=await listWorlds(db);
    target.replaceChildren();empty.hidden=worlds.length>0;
    document.querySelector('#world-count').textContent=`${worlds.length} WORLD${worlds.length===1?'':'S'}`;
    for(const world of worlds){
      const row=document.querySelector('#world-card').content.cloneNode(true);
      row.querySelector('h3').textContent=titleCase(world.name);
      row.querySelector('.world-subtitle').textContent=titleCase(world.alternativeName) || 'A world awaiting exploration';
      row.querySelector('.world-stats').textContent=`${(world.counts.historical_figures||0).toLocaleString()} figures · ${(world.counts.historical_events||0).toLocaleString()} event${world.counts.historical_events===1?'':'s'}`;
      row.querySelector('a').href=`#/world/${encodeURIComponent(world.id)}/desk`;
      row.querySelector('.world-date').textContent=`Imported ${new Date(world.importedAt).toLocaleDateString()}`;
      target.append(row);
    }
    document.querySelector('#storage-status').textContent='Worlds are saved in this browser. Clearing site data removes them.';
  } catch(error){document.querySelector('#storage-status').textContent=`World storage unavailable: ${error.message}`;}
  finally {db?.close();}
}
export async function renderWorld(id, params) {
  const ticket=++generation;let db;
  const title=document.querySelector('#world-title'),status=document.querySelector('#record-status'),list=document.querySelector('#records');
  title.textContent='Opening world…';list.replaceChildren();status.textContent='';
  document.querySelector('#world-details').hidden=true;
  try {
    db=await openDatabase();const world=await getWorld(db,id);
    if(ticket!==generation)return;
    if(!world || world.status!=='ready'){title.textContent='World not available';status.textContent='This world may have been deleted, or it belongs to another browser.';return;}
    document.querySelector('#open-desk').href=`#/world/${encodeURIComponent(id)}/desk`;
    document.querySelector('#open-grudges').href=`#/world/${encodeURIComponent(id)}/grudges`;
    document.querySelector('#open-warfare').href=`#/world/${encodeURIComponent(id)}/wars`;
    document.querySelector('#open-record-book').href=`#/world/${encodeURIComponent(id)}/records`;
    document.querySelector('#open-atlas').href=`#/world/${encodeURIComponent(id)}/atlas`;
    const shortcuts=document.querySelector('#culture-shortcuts');shortcuts.replaceChildren();for(const [kind,label] of [['artifacts','Artifacts'],['written_contents','Written works'],['poetic_forms','Poetic forms'],['musical_forms','Musical forms'],['dance_forms','Dance forms']]){const link=document.createElement('a');link.className='button quiet';link.textContent=`${label} (${world.counts[kind]||0})`;link.href=`#/world/${encodeURIComponent(id)}?kind=${kind}`;shortcuts.append(link);}
    title.textContent=titleCase(world.name);
    document.title=titleCase(world.name)+' · Armok’s Chronicle';
    document.querySelector('#world-subtitle').textContent=titleCase(world.alternativeName)||'Imported world archive';
    document.querySelector('#world-details').hidden=false;
    document.querySelector('#import-diagnostics').textContent=world.diagnostics.map(d=>`${d.file}: ${d.records.toLocaleString()} source records; ${d.removedControls} invalid XML control characters removed; ${d.encoding}.`).join('\n');
    const dialog=document.querySelector('#delete-dialog');
    document.querySelector('#delete-error').textContent='';
    document.querySelector('#delete-world').onclick=()=>{document.querySelector('#delete-name').textContent=titleCase(world.name);dialog.showModal();};
    document.querySelector('#confirm-delete').onclick=async()=>{let connection;const button=document.querySelector('#confirm-delete');button.disabled=true;try{connection=await openDatabase();await deleteWorld(connection,id);dialog.close();location.hash='#/library';}catch(error){document.querySelector('#delete-error').textContent=error.message;}finally{connection?.close();button.disabled=false;}};
    await renderDirectory(id, params);
  }catch(error){status.textContent=error.message;}finally{db?.close();}
}
export async function renderRecovery() {
  let db;
  try {
    db=await openDatabase();
    const staged=await new Promise((resolve,reject)=>{const r=db.transaction('worlds').objectStore('worlds').index('status').getAll('staging');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    const panel=document.querySelector('#recovery');panel.hidden=!staged.length;
    document.querySelector('#recovery-text').textContent=`${staged.length} unfinished import(s) remain in local storage. Close other import tabs before discarding these.`;
    document.querySelector('#discard-incomplete').onclick=async()=>{let d;try{d=await openDatabase();for(const w of staged)await deleteWorld(d,w.id);panel.hidden=true;}catch(e){document.querySelector('#recovery-text').textContent=e.message;}finally{d?.close();}};
  }catch{}finally{db?.close();}
}
