import {collectionKind,warfareTypes,validId,pageOffset} from './warfare.js?v=0.21.1';
import {recordKey} from './exploration.js?v=0.21.1';
import {readableValue} from './language.js?v=0.21.1';
export const factionLimits={collections:20000,memberships:250000,eventScan:250000,roleReferences:250000,claims:100000,pairsPerSource:128,nodes:25,edges:60,page:10,evidence:24,cache:4};
const numeric=(a,b)=>a.localeCompare(b,'en',{numeric:true})||a.localeCompare(b,'en');
export const factionPair=(a,b)=>[String(a),String(b)].sort(numeric).join(',');
const yieldWork=()=>new Promise(resolve=>setTimeout(resolve,0));
function check(cancel){if(cancel())throw new DOMException('Warfare network cancelled.','AbortError');}
export async function buildFactionSources(index,{limits=factionLimits,isCancelled=()=>false,onProgress=()=>{}}={}){
 const incompleteIds=new Set();const rows=[...index.collections.values()].slice(0,limits.collections),parent=new Map(rows.map(r=>[r.id,r.id])),owner=new Map(),stats={collectionLimited:index.collections.size>rows.length,membershipLimited:false,eventLimited:false,claimLimited:false,roleLimited:false,pairLimited:0,incompleteSources:0,missingParents:0,selfPairs:0,oneSided:0};let work=0,collectionWork=0,roleWork=0;
 const find=id=>{let root=id;while(parent.get(root)!==root)root=parent.get(root);while(parent.get(id)!==id){const next=parent.get(id);parent.set(id,root);id=next;}return root;};
 const join=(a,b)=>{a=find(a);b=find(b);if(a!==b){const [first,second]=[a,b].sort(numeric);parent.set(second,first);}};
 for(const row of rows){check(isCancelled);stats.incompleteSources+=Number(row.truncated);if(row.truncated||row.invalid)incompleteIds.add(row.id);for(const id of row.parents){if(++work>limits.memberships){stats.membershipLimited=true;break;}if(!parent.has(id)){stats.missingParents++;incompleteIds.add(row.id);}}if(stats.membershipLimited)break;
  for(const child of index.children.get(row.id)||[]){if(++work>limits.memberships){stats.membershipLimited=true;break;}if(parent.has(child))join(row.id,child);else{stats.missingParents++;incompleteIds.add(row.id);}}
  if(stats.membershipLimited)break;
  for(const event of row.events){if(++work>limits.memberships){stats.membershipLimited=true;break;}if(owner.has(event))join(row.id,owner.get(event));else owner.set(event,row.id);}
  if(++collectionWork%200===0){onProgress(work);await yieldWork();}
 }
 const groups=new Map();for(const row of rows){const key='collection:'+find(row.id);let group=groups.get(key);if(!group){group={key,id:row.id,kind:collectionKind,label:row.label,warCount:0,roots:0,shared:false,incomplete:false};groups.set(key,group);}group.incomplete ||= incompleteIds.has(row.id);group.warCount+=Number(row.type==='war');group.roots+=Number(!(index.parents.get(row.id)?.size));
  const selected=index.collections.get(group.id);if((row.type==='war'&&selected.type!=='war')||(selected.type!=='war'&&warfareTypes.has(row.type)&&!warfareTypes.has(selected.type))||(row.type===selected.type&&numeric(row.id,group.id)<0)){group.id=row.id;group.label=row.label;}
 }
 for(const group of groups.values())group.shared=group.warCount>1||group.roots!==1;
 const sources=[],types=new Map();
 function add(source,left,right,role){left=[...new Set(left.filter(validId))];right=[...new Set(right.filter(validId))];if(!left.length||!right.length){if(left.length||right.length)stats.oneSided++;return;}
  let pairs=0;for(const from of left)for(const to of right){if(from===to){stats.selfPairs++;continue;}if(++pairs>limits.pairsPerSource){stats.pairLimited++;return;}if(sources.length>=limits.claims){stats.claimLimited=true;return;}sources.push({...source,from,to,pair:factionPair(from,to),role});types.set(source.typeKey,source.typeLabel);}
 }
 function fields(refs,key){const result=new Map();for(const ref of refs){if(++roleWork>limits.roleReferences){stats.roleLimited=true;break;}if(ref.kind!=='entities')continue;const name=ref[key];if(!result.has(name))result.set(name,[]);result.get(name).push(ref.id);}return name=>result.get(name)||[];}
 collectionWork=0;for(const row of rows){check(isCancelled);if(!warfareTypes.has(row.type))continue;const field=fields(row.refs,'field'),source={id:row.id,kind:collectionKind,key:recordKey(collectionKind,row.id),label:row.label,type:row.type,typeKey:'collection:'+row.type,typeLabel:readableValue(row.type)+' (Collection)',start:row.start,end:row.end,group:'collection:'+find(row.id)};
  if(row.type==='war')add(source,field('aggressor_ent_id'),field('defender_ent_id'),'war-aggressor');
  add(source,field('attacking_enid'),field('defending_enid'),'attacker');if(stats.claimLimited||stats.roleLimited)break;if(++collectionWork%200===0){onProgress(work+roleWork);await yieldWork();}
 }
 let scanned=0;const eventTypes=new Set(['field battle','attacked site','destroyed site','plundered site']);
 for(const event of index.events.values()){check(isCancelled);if(++scanned>limits.eventScan){stats.eventLimited=true;break;}if(eventTypes.has(event.type)){
   const field=fields(event.refs,'role'),group=owner.has(event.id)?'collection:'+find(owner.get(event.id)):'event:'+event.id;
   if(!groups.has(group))groups.set(group,{key:group,id:event.id,kind:'historical_events',label:`${readableValue(event.type)} #${event.id}`,warCount:0,roots:1,shared:false});
   stats.incompleteSources+=Number(event.truncated);add({id:event.id,kind:'historical_events',key:recordKey('historical_events',event.id),label:`${readableValue(event.type)} #${event.id}`,type:event.type,typeKey:'event:'+event.type,typeLabel:readableValue(event.type)+' (Event)',start:event.year,end:event.year,group},field('attacker_civ_id'),field('defender_civ_id'),'attacker');
  }if(stats.claimLimited||stats.roleLimited)break;if(scanned%1000===0){onProgress(work+scanned);await yieldWork();}
 }
 return {sources,groups,stats,types:[...types].sort(([a],[b])=>a.localeCompare(b)).map(([key,label])=>({key,label}))};
}
export function factionFilters(options={}){const from=options.from??'',to=options.to??'',type=String(options.type||''),lo=from===''?null:Number(from),hi=to===''?null:Number(to);return {from,to,type,lo,hi,invalid:(lo!==null&&!Number.isSafeInteger(lo))||(hi!==null&&!Number.isSafeInteger(hi))||(lo!==null&&hi!==null&&lo>hi)};}
export async function filterFactionNetwork(base,options={}, {isCancelled=()=>false,onProgress=()=>{}}={}){
 const filters=factionFilters(options),edges=new Map(),adjacency=new Map();let processed=0;
 if(!filters.invalid)for(const source of base.sources){check(isCancelled);
  const dates=[source.start,source.end].filter(y=>y!==null),dated=dates.length&&!(source.start!==null&&source.end!==null&&source.start>source.end);
  if((!filters.type||source.typeKey===filters.type)&&((filters.lo===null&&filters.hi===null)||(dated&&Math.max(...dates)>=(filters.lo??-Infinity)&&Math.min(...dates)<=(filters.hi??Infinity)))){
   let edge=edges.get(source.pair);if(!edge){const [a,b]=source.pair.split(',');edge={key:source.pair,a,b,groups:new Set(),claims:[],directions:new Map(),types:new Set(),recordKeys:new Set()};edges.set(source.pair,edge);for(const id of [a,b]){if(!adjacency.has(id))adjacency.set(id,[]);adjacency.get(id).push(edge);}}
   edge.groups.add(source.group);edge.claims.push(source);edge.recordKeys.add(source.key);edge.types.add(source.typeKey);const direction=JSON.stringify([source.role,source.from,source.to]);if(!edge.directions.has(direction))edge.directions.set(direction,{role:source.role,from:source.from,to:source.to,groups:new Set()});edge.directions.get(direction).groups.add(source.group);
  }if(++processed%1000===0){onProgress(processed);await yieldWork();}
 }
 for(const list of adjacency.values())list.sort((a,b)=>b.groups.size-a.groups.size||numeric(a.key,b.key));
 return {edges,adjacency,filters,stats:base.stats,types:base.types,groups:base.groups};
}
export function compactFactionEdge(edge,groups,stats={}){return {key:edge.key,a:edge.a,b:edge.b,count:edge.groups.size,countIncomplete:Boolean(stats.collectionLimited||stats.membershipLimited||stats.incompleteSources||[...edge.groups].some(k=>groups.get(k)?.incomplete)),sourceCount:edge.recordKeys.size,claimCount:edge.claims.length,sharedGroups:[...edge.groups].filter(k=>groups.get(k)?.shared).length,directions:[...edge.directions.values()].map(({role,from,to,groups})=>({role,from,to,count:groups.size})).sort((a,b)=>a.role.localeCompare(b.role)||numeric(a.from,b.from)||numeric(a.to,b.to)),types:[...edge.types].sort()};}
export function factionNetworkPage(network,id,offset=0){const all=network.adjacency.get(String(id))||[],start=pageOffset(offset,all.length,factionLimits.page);return {edges:all.slice(start,start+factionLimits.page).map(e=>compactFactionEdge(e,network.groups,network.stats)),total:all.length,offset:start,next:Math.min(start+factionLimits.page,all.length),stats:network.stats,types:network.types,invalid:network.filters.invalid};}
export function factionEvidencePage(network,pair,offset=0){const edge=network.edges.get(pair);if(!edge)return {rows:[],total:0,offset:0,size:factionLimits.evidence};const rows=[...edge.claims].sort((a,b)=>(a.start??Infinity)-(b.start??Infinity)||a.key.localeCompare(b.key,'en',{numeric:true})||a.role.localeCompare(b.role)||numeric(a.from,b.from));const start=pageOffset(offset,rows.length,factionLimits.evidence);return {rows:rows.slice(start,start+factionLimits.evidence).map(row=>({...row,group:network.groups.get(row.group)})),total:rows.length,offset:start,size:factionLimits.evidence,edge:compactFactionEdge(edge,network.groups,network.stats)};}
export function addFactionPage(state,page,root){const nodes=new Map(state.nodes.map(n=>[n.id,n])),edges=new Map(state.edges.map(e=>[e.key,e]));let capped=false;
 for(const edge of page.edges){if(edges.has(edge.key))continue;const missing=[edge.a,edge.b].filter(id=>!nodes.has(id));if(nodes.size+missing.length>factionLimits.nodes||edges.size>=factionLimits.edges){capped=true;break;}for(const id of missing){const node=page.nodes.find(n=>n.id===id);if(node)nodes.set(id,node);}if(nodes.has(edge.a)&&nodes.has(edge.b))edges.set(edge.key,edge);}
 return {nodes:[...nodes.values()],edges:[...edges.values()],capped};
}
