import {beastRoles} from './bestiary.js?v=0.28.1';
import {settlementReferences} from './settlements.js?v=0.28.1';
import {supernaturalReferences} from './supernatural.js?v=0.28.1';
import {collectReferences,recordKey} from './exploration.js?v=0.28.1';
import {cultureReferences} from './culture.js?v=0.28.1';
import {recordRelationships,relationshipWording} from './relationships.js?v=0.28.1';
import {narrateEvent} from './narrative.js?v=0.28.1';
import {collectionFacts} from './warfare.js?v=0.28.1';
import {referenceLabel,clippedLabel} from './language.js?v=0.28.1';
export const threadLimits={sources:60,references:500,candidates:36,page:6};
export function threadReferences(record){
 const refs=[...beastRoles(record),...collectReferences({merged:record.data,plus:record.supplement}),...cultureReferences(record),...supernaturalReferences(record),...settlementReferences(record)];
 if(record.kind==='historical_event_collections'){
  const fact=collectionFacts(record);
  refs.push(...fact.refs.map(r=>({...r,path:r.field})),...fact.events.map(id=>({kind:'historical_events',id,path:'event',role:'Recorded event'})),...fact.children.map(id=>({kind:record.kind,id,path:'eventcol',role:'Nested conflict'})),...fact.parents.map(id=>({kind:record.kind,id,path:'parent_eventcol / war_eventcol',role:'Wider conflict'})));
 }
 return refs;
}
// Sample in index order, interleaving source families so routine events cannot occupy every slot.
export function threadSources(keys,lookup){
 const groups=new Map();let eligible=0;
 for(const key of keys){const row=lookup.get(key);if(!row||!['historical_figures','historical_events','historical_event_collections','artifacts','written_contents','sites','entities'].includes(row.kind))continue;eligible++;if(!groups.has(row.kind))groups.set(row.kind,[]);const group=groups.get(row.kind);if(group.length<threadLimits.sources)group.push(key);}
 const selected=[];for(let i=0;selected.length<threadLimits.sources;i++){let added=false;for(const group of groups.values())if(group[i]&&selected.length<threadLimits.sources){selected.push(group[i]);added=true;}if(!added)break;}
 return {keys:selected,truncated:eligible>selected.length};
}
export function followThreads(root,sources,lookup,{truncated=false}={}){
 const rootKey=recordKey(root.kind,root.id),cards=new Map();let clipped=truncated,missing=0;
 const node=ref=>{const row=lookup.get(recordKey(ref.kind,ref.id));return row?{kind:row.kind,id:row.id,label:clippedLabel(row.label)}:null;};
 const rootNode=node(root)||{kind:root.kind,id:root.id,label:clippedLabel(root.label)};
 const add=(ref,reason,source,path,priority=4)=>{const target=node(ref);if(!target){missing++;return;}const key=recordKey(target.kind,target.id);if(key===rootKey)return;const evidence={...node(source),kind:source.kind,id:String(source.id),path:clippedLabel(path||'Recorded fields')};const existing=cards.get(key);if(existing){const same=existing.evidence.some(e=>e.kind===evidence.kind&&e.id===evidence.id&&e.path===evidence.path);if(priority<existing.priority){existing.priority=priority;existing.reason=reason;existing.evidence=[evidence,...existing.evidence.filter(e=>!(e.kind===evidence.kind&&e.id===evidence.id&&e.path===evidence.path))].slice(0,3);}else if(existing.evidence.length<3&&!same)existing.evidence.push(evidence);return;}if(cards.size>=threadLimits.candidates){clipped=true;return;}cards.set(key,{...target,reason,evidence:[evidence],priority});};
 const labelTokens=tokens=>tokens.map(t=>typeof t==='string'?clippedLabel(t):node(t)?.label||t.unknown||'an unavailable record').join('');
 const consume=source=>{
  const isRoot=recordKey(source.kind,source.id)===rootKey,refs=threadReferences(source);clipped ||= refs.length>threadLimits.references;
  const bounded=refs.slice(0,threadLimits.references),touches=bounded.filter(r=>recordKey(r.kind,r.id)===rootKey);
  if(!isRoot&&!touches.length)return;
  if(source.kind==='historical_events'){
   const reason=labelTokens(narrateEvent(source.data).tokens);
   if(!isRoot)add(source,reason,source,'Recorded event',2);
   for(const ref of bounded)add(ref,reason,source,ref.path,2);
   return;
  }
  if(source.kind==='historical_figures'){
   const parsed=recordRelationships(source);clipped ||= parsed.truncated;
   for(const edge of parsed.edges){if(!isRoot&&edge.target!==rootKey)continue;const target={kind:edge.targetKind,id:edge.targetId},words=relationshipWording(edge),reason=`${node(source)?.label||'This figure'}${words.between}${node(target)?.label||'an unavailable record'}${words.after}`;add(isRoot?target:source,reason,source,edge.evidence[0]?.path,0);}
  }
  for(const ref of bounded){
   if(!isRoot&&recordKey(ref.kind,ref.id)!==rootKey)continue;
   const role=referenceLabel(ref.role),reason=isRoot?`This record names ${node(ref)?.label||'an unavailable record'} as “${role}”.`:`${node(source)?.label||'This record'} names ${rootNode.label} as “${role}”.`;
   add(isRoot?ref:source,reason,source,ref.path,1);
  }
 };
 consume(root);for(const source of sources)if(recordKey(source.kind,source.id)!==rootKey)consume(source);
 // Diverse first page; preserve deterministic evidence priority within each target family.
 const groups=new Map();for(const card of [...cards.values()].sort((a,b)=>a.priority-b.priority||a.label.localeCompare(b.label,'en')||recordKey(a.kind,a.id).localeCompare(recordKey(b.kind,b.id),'en',{numeric:true}))){if(!groups.has(card.kind))groups.set(card.kind,[]);groups.get(card.kind).push(card);}
 const rows=[];for(let i=0;rows.length<cards.size;i++)for(const group of groups.values())if(group[i])rows.push(group[i]);
 return {rows,truncated:clipped,missing,sourcesRead:sources.length+1};
}
