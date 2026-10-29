import {eventType} from './narrative.js?v=0.31.0';
import {recordKey} from './exploration.js?v=0.31.0';
import {eventLabel,clippedLabel} from './language.js?v=0.31.0';
export const journeyLimits={records:500000,dated:200,undated:40,page:12,cache:8};
const valid=v=>typeof v==='string'&&v.length<=128&&/^\d+$/.test(v);
const id=(d,...keys)=>keys.map(k=>d[k]).find(valid)||null;
const date=v=>typeof v==='string'&&/^-?\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)!==-1?Number(v):null;
const ref=(kind,value,role)=>value?{kind,id:value,role}:null;
// Only the primary subject of these schemas receives a location. Relatives, killers,
// teachers, claimed owners and holders' later movements are never propagated.
export function journeyFact(record,kind,subjectId){
 if(record.kind!=='historical_events'||!valid(String(record.id)))return null;
 const d=record.data||{},type=eventType(d),refs=[];let subject,action,category='location';
 if(kind==='historical_figures'){
  if(type==='change hf state'){subject=id(d,'hfid');const states={settled:'Settled',wandering:'Began Wandering',visiting:'Visited',refugee:'Became a Refugee',scouting:'Scouted',hunting:'Hunted'};action=states[d.state]||'Changed Recorded State';}
  else if(type==='hf died'){subject=id(d,'hfid','victim_hf');action='Died';}
  else if(type==='hf abducted'){subject=id(d,'target_hfid');action='Was Abducted';}
  else return null;
 }else if(kind==='artifacts'){
  subject=id(d,'artifact_id');
  const actions={'artifact created':'Created','artifact possessed':'Recorded Possession','artifact stored':'Stored','artifact lost':'Lost','artifact found':'Found','artifact recovered':'Recovered','artifact destroyed':'Destruction Recorded','artifact claim formed':'Ownership Claim Recorded','artifact given':'Transfer Recorded'};
  action=actions[type];if(!action)return null;
  if(type==='artifact created'&&Object.hasOwn(d,'name_only')){action='Received Its Name';category='context';}
  if(type==='artifact claim formed')category='claim';
  if(type==='artifact given')category='transfer';
  for(const [fields,target,role] of [[['hist_figure_id','creator_hfid','hfid'],'historical_figures',type==='artifact created'?'Recorded Creator':type==='artifact possessed'?'Recorded Possessor':'Recorded Figure'],[['entity_id'],'entities','Recorded Claimant'],[['giver_hist_figure_id'],'historical_figures','Giver'],[['receiver_hist_figure_id'],'historical_figures','Receiver'],[['giver_entity_id'],'entities','Giving Organisation'],[['receiver_entity_id'],'entities','Receiving Organisation']]){const value=id(d,...fields);if(value)refs.push(ref(target,value,role));}
 }else return null;
 if(subject!==String(subjectId))return null;
 const locationConflict=valid(d.site_id)&&valid(d.site)&&d.site_id!==d.site;
 const location=!locationConflict&&category==='location'?(ref('sites',id(d,'site_id','site'),'Recorded Site')||ref('regions',id(d,'subregion_id'),'Recorded Region')||ref('underground_regions',id(d,'feature_layer_id'),'Recorded Underground Region')):null;
 const year=date(d.year),seconds=date(d.seconds72);
 return {id:String(record.id),kind:'historical_events',type,action,category,locationConflict,year,seconds:seconds!==null&&seconds>=0?seconds:null,location,refs,label:eventLabel(type),paths:['type',...(d.year!==undefined?['year']:[]),...['hfid','victim_hf','target_hfid','artifact_id','site_id','site','subregion_id','feature_layer_id','state','hist_figure_id','creator_hfid','claim','circumstance','seconds72'].filter(k=>Object.hasOwn(d,k))]};
}
const compare=(a,b)=>(a.year??Infinity)-(b.year??Infinity)||(a.seconds??Infinity)-(b.seconds??Infinity)||a.id.localeCompare(b.id,'en',{numeric:true});
export function createJourneyHistory(kind,subjectId,limits=journeyLimits){
 let scanned=0,total=0,datedTotal=0,undatedTotal=0,scanLimited=false;const dated=[],undated=[];
 return {accept(record){if(scanned>=limits.records){scanLimited=true;return false;}scanned++;const fact=journeyFact(record,kind,subjectId);if(!fact)return true;total++;const rows=fact.year===null?undated:dated,cap=fact.year===null?limits.undated:limits.dated;if(fact.year===null)undatedTotal++;else datedTotal++;rows.push(fact);rows.sort(compare);if(rows.length>cap){if(fact.year===null)rows.pop();else rows.shift();}return true;},finish(){return {rows:[...dated,...undated],scanned,total,datedTotal,undatedTotal,scanLimited,retainedLimited:datedTotal>limits.dated||undatedTotal>limits.undated};}};
}
export function journeySnapshot(record){if(record.kind!=='artifacts')return [];const d=record.data||{},site=id(d,'site_id'),holder=id(d,'holder_hfid');return [{id:record.id,kind:record.kind,type:'artifact snapshot',action:'Export-Time Snapshot',category:'snapshot',year:null,seconds:null,location:ref('sites',site,'Snapshot Site'),refs:holder?[ref('historical_figures',holder,'Recorded Physical Holder')]:[],label:'Artifact Snapshot',paths:['site_id','holder_hfid'].filter(k=>Object.hasOwn(d,k))}].filter(row=>row.location||row.refs.length);}
export function resolveJourney(history,lookup,snapshots=[]){const resolve=r=>{if(!r)return null;const row=lookup.get(recordKey(r.kind,r.id));return {...r,label:clippedLabel(row?.label||`Missing ${r.kind==='sites'?'Site':r.kind==='historical_figures'?'Figure':'Record'} #${r.id}`),missing:!row};};const rows=history.rows.map(row=>({...row,location:resolve(row.location),refs:row.refs.map(resolve)}));return {...history,rows,snapshots:snapshots.map(row=>({...row,location:resolve(row.location),refs:row.refs.map(resolve)}))};}
export function latestJourneyLocations(history){
 const located=history.rows.filter(r=>r.category==='location'&&r.year!==null&&r.location);if(!located.length)return {rows:[],ambiguous:false,laterUnknown:false};
 const year=Math.max(...located.map(r=>r.year)),same=located.filter(r=>r.year===year),allTimed=same.every(r=>r.seconds!==null),seconds=allTimed?Math.max(...same.map(r=>r.seconds)):null,rows=allTimed?same.filter(r=>r.seconds===seconds):same;
 const laterUnknown=history.rows.some(r=>r.category==='location'&&r.year!==null&&!r.location&&(r.year>year||r.year===year&&(r.seconds===null||seconds===null||r.seconds>=seconds)));
 return {rows,ambiguous:new Set(rows.map(r=>recordKey(r.location.kind,r.location.id))).size>1,laterUnknown};
}
export function journeyPage(history,offset=0,size=journeyLimits.page){const total=history.rows.length,n=Number(offset),start=Math.max(0,Math.min(Number.isFinite(n)?Math.floor(n/size)*size:0,Math.max(0,Math.floor((total-1)/size)*size)));return {...history,rows:history.rows.slice(start,start+size),offset:start,size,retained:total,latest:latestJourneyLocations(history)};}
export function journeyMap(history,sites,width,height){
 const bySite=new Map(sites.map(s=>[s.id,s])),points=[],segments=[];let previous=null;
 // Count all same-year location rows; incomplete timestamps leave their order unknown.
 const years=new Map();for(const row of history.rows)if(row.category==='location'&&row.year!==null){if(!years.has(row.year))years.set(row.year,[]);years.get(row.year).push(row);}
 const ambiguous=row=>years.get(row.year).length>1&&(years.get(row.year).some(r=>r.seconds===null)||years.get(row.year).some(r=>r.id!==row.id&&r.seconds===row.seconds));
 let unmapped=0;for(const row of history.rows){if(row.category!=='location')continue;const site=row.location?.kind==='sites'?bySite.get(row.location.id):null;
  if(!site||!Number.isInteger(site.x)||!Number.isInteger(site.y)||site.x<0||site.y<0||site.x>=width||site.y>=height){unmapped++;previous=null;continue;}
  const point={...row,x:site.x,y:site.y,number:points.length+1,siteLabel:site.label};points.push(point);
  if(row.year===null){previous=null;continue;}
  if(previous&&!ambiguous(row)&&!ambiguous(previous)&&(row.year>previous.year||row.year===previous.year&&row.seconds>previous.seconds)){if(previous.x!==point.x||previous.y!==point.y)segments.push({from:previous.number,to:point.number});}
  previous=point;
 }
 return {points,segments,unmapped,partial:history.scanLimited||history.retainedLimited};
}
