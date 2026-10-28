import {explore} from '../data/explorer-client.js?v=0.21.1';
import {recordURL} from '../data/exploration.js?v=0.21.1';
import {relationshipWording} from '../data/relationships.js?v=0.21.1';
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const reasonNames={depth_limit:'maximum path length',node_limit:'record limit',edge_limit:'link limit',source_record_limit:'source-reading budget',neighbourhood_limit:'incomplete neighbourhood scan'};
export function connectionSummary(result){
 if(result.status==='cancelled')return 'Search cancelled. Your selections are unchanged.';
 if(result.status==='missing_endpoint')return 'A selected figure is no longer available in this archive. Choose both figures again.';
 if(result.status==='found')return result.steps.length===0?'You selected the same figure; no connecting links are needed.':`${result.shortest?'One shortest recorded connection':'A recorded connection'} found: ${result.steps.length} ${result.steps.length===1?'link':'links'}.`+(result.shortest?'':' Incomplete search data means a shorter connection may exist.');
 if(result.status==='limited')return 'No connection found before a search limit was reached. This does not establish that no recorded connection exists.';
 return 'No connection found in the available records with these relationship options. Missing export data may contain further links.';
}
export function connectionResult(result,worldId,query=''){
 const container=el('div',undefined,'connection-result'),nodes=new Map(result.nodes.map(node=>[node.key,node]));
 const link=node=>{const a=el('a',node.label);a.href=recordURL(worldId,node.kind,node.id,query);return a;};
 if(result.status==='found'){
  const start=nodes.get(result.nodes[0]?.key);if(start){const intro=el('p','Start: ');intro.append(link(start));container.append(intro);}
  const list=el('ol',undefined,'connection-steps');
  for(const step of result.steps){const item=el('li'),heading=el('h3'),from=nodes.get(step.from),to=nodes.get(step.to),source=nodes.get(step.edge.source),target=nodes.get(step.edge.target),sentence=el('p'),wording=relationshipWording(step.edge);
   heading.append(link(from),document.createTextNode(' → '),link(to));sentence.append(link(source),document.createTextNode(wording.between),link(target),document.createTextNode(wording.after));item.append(heading,sentence);
   if(step.reversed)item.append(el('p','This step follows the recorded link in reverse. The sentence above preserves its original direction.','muted'));
   const evidence=el('details'),summary=el('summary','Source evidence'),facts=el('ul');for(const entry of step.edge.evidence)facts.append(el('li',`${entry.origin}: ${entry.path}`+(entry.sources?.length?` (${entry.sources.join(', ')})`:'')+(entry.strength!==undefined?` · link_strength: ${entry.strength}`:'')+(entry.startYear!==undefined?` · start_year: ${entry.startYear}`:'')+(entry.endYear!==undefined?` · end_year: ${entry.endYear}`:'')));evidence.append(summary,facts);
   if(step.edge.moreEvidence)evidence.append(el('p','Further repeated evidence is available in the source record.','muted'));
   const params=new URLSearchParams(query.replace(/^\?/,''));params.set('source','1');const sourceLink=el('a','Open supporting source record');sourceLink.href=recordURL(worldId,step.edge.sourceKind,step.edge.sourceId,'?'+params);evidence.append(sourceLink);item.append(evidence);list.append(item);
  }
  container.append(list);
 }
 const reasons=result.reasons.map(reason=>reasonNames[reason]||reason);if(reasons.length)container.append(el('p','Search limits encountered: '+reasons.join(', ')+'.','notice'));
 if(result.missingRecords||result.stats.invalidLinks){const messages=[];if(result.missingRecords)messages.push(`${result.missingRecords} referenced ${result.missingRecords===1?'record is':'records are'} unavailable.`);if(result.stats.invalidLinks)messages.push(`${result.stats.invalidLinks} ${result.stats.invalidLinks===1?'link has an unusable target ID.':'links have unusable target IDs.'}`);container.append(el('p',messages.join(' ')+' These were not traversed.','muted'));}
 const details=el('details'),summary=el('summary','Search details');details.append(summary,el('p',`${result.stats.examined} ${result.stats.examined===1?'record':'records'} examined · ${result.stats.sourceRecords} source ${result.stats.sourceRecords===1?'record':'records'} read · maximum ${result.maxDepth} ${result.maxDepth===1?'link':'links'}. Organisation paths ${result.organisations?'allowed':'excluded'}.`,'muted'));container.append(details);
 return container;
}
export function connectionFinder(record,worldId,query,isCurrent=()=>true){
 const section=el('section',undefined,'connection-finder'),heading=el('h2','How Are These Two Connected?'),form=el('form'),pickers=el('div',undefined,'connection-pickers'),options=el('div',undefined,'connection-options'),organisations=el('input'),depth=el('select'),find=el('button','Find a connection','quiet'),cancel=el('button','Cancel search','quiet'),status=el('p','Choose a second figure, then find a connection.','notice'),output=el('div');
 section.append(heading,el('p','Find a shortest chain of explicit recorded links. Links can be followed in either direction; every step retains its source evidence. A chain through an organisation does not imply that its members met. Site links and shared events are excluded. Snapshot links do not establish dates or current status.','muted'),form,status,output);status.setAttribute('role','status');form.append(pickers,options,find,cancel);find.type='submit';cancel.type='button';cancel.hidden=true;organisations.type='checkbox';organisations.id='connection-organisations';
 const orgLabel=el('label');orgLabel.append(organisations,document.createTextNode(' Allow paths through organisations'));const depthLabel=el('label','Maximum links');depth.id='connection-depth';depthLabel.htmlFor=depth.id;for(const value of [2,4,6,8])depth.add(new Option(String(value),String(value)));depth.value='6';options.append(orgLabel,depthLabel,depth);
 let alive=true,busy=false,serial=0,controller;const current=()=>alive&&isCurrent(),queryString=()=>typeof query==='function'?query():query;
 function invalidate(){output.replaceChildren();status.textContent='Selections changed. Find a connection to update the result.';}
 function picker(label,id,initial){
  const group=el('fieldset'),legend=el('legend',label),input=el('input'),search=el('button',`Search ${label.toLowerCase()}`,'quiet'),select=el('select'),message=el('p',initial?'Selected: '+initial.label:'Search by name or #ID, then select a matching figure.','muted');let chosen=initial,request=0;
  input.type='search';input.autocomplete='off';input.placeholder='Name or #ID';input.id=id+'-query';select.id=id+'-results';search.type='button';const inputLabel=el('label',label+' name or ID'),selectLabel=el('label',label+' match');inputLabel.htmlFor=input.id;selectLabel.htmlFor=select.id;
  select.add(new Option(initial?`${initial.label} · #${initial.id}`:'Choose a figure',''));if(initial)select.options[0].value=initial.id;input.value=initial?.label||'';
  group.append(legend,inputLabel,input,search,selectLabel,select,message);pickers.append(group);
  input.oninput=()=>{request++;search.disabled=busy;chosen=null;select.replaceChildren(new Option('Choose a figure',''));message.textContent='Search again to choose this figure.';invalidate();};
  async function searchFigures(){const ticket=++request,term=input.value.trim();chosen=null;select.replaceChildren(new Option('Choose a figure',''));invalidate();if(!term){message.textContent='Enter a name or # followed by an ID.';return;}search.disabled=true;message.textContent='Searching figures…';
   try{const result=await explore(worldId,{type:'search',options:{kind:'historical_figures',q:term,limit:10}});if(!current()||ticket!==request)return;for(const row of result.rows)select.add(new Option(`${row.label} · #${row.id}`,row.id));message.textContent=result.total?result.total===1?'1 match found. Choose the figure.':`${result.total.toLocaleString()} matches found${result.total>10?'; showing the first 10':''}. Choose a figure, or narrow your search.`:'No matching figures. Try a shorter name or #ID.';select.onchange=()=>{chosen=result.rows.find(row=>row.id===select.value)||null;invalidate();};
   }catch(error){if(current()&&ticket===request)message.textContent=`Figure search unavailable: ${error.message}`;}finally{if(current()&&ticket===request)search.disabled=busy;}
  }
  search.onclick=()=>void searchFigures();input.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();void searchFigures();}};
  return {value:()=>chosen,disable(value){input.disabled=select.disabled=search.disabled=value;},cancel(){request++;}};
 }
 const first=picker('First figure','connection-first',{id:record.id,label:record.label}),second=picker('Second figure','connection-second');
 const setBusy=value=>{busy=value;first.disable(value);second.disable(value);organisations.disabled=depth.disabled=find.disabled=value;cancel.hidden=!value;};
 organisations.onchange=depth.onchange=invalidate;
 form.onsubmit=async event=>{event.preventDefault();if(busy||!current())return;const start=first.value(),end=second.value();if(!start||!end){status.textContent='Choose a matching figure in both lists before searching.';return;}
  const ticket=++serial;controller=new AbortController();setBusy(true);output.replaceChildren();status.textContent='Searching recorded connections…';
  try{const result=await explore(worldId,{type:'connection',startId:start.id,endId:end.id,organisations:organisations.checked,maxDepth:Number(depth.value)},(count,phase)=>{if(current()&&ticket===serial)status.textContent=phase==='connections'?`Searching connections: ${count.toLocaleString()} records examined…`:`Preparing search: ${count.toLocaleString()} records indexed…`;},controller.signal);if(!current()||ticket!==serial)return;status.textContent=connectionSummary(result);output.replaceChildren(connectionResult(result,worldId,queryString()));
  }catch(error){if(current()&&ticket===serial)status.textContent=error.name==='AbortError'?'Search cancelled. Your selections are unchanged.':`Connection search unavailable: ${error.message}`;}finally{if(current()&&ticket===serial){setBusy(false);find.focus();}}
 };
 cancel.onclick=()=>controller?.abort();
 return {element:section,dispose(){alive=false;serial++;controller?.abort();first.cancel();second.cancel();}};
}
