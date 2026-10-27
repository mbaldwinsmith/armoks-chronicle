import {openDatabase,saveWorld,saveRecords,getWorld,readPage,countKind,listWorlds,deleteWorld} from '../js/data/database.js';
const output=document.querySelector('#results');
function assert(value,message){if(!value)throw Error(message);}
function runImport(id,files){return new Promise((resolve,reject)=>{const worker=new Worker(new URL('../js/import/import-worker.js',import.meta.url),{type:'module'});const timeout=setTimeout(()=>{worker.terminate();reject(Error('Import timed out'));},30000);worker.onmessage=({data})=>{if(data.type==='complete'||data.type==='error'){clearTimeout(timeout);worker.terminate();data.type==='complete'?resolve(data.world):reject(Error(data.message));}};worker.onerror=e=>{clearTimeout(timeout);worker.terminate();reject(Error(e.message));};worker.postMessage({type:'import',worldId:id,files});});}
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
  let failed=false;try{await runImport(ids[1],[new File(['<df_world><sites><site><id>1</id></site></sites><broken>'],'bad-legends.xml')]);}catch{failed=true;}
  assert(failed,'Malformed XML accepted');assert(!await getWorld(db,ids[1]),'Failed import retained world');assert((await getWorld(db,ids[0])).status==='ready','Failed import destroyed existing world');log('PASS: malformed import rollback preserves existing worlds.');
  await saveWorld(db,{id:ids[2],status:'staging'});assert(!(await listWorlds(db)).some(w=>w.id===ids[2]),'Staging exposed');
  await saveRecords(db,ids[2],Array.from({length:55},(_,i)=>({kind:'sites',id:String(i).padStart(3,'0'),data:{id:String(i),name:'Fixture '+i}})),'standard');
  assert(await countKind(db,ids[2],'sites')===55,'Index count');assert((await readPage(db,ids[2],'sites',50)).length===5,'Pagination');log('PASS: staging isolation, batched writes, indexed pagination.');
  for(const id of ids)await deleteWorld(db,id);
  assert((await countKind(db,ids[2],'sites'))===0,'Record cleanup');assert(JSON.stringify((await listWorlds(db)).map(w=>w.id).sort())===JSON.stringify(before),'Unrelated worlds changed');log('PASS: exact-world deletion and isolation.');
  log('ALL TESTS PASSED');
 }catch(error){log('FAIL: '+error.message);}finally{if(db){for(const id of ids)try{await deleteWorld(db,id);}catch{}db.close();}button.disabled=false;}
};
