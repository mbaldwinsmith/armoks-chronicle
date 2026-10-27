import {saveResearch,getResearch,listResearch,makeBackup,parseBackup,restoreResearch,removeResearchEntry} from '../js/data/research.js?v=0.9.0';
import {culturePanel} from '../js/views/culture.js?v=0.9.0';
import {narratives,biography} from '../js/views/narrative.js?v=0.9.0';
import {explore,stopExplorer} from '../js/data/explorer-client.js?v=0.9.0';
import {openDatabase,saveWorld,saveRecords,saveFile,getWorld,getRecord,readPage,countKind,listWorlds,deleteWorld} from '../js/data/database.js?v=0.9.0';
const output=document.querySelector('#results');
function assert(value,message){if(!value)throw Error(message);}
function runImport(id,files){return new Promise((resolve,reject)=>{const worker=new Worker(new URL('../js/import/import-worker.js?v=0.9.0',import.meta.url),{type:'module'});const timeout=setTimeout(()=>{worker.terminate();reject(Error('Import timed out'));},30000);worker.onmessage=({data})=>{if(data.type==='complete'||data.type==='error'){clearTimeout(timeout);worker.terminate();data.type==='complete'?resolve(data.world):reject(Error(data.message));}};worker.onerror=e=>{clearTimeout(timeout);worker.terminate();reject(Error(e.message));};worker.postMessage({type:'import',worldId:id,files});});}
document.querySelector('#run').onclick=async()=>{
 const button=document.querySelector('#run');button.disabled=true;output.textContent='Running…\n';
 const prefix='test-'+crypto.randomUUID(),ids=[prefix+'-ok',prefix+'-bad',prefix+'-pages'];let db;
 const log=text=>{output.textContent+=text+'\n';};
 try {
  db=await openDatabase();const before=(await listWorlds(db)).map(w=>w.id).sort();
  const files=await Promise.all(['example-legends.xml','example-legends_plus.xml'].map(async name=>new File([await (await fetch('./fixtures/'+name)).text()],name)));
  const world=await runImport(ids[0],files);
  assert(world.counts.historical_figures===3,'Figure count');assert(world.counts.historical_events===1,'Plus events duplicated');assert(world.name==='The Example World','World name');
  db.close();db=await openDatabase();assert((await getWorld(db,ids[0])).status==='ready','World not persistent');
  const rows=await readPage(db,ids[0],'historical_figures');const first=rows.find(r=>r.id==='1');assert(first.data.race==='DWARF'&&first.data.sex==='1'&&first.supplement.race==='dwarf','Merge lost provenance');log('PASS: real module worker import, ID merge, provenance, persistent reopen.');
  await saveFile(db,ids[0],new File([await (await fetch('./fixtures/example-world_map.csv')).text()],'example-world_map.csv'));
  const atlas=await new Promise((resolve,reject)=>{const worker=new Worker(new URL('../js/data/atlas-worker.js?v=0.9.0',import.meta.url),{type:'module'});worker.onmessage=({data})=>{worker.terminate();data.error?reject(Error(data.error)):resolve(data);};worker.onerror=e=>reject(Error(e.message));worker.postMessage({worldId:ids[0]});});assert(atlas.conflicts.length===1&&atlas.conflicts[0].x===4&&atlas.conflicts[0].y===7,'Atlas conflict location');assert(atlas.sites[0].owner==='5'&&atlas.sites[0].civilisation==='6'&&atlas.entities['5']==='Example Copper League','Atlas ownership/civilisation distinction');assert(atlas.terrain.cells.length===64&&atlas.sites[0].x===4&&atlas.sites[0].y===7,'Atlas terrain/site alignment');log('PASS: atlas worker reads saved map, validates cells and aligns site coordinates.');
  const bibliography=await explore(ids[0],{type:'associations',kind:'historical_figures',recordId:'1',kinds:['written_contents']});assert(bibliography.total===1&&bibliography.rows[0].id==='30','Bibliography index');
  const copies=await explore(ids[0],{type:'associations',kind:'written_contents',recordId:'30',kinds:['artifacts']});assert(copies.total===1&&copies.rows[0].id==='55','Physical copy index');
  const formWorks=await explore(ids[0],{type:'associations',kind:'poetic_forms',recordId:'78',kinds:['written_contents']});assert(formWorks.total===1,'Form-to-work index');
  const workPanel=culturePanel({kind:'written_contents',data:{title:'<img src=x>',page_start:'1',page_end:'2'}},[],ids[0],'');assert(workPanel.textContent.includes('not the full text')&&!workPanel.querySelector('img'),'Metadata disclosure or unsafe DOM');log('PASS: author bibliography, physical-copy/form indexes, metadata disclosure, safe cultural DOM.');
  const search=await explore(ids[0],{type:'search',options:{q:'urist'}});assert(search.total===1&&search.rows[0].id==='1','Worker search');
  const related=await explore(ids[0],{type:'related',kind:'historical_figures',recordId:'1'});assert(related.total===1&&related.rows[0].id==='0','Reverse event references');
  const resolved=await explore(ids[0],{type:'resolve',refs:[{kind:'historical_figures',id:'2'},{kind:'sites',id:'999'}]});assert(resolved[0].label==='Domas Examplewright'&&resolved[1].label===null,'Resolution or missing record fallback');const narrowed=await explore(ids[0],{type:'related',kind:'historical_figures',recordId:'1',filters:{from:'21'}});assert(narrowed.total===0&&narrowed.unfiltered===1,'Filtered counts');
  const event=await getRecord(db,ids[0],'historical_events','0');const [story]=await narratives([event],ids[0],'');assert(story.textContent.includes('The Entirely Fictional Dragon died'),'Death summary missing victim');assert(story.textContent.includes('recorded killer was Urist Examplekeeper'),'Death summary swapped killer');assert(story.querySelectorAll('a').length===3,'Narrative linked names');
  const [unsafe]=await narratives([{data:{type:'<img src=x onerror=alert(1)>'}}],ids[0],'');assert(!unsafe.querySelector('img'),'Untrusted event type became markup');
  const life=biography(first.data,[],ids[0],'');assert(life.textContent.includes('does not prove the figure is alive'),'Biography inferred survival');log('PASS: narrative DOM rendering, linked roles, lifespan uncertainty, date filtering/counts.');
  stopExplorer();log('PASS: worker name search, reverse event index, reference resolution and missing targets.');
  let failed=false;try{await runImport(ids[1],[new File(['<df_world><sites><site><id>1</id></site></sites><broken>'],'bad-legends.xml')]);}catch{failed=true;}
  assert(failed,'Malformed XML accepted');assert(!await getWorld(db,ids[1]),'Failed import retained world');assert((await getWorld(db,ids[0])).status==='ready','Failed import destroyed existing world');log('PASS: malformed import rollback preserves existing worlds.');
  await saveWorld(db,{id:ids[2],status:'staging'});assert(!(await listWorlds(db)).some(w=>w.id===ids[2]),'Staging exposed');
  await saveRecords(db,ids[2],Array.from({length:55},(_,i)=>({kind:'sites',id:String(i).padStart(3,'0'),data:{id:String(i),name:'Fixture '+i}})),'standard');
  assert(await countKind(db,ids[2],'sites')===55,'Index count');assert((await readPage(db,ids[2],'sites',50)).length===5,'Pagination');log('PASS: staging isolation, batched writes, indexed pagination.');
  const annotation={kind:'historical_figures',id:'1',label:'Urist Examplekeeper',note:'Synthetic research note <img src=x>',bookmarked:true,tags:['fixture']};
  const saved=await saveResearch(db,world,annotation,0);db.close();db=await openDatabase();assert((await getResearch(db,world.id,annotation.kind,annotation.id)).note===annotation.note,'Research persistence');
  let stale=false;try{await saveResearch(db,world,{...annotation,note:'stale draft'},0);}catch{stale=true;}assert(stale,'Stale-tab note overwrote saved research');
  const backup=parseBackup(makeBackup(world,[saved]));await saveWorld(db,{id:ids[2],status:'ready',name:'Explicit fixture target'});const restored=await restoreResearch(db,{id:ids[2],name:'Explicit fixture target'},backup.entries);assert(restored.added===1,'Research transfer');const repeated=await restoreResearch(db,{id:ids[2],name:'Explicit fixture target'},[{...annotation,note:'must not overwrite'}]);assert(repeated.skipped===1&&(await getResearch(db,ids[2],annotation.kind,annotation.id)).note===annotation.note,'Restore overwrote existing research');
  await deleteWorld(db,world.id);assert((await getResearch(db,world.id,annotation.kind,annotation.id)).note===annotation.note,'Deleting source world destroyed research');log('PASS: research persistence, stale-tab protection, backup round trip, explicit transfer, additive restore and source-deletion preservation.');
  for(const id of [world.id,ids[2]])await removeResearchEntry(db,id,annotation.kind,annotation.id);
  for(const id of ids)await deleteWorld(db,id);
  assert((await countKind(db,ids[2],'sites'))===0,'Record cleanup');assert(JSON.stringify((await listWorlds(db)).map(w=>w.id).sort())===JSON.stringify(before),'Unrelated worlds changed');log('PASS: exact-world deletion and isolation.');
  log('ALL TESTS PASSED');
 }catch(error){log('FAIL: '+error.message);}finally{stopExplorer();if(db){for(const id of ids)try{await removeResearchEntry(db,id,'historical_figures','1');await deleteWorld(db,id);}catch{}db.close();}button.disabled=false;}
};
