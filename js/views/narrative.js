import {narrateEvent,lifeSummary,figureRelationships,words} from '../data/narrative.js?v=0.34.0';
import {recordURL,recordKey} from '../data/exploration.js?v=0.34.0';
import {explore} from '../data/explorer-client.js?v=0.34.0';
export const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
export async function narratives(records,worldId,query){
 const summaries=records.map(record=>narrateEvent(record.data));
 const refs=summaries.flatMap(summary=>summary.tokens.filter(token=>typeof token==='object'));
 const resolved=await explore(worldId,{type:'resolve',refs}),names=new Map(resolved.map(ref=>[recordKey(ref.kind,ref.id),ref.label]));
 return summaries.map(summary=>{
  const block=el('div',undefined,'event-story'),p=el('p');
  for(const token of summary.tokens){if(typeof token==='string'){p.append(document.createTextNode(token));continue;}
   const label=names.get(recordKey(token.kind,token.id));
   if(label){const a=el('a',label);a.href=recordURL(worldId,token.kind,token.id,query);p.append(a);}else p.append(document.createTextNode(`${token.unknown} (#${token.id}, record unavailable)`));
  }
  block.append(p,el('span',summary.fallback?'Structured fallback · exported facts':'Summary rendered from exported facts','story-note'));return block;
 });
}
export function biography(data,resolved,worldId,query){
 const section=el('section',undefined,'biography'),facts=el('dl',undefined,'record-facts');section.append(el('h2','A recorded life'));
 for(const [label,value] of lifeSummary(data))facts.append(el('dt',label),el('dd',value));section.append(facts);
 const relationships=figureRelationships(data),names=new Map(resolved.map(ref=>[recordKey(ref.kind,ref.id),ref.label]));
 if(relationships.length){const details=el('details',undefined,'guide-card');details.open=relationships.length<=10;details.append(el('summary',`Recorded relationships (${relationships.length})`),el('p','Labels are preserved from this figure’s source record. They do not establish dates or current membership.','muted'));const list=el('ul',undefined,'reference-list');
  for(const relation of relationships){const item=el('li');item.append(el('strong',relation.label+' → '));const label=names.get(recordKey(relation.kind,relation.id));if(label){const a=el('a',label);a.href=recordURL(worldId,relation.kind,relation.id,query);item.append(a);}else item.append(document.createTextNode(/^\d+$/.test(relation.id||'')?`Unresolved record #${relation.id}`:'Unidentified record'));list.append(item);}details.append(list);section.append(details);
 }
 for(const field of ['sphere','goal','hf_skill'])if(data[field]){const details=el('details',undefined,'guide-card');details.append(el('summary',({sphere:'Spheres',goal:'Goals',hf_skill:'Skills'}[field]||words(field))+' (source values)'),el('pre',JSON.stringify(data[field],null,2)));section.append(details);}
 return section;
}
