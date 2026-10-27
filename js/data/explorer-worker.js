import {cultureReferences,cultureLabel} from './culture.js?v=0.12.0';
import {eventType,filterEvents} from './narrative.js?v=0.12.0';
import {openDatabase,getWorld} from './database.js?v=0.12.0';
import {normalise,recordKey,collectReferences,eventDate,compareEvents,searchEntries} from './exploration.js?v=0.12.0';
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
async function relationshipPage(data){
 const {relationshipNeighbourhood,graphPage,relationshipLimits}=await import('./relationships.js?v=0.12.0');
 const key=recordKey(data.kind,data.recordId),current=lookup.get(key);
 if(data.kind!=='historical_figures'||!current)throw Error('Choose an available historical figure to expand.');
 if(!neighbourhoods.has(key)){
  const candidates=[key,...[...(incoming.get(key)||[])].filter(source=>source!==key&&lookup.get(source)?.kind==='historical_figures').sort()];
  const selected=candidates.slice(0,relationshipLimits.sourceRecords),db=await openDatabase();let records;
  try{records=await new Promise((resolve,reject)=>{const tx=db.transaction('records'),store=tx.objectStore('records'),found=[];for(const source of selected){const [kind,id]=JSON.parse(source),request=store.get([data.worldId,kind,id]);request.onsuccess=()=>{if(request.result)found.push(request.result);};}tx.oncomplete=()=>resolve(found);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Relationship lookup interrupted.'));});}finally{db.close();}
  const result=relationshipNeighbourhood(records,key);result.truncated ||= candidates.length>selected.length;
  // Keep only a small number of neighbourhoods in memory; revisiting rebuilds them safely.
  if(neighbourhoods.size>=16)neighbourhoods.delete(neighbourhoods.keys().next().value);neighbourhoods.set(key,result);
 }
 const result=graphPage(neighbourhoods.get(key),data),keys=new Set([key,...result.edges.flatMap(edge=>[edge.source,edge.target])]);
 return {...result,nodes:[...keys].map(key=>{const row=lookup.get(key),[kind,id]=JSON.parse(key);return {key,kind,id,label:row?.label||`Missing ${kind==='historical_figures'?'Figure':kind==='entities'?'Organisation':'Site'} #${id}`,missing:!row};})};
}
// Serial requests prevent overlapping index builds. UI request IDs discard superseded results.
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.then(async()=>{
 try {
  await load(data.worldId);let result;
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
  else if(data.type==='resolve')result=data.refs.map(ref=>({ ...ref,label:lookup.get(recordKey(ref.kind,ref.id))?.label||null }));
  else throw Error('Unknown exploration request.');
  postMessage({id:data.id,result});
 }catch(error){postMessage({id:data.id,error:error.message});}
 });};
