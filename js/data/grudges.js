import {recordKey,normalise,collectReferences} from './exploration.js?v=0.24.1';
import {eventType,narrateEvent} from './narrative.js?v=0.24.1';
import {recordRelationships,relationshipWording} from './relationships.js?v=0.24.1';
import {collectionFacts,warfareTypes,validId,pageOffset} from './warfare.js?v=0.24.1';
import {clippedLabel,readableValue,referenceLabel} from './language.js?v=0.24.1';
export const grudgeLimits={scanned:500000,rows:100000,references:24,page:24};
export const grudgeCategories={killings:'Recorded Killings',thefts:'Thefts',abductions:'Abductions',factions:'Faction Conflict Sources',grudges:'Explicit Grudge Links'};
const grudgeTypes=new Set(['grudge','grudge bearer','grudge holder']);
const violent=new Set(['murder','murdered','shot','struck','struck down','execution','execution generic','beheaded','crucified','burned alive']);
const natural=new Set(['old age','starvation','thirst','suffocation','drown','drowned','drown self','leapt from height']);
const year=v=>typeof v==='string'&&/^-?\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)!==-1?Number(v):null;
const ref=(d,kind,role,...fields)=>{for(const field of fields)if(validId(d[field]))return {kind,id:d[field],role,path:field};return null;};
const compact=refs=>{const seen=new Set();return refs.filter(r=>r&& !seen.has(JSON.stringify([r.kind,r.id,r.role]))&&seen.add(JSON.stringify([r.kind,r.id,r.role])));};
export function grudgeFacts(record){
 const d=record.data||{},source={kind:record.kind,id:String(record.id)},base={...source,key:recordKey(record.kind,record.id),label:clippedLabel(record.label),start:null,end:null,refs:[],tokens:[],paths:[],partial:false};
 if(record.kind==='historical_figures'){
  const parsed=recordRelationships(record);return Object.assign(parsed.edges.filter(e=>grudgeTypes.has(e.type)).map(e=>{const from={kind:record.kind,id:String(record.id)},to={kind:e.targetKind,id:e.targetId},w=relationshipWording(e);return {...base,key:e.key,category:'grudges',type:e.type,label:readableValue(e.type),tokens:[from,w.between,to,w.after],refs:[{...from,role:'Source Figure'},{...to,role:`Listed as ${e.label}`}],paths:e.evidence.map(v=>`${v.origin}: ${v.path}`),partial:parsed.truncated||e.moreEvidence};}),{truncated:parsed.truncated});
 }
 if(record.kind==='historical_event_collections'){
  const fact=collectionFacts(record),refs=fact.refs.filter(r=>r.kind==='entities'&&['aggressor_ent_id','defender_ent_id','attacking_enid','defending_enid'].includes(r.field));
  if(!warfareTypes.has(fact.type)||!refs.length)return [];
  return [{...base,category:'factions',label:clippedLabel(fact.label),type:fact.type,start:fact.start,end:fact.end,refs:compact([...refs.map(r=>({...r,path:r.field})),...fact.refs.filter(r=>r.kind==='historical_figures').map(r=>({...r,path:r.field})),...(fact.siteId?[{kind:'sites',id:fact.siteId,role:'Recorded Site',path:'site_id / site'}]:[])]),tokens:['The source names the following recorded roles in this conflict. War aggression and battle attack roles are distinct; neither proves revenge.'],paths:['type',...refs.map(r=>r.field)],partial:fact.truncated}];
 }
 if(record.kind!=='historical_events')return [];
 const type=eventType(d),start=year(d.year),refs=[];let category,tokens=narrateEvent(d).tokens;
 if(type==='hf died'){
  const cause=String(d.cause||d.death_cause||'').replaceAll('_',' ').toLowerCase().trim(),killer=ref(d,'historical_figures','Recorded Killer','slayer_hfid','slayer_hf'),unnamed=typeof d.slayer_race==='string'&&d.slayer_race.trim()&&d.slayer_race!=='-1';
  if(natural.has(cause)||(!killer&&!unnamed&&!violent.has(cause)))return [];
  category='killings';refs.push(ref(d,'historical_figures','Victim','hfid','victim_hf'),killer);
 }else if(['item stolen','artifact stolen'].includes(type)){
  category='thefts';const thief=ref(d,'historical_figures','Recorded Thief','thief_hfid','histfig','hist_figure_id');refs.push(thief,ref(d,'artifacts','Stolen Artifact','artifact_id','artifact'));
  if(type==='artifact stolen')tokens=[thief||'An unidentified figure',' stole ',ref(d,'artifacts','Artifact','artifact_id','artifact')||'an unidentified artifact','.'];
 }else if(type==='hf abducted'){
  category='abductions';refs.push(ref(d,'historical_figures','Abductor','snatcher_hfid'),ref(d,'historical_figures','Abducted Figure','target_hfid'));
 }else if(['field battle','attacked site','destroyed site','plundered site'].includes(type)){
  category='factions';refs.push(ref(d,'entities','Attacking Organisation','attacker_civ_id'),ref(d,'entities','Defending Organisation','defender_civ_id'));if(!refs.some(Boolean))return [];
 }else return [];
 // Additional explicit references are retained as mentions, never promoted to victim/owner roles.
 const generic=collectReferences(d).map(r=>({...r,role:referenceLabel(r.role,type==='hf died')}));
 refs.push(ref(d,'sites','Recorded Site','site_id','site'));for(const item of generic)if(!refs.some(r=>r&&r.kind===item.kind&&r.id===item.id))refs.push(item);
 return [{...base,category,type,label:readableValue(type),start,end:start,refs:compact(refs),tokens,paths:['type',...(d.cause!==undefined?['cause']:[]),...(d.death_cause!==undefined?['death_cause']:[]),...refs.filter(Boolean).map(r=>r.path).filter(Boolean)],partial:false}];
}
export function createGrudgeLedger(limits=grudgeLimits){let scanned=0,rowLimited=false,scanLimited=false,partial=0;const rows=[],seen=new Set();return {
 accept(record){if(scanned>=limits.scanned){scanLimited=true;return false;}scanned++;const facts=grudgeFacts(record);partial+=Number(Boolean(facts.truncated));for(const fact of facts){if(seen.has(fact.key))continue;if(rows.length>=limits.rows){rowLimited=true;continue;}seen.add(fact.key);const refs=fact.refs.slice(0,limits.references),isPartial=fact.partial||refs.length<fact.refs.length;partial+=Number(isPartial);rows.push({...fact,refs,paths:fact.paths.slice(0,limits.references),partial:isPartial});}return true;},
 finish(){return {rows,stats:{scanned,rowLimited,scanLimited,partial}};}
};}
export function grudgeFilters(options={}){const clean=k=>String(options[k]??'').trim().slice(0,160),from=clean('from'),to=clean('to'),lo=from===''?null:Number(from),hi=to===''?null:Number(to),valid=v=>v===''||/^-?\d+$/.test(v)&&Number.isSafeInteger(Number(v));return {q:clean('q'),person:clean('person'),faction:clean('faction'),site:clean('site'),category:Object.hasOwn(grudgeCategories,options.category)?options.category:'',from,to,lo,hi,sort:options.sort==='latest'?'latest':'earliest',invalid:!valid(from)||!valid(to)||(lo!==null&&hi!==null&&lo>hi)};}
function searchNode(row,query){const q=normalise(query);return q.startsWith('#')?row.id===q.slice(1):normalise(row.label).includes(q);}
export async function grudgePage(index,lookup,options={}, {isCancelled=()=>false,onProgress=()=>{}}={}){
 const filters=grudgeFilters(options),matches=[],counts=Object.fromEntries(Object.keys(grudgeCategories).map(k=>[k,0]));let work=0;
 const resolve=r=>{const row=lookup.get(recordKey(r.kind,r.id));return {...r,label:row?clippedLabel(row.label):`Missing ${r.kind==='historical_figures'?'Figure':r.kind==='entities'?'Organisation':r.kind==='sites'?'Site':'Record'} #${r.id}`,missing:!row};};
 const reason=row=>row.tokens.map(t=>typeof t==='string'?t:resolve(t).label).join('');
 if(!filters.invalid)for(const row of index.rows){
  if(isCancelled())throw new DOMException('Ledger query cancelled.','AbortError');
  const dates=[row.start,row.end].filter(y=>y!==null),dated=dates.length&&!(row.start!==null&&row.end!==null&&row.start>row.end);
  if((!filters.category||row.category===filters.category)&&((filters.lo===null&&filters.hi===null)||(dated&&Math.max(...dates)>=(filters.lo??-Infinity)&&Math.min(...dates)<=(filters.hi??Infinity)))){
   const refs=row.refs.map(resolve),selected=[['historical_figures',filters.person],['entities',filters.faction],['sites',filters.site]].every(([kind,query])=>!query||refs.some(ref=>ref.kind===kind&&searchNode(ref,query)));
   if(selected&&(!filters.q||(filters.q.startsWith('#')?row.id===filters.q.slice(1):normalise([resolve({kind:row.kind,id:row.id}).label,row.label,row.type,reason(row),...refs.map(r=>r.label)].join(' ')).includes(normalise(filters.q))))){matches.push(row);counts[row.category]++;}
  }
  if(++work%1000===0){onProgress(work);await new Promise(resolve=>setTimeout(resolve,0));}
 }
 if(isCancelled())throw new DOMException('Ledger query cancelled.','AbortError');
 const direction=filters.sort==='latest'?-1:1;matches.sort((a,b)=>a.start===null&&b.start!==null?1:b.start===null&&a.start!==null?-1:(a.start===null?0:direction*(a.start-b.start))||a.key.localeCompare(b.key,'en',{numeric:true}));const offset=pageOffset(options.offset,matches.length,grudgeLimits.page);
 return {rows:matches.slice(offset,offset+grudgeLimits.page).map(row=>({...row,refs:row.refs.map(resolve),tokens:row.tokens.map(t=>typeof t==='string'?t:resolve(t)),source:resolve({kind:row.kind,id:row.id}),reason:reason(row)})),total:matches.length,all:index.rows.length,counts,offset,size:grudgeLimits.page,invalid:filters.invalid,stats:index.stats,filters};
}
