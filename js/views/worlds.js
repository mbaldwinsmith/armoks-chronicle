import {openDatabase,listWorlds,getWorld,readPage,deleteWorld} from '../data/database.js';
const names={historical_figures:'Historical figures',historical_events:'Historical events',sites:'Sites',entities:'Organisations',artifacts:'Artifacts',written_contents:'Written works'};
let generation=0;
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
      row.querySelector('h3').textContent=world.name;
      row.querySelector('.world-subtitle').textContent=world.alternativeName || 'A world awaiting exploration';
      row.querySelector('.world-stats').textContent=`${(world.counts.historical_figures||0).toLocaleString()} figures · ${(world.counts.historical_events||0).toLocaleString()} events`;
      row.querySelector('a').href=`#/world/${encodeURIComponent(world.id)}`;
      row.querySelector('.world-date').textContent=`Imported ${new Date(world.importedAt).toLocaleDateString()}`;
      target.append(row);
    }
    document.querySelector('#storage-status').textContent='Worlds are saved in this browser. Clearing site data removes them.';
  } catch(error){document.querySelector('#storage-status').textContent=`World storage unavailable: ${error.message}`;}
  finally {db?.close();}
}
export async function renderWorld(id) {
  const ticket=++generation;let db;
  const title=document.querySelector('#world-title'),status=document.querySelector('#record-status'),list=document.querySelector('#records');
  title.textContent='Opening world…';list.replaceChildren();status.textContent='';
  document.querySelector('#world-details').hidden=true;
  try {
    db=await openDatabase();const world=await getWorld(db,id);
    if(ticket!==generation)return;
    if(!world || world.status!=='ready'){title.textContent='World not available';status.textContent='This world may have been deleted, or it belongs to another browser.';return;}
    title.textContent=world.name;
    document.querySelector('#world-subtitle').textContent=world.alternativeName||'Imported world archive';
    document.querySelector('#world-details').hidden=false;
    const select=document.querySelector('#record-kind');select.replaceChildren();
    for(const [kind,count] of Object.entries(world.counts).sort(([a],[b])=>a.localeCompare(b))){const option=document.createElement('option');option.value=kind;option.textContent=`${names[kind]||kind.replaceAll('_',' ')} (${count.toLocaleString()})`;select.append(option);}
    if(world.counts.historical_figures)select.value='historical_figures';
    document.querySelector('#import-diagnostics').textContent=world.diagnostics.map(d=>`${d.file}: ${d.records.toLocaleString()} source records; ${d.removedControls} invalid XML control characters removed; ${d.encoding}.`).join('\n');
    let offset=0,query=0;
    async function loadPage(){
      const request=++query,kind=select.value;let connection;
      list.replaceChildren();status.textContent='Loading records…';
      try{connection=await openDatabase();const rows=await readPage(connection,id,kind,offset);
        if(ticket!==generation||request!==query)return;
        for(const record of rows){const details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent=`${record.label} · #${record.id}`;details.append(summary);details.addEventListener('toggle',()=>{if(details.open&&!pre.textContent){pre.textContent=JSON.stringify({fields:record.data,sources:record.sources,...(record.supplement?{supplementaryFields:record.supplement}:{})},null,2);details.append(pre);}},{once:true});list.append(details);}
        const total=world.counts[kind];status.textContent=total?`Records ${offset+1}–${Math.min(offset+50,total)} of ${total.toLocaleString()}`:'No records in this section.';
        document.querySelector('#previous-records').disabled=offset===0;document.querySelector('#next-records').disabled=offset+50>=total;
      }catch(error){status.textContent=`Could not load records: ${error.message}`;}finally{connection?.close();}
    }
    select.onchange=()=>{offset=0;void loadPage();};
    document.querySelector('#previous-records').onclick=()=>{offset=Math.max(0,offset-50);void loadPage();};
    document.querySelector('#next-records').onclick=()=>{offset+=50;void loadPage();};
    const dialog=document.querySelector('#delete-dialog');
    document.querySelector('#delete-world').onclick=()=>{document.querySelector('#delete-name').textContent=world.name;dialog.showModal();};
    document.querySelector('#confirm-delete').onclick=async()=>{let connection;const button=document.querySelector('#confirm-delete');button.disabled=true;try{connection=await openDatabase();await deleteWorld(connection,id);dialog.close();location.hash='#/library';}catch(error){document.querySelector('#delete-error').textContent=error.message;}finally{connection?.close();button.disabled=false;}};
    await loadPage();
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
