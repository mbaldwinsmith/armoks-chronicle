import {eventType,narrateEvent} from './narrative.js?v=0.30.0';
import {recordKey} from './exploration.js?v=0.30.0';
import {clippedLabel,eventLabel} from './language.js?v=0.30.0';
import {sitePosition} from './terrain.js?v=0.30.0';
export const settlementLimits={records:500000,facts:100000,sites:50000,page:12};
export const settlementCategories={all:'All Settlement History',origins:'Founding and Reclamation',conflict:'Attacks and Destruction',government:'Government and Diplomacy',building:'Construction and Rebuilding'};
const types={
 'created site':'origins','reclaim site':'origins','site abandoned':'origins','site died':'origins','site retired':'origins',
 'attacked site':'conflict','hf attacked site':'conflict','destroyed site':'conflict','hf destroyed site':'conflict','plundered site':'conflict',
 'site taken over':'government','new site leader':'government','site surrendered':'government','site tribute forced':'government','site dispute':'government',
 'created structure':'building','replaced structure':'building','razed structure':'building'
};
const id=v=>typeof v==='string'&&/^\d{1,128}$/.test(v)?v:null;
const first=(d,...fields)=>fields.map(f=>id(d?.[f])).find(Boolean)||null;
const normal=v=>typeof v==='string'?v.trim().toLowerCase().replaceAll('_',' ').replace(/\s+/g,' '):'';
const year=v=>typeof v==='string'&&/^-?\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)!==-1?Number(v):null;
const ref=(kind,value,role,path)=>value?{kind,id:value,role,path}:null;
const dateSort=(a,b)=>(a.year??Infinity)-(b.year??Infinity)||(a.seconds??Infinity)-(b.seconds??Infinity)||a.id.localeCompare(b.id,'en',{numeric:true});
function settlementRoles(d,type,sites){const governmentChange=['site taken over','new site leader'].includes(type);
 const refs=[];for(const site of sites)refs.push(ref('sites',site,type==='site dispute'?'Disputed Site':'Recorded Site',type==='site dispute'?'site_id_1 / site_id_2':'site_id'));
 for(const [field,role] of [['civ_id','Recorded Civilisation'],['resident_civ_id','Recorded Residents'],['site_civ_id',governmentChange?'Previous Local Government':'Recorded Local Government'],['new_site_civ_id','New Local Government'],['attacker_civ_id','Attacking Civilisation'],['defender_civ_id','Defending Civilisation'],['entity_id_1','First Disputing Organisation'],['entity_id_2','Second Disputing Organisation']])if(id(d[field]))refs.push(ref('entities',d[field],role,field));
 for(const [field,role] of [['builder_hfid','Recorded Builder'],['builder_hf','Recorded Builder'],['attacker_hfid','Attacking Figure'],['new_leader_hfid','New Recorded Leader']])if(id(d[field]))refs.push(ref('historical_figures',d[field],role,field));
 return refs;
}
export function settlementFact(record){
 if(record.kind!=='historical_events'||!id(String(record.id)))return null;const d=record.data||{},type=eventType(d),category=types[type];if(!category)return null;
 const sites=type==='site dispute'?[...new Set([id(d.site_id_1),id(d.site_id_2)].filter(Boolean))]:[first(d,'site_id',...(['created structure','replaced structure'].includes(type)?['site']:[]))].filter(Boolean);if(!sites.length)return null;
 const governmentChange=['site taken over','new site leader'].includes(type),oldGovernment=governmentChange?id(d.site_civ_id):null,newGovernment=governmentChange?id(d.new_site_civ_id):null;
 const issues=[];if(record.supplement&&['type','year','seconds72','site_id','site','site_id_1','site_id_2','site_civ_id','new_site_civ_id'].some(k=>d[k]!==undefined&&record.supplement[k]!==undefined&&normal(d[k])!==normal(record.supplement[k])))issues.push('The standard and supplementary records disagree about this event.');
 if(['created structure','replaced structure'].includes(type)&&id(d.site_id)&&id(d.site)&&d.site_id!==d.site)issues.push('The recorded site fields disagree.');
 const refs=settlementRoles(d,type,sites);
 const tokens=narrateEvent(d).tokens.map(t=>typeof t==='string'?clippedLabel(t):id(t.id)?t:'an unidentified record');
 return {id:String(record.id),kind:record.kind,type,category,label:eventLabel(type),sites,year:year(d.year),seconds:year(d.seconds72)!==null&&year(d.seconds72)>=0?year(d.seconds72):null,governmentChange,oldGovernment,newGovernment,issues,refs,tokens};
}
export function settlementReferences(record){if(record.kind==='sites')return [ref('entities',id(record.data?.cur_owner_id),'Export-Time Owner','cur_owner_id'),ref('entities',id(record.data?.civ_id),'Recorded Civilisation','civ_id')].filter(Boolean);if(record.kind!=='historical_events')return [];const d=record.data||{},type=eventType(d);if(!types[type])return [];const sites=type==='site dispute'?[...new Set([id(d.site_id_1),id(d.site_id_2)].filter(Boolean))]:[first(d,'site_id',...(['created structure','replaced structure'].includes(type)?['site']:[]))].filter(Boolean);return sites.length?settlementRoles(d,type,sites):[];}
function governmentGroups(rows,lookup){
 const groups=new Map(),reasons=new Map();for(const row of rows){if(!row.governmentChange)continue;let reason='';if(row.issues.length)reason='Conflicting source fields prevent a reliable comparison.';else if(row.year===null)reason='The date is not recorded.';else if(!row.oldGovernment||!row.newGovernment)reason='Both previous and new local governments must be identified.';else if(row.oldGovernment===row.newGovernment)reason='The same local government is named before and after this event.';else if(!lookup.has(recordKey('entities',row.oldGovernment))||!lookup.has(recordKey('entities',row.newGovernment)))reason='A referenced local government is missing from this archive.';
  if(reason){reasons.set(row.id,reason);continue;}const key=JSON.stringify([row.year,row.oldGovernment,row.newGovernment]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);
 }
 const signatures=[];for(const rows of groups.values()){if(rows.some(r=>r.seconds===null)){signatures.push({rows,uncertainTiming:rows.length>1});}else{const times=new Map();for(const row of rows){if(!times.has(row.seconds))times.set(row.seconds,[]);times.get(row.seconds).push(row);}for(const rows of times.values())signatures.push({rows,uncertainTiming:false});}}
 signatures.sort((a,b)=>dateSort(a.rows[0],b.rows[0]));return {signatures,reasons};
}
export function createSettlementIndex(limits=settlementLimits){
 const bySite=new Map(),seen=new Set();let scanned=0,facts=0,limited=false;
 return {accept(record){if(record.kind!=='historical_events')return true;if(scanned>=limits.records){limited=true;return false;}scanned++;if(facts>=limits.facts){limited=true;return true;}if(seen.has(String(record.id)))return true;const fact=settlementFact(record);if(!fact)return true;if(facts>=limits.facts){limited=true;return true;}seen.add(fact.id);facts++;
  for(const site of fact.sites){if(!bySite.has(site)){if(bySite.size>=limits.sites){limited=true;continue;}bySite.set(site,[]);}bySite.get(site).push(fact);}return true;
 },finish(lookup){const histories=new Map();for(const [site,rows] of bySite){rows.sort(dateSort);histories.set(site,{rows,...governmentGroups(rows,lookup)});}return {histories,stats:{scanned,facts,sites:bySite.size,limited}};}};
}
export function settlementFilters(value={}){const get=k=>value instanceof URLSearchParams?value.get(k):value[k];const from=get('settleFrom')??get('from')??'',to=get('settleTo')??get('to')??'',category=get('settleCategory')??get('category')??'all';const valid=v=>v===''||typeof v==='string'&&/^-?\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)!==-1;return {category:Object.hasOwn(settlementCategories,category)?category:'all',from,to,invalid:!valid(from)||!valid(to)||from!==''&&to!==''&&Number(from)>Number(to)};}
export function settlementParams(params,filters,offset=0){const q=new URLSearchParams(params),f=settlementFilters(filters);for(const key of ['settleFrom','settleTo','settleCategory','settleOffset'])q.delete(key);if(f.category!=='all')q.set('settleCategory',f.category);if(f.from!=='')q.set('settleFrom',f.from);if(f.to!=='')q.set('settleTo',f.to);if(offset)q.set('settleOffset',String(offset));return q;}
const resolve=(r,lookup)=>({...r,label:clippedLabel(lookup.get(recordKey(r.kind,r.id))?.label||`Missing ${r.kind==='entities'?'Organisation':r.kind==='sites'?'Site':'Figure'} #${r.id}`),missing:!lookup.has(recordKey(r.kind,r.id))});
export function settlementProfile(index,record,lookup,options={}){
 const history=index.histories.get(String(record.id))||{rows:[],signatures:[],reasons:new Map()},f=settlementFilters(options),rows=f.invalid?[]:history.rows.filter(r=>(f.category==='all'||r.category===f.category)&&(f.from===''&&f.to===''||r.year!==null&&(f.from===''||r.year>=Number(f.from))&&(f.to===''||r.year<=Number(f.to)))),n=Number(options.offset),offset=Math.max(0,Math.min(Number.isFinite(n)?Math.floor(n/settlementLimits.page)*settlementLimits.page:0,Math.max(0,Math.floor((rows.length-1)/settlementLimits.page)*settlementLimits.page))),groups=new Map();
 for(const group of history.signatures)for(const row of group.rows)groups.set(row.id,group);
 const d=record.data||{},snapshot=value=>value==='-1'?{state:'none',label:'No Recorded Affiliation (−1)'}:id(value)?{state:'recorded',...resolve(ref('entities',value,'',''),lookup)}:{state:'unknown',label:'Not Recorded'};
 return {rows:rows.slice(offset,offset+settlementLimits.page).map(row=>{const group=groups.get(row.id);return {...row,refs:row.refs.map(r=>resolve(r,lookup)),tokens:row.tokens.map(t=>typeof t==='string'?t:resolve(t,lookup)),change:group?{counted:true,related:group.rows.length,uncertainTiming:group.uncertainTiming}:row.governmentChange?{counted:false,reason:history.reasons.get(row.id)}:null};}),total:rows.length,unfiltered:history.rows.length,offset,size:settlementLimits.page,filters:f,stats:index.stats,changes:history.signatures.length,ambiguousGroups:history.signatures.filter(g=>g.uncertainTiming).length,snapshot:{owner:snapshot(d.cur_owner_id),civilisation:snapshot(d.civ_id)},position:sitePosition(d,1025,1025)};
}
export function contestedSettlements(index,lookup){
 const rows=[];let unresolved=0;for(const [id,history] of index.histories){if(!history.signatures.length)continue;const key=recordKey('sites',id),site=lookup.get(key);if(!site){unresolved++;continue;}rows.push({key,kind:'sites',id,label:clippedLabel(site.label),value:history.signatures.length,settlement:true,detail:'Recorded changes of local government; this is not an attack count.',evidence:history.signatures.slice(0,5).map(g=>({kind:'historical_events',id:g.rows[0].id})),uncertainTiming:history.signatures.some(g=>g.uncertainTiming)});}
 rows.sort((a,b)=>b.value-a.value||a.label.localeCompare(b.label,'en')||a.id.localeCompare(b.id,'en',{numeric:true}));let rank=0;rows.forEach((r,i)=>{if(i===0||r.value!==rows[i-1].value)rank=i+1;r.rank=rank;});const candidates=[...lookup.values()].filter(r=>r.kind==='sites').length;return {rows,candidates,excluded:candidates-rows.length,unresolved,partial:index.stats.limited};
}
