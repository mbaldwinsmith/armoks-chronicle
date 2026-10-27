import {cultureReferences,cultureLabel} from './culture.js?v=0.13.2';
import {eventType,filterEvents} from './narrative.js?v=0.13.2';
import {openDatabase,getWorld} from './database.js?v=0.13.2';
import {normalise,recordKey,collectReferences,eventDate,compareEvents,searchEntries} from './exploration.js?v=0.13.2';
const neighbourhoods=new Map();
let cachedWorld, entries=[],lookup=new Map(), incoming=new Map();
async function load(worldId) {
 if(cachedWorld===worldId)return;
 const db=await openDatabase();entries=[];lookup.clear();incoming.clear();neighbourhoods.clear();cachedWorld=null;
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
function relationshipNode(key){const row=lookup.get(key),[kind,id]=JSON.parse(key);return {key,kind,id,label:row?.label||`Missing ${kind==='historical_figures'?'Figure':kind==='entities'?'Organisation':'Site'} #${id}`,missing:!row};}
async function fullNeighbourhood(key,worldId,maxSources=500){
 const {relationshipNeighbourhood,relationshipLimits}=await import('./relationships.js?v=0.13.2');
 if(neighbourhoods.has(key))return {...neighbourhoods.get(key),recordsRead:0};
 const [kind]=JSON.parse(key),sources=[...(incoming.get(key)||[])].filter(source=>source!==key&&lookup.get(source)?.kind==='historical_figures').sort(),candidates=kind==='historical_figures'?[key,...sources]:sources;
 const count=Math.max(0,Math.min(relationshipLimits.sourceRecords,maxSources)),selected=candidates.slice(0,count);let records=[];
 if(selected.length){const db=await openDatabase();try{records=await new Promise((resolve,reject)=>{const tx=db.transaction('records'),store=tx.objectStore('records'),found=[];for(const source of selected){const [kind,id]=JSON.parse(source),request=store.get([worldId,kind,id]);request.onsuccess=()=>{if(request.result)found.push(request.result);};}tx.oncomplete=()=>resolve(found);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Relationship lookup interrupted.'));});}finally{db.close();}}
 const result=relationshipNeighbourhood(records,key);result.truncated ||= candidates.length>selected.length;result.budgetLimited=candidates.length>selected.length&&count<relationshipLimits.sourceRecords;result.recordsRead=selected.length;
 if(!result.budgetLimited){if(neighbourhoods.size>=16)neighbourhoods.delete(neighbourhoods.keys().next().value);neighbourhoods.set(key,result);}
 return result;
}
async function relationshipPage(data){
 const {graphPage}=await import('./relationships.js?v=0.13.2'),key=recordKey(data.kind,data.recordId);
 if(data.kind!=='historical_figures'||!lookup.has(key))throw Error('Choose an available historical figure to expand.');
 const result=graphPage(await fullNeighbourhood(key,data.worldId),data),keys=new Set([key,...result.edges.flatMap(edge=>[edge.source,edge.target])]);
 return {...result,nodes:[...keys].map(relationshipNode)};
}
const cancelled=new Set(),scheduled=new Set();
async function connectionSearch(data){
 const {findConnection}=await import('./connections.js?v=0.13.2');
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
  }else if(data.type==='relationships')result=await relationshipPage(data);
  else if(data.type==='connection')result=await connectionSearch(data);
  else if(data.type==='resolve')result=data.refs.map(ref=>({ ...ref,label:lookup.get(recordKey(ref.kind,ref.id))?.label||null }));
  else throw Error('Unknown exploration request.');
  postMessage({id:data.id,result});
 }catch(error){postMessage({id:data.id,error:error.message});}finally{cancelled.delete(data.id);scheduled.delete(data.id);}
 });};
