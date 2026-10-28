import {cultureReferences,cultureLabel} from './culture.js?v=0.18.0';
import {eventType,filterEvents} from './narrative.js?v=0.18.0';
import {openDatabase,getWorld} from './database.js?v=0.18.0';
import {normalise,recordKey,collectReferences,eventDate,compareEvents,searchEntries} from './exploration.js?v=0.18.0';
const neighbourhoods=new Map();
let bookCache,warIndex,factionSources;const factionNetworks=new Map();const warDetails=new Map();
let cachedWorld, entries=[],lookup=new Map(), incoming=new Map();
async function load(worldId) {
 if(cachedWorld===worldId)return;
 const db=await openDatabase();entries=[];lookup.clear();incoming.clear();neighbourhoods.clear();bookCache=null;warIndex=null;factionSources=null;factionNetworks.clear();warDetails.clear();cachedWorld=null;
 try {
  const world=await getWorld(db,worldId);if(world?.status!=='ready')throw Error('This world is not available in this browser.');
  await new Promise((resolve,reject)=>{
   const request=db.transaction('records').objectStore('records').index('world').openCursor(IDBKeyRange.only(worldId));
   request.onerror=()=>reject(request.error);
   request.onsuccess=()=>{
    const cursor=request.result;if(!cursor){resolve();return;}
    const record=cursor.value,key=recordKey(record.kind,record.id);
    const row={key,kind:record.kind,id:record.id,label:cultureLabel(record),search:normalise(cultureLabel(record)),aliases:record.kind==='historical_events'?[normalise(record.data.type),normalise(record.label)]:[],...eventDate(record.data),eventType:record.kind==='historical_events'?eventType(record.data):null};
    entries.push(row);lookup.set(key,row);
    for(const ref of [...collectReferences({merged:record.data,plus:record.supplement}),...cultureReferences(record)]) {
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
 const {createWarfareIndex,warfareDirectory,conflictDetails,warfarePage,warfareLimits,collectionKind}=await import('./warfare.js?v=0.18.0');
 if(!warIndex){const builder=createWarfareIndex(),db=await openDatabase();let count=0;
  try{await Promise.all([collectionKind,'historical_events','sites'].map(kind=>new Promise((resolve,reject)=>{
   const tx=db.transaction('records'),request=tx.objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([data.worldId,kind]));
   tx.onabort=()=>reject(tx.error||Error('Conflict indexing cancelled.'));request.onerror=()=>reject(request.error);
   request.onsuccess=()=>{if(cancelled.has(data.id)){tx.abort();return;}const cursor=request.result;if(!cursor){resolve();return;}builder.accept(cursor.value);if(++count%5000===0)postMessage({type:'progress',id:data.id,phase:'conflicts',count});cursor.continue();};
  })));warIndex=builder.finish();}finally{db.close();}
 }
 if(data.type==='faction-network'||data.type==='faction-evidence'){
  const {buildFactionSources,filterFactionNetwork,factionFilters,factionNetworkPage,factionEvidencePage,factionLimits}=await import('./faction-warfare.js?v=0.18.0');
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
 const {createRecordBook,recordBookPage}=await import('./book-of-records.js?v=0.18.0');
 if(!bookCache){
  const builder=createRecordBook(),db=await openDatabase();let count=0;
  try{await new Promise((resolve,reject)=>{
   const tx=db.transaction('records'),request=tx.objectStore('records').index('world').openCursor(IDBKeyRange.only(data.worldId));
   tx.onabort=()=>reject(tx.error||Error('Ranking calculation cancelled.'));request.onerror=()=>reject(request.error);
   request.onsuccess=()=>{if(cancelled.has(data.id)){tx.abort();return;}const cursor=request.result;if(!cursor){resolve();return;}
    const record=cursor.value;builder.accept(record,record.kind==='historical_events'?collectReferences(record.data):[]);
    if(++count%5000===0)postMessage({type:'progress',id:data.id,phase:'rankings',count});cursor.continue();
   };
  });bookCache=builder.finish(lookup);}finally{db.close();}
 }
 const page=recordBookPage(bookCache,data.category,data.offset);
 return {...page,rows:page.rows.map(row=>({...row,evidence:row.evidence.map(ref=>({...ref,label:lookup.get(recordKey(ref.kind,ref.id))?.label||`Source #${ref.id}`}))}))};
}
function relationshipNode(key){const row=lookup.get(key),[kind,id]=JSON.parse(key);return {key,kind,id,label:row?.label||`Missing ${kind==='historical_figures'?'Figure':kind==='entities'?'Organisation':'Site'} #${id}`,missing:!row};}
async function fullNeighbourhood(key,worldId,maxSources=500){
 const {relationshipNeighbourhood,relationshipLimits}=await import('./relationships.js?v=0.18.0');
 if(neighbourhoods.has(key))return {...neighbourhoods.get(key),recordsRead:0};
 const [kind]=JSON.parse(key),sources=[...(incoming.get(key)||[])].filter(source=>source!==key&&lookup.get(source)?.kind==='historical_figures').sort(),candidates=kind==='historical_figures'?[key,...sources]:sources;
 const count=Math.max(0,Math.min(relationshipLimits.sourceRecords,maxSources)),selected=candidates.slice(0,count);let records=[];
 if(selected.length){const db=await openDatabase();try{records=await new Promise((resolve,reject)=>{const tx=db.transaction('records'),store=tx.objectStore('records'),found=[];for(const source of selected){const [kind,id]=JSON.parse(source),request=store.get([worldId,kind,id]);request.onsuccess=()=>{if(request.result)found.push(request.result);};}tx.oncomplete=()=>resolve(found);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Relationship lookup interrupted.'));});}finally{db.close();}}
 const result=relationshipNeighbourhood(records,key);result.truncated ||= candidates.length>selected.length;result.budgetLimited=candidates.length>selected.length&&count<relationshipLimits.sourceRecords;result.recordsRead=selected.length;
 if(!result.budgetLimited){if(neighbourhoods.size>=16)neighbourhoods.delete(neighbourhoods.keys().next().value);neighbourhoods.set(key,result);}
 return result;
}
async function relationshipPage(data){
 const {graphPage}=await import('./relationships.js?v=0.18.0'),key=recordKey(data.kind,data.recordId);
 if(data.kind!=='historical_figures'||!lookup.has(key))throw Error('Choose an available historical figure to expand.');
 const result=graphPage(await fullNeighbourhood(key,data.worldId),data),keys=new Set([key,...result.edges.flatMap(edge=>[edge.source,edge.target])]);
 return {...result,nodes:[...keys].map(relationshipNode)};
}
const cancelled=new Set(),scheduled=new Set();
async function connectionSearch(data){
 const {findConnection}=await import('./connections.js?v=0.18.0');
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
   if(data.options?.kind==='historical_events'){
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
  else if(data.type==='records')result=await bookOfRecords(data);
  else if(data.type==='relationships')result=await relationshipPage(data);
  else if(data.type==='connection')result=await connectionSearch(data);
  else if(data.type==='resolve')result=data.refs.map(ref=>({ ...ref,label:lookup.get(recordKey(ref.kind,ref.id))?.label||null }));
  else throw Error('Unknown exploration request.');
  postMessage({id:data.id,result});
 }catch(error){postMessage({id:data.id,error:error.message});}finally{cancelled.delete(data.id);scheduled.delete(data.id);}
 });};
