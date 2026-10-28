import {eventType} from './narrative.js?v=0.28.0';
import {collectReferences,recordKey,eventDate,compareEvents,normalise} from './exploration.js?v=0.28.0';
import {readableValue,titleCase,referenceLabel} from './language.js?v=0.28.0';
import {sitePosition} from './terrain.js?v=0.28.0';
export const collectionKind='historical_event_collections';
export const warfareTypes=new Set(['war','battle','duel','beast attack','site conquered','abduction','theft','raid','persecution','purge','insurrection','entity overthrown']);
export const warfareLimits={references:10000,collections:2000,events:50000,edges:20000,participants:5000,casualtyWork:200000,page:24,eventPage:50,cache:8};
const array=v=>v===undefined?[]:Array.isArray(v)?v:[v];
export const validId=v=>typeof v==='string'&&/^\d+$/.test(v);
const ids=v=>[...new Set(array(v).slice(0,warfareLimits.references).filter(validId))];
const year=v=>typeof v==='string'&&/^-?\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)!==-1?Number(v):null;
const scalar=(d,...fields)=>fields.map(k=>d[k]).find(v=>typeof v==='string'&&v.trim()!==''&&v!=='-1');
export const collectionType=d=>String(d?.type||'unknown collection').replaceAll('_',' ').toLowerCase().trim();
const roles={
 aggressor_ent_id:['entities','Recorded War Aggressor'],defender_ent_id:['entities','Recorded War Defender'],attacking_enid:['entities','Attacking Organisation'],defending_enid:['entities','Defending Organisation'],target_entity_id:['entities','Target Organisation'],target_enid:['entities','Target Organisation'],involved_enid:['entities','Involved Organisation'],attacking_merc_enid:['entities','Attacking Mercenary Organisation'],defending_merc_enid:['entities','Defending Mercenary Organisation'],
 attacking_hfid:['historical_figures','Attacking Figure'],defending_hfid:['historical_figures','Defending Figure'],noncom_hfid:['historical_figures','Recorded Non-combatant'],beast_hfid:['historical_figures','Attacking Beast'],snatcher_hfid:['historical_figures','Abductor'],kidnapped_hfid:['historical_figures','Abducted Figure'],attempted_kidnapped_hfid:['historical_figures','Attempted Abduction Target'],thief_hfid:['historical_figures','Recorded Thief'],raider_hfid:['historical_figures','Recorded Raider']
};
function squadSide(value){if(value===undefined)return {value:null,invalid:0};const raw=array(value);let total=0,invalid=Math.max(0,raw.length-warfareLimits.references);
 for(const v of raw.slice(0,warfareLimits.references)){if(typeof v!=='string'||!/^\d+$/.test(v)||!Number.isSafeInteger(Number(v))||!Number.isSafeInteger(total+Number(v))){invalid++;continue;}total+=Number(v);}
 return {value:raw.length>invalid?total:null,invalid};
}
export function collectionFacts(record){const d=record.data||{},type=collectionType(d),events=ids(d.event),children=ids(d.eventcol),parents=ids([...(array(d.parent_eventcol)),...array(d.war_eventcol)]),refs=[];let invalid=0,truncated=false;
 for(const field of ['event','eventcol','parent_eventcol','war_eventcol']){const values=array(d[field]);invalid+=values.slice(0,warfareLimits.references).filter(v=>!validId(v)).length;truncated ||= values.length>warfareLimits.references;}
 for(const [field,[kind,role]] of Object.entries(roles)){const raw=array(d[field]);truncated ||= raw.length>warfareLimits.references;for(const id of ids(raw)){if(refs.length>=warfareLimits.references){truncated=true;break;}refs.push({kind,id,role,field});}}
 truncated ||= array(d.parent_eventcol).length+array(d.war_eventcol).length>warfareLimits.references;
 const siteId=scalar(d,'site_id','site');
 return {id:String(record.id),kind:collectionKind,type,label:typeof d.name==='string'&&d.name.trim()?titleCase(d.name):`${readableValue(type)} #${record.id}`,start:year(d.start_year),end:year(d.end_year),outcome:typeof d.outcome==='string'?readableValue(d.outcome):null,events,children,parents,refs,siteId:validId(siteId)?siteId:null,position:sitePosition(d,1025,1025),squads:{attacker:squadSide(d.attacking_squad_deaths),defender:squadSide(d.defending_squad_deaths)},invalid,truncated};
}
export function createWarfareIndex(){const index={collections:new Map(),events:new Map(),sites:new Map(),children:new Map(),parents:new Map()};return {index,accept(record){const d=record.data||{},id=String(record.id);
 if(record.kind===collectionKind)index.collections.set(id,collectionFacts(record));
 if(record.kind==='sites')index.sites.set(id,{id,label:titleCase(record.label),position:sitePosition(d,1025,1025)});
 if(record.kind==='historical_events'){const refs=collectReferences(d),type=eventType(d);index.events.set(id,{id,kind:record.kind,...eventDate(d),type,refs:refs.slice(0,500),truncated:refs.length>500,victim:type==='hf died'?scalar(d,'hfid','victim_hf'):null,siteId:scalar(d,'site_id','site'),position:sitePosition(d,1025,1025)});}
 },finish(){const add=(parent,child)=>{if(!index.children.has(parent))index.children.set(parent,new Set());index.children.get(parent).add(child);if(!index.parents.has(child))index.parents.set(child,new Set());index.parents.get(child).add(parent);};for(const row of index.collections.values()){for(const child of row.children)add(row.id,child);for(const parent of row.parents)add(parent,row.id);}return index;}};}
