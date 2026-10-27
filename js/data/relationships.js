import {recordKey} from './exploration.js?v=0.13.1';
import {readableValue} from './language.js?v=0.13.1';
export const relationshipCategories={family:'Family',social:'Friends and Other Social Ties',rivalry:'Rivalries',affiliation:'Organisations and Sites',worship:'Worship',other:'Other Recorded Links'};
const family=new Set(['mother','father','parent','child','son','daughter','spouse','sibling','brother','sister','grandparent','grandchild','aunt','uncle','niece','nephew','cousin']);
const social=new Set(['friend','companion','lover','master','apprentice','teacher','student']);
const rivalry=new Set(['enemy','rival','rivalry','grudge','grudge bearer','grudge holder']);
export function relationshipCategory(type,kind){
 if(kind==='entities'||kind==='sites')return 'affiliation';
 if(family.has(type))return 'family';if(social.has(type))return 'social';if(rivalry.has(type))return 'rivalry';
 if(['deity','worship','worshipper','worshipped'].includes(type))return 'worship';return 'other';
}
export function relationshipWording(edge){
 if(edge.targetKind==='entities'){
  const roles={member:'a member of',enemy:'an enemy of',prisoner:'a prisoner of','former member':'a former member of'};
  if(Object.hasOwn(roles,edge.type))return {between:` is listed as ${roles[edge.type]} `,after:'.'};
  return {between:` has a recorded “${edge.label}” link to `,after:'.'};
 }
 if(edge.targetKind==='sites')return edge.type==='home'?{between:' lists ',after:' as a home.'}:{between:` has a recorded “${edge.label}” association with `,after:'.'};
 return {between:' lists ',after:` as “${edge.label}”.`};
}
const fields=[['hf_link','historical_figures','hfid'],['entity_link','entities','entity_id'],['site_link','sites','site_id']];
export const relationshipLimits={nodes:40,edges:100,page:8,sourceRecords:500,linksPerRecord:5000,neighbours:4000};
// A label describes the TARGET as listed by the SOURCE. Never invent reciprocal roles.
export function recordRelationships(record){
 const edges=new Map();let invalid=0,examined=0,truncated=false;
 if(record.kind!=='historical_figures')return {edges:[],invalid,truncated};
 const source=recordKey(record.kind,record.id);
 for(const [origin,data] of [['Merged record',record.data],['Legends Plus',record.supplement]]){
  if(!data)continue;
  for(const [field,kind,idField] of fields){
   const raw=data[field],values=Array.isArray(raw)?raw:raw?[raw]:[];
   for(let i=0;i<values.length;i++){
    if(++examined>relationshipLimits.linksPerRecord){truncated=true;break;}
    const value=values[i];if(!value||typeof value!=='object')continue;
    const id=value[idField];if(typeof id!=='string'||!/^\d+$/.test(id)){if(origin==='Merged record')invalid++;continue;}
    const rawType=typeof value.link_type==='string'?value.link_type:'unspecified relationship',type=rawType.replaceAll('_',' ').toLowerCase().trim(),target=recordKey(kind,id);
    const key=JSON.stringify([source,target,field,type]);
    const evidence={origin,path:Array.isArray(raw)?`${field}.${i}`:field,sources:record.sources||[],...(typeof value.link_strength==='string'?{strength:value.link_strength}:{}),...(typeof value.start_year==='string'?{startYear:value.start_year}:{}),...(typeof value.end_year==='string'?{endYear:value.end_year}:{})};
    const edge=edges.get(key)||{key,source,target,sourceKind:record.kind,sourceId:String(record.id),targetKind:kind,targetId:id,type,rawType,label:readableValue(rawType),category:relationshipCategory(type,kind),evidence:[],moreEvidence:false};
    if(edge.evidence.length<4)edge.evidence.push(evidence);else edge.moreEvidence=true;edges.set(key,edge);
   }
  }
 }
 return {edges:[...edges.values()],invalid,truncated};
}
export function relationshipNeighbourhood(records,key){
 const edges=new Map();let invalid=0,truncated=false;
 for(const record of records){const parsed=recordRelationships(record);truncated ||= parsed.truncated;if(recordKey(record.kind,record.id)===key)invalid+=parsed.invalid;
  for(const edge of parsed.edges)if(edge.source===key||edge.target===key){if(edges.size>=relationshipLimits.neighbours&&!edges.has(edge.key)){truncated=true;continue;}edges.set(edge.key,edge);}
 }
 return {edges:[...edges.values()].sort((a,b)=>a.category.localeCompare(b.category)||a.label.localeCompare(b.label)||a.key.localeCompare(b.key,'en',{numeric:true})),invalid,truncated};
}
export function graphPage(neighbourhood,{category='all',offset=0}={}){
 const edges=neighbourhood.edges.filter(edge=>category==='all'||edge.category===category),start=Math.max(0,Math.floor(Number(offset)||0));
 return {...neighbourhood,total:edges.length,unfiltered:neighbourhood.edges.length,edges:edges.slice(start,start+relationshipLimits.page),next:Math.min(start+relationshipLimits.page,edges.length)};
}
export function addGraphPage(state,page){
 const nodes=new Map(state.nodes.map(node=>[node.key,node])),edges=new Map(state.edges.map(edge=>[edge.key,edge]));let capped=false;
 for(const edge of page.edges){if(edges.has(edge.key))continue;
  const required=[edge.source,edge.target].filter((key,i,keys)=>!nodes.has(key)&&keys.indexOf(key)===i);
  if(edges.size>=relationshipLimits.edges||nodes.size+required.length>relationshipLimits.nodes){capped=true;break;}
  for(const key of required){const node=page.nodes.find(node=>node.key===key);if(node)nodes.set(key,node);}
  if(nodes.has(edge.source)&&nodes.has(edge.target))edges.set(edge.key,edge);
 }
 return {nodes:[...nodes.values()],edges:[...edges.values()],capped};
}
// A bounded deterministic network layout, not a genealogical or chronological tree.
export function layoutRelationships(nodes,edges,root){
 const points=nodes.map((node,i)=>({...node,x:node.key===root?0:Math.cos(i*2.39996)*Math.sqrt(i+1)*150,y:node.key===root?0:Math.sin(i*2.39996)*Math.sqrt(i+1)*115})),byKey=new Map(points.map(node=>[node.key,node]));
 for(let step=0;step<100;step++){
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
   const a=points[i],b=points[j],dx=b.x-a.x||1,dy=b.y-a.y||1;
   if(Math.abs(dx)<230&&Math.abs(dy)<85){const horizontal=(230-Math.abs(dx))/230<(85-Math.abs(dy))/85,amount=horizontal?(230-Math.abs(dx))*.52:(85-Math.abs(dy))*.52;
    if(a.key!==root)a[horizontal?'x':'y']-=Math.sign(horizontal?dx:dy)*amount;if(b.key!==root)b[horizontal?'x':'y']+=Math.sign(horizontal?dx:dy)*amount;
   }
  }
  if(step>=80)continue;
  for(const edge of edges){const a=byKey.get(edge.source),b=byKey.get(edge.target);if(!a||!b||a===b)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,f=(d-290)*.007;
   if(a.key!==root){a.x+=dx/d*f;a.y+=dy/d*f;}if(b.key!==root){b.x-=dx/d*f;b.y-=dy/d*f;}
  }
 }
 return points;
}

// Canonical orientation keeps reciprocal edge labels on opposite sides of the pair.
export function relationshipCurve(a,b,index,source,target){
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,sign=source<target?1:-1,offset=(index%2===0?1:-1)*(64+Math.floor(index/2)*48),nx=-dy/d*sign,ny=dx/d*sign,mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
 return {x:mx+nx*offset,y:my+ny*offset,labelX:mx+nx*offset/2,labelY:my+ny*offset/2};
}
