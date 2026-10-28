import {createOfficeIndex,officeProfile} from './offices.js?v=0.25.0';
import {createJourneyHistory,journeySnapshot,resolveJourney,journeyPage,journeyLimits} from './journeys.js?v=0.25.0';
import {createSupernaturalIndex,supernaturalProfile,supernaturalStates,supernaturalFilters,matchesSupernatural} from './supernatural.js?v=0.25.0';
import {threadReferences,threadSources,followThreads} from './threads.js?v=0.25.0';
import {namedRecord,eraFact,eraPage,deskDiscoveries,randomRecord} from './desk.js?v=0.25.0';
import {cultureReferences,cultureLabel} from './culture.js?v=0.25.0';
import {eventType,filterEvents} from './narrative.js?v=0.25.0';
import {openDatabase,getWorld} from './database.js?v=0.25.0';
import {normalise,recordKey,collectReferences,eventDate,compareEvents,searchEntries} from './exploration.js?v=0.25.0';
const neighbourhoods=new Map(),journeyCache=new Map();
let officeCache,superCache,grudgeCache,bookCache,warIndex,factionSources;const factionNetworks=new Map();const warDetails=new Map();
let cachedWorld, entries=[],lookup=new Map(), incoming=new Map();
async function load(worldId) {
 if(cachedWorld===worldId)return;
 const db=await openDatabase();entries=[];lookup.clear();incoming.clear();neighbourhoods.clear();journeyCache.clear();officeCache=null;superCache=null;grudgeCache=null;bookCache=null;warIndex=null;factionSources=null;factionNetworks.clear();warDetails.clear();cachedWorld=null;
 try {
  const world=await getWorld(db,worldId);if(world?.status!=='ready')throw Error('This world is not available in this browser.');
  await new Promise((resolve,reject)=>{
   const request=db.transaction('records').objectStore('records').index('world').openCursor(IDBKeyRange.only(worldId));
   request.onerror=()=>reject(request.error);
   request.onsuccess=()=>{
    const cursor=request.result;if(!cursor){resolve();return;}
    const record=cursor.value,key=recordKey(record.kind,record.id);
    const row={key,kind:record.kind,id:record.id,label:cultureLabel(record),search:normalise(cultureLabel(record)),aliases:record.kind==='historical_events'?[normalise(record.data.type),normalise(record.label)]:[],...eventDate(record.data),named:namedRecord(record),collectionType:record.kind==='historical_event_collections'?eventType(record.data):null,...(record.kind==='historical_eras'?{era:eraFact(record)}:{}),eventType:record.kind==='historical_events'?eventType(record.data):null};
    entries.push(row);lookup.set(key,row);
    for(const ref of threadReferences(record)) {
     const target=recordKey(ref.kind,ref.id);if(target===key)continue;
     if(!incoming.has(target))incoming.set(target,new Set());incoming.get(target).add(key);
    }
    if(entries.length%5000===0)postMessage({type:'progress',count:entries.length});
    cursor.continue();
   };
  });cachedWorld=worldId;
 }finally{db.close();}
}
async function warfareQuery(data){
 const {createWarfareIndex,warfareDirectory,conflictDetails,warfarePage,warfareLimits,collectionKind}=await import('./warfare.js?v=0.25.0');
 if(!warIndex){const builder=createWarfareIndex(),db=await openDatabase();let count=0;
  try{await Promise.all([collectionKind,'historical_events','sites'].map(kind=>new Promise((resolve,reject)=>{
   const tx=db.transaction('records'),request=tx.objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([data.worldId,kind]));
   tx.onabort=()=>reject(tx.error||Error('Conflict indexing cancelled.'));request.onerror=()=>reject(request.error);
   request.onsuccess=()=>{if(cancelled.has(data.id)){tx.abort();return;}const cursor=request.result;if(!cursor){resolve();return;}builder.accept(cursor.value);if(++count%5000===0)postMessage({type:'progress',id:data.id,phase:'conflicts',count});cursor.continue();};
  })));warIndex=builder.finish();}finally{db.close();}
 }
 if(data.type==='faction-network'||data.type==='faction-evidence'){
  const {buildFactionSources,filterFactionNetwork,factionFilters,factionNetworkPage,factionEvidencePage,factionLimits}=await import('./faction-warfare.js?v=0.25.0');
  const cancel=()=>cancelled.has(data.id),onProgress=count=>postMessage({type:'progress',id:data.id,phase:'factions',count});
  if(!factionSources)factionSources=await buildFactionSources(warIndex,{isCancelled:cancel,onProgress});
  const f=factionFilters(data.options),cacheKey=JSON.stringify([f.from,f.to,f.type]);if(!factionNetworks.has(cacheKey)){const network=await filterFactionNetwork(factionSources,data.options,{isCancelled:cancel,onProgress});if(factionNetworks.size>=factionLimits.cache)factionNetworks.delete(factionNetworks.keys().next().value);factionNetworks.set(cacheKey,network);}const network=factionNetworks.get(cacheKey);
  const node=id=>{const row=lookup.get(recordKey('entities',id));return {id,kind:'entities',key:recordKey('entities',id),label:row?.label||`Missing Organisation #${id}`,missing:!row};};
  if(data.type==='faction-evidence'){const result=factionEvidencePage(network,data.pair,data.offset);return {...result,rows:result.rows.map(row=>({...row,fromNode:node(row.from),toNode:node(row.to)}))};}
  const id=String(data.recordId);if(!lookup.has(recordKey('entities',id)))throw Error('Choose an organisation saved in this archive.');const page=factionNetworkPage(network,id,data.offset),ids=new Set([id,...page.edges.flatMap(e=>[e.a,e.b])]);return {...page,nodes:[...ids].map(node)};
 }
 const resolve=ref=>({...ref,label:lookup.get(recordKey(ref.kind,ref.id))?.label||`Missing ${ref.kind==='historical_figures'?'Figure':'Organisation'} #${ref.id}`,missing:!lookup.has(recordKey(ref.kind,ref.id))});
 const collection=row=>row?{...row,site:row.siteId?{id:row.siteId,kind:'sites',label:warIndex.sites.get(row.siteId)?.label||`Missing Site #${row.siteId}`,missing:!warIndex.sites.has(row.siteId)}:null,position:warIndex.sites.get(row.siteId)?.position||row.position,factions:row.factions?.map(resolve)||[]}:null;
 if(data.type==='warfare-directory'){const result=warfareDirectory(warIndex,data.options);return {...result,rows:result.rows.map(collection)};}
 const id=String(data.recordId);if(!warDetails.has(id)){const result=await conflictDetails(warIndex,id,{isCancelled:()=>cancelled.has(data.id),onProgress:count=>postMessage({type:'progress',id:data.id,phase:'conflict',count})});if(warDetails.size>=warfareLimits.cache)warDetails.delete(warDetails.keys().next().value);warDetails.set(id,result);}
 const page=warfarePage(warIndex,warDetails.get(id),data.options);return {...page,root:collection(page.root),parents:page.parents.map(collection),rows:page.rows.map(row=>page.tab==='conflicts'?collection(row):page.tab==='participants'?{...resolve(row),evidence:row.evidence}:page.tab==='chronicle'?{...row,label:lookup.get(recordKey(row.kind,row.id))?.label||`Event #${row.id}`}:{...row,label:warIndex.collections.get(row.id)?.label||`Battle #${row.id}`})};
}
async function bookOfRecords(data){
 const {createRecordBook,recordBookPage}=await import('./book-of-records.js?v=0.25.0');
 if(!bookCache){
  const builder=createRecordBook(officeCache),db=await openDatabase();let count=0;
  try{await new Promise((resolve,reject)=>{
   const tx=db.transaction('records'),request=tx.objectStore('records').index('world').openCursor(IDBKeyRange.only(data.worldId));
   tx.onabort=()=>reject(tx.error||Error('Ranking calculation cancelled.'));request.onerror=()=>reject(request.error);
   request.onsuccess=()=>{if(cancelled.has(data.id)){tx.abort();return;}const cursor=request.result;if(!cursor){resolve();return;}
    const record=cursor.value;builder.accept(record,record.kind==='historical_events'?collectReferences(record.data):[]);
    if(++count%5000===0)postMessage({type:'progress',id:data.id,phase:'rankings',count});cursor.continue();
   };
  });bookCache=builder.finish(lookup);officeCache=bookCache.offices;}finally{db.close();}
 }
 const page=recordBookPage(bookCache,data.category,data.offset);
 return {...page,rows:page.rows.map(row=>({...row,evidence:row.evidence.map(ref=>({...ref,label:lookup.get(recordKey(ref.kind,ref.id))?.label||`Source #${ref.id}`}))}))};
}
function relationshipNode(key){const row=lookup.get(key),[kind,id]=JSON.parse(key);return {key,kind,id,label:row?.label||`Missing ${kind==='historical_figures'?'Figure':kind==='entities'?'Organisation':'Site'} #${id}`,missing:!row};}
async function fullNeighbourhood(key,worldId,maxSources=500){
 const {relationshipNeighbourhood,relationshipLimits}=await import('./relationships.js?v=0.25.0');
 if(neighbourhoods.has(key))return {...neighbourhoods.get(key),recordsRead:0};
 const [kind]=JSON.parse(key),sources=[...(incoming.get(key)||[])].filter(source=>source!==key&&lookup.get(source)?.kind==='historical_figures').sort(),candidates=kind==='historical_figures'?[key,...sources]:sources;
 const count=Math.max(0,Math.min(relationshipLimits.sourceRecords,maxSources)),selected=candidates.slice(0,count);let records=[];
 if(selected.length){const db=await openDatabase();try{records=await new Promise((resolve,reject)=>{const tx=db.transaction('records'),store=tx.objectStore('records'),found=[];for(const source of selected){const [kind,id]=JSON.parse(source),request=store.get([worldId,kind,id]);request.onsuccess=()=>{if(request.result)found.push(request.result);};}tx.oncomplete=()=>resolve(found);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Relationship lookup interrupted.'));});}finally{db.close();}}
 const result=relationshipNeighbourhood(records,key);result.truncated ||= candidates.length>selected.length;result.budgetLimited=candidates.length>selected.length&&count<relationshipLimits.sourceRecords;result.recordsRead=selected.length;
 if(!result.budgetLimited){if(neighbourhoods.size>=16)neighbourhoods.delete(neighbourhoods.keys().next().value);neighbourhoods.set(key,result);}
 return result;
}
async function relationshipPage(data){
 const {graphPage}=await import('./relationships.js?v=0.25.0'),key=recordKey(data.kind,data.recordId);
 if(data.kind!=='historical_figures'||!lookup.has(key))throw Error('Choose an available historical figure to expand.');
 const result=graphPage(await fullNeighbourhood(key,data.worldId),data),keys=new Set([key,...result.edges.flatMap(edge=>[edge.source,edge.target])]);
 return {...result,nodes:[...keys].map(relationshipNode)};
}
async function officesQuery(data){
 if(!['historical_figures','entities'].includes(data.kind)||!lookup.has(recordKey(data.kind,data.recordId)))throw Error('Choose a figure or organisation saved in this archive.');
 if(!officeCache){const builder=createOfficeIndex(),db=await openDatabase();let count=0,stopped=false;
 try{for(const kind of ['entities','historical_events']){if(stopped)break;await new Promise((resolve,reject)=>{const tx=db.transaction('records'),r=tx.objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([data.worldId,kind]));tx.onabort=()=>reject(tx.error||Error('Office indexing cancelled.'));r.onerror=()=>reject(r.error);r.onsuccess=()=>{if(cancelled.has(data.id)){tx.abort();return;}const c=r.result;if(!c){resolve();return;}if(!builder.accept(c.value)){stopped=true;resolve();return;}if(++count%2000===0)postMessage({type:'progress',id:data.id,phase:'offices',count});c.continue();};});}if(cancelled.has(data.id))throw Error('Office indexing cancelled.');officeCache=builder.finish();}finally{db.close();}}
 return officeProfile(officeCache,data.kind,data.recordId,lookup,data.offset);
}
async function journeyQuery(data){
 const key=recordKey(data.kind,data.recordId);if(!['historical_figures','artifacts'].includes(data.kind)||!lookup.has(key))throw Error('Choose a figure or artifact saved in this archive.');
 if(!journeyCache.has(key)){const db=await openDatabase(),builder=createJourneyHistory(data.kind,data.recordId);let count=0;
 try{const root=await new Promise((resolve,reject)=>{const r=db.transaction('records').objectStore('records').get([data.worldId,data.kind,String(data.recordId)]);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 await new Promise((resolve,reject)=>{const tx=db.transaction('records'),r=tx.objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([data.worldId,'historical_events']));tx.onabort=()=>reject(tx.error||Error('Location scan cancelled.'));r.onerror=()=>reject(r.error);r.onsuccess=()=>{if(cancelled.has(data.id)){tx.abort();return;}const c=r.result;if(!c||!builder.accept(c.value)){resolve();return;}if(++count%2000===0)postMessage({type:'progress',id:data.id,phase:'journeys',count});c.continue();};});
 if(cancelled.has(data.id))throw Error('Location scan cancelled.');const result=resolveJourney(builder.finish(),lookup,journeySnapshot(root));if(journeyCache.size>=journeyLimits.cache)journeyCache.delete(journeyCache.keys().next().value);journeyCache.set(key,result);
 }finally{db.close();}}
 return data.type==='journey-map'?{...journeyCache.get(key),subject:{kind:data.kind,id:String(data.recordId),label:lookup.get(key).label.slice(0,240)}}:journeyPage(journeyCache.get(key),data.offset);
}
async function ensureSupernatural(data){
 if(superCache)return;const builder=createSupernaturalIndex(),db=await openDatabase();let count=0,stopped=false;
 try{for(const kind of ['historical_figures','historical_events']){if(stopped)break;await new Promise((resolve,reject)=>{const tx=db.transaction('records'),request=tx.objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([data.worldId,kind]));tx.onabort=()=>reject(tx.error||Error('Supernatural evidence indexing cancelled.'));request.onerror=()=>reject(request.error);request.onsuccess=()=>{if(cancelled.has(data.id)){tx.abort();return;}const cursor=request.result;if(!cursor){resolve();return;}if(!builder.accept(cursor.value)){stopped=true;resolve();return;}if(++count%2000===0)postMessage({type:'progress',id:data.id,phase:'supernatural',count});cursor.continue();};});}if(cancelled.has(data.id))throw Error('Supernatural evidence indexing cancelled.');superCache=builder.finish();}finally{db.close();}
}
async function supernaturalSearch(data){await ensureSupernatural(data);const all=searchEntries(entries,{...data.options,kind:'historical_figures',offset:0,limit:entries.length}).rows,selection=supernaturalFilters(data.supernatural),rows=all.filter(row=>matchesSupernatural(superCache.profiles.get(row.id)?.states||supernaturalStates(),selection)),offset=Math.max(0,Math.min(Math.floor((Number(data.options?.offset)||0)/50)*50,Math.max(0,Math.floor((rows.length-1)/50)*50)));
 return {total:rows.length,unfiltered:all.length,offset,rows:rows.slice(offset,offset+50).map(row=>({...row,supernatural:{...(superCache.profiles.get(row.id)?.states||supernaturalStates())}})),supernaturalStats:superCache.stats,ruleVersion:superCache.version};
}
async function grudgeQuery(data){
 const {createGrudgeLedger,grudgePage}=await import('./grudges.js?v=0.25.0');
 if(!grudgeCache){const builder=createGrudgeLedger(),db=await openDatabase();let count=0,stopped=false;
  try{for(const kind of ['historical_events','historical_event_collections','historical_figures']){if(stopped)break;await new Promise((resolve,reject)=>{const tx=db.transaction('records'),request=tx.objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([data.worldId,kind]));tx.onabort=()=>reject(tx.error||new DOMException('Ledger indexing cancelled.','AbortError'));request.onerror=()=>reject(request.error);request.onsuccess=()=>{if(cancelled.has(data.id)){tx.abort();return;}const cursor=request.result;if(!cursor){resolve();return;}if(!builder.accept(cursor.value)){stopped=true;resolve();return;}if(++count%2000===0)postMessage({type:'progress',id:data.id,phase:'ledger',count});cursor.continue();};});}if(cancelled.has(data.id))throw new DOMException('Ledger indexing cancelled.','AbortError');grudgeCache=builder.finish();}finally{db.close();}
 }
 return grudgePage(grudgeCache,lookup,data.options,{isCancelled:()=>cancelled.has(data.id),onProgress:count=>postMessage({type:'progress',id:data.id,phase:'ledger',count})});
}
async function threadQuery(data){
 const key=recordKey(data.kind,data.recordId),sample=threadSources(incoming.get(key)||[],lookup),db=await openDatabase();
 try{const records=await new Promise((resolve,reject)=>{const tx=db.transaction('records'),store=tx.objectStore('records'),found=new Map();for(const source of new Set([key,...sample.keys])){const [kind,id]=JSON.parse(source),request=store.get([data.worldId,kind,id]);request.onsuccess=()=>{if(request.result)found.set(source,request.result);};}tx.oncomplete=()=>resolve(found);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Thread lookup interrupted.'));});
 if(cancelled.has(data.id))throw new DOMException('Thread lookup cancelled.','AbortError');const root=records.get(key);if(!root)throw Error('This record is unavailable.');return followThreads(root,sample.keys.map(k=>records.get(k)).filter(Boolean),lookup,{truncated:sample.truncated});
 }finally{db.close();}
}
const cancelled=new Set(),scheduled=new Set();
async function connectionSearch(data){
 const {findConnection}=await import('./connections.js?v=0.25.0');
 const start=recordKey('historical_figures',data.startId),end=recordKey('historical_figures',data.endId);
 const result=await findConnection({start,end,organisations:data.organisations===true,maxDepth:data.maxDepth,exists:key=>lookup.has(key),getNeighbours:(key,remaining)=>fullNeighbourhood(key,data.worldId,remaining),isCancelled:()=>cancelled.has(data.id),onProgress:count=>postMessage({type:'progress',id:data.id,phase:'connections',count})});
 return {...result,nodes:(result.nodes||[]).map(relationshipNode)};
}
// Serial requests prevent overlapping index builds. UI request IDs discard superseded results.
let queue=Promise.resolve();
self.onmessage=({data})=>{if(data.type==='cancel'){if(scheduled.has(data.cancelId))cancelled.add(data.cancelId);return;}scheduled.add(data.id);queue=queue.then(async()=>{
 try {
  if(cancelled.has(data.id))return;await load(data.worldId);if(cancelled.has(data.id))return;let result;
  if(data.type==='search'){
   if(data.options?.kind==='historical_figures')result=await supernaturalSearch(data);
   else if(data.options?.kind==='historical_events'){
    const all=searchEntries(entries,{...data.options,offset:0,limit:entries.length}).rows,filtered=filterEvents(all,data.filters||{}),offset=data.options.offset||0;
    result={total:filtered.length,unfiltered:all.length,types:[...new Set(all.map(row=>row.eventType))].sort(),rows:filtered.slice(offset,offset+50)};
   }else result=searchEntries(entries,data.options);
  }
  else if(data.type==='related'){
   const rows=[...(incoming.get(recordKey(data.kind,data.recordId))||[])].map(key=>lookup.get(key)).filter(row=>row.kind==='historical_events').sort(compareEvents);
   const filtered=filterEvents(rows,data.filters);result={total:filtered.length,unfiltered:rows.length,types:[...new Set(rows.map(row=>row.eventType))].sort(),rows:filtered.slice(data.offset||0,(data.offset||0)+50)};
  }else if(data.type==='associations'){
   const rows=[...(incoming.get(recordKey(data.kind,data.recordId))||[])].map(key=>lookup.get(key)).filter(row=>data.kinds.includes(row.kind)).sort((a,b)=>a.label.localeCompare(b.label)||a.key.localeCompare(b.key));result={total:rows.length,rows:rows.slice(data.offset||0,(data.offset||0)+50)};
  }else if(['warfare','warfare-directory','faction-network','faction-evidence'].includes(data.type))result=await warfareQuery(data);
  else if(data.type==='desk'){const page=await bookOfRecords(data);result={discoveries:deskDiscoveries(page.highlights),eras:eraPage(entries,data.offset)};}
  else if(data.type==='supernatural'){await ensureSupernatural(data);if(!lookup.has(recordKey('historical_figures',data.recordId)))throw Error('Choose a figure saved in this archive.');result=supernaturalProfile(superCache,data.recordId,lookup,data.offset);}
  else if(data.type==='offices')result=await officesQuery(data);
  else if(data.type==='journey'||data.type==='journey-map')result=await journeyQuery(data);
  else if(data.type==='grudges')result=await grudgeQuery(data);
  else if(data.type==='threads')result=await threadQuery(data);
  else if(data.type==='random')result=randomRecord(entries,data.options);
  else if(data.type==='records')result=await bookOfRecords(data);
  else if(data.type==='relationships')result=await relationshipPage(data);
  else if(data.type==='connection')result=await connectionSearch(data);
  else if(data.type==='resolve')result=data.refs.map(ref=>({ ...ref,label:lookup.get(recordKey(ref.kind,ref.id))?.label||null }));
  else throw Error('Unknown exploration request.');
  postMessage({id:data.id,result});
 }catch(error){postMessage({id:data.id,error:error.message});}finally{cancelled.delete(data.id);scheduled.delete(data.id);}
 });};
