import {eventType} from './narrative.js?v=0.27.0';
import {recordKey} from './exploration.js?v=0.27.0';
import {titleCase,clippedLabel} from './language.js?v=0.27.0';
export const officeLimits={records:500000,facts:100000,nested:512,definitions:50000,assignments:50000,page:12};
const array=v=>v===undefined?[]:Array.isArray(v)?v:[v];
const id=v=>typeof v==='string'&&/^\d{1,128}$/.test(v)?v:null;
const first=(d,...keys)=>keys.map(k=>id(d?.[k])).find(Boolean)||null;
const text=v=>typeof v==='string'&&v.length<=240?v.trim():'';
const normal=v=>text(v).toLowerCase().replaceAll('_',' ').replace(/\s+/g,' ');
const year=v=>typeof v==='string'&&/^-?\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)!==-1?Number(v):null;
const date=d=>({year:year(d.year),seconds:year(d.seconds72)!==null&&year(d.seconds72)>=0?year(d.seconds72):null});
const before=(a,b)=>a?.year!==null&&a?.year!==undefined&&b?.year!==null&&b?.year!==undefined&&(a.year<b.year||a.year===b.year&&a.seconds!==null&&b.seconds!==null&&a.seconds<b.seconds);
const compare=(a,b)=>(a?.year??Infinity)-(b?.year??Infinity)||(a?.seconds??Infinity)-(b?.seconds??Infinity);
export function officeEvent(record){
 if(record.kind!=='historical_events'||!id(String(record.id)))return null;const d=record.data||{},type=eventType(d);
 if(!['add hf entity link','remove hf entity link','create entity position'].includes(type))return null;
 if(type!=='create entity position'&&normal(d.link_type||d.link)!=='position')return null;
 const entity=type==='create entity position'?first(d,'site_civ','civ'):first(d,'civ_id','civ'),holder=first(d,'hfid','histfig');
 const position=first(d,'position_id'),name=text(d.position),title=name&&!/^-?\d+$/.test(name)?name:'';
 const sourceConflict=record.supplement&&['civ','civ_id','hfid','histfig','position_id','position','link','link_type','year','seconds72'].some(k=>d[k]!==undefined&&record.supplement[k]!==undefined&&normal(d[k])!==normal(record.supplement[k]));
 const conflict=!!sourceConflict||[['civ','civ_id'],['hfid','histfig'],['link','link_type']].some(([a,b])=>d[a]!==undefined&&d[b]!==undefined&&normal(d[a])!==normal(d[b]));
 return {kind:record.kind,id:String(record.id),entity,holder: type==='create entity position'?null:holder,creator:type==='create entity position'?first(d,'histfig'):null,position,title,action:type==='add hf entity link'?'appointment':type==='remove hf entity link'?'removal':'creation',...date(d),appointer:type==='add hf entity link'?first(d,'appointer_hfid'):null,promised:type==='add hf entity link'?first(d,'promise_to_hfid'):null,conflict};
}
function resolveOffice(entity,position,title,definitions){
 const defs=position?[]:[...(definitions.get(entity)?.values()||[])],named=defs.filter(d=>d.names.some(n=>normal(n)===normal(title))),definition=position?definitions.get(entity)?.get(position):named.length===1?named[0]:null;
 const pid=position||definition?.id||null,key=pid?'id:'+pid:title?'title:'+normal(title):'unknown';
 return {key:JSON.stringify([entity,key]),entity,position:pid,title:clippedLabel(titleCase(definition?.name||title||(pid?'Office #'+pid:'Unspecified Office'))),uncertain:!pid&&!title||!position&&named.length>1||definition?.conflict||false};
}
export function createOfficeIndex(limits=officeLimits){
 const definitions=new Map(),assignments=[],facts=[],seen=new Set(),eventIds=new Set();let scanned=0,definitionCount=0,limited=false,nestedLimited=false;
 return {accept(record){if(!['entities','historical_events'].includes(record.kind))return true;if(scanned>=limits.records){limited=true;return false;}scanned++;const d=record.data||{};
  if(record.kind==='entities'){
   const entity=id(String(record.id));if(!entity)return true;if(!definitions.has(entity))definitions.set(entity,new Map());const defs=definitions.get(entity);
   for(const [origin,data] of [['Merged record',d],['Legends Plus',record.supplement||{}]])for(const field of ['entity_position','entity_position_assignment']){const rows=array(data[field]);if(rows.length>limits.nested)nestedLimited=true;
    for(const raw of rows.slice(0,limits.nested)){if(!raw||typeof raw!=='object')continue;
     if(field==='entity_position'){const pid=id(raw.id);if(!pid)continue;const names=[...new Set([raw.name,raw.name_male,raw.name_female].map(text).filter(Boolean))],name=text(raw.name)||names.join(' / ')||'Office #'+pid;
      if(defs.has(pid)){const prev=defs.get(pid);if(normal(prev.name)!==normal(name)){prev.conflict=true;}continue;}
      if(definitionCount>=limits.definitions){limited=true;continue;}definitionCount++;defs.set(pid,{id:pid,name,names,entity,conflict:false,origin});
     }else{const holder=id(raw.histfig),position=id(raw.position_id),assignment=id(raw.id);if(!holder||!position)continue;const key=JSON.stringify([entity,assignment,position,holder]);if(seen.has(key))continue;if(assignments.length>=limits.assignments){limited=true;continue;}seen.add(key);assignments.push({entity,holder,position,assignment,origin});}
    }
   }
  }else{const fact=officeEvent(record);if(fact){if(eventIds.has(fact.id))return true;if(facts.length>=limits.facts){limited=true;return true;}eventIds.add(fact.id);facts.push(fact);}}
  return true;
 },finish(){
  const terms=[],contexts=[],groups=new Map(),snapshots=[];
  for(const fact of facts){const office=resolveOffice(fact.entity,fact.position,fact.title,definitions),f={...fact,office};if(f.action==='creation'){contexts.push(f);continue;}const key=JSON.stringify([office.key,f.holder]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}
  const make=(start,end,issues=[])=>{const source=start||end,term={key:JSON.stringify([source.office.key,source.holder,start?.id||null,end?.id||null]),office:source.office,holder:source.holder,start,end,issues:[...issues]};if(!term.office.entity||!term.holder)term.issues.push('The organisation or officeholder is not identified');if(term.office.uncertain)term.issues.push('The source does not identify a unique office');if(start?.conflict||end?.conflict)term.issues.push('The source records disagree');term.duration=start&&end&&before(start,end)&&Number.isSafeInteger(end.year-start.year)?end.year-start.year:null;terms.push(term);return term;};
  for(const events of groups.values()){
   events.sort((a,b)=>compare(a,b)||a.id.localeCompare(b.id,'en',{numeric:true}));const years=new Map();for(const e of events){if(!years.has(e.year))years.set(e.year,[]);years.get(e.year).push(e);}const ambiguous=events.some(e=>e.year===null)||[...years.values()].some(group=>group.length>1&&(group.some(e=>e.seconds===null)||new Set(group.map(e=>e.seconds)).size!==group.length));
   if(ambiguous){for(const e of events)make(e.action==='appointment'?e:null,e.action==='removal'?e:null,['The dates do not establish a clear order for these appointments and removals']);continue;}
   let pending=[];for(const e of events){if(e.action==='appointment'){pending.push(e);continue;}if(pending.length===1)make(pending[0],e);else{for(const start of pending)make(start,null,['Several appointments precede this removal, so a term cannot be paired uniquely']);make(null,e,[pending.length?'This removal cannot be matched to one appointment':'No matching appointment is recorded']);}pending=[];}for(const start of pending)make(start,null,pending.length>1?['Several appointments have no uniquely matching removal']:[]);
  }
  const offices=new Map();for(const term of terms){if(!offices.has(term.office.key))offices.set(term.office.key,[]);offices.get(term.office.key).push(term);}
  for(const rows of offices.values()){
   rows.sort((a,b)=>compare(a.start,b.start)||a.key.localeCompare(b.key));let furthest=null;
   for(const term of rows){if(!term.start||term.start.year===null)continue;if(furthest&&(!furthest.end||furthest.end.year>term.start.year||furthest.end.year===term.start.year&&furthest.end.seconds!==null&&term.start.seconds!==null&&furthest.end.seconds>term.start.seconds)){term.overlap=true;furthest.overlap=true;}else if(furthest?.end?.year===term.start.year&&!before(furthest.end,term.start)){term.boundaryUncertain=true;furthest.boundaryUncertain=true;}if(!furthest||!term.end||furthest.end&&compare(term.end,furthest.end)>0)furthest=term;}
   // These are neighbouring recorded holders, not proof of inheritance or a complete succession.
   if(rows.some(t=>!t.start||t.start.year===null||t.issues.length))continue;
   for(let i=1;i<rows.length;i++){const prev=rows[i-1],next=rows[i];if(prev.holder!==next.holder&&prev.end&&before(prev.end,next.start)&&!prev.overlap&&!next.overlap){prev.next=next.key;next.previous=prev.key;}}
  }
  for(const assignment of assignments){const office=resolveOffice(assignment.entity,assignment.position,'',definitions);snapshots.push({...assignment,office});}
  return {terms,contexts,snapshots,definitions,stats:{scanned,facts:facts.length,definitions:definitionCount,assignments:assignments.length,limited:limited||nestedLimited,nestedLimited}};
 }};
}
const resolve=(kind,value,lookup)=>value?{kind,id:value,label:clippedLabel(lookup.get(recordKey(kind,value))?.label||`Missing ${kind==='entities'?'Organisation':'Figure'} #${value}`),missing:!lookup.has(recordKey(kind,value))}:null;
export function officeTerm(term,lookup,byKey=new Map()){
 const fact=f=>f?{...f,appointer:resolve('historical_figures',f.appointer,lookup),promised:resolve('historical_figures',f.promised,lookup)}:null;
 const neighbour=key=>{const row=byKey.get(key);return row?{holder:resolve('historical_figures',row.holder,lookup),year:row.start?.year??null}:null;};
 return {...term,holder:resolve('historical_figures',term.holder,lookup),entity:resolve('entities',term.office.entity,lookup),start:fact(term.start),end:fact(term.end),previous:neighbour(term.previous),next:neighbour(term.next)};
}
export function officeProfile(index,kind,subjectId,lookup,offset=0){
 const match=row=>kind==='entities'?row.office.entity===String(subjectId):row.holder===String(subjectId),all=index.terms.filter(match).sort((a,b)=>compare(a.start||a.end,b.start||b.end)||a.key.localeCompare(b.key)),byKey=new Map(index.terms.map(t=>[t.key,t])),n=Number(offset),start=Math.max(0,Math.min(Number.isFinite(n)?Math.floor(n/officeLimits.page)*officeLimits.page:0,Math.max(0,Math.floor((all.length-1)/officeLimits.page)*officeLimits.page)));
 return {rows:all.slice(start,start+officeLimits.page).map(t=>officeTerm(t,lookup,byKey)),total:all.length,offset:start,size:officeLimits.page,stats:index.stats,snapshots:index.snapshots.filter(match).slice(0,24).map(s=>({...s,holder:resolve('historical_figures',s.holder,lookup),entity:resolve('entities',s.entity,lookup)})),snapshotTotal:index.snapshots.filter(match).length,contexts:index.contexts.filter(c=>kind==='entities'?c.entity===String(subjectId):c.creator===String(subjectId)).slice(0,12).map(c=>({...c,entity:resolve('entities',c.entity,lookup)})),contextTotal:index.contexts.filter(c=>kind==='entities'?c.entity===String(subjectId):c.creator===String(subjectId)).length,definitionTotal:kind==='entities'?(index.definitions.get(String(subjectId))?.size||0):0,definitions:kind==='entities'?[...(index.definitions.get(String(subjectId))?.values()||[])].slice(0,24).map(d=>({id:d.id,title:clippedLabel(titleCase(d.name)),conflict:d.conflict})):[]};
}
export function officeRankings(index,lookup,shortest=false){
 const eligible=index.terms.filter(t=>t.duration!==null&&!t.issues.length&&!t.overlap&&lookup.has(recordKey('historical_figures',t.holder))&&lookup.has(recordKey('entities',t.office.entity)));
 const rows=eligible.map(t=>({key:t.key,kind:'historical_figures',id:t.holder,label:clippedLabel(lookup.get(recordKey('historical_figures',t.holder)).label),value:t.duration,detail:`${t.office.title} of ${clippedLabel(lookup.get(recordKey('entities',t.office.entity)).label)} · Year ${t.start.year} → Year ${t.end.year}`,evidence:[{kind:'historical_events',id:t.start.id},{kind:'historical_events',id:t.end.id}],entity:t.office.entity,office:true}));
 rows.sort((a,b)=>(shortest?a.value-b.value:b.value-a.value)||a.label.localeCompare(b.label,'en')||a.key.localeCompare(b.key));let rank=0;rows.forEach((r,i)=>{if(i===0||r.value!==rows[i-1].value)rank=i+1;r.rank=rank;});return {rows,candidates:index.terms.length,excluded:index.terms.length-rows.length,unresolved:index.terms.filter(t=>!lookup.has(recordKey('historical_figures',t.holder))||!lookup.has(recordKey('entities',t.office.entity))).length,partial:index.stats.limited};
}