// Iterative traversal deduplicates shared descendants/events and detects genuine path cycles.
export function collectionMembership(index,id,limits=warfareLimits){
 const collectionIds=new Set(),eventIds=new Set(),missingCollections=new Set(),active=new Set(),cycles=new Set(),stack=[{id,exit:false}];let edges=0,truncated=false,invalid=0;
 while(stack.length){const step=stack.pop();if(step.exit){active.delete(step.id);continue;}if(active.has(step.id)){cycles.add(step.id);continue;}if(collectionIds.has(step.id))continue;
  const row=index.collections.get(step.id);if(!row){missingCollections.add(step.id);continue;}if(collectionIds.size>=limits.collections){truncated=true;break;}collectionIds.add(step.id);invalid+=row.invalid;truncated ||= row.truncated;active.add(step.id);stack.push({id:step.id,exit:true});
  for(const event of row.events){if(eventIds.size>=limits.events&&!eventIds.has(event)){truncated=true;break;}eventIds.add(event);}
  const children=[...(index.children.get(step.id)||[])].sort((a,b)=>a.localeCompare(b,'en',{numeric:true}));for(let i=children.length-1;i>=0;i--){if(++edges>limits.edges){truncated=true;break;}stack.push({id:children[i],exit:false});}
 }
 return {collectionIds,eventIds,missingCollections,cycles,truncated,invalid,edges};
}
export function warfareDirectory(index,{q='',type='',from='',to='',offset=0}={}){const term=normalise(q),lo=from===''?null:Number(from),hi=to===''?null:Number(to),invalid=(lo!==null&&!Number.isSafeInteger(lo))||(hi!==null&&!Number.isSafeInteger(hi))||(lo!==null&&hi!==null&&lo>hi);
 const all=[...index.collections.values()].filter(r=>warfareTypes.has(r.type));const rows=invalid?[]:all.filter(r=>(!type||r.type===type)&&(!term||(term.startsWith('#')?r.id===term.slice(1):normalise(r.label).includes(term)||r.id===term))&&((lo===null&&hi===null)||([r.start,r.end].some(y=>y!==null)&&(![r.start,r.end].every(y=>y!==null)||r.start<=r.end)&&Math.max(...[r.start,r.end].filter(y=>y!==null))>=(lo??-Infinity)&&Math.min(...[r.start,r.end].filter(y=>y!==null))<=(hi??Infinity))));
 rows.sort((a,b)=>(a.start??Infinity)-(b.start??Infinity)||a.label.localeCompare(b.label)||a.id.localeCompare(b.id,'en',{numeric:true}));const start=pageOffset(offset,rows.length,warfareLimits.page);
 return {rows:rows.slice(start,start+warfareLimits.page).map(publicCollection),total:rows.length,all:all.length,offset:start,types:[...new Set(all.map(r=>r.type))].sort(),invalid};
}
export function publicCollection(row){if(!row)return null;return {id:row.id,kind:collectionKind,label:row.label,type:row.type,start:row.start,end:row.end,outcome:row.outcome,siteId:row.siteId,position:row.position,factions:row.refs.filter(r=>r.kind==='entities').slice(0,4)};}
const hasSquads=r=>r.squads.attacker.value!==null||r.squads.defender.value!==null||r.squads.attacker.invalid||r.squads.defender.invalid;
export async function conflictDetails(index,id,{isCancelled=()=>false,onProgress=()=>{},limits=warfareLimits}={}){
 const root=index.collections.get(id);if(!root)throw Error('This historical collection is missing from the archive.');const membership=collectionMembership(index,id,limits),participants=new Map(),victims=new Set(),events=[],reports=[];let missingEvents=0,unidentifiedDeaths=0,participantLimited=false,located=0,eventPartial=false;
 const addParticipant=(ref,source)=>{if(!['historical_figures','entities'].includes(ref.kind)||!validId(ref.id))return;const key=JSON.stringify([ref.kind,ref.id,ref.role]);let item=participants.get(key);if(!item){if(participants.size>=limits.participants){participantLimited=true;return;}item={...ref,evidence:[],count:0};participants.set(key,item);}item.count++;if(item.evidence.length<3)item.evidence.push(source);};
 let work=0;for(const cid of membership.collectionIds){if(isCancelled())throw new DOMException('Conflict query cancelled.','AbortError');const row=index.collections.get(cid);for(const ref of row.refs)addParticipant(ref,{kind:collectionKind,id:cid,field:ref.field});if(row.type==='battle'&&hasSquads(row))reports.push({id:cid,...row.squads});}
 for(const eid of membership.eventIds){if(isCancelled())throw new DOMException('Conflict query cancelled.','AbortError');const event=index.events.get(eid);if(!event){missingEvents++;continue;}events.push(event);eventPartial ||= event.truncated;
  if(event.type==='hf died'){if(validId(event.victim))victims.add(event.victim);else unidentifiedDeaths++;}
  const site=index.sites.get(event.siteId);if(site?.position||event.position)located++;
  for(const ref of event.refs)addParticipant({...ref,role:`Mentioned in Events: ${referenceLabel(ref.role,event.type==='hf died')}`},{kind:'historical_events',id:eid,field:ref.path});
  if(++work%500===0){onProgress(work);await new Promise(resolve=>setTimeout(resolve,0));}
 }
 events.sort(compareEvents);
 // Most-specific reports only. If provenance overlaps or graph work is incomplete, do not combine totals.
 let casualtyWork=0,casualtyLimited=false;const rollups=new Set(),descendants=new Map(),reportIds=new Set(reports.map(r=>r.id));
 for(const report of reports){const seen=new Set(),queue=[...(index.children.get(report.id)||[])];for(let i=0;i<queue.length;i++){if(++casualtyWork>limits.casualtyWork){casualtyLimited=true;break;}const next=queue[i];if(seen.has(next))continue;seen.add(next);if(next!==report.id&&reportIds.has(next))rollups.add(report.id);for(const child of index.children.get(next)||[])queue.push(child);}descendants.set(report.id,seen);if(casualtyLimited)break;
  if(casualtyWork%500<50){if(isCancelled())throw new DOMException('Conflict query cancelled.','AbortError');await new Promise(resolve=>setTimeout(resolve,0));}}
 const frontier=reports.filter(r=>!rollups.has(r.id)),owners=new Map();let overlap=false;
 for(const report of frontier){const group=[report.id,...(descendants.get(report.id)||[])];for(const cid of group){if(++casualtyWork>limits.casualtyWork){casualtyLimited=true;break;}const tokens=['collection:'+cid,...(index.collections.get(cid)?.events||[]).flatMap(e=>['event:'+e,...(validId(index.events.get(e)?.victim)?['victim:'+index.events.get(e).victim]:[])])];for(const token of tokens){if(++casualtyWork>limits.casualtyWork){casualtyLimited=true;break;}if(owners.has(token)&&owners.get(token)!==report.id)overlap=true;else owners.set(token,report.id);}if(casualtyLimited)break;}if(casualtyLimited)break;}
 const uncertain=membership.truncated||membership.cycles.size>0||membership.missingCollections.size>0||missingEvents>0||overlap||casualtyLimited;
 const totals={attacker:null,defender:null};let invalidSquads=0;for(const report of frontier)for(const side of ['attacker','defender']){invalidSquads+=report[side].invalid;const value=report[side].value;if(value!==null){const next=(totals[side]??0)+value;if(Number.isSafeInteger(next))totals[side]=next;else casualtyLimited=true;}}
 if(!Number.isSafeInteger((totals.attacker??0)+(totals.defender??0)))casualtyLimited=true;
 for(const report of reports)report.rollup=rollups.has(report.id);
 return {root:publicCollection(root),membership:{collections:membership.collectionIds.size,events:membership.eventIds.size,missingCollections:[...membership.missingCollections].slice(0,24),missingCollectionCount:membership.missingCollections.size,missingEvents,cycles:membership.cycles.size,truncated:membership.truncated,invalid:membership.invalid},events,participants:[...participants.values()].sort((a,b)=>a.role.localeCompare(b.role)||a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id,'en',{numeric:true})),reports,parents:[...(index.parents.get(id)||[])],children:[...(index.children.get(id)||[])],victims:victims.size,unidentifiedDeaths,located,participantLimited,eventPartial,squads:{totals:uncertain||casualtyLimited?null:totals,reports:reports.length,frontier:frontier.length,rollups:rollups.size,overlap,limited:casualtyLimited,invalid:invalidSquads,partial:frontier.some(r=>r.attacker.value===null||r.defender.value===null)||invalidSquads>0}};
}
export function pageOffset(value,total,size){const n=Number(value),offset=Number.isFinite(n)?Math.max(0,Math.floor(n/size)*size):0;return Math.min(offset,Math.max(0,Math.ceil(total/size)-1)*size);}
export function warfarePage(index,detail,{tab='chronicle',offset=0,from='',to=''}={}){const chosen=['chronicle','conflicts','participants','reports'].includes(tab)?tab:'chronicle';let rows=chosen==='chronicle'?detail.events:chosen==='conflicts'?detail.children.map(id=>publicCollection(index.collections.get(id))||{id,kind:collectionKind,label:`Missing Collection #${id}`,missing:true}):chosen==='participants'?detail.participants:detail.reports;
 const lo=from===''?null:Number(from),hi=to===''?null:Number(to),invalid=(lo!==null&&!Number.isSafeInteger(lo))||(hi!==null&&!Number.isSafeInteger(hi))||(lo!==null&&hi!==null&&lo>hi);if(chosen==='chronicle')rows=invalid?[]:rows.filter(r=>(lo===null&&hi===null)||(r.year!==null&&(lo===null||r.year>=lo)&&(hi===null||r.year<=hi)));
 const size=chosen==='chronicle'?warfareLimits.eventPage:warfareLimits.page,start=pageOffset(offset,rows.length,size),{events,participants,reports,parents,children,...overview}=detail;
 return {...overview,parents:parents.slice(0,8).map(id=>publicCollection(index.collections.get(id))||{id,kind:collectionKind,label:`Missing Collection #${id}`,missing:true}),moreParents:Math.max(0,parents.length-8),counts:{chronicle:events.length,conflicts:children.length,participants:participants.length,reports:reports.length},tab:chosen,offset:start,total:rows.length,size,invalid,rows:rows.slice(start,start+size).map(row=>chosen==='chronicle'?{id:row.id,kind:'historical_events',year:row.year,seconds:row.seconds,eventType:row.type}:row)};
}
