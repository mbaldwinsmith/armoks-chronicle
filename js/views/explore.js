import {conflictRecord} from '../data/conflicts.js?v=0.7.1';
import {sitePosition} from '../data/terrain.js?v=0.7.1';
import {narratives,biography} from './narrative.js?v=0.7.1';
import {openDatabase,getWorld,getRecord} from '../data/database.js?v=0.7.1';
import {explore} from '../data/explorer-client.js?v=0.7.1';
import {kindNames,recordURL,collectReferences,eventDate} from '../data/exploration.js?v=0.7.1';
let generation=0,timer;
export function cancelExploration(){generation++;clearTimeout(timer);}
const element=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
function rowLink(row,world,query){const li=element('li'),a=element('a',row.label);a.href=recordURL(world,row.kind,row.id,query);li.append(a,element('span',`${kindNames[row.kind]||row.kind.replaceAll('_',' ')} · #${row.id}${row.year!==null&&row.year!==undefined?` · Year ${row.year}`:''}`,'muted'));return li;}
export async function renderDirectory(id,params) {
 const ticket=++generation;let request=0;
 const list=document.querySelector('#records'),status=document.querySelector('#record-status'),input=document.querySelector('#record-search'),select=document.querySelector('#record-kind'),sort=document.querySelector('#record-sort');
 let offset=Math.max(0,Number(params.get('offset'))||0);offset=Math.floor(offset/50)*50;
 input.value=params.get('q')||'';sort.value=params.get('sort')==='year'?'year':'name';
 const world=await withDB(db=>getWorld(db,id));if(ticket!==generation||world?.status!=='ready')return;
 select.replaceChildren(new Option('All record categories',''));
 for(const [kind,count] of Object.entries(world.counts).sort(([a],[b])=>a.localeCompare(b)))select.add(new Option(`${kindNames[kind]||kind.replaceAll('_',' ')} (${count.toLocaleString()})`,kind));
 select.value=params.get('kind')||'';if(select.selectedIndex<0)select.value='';
 const previous=document.querySelector('#previous-records'),next=document.querySelector('#next-records');
 async function search(){
  const token=++request;previous.disabled=true;next.disabled=true;list.replaceChildren();status.textContent='Preparing search…';
  const query=new URLSearchParams();if(input.value)query.set('q',input.value);if(select.value)query.set('kind',select.value);if(sort.value!=='name')query.set('sort',sort.value);if(offset)query.set('offset',offset);
  const suffix=query.size?'?'+query:'';
  history.replaceState(null,'',`#/world/${encodeURIComponent(id)}${suffix}`);
  try{
   const result=await explore(id,{type:'search',options:{q:input.value,kind:select.value,sort:sort.value,offset}},count=>{if(ticket===generation&&token===request)status.textContent=`Preparing search: ${count.toLocaleString()} records indexed…`;});
   if(ticket!==generation||token!==request)return;
   for(const row of result.rows)list.append(rowLink(row,id,suffix));
   const eventRows=result.rows.filter(row=>row.kind==='historical_events');
   if(eventRows.length){const records=await withDB(db=>Promise.all(eventRows.map(row=>getRecord(db,id,row.kind,row.id))));const stories=await narratives(records.filter(Boolean),id,suffix);if(ticket!==generation||token!==request)return;let i=0;for(const child of list.children){const row=result.rows[Array.from(list.children).indexOf(child)];if(row.kind==='historical_events'&&records[eventRows.findIndex(r=>r.id===row.id)])child.append(stories[i++]);}}

   status.textContent=result.total?`${(offset+1).toLocaleString()}–${Math.min(offset+50,result.total).toLocaleString()} of ${result.total.toLocaleString()} matching records`:'No matching records. Try a shorter name, # followed by an ID, or clear the category filter.';
   previous.disabled=offset===0;next.disabled=offset+50>=result.total;
  }catch(error){if(ticket===generation&&token===request)status.textContent=`Search unavailable: ${error.message}`;}
 }
 input.oninput=()=>{clearTimeout(timer);request++;timer=setTimeout(()=>{offset=0;void search();},200);};
 select.onchange=sort.onchange=()=>{clearTimeout(timer);offset=0;void search();};
 document.querySelector('#clear-search').onclick=()=>{clearTimeout(timer);input.value='';select.value='';sort.value='name';offset=0;void search();input.focus();};
 previous.onclick=()=>{offset=Math.max(0,offset-50);void search();};next.onclick=()=>{offset+=50;void search();};
 await search();
}
async function withDB(fn){const db=await openDatabase();try{return await fn(db);}finally{db.close();}}
export async function renderRecord(worldId,kind,id,params) {
 const ticket=++generation,title=document.querySelector('#detail-title'),body=document.querySelector('#detail-body'),status=document.querySelector('#detail-status');
 title.textContent='Opening record…';body.replaceChildren();status.textContent='';
 const suffix=params.size?'?'+params:'';const back=document.querySelector('#back-results');back.href=`#/world/${encodeURIComponent(worldId)}${suffix}`;
 try {
  const {world,record}=await withDB(async db=>({world:await getWorld(db,worldId),record:await getRecord(db,worldId,kind,id)}));
  if(ticket!==generation)return;
  if(world?.status!=='ready'||!record){title.textContent='Record unavailable';status.textContent='This record is missing, or this world is not saved in this browser. Importing a world creates a new local address.';return;}
  title.textContent=record.label;document.title=`${record.label} · Armok’s Chronicle`;
  body.append(element('p',`${world.name} · ${kindNames[kind]||kind.replaceAll('_',' ')} · #${id}`,'intro'));
  const data=record.data;
  if(kind==='entities'){for(const [basis,label] of [['owner','Show settlements owned by this organisation'],['civilisation','Show settlements with this recorded civilisation']]){const link=element('a',label,'button quiet');link.href=`#/world/${encodeURIComponent(worldId)}/atlas?basis=${basis}&faction=${encodeURIComponent(id)}`;body.append(link);}}

  if(kind==='historical_events'){
   const siteId=[data.site_id,data.site].find(value=>typeof value==='string'&&/^\d+$/.test(value));const site=siteId?await withDB(db=>getRecord(db,worldId,'sites',siteId)):null;if(ticket!==generation)return;
   const pos=site&&sitePosition(site.data,1025,1025);const event=conflictRecord(record,pos?[{id:site.id,label:site.label,...pos}]:[],1025,1025);
   if(event){if(event.x!==undefined){const query=new URLSearchParams({x:event.x,y:event.y,conflicts:'1',conflictType:event.type});if(event.year!==null){query.set('conflictFrom',event.year);query.set('conflictTo',event.year);}const link=element('a','Show this conflict in the atlas','button quiet');link.href=`#/world/${encodeURIComponent(worldId)}/atlas?${query}`;body.append(link);}else body.append(element('p','This conflict has no usable recorded location; it remains available in the atlas event list.','muted'));}
  }
  if(kind==='sites'&&/^\d+,\d+$/.test(data.coords||'')){const [x,y]=data.coords.split(',');const mapLink=element('a','Show this site in the atlas','button quiet');mapLink.href=`#/world/${encodeURIComponent(worldId)}/atlas?x=${x}&y=${y}`;body.append(mapLink);}
  const fields=element('dl',undefined,'record-facts');
  for(const [key,value] of Object.entries(data))if(typeof value==='string'&&!['id','name'].includes(key)){
   fields.append(element('dt',key.replaceAll('_',' ')),element('dd',value==='-1'?'Unknown / not recorded (−1)':value));
  }
  const fieldDetails=element('details',undefined,'guide-card');fieldDetails.append(element('summary','Recorded fields'),fields);
  if(kind==='historical_figures'||kind==='historical_events')body.append(fieldDetails);else body.append(fields);
  if(kind==='historical_events'){const [story]=await narratives([record],worldId,suffix);if(ticket!==generation)return;const date=eventDate(data);story.prepend(element('p',date.year===null?'Year not recorded':`Year ${date.year}`,'small-label'));body.insertBefore(story,fieldDetails);}
  const refs=collectReferences({merged:data,plus:record.supplement});
  const section=element('details',undefined,'guide-card'),heading=element('summary',`Linked references (${refs.length})`),links=element('ul',undefined,'reference-list');section.open=refs.length<=10;section.append(heading,element('p','Field paths retain the source roles. A reference alone does not establish friendship, ownership, or current membership.','muted'),links);body.append(section);
  const raw=element('details',undefined,'guide-card'),pre=element('pre',JSON.stringify({fields:data,sources:record.sources,supplementaryFields:record.supplement},null,2));raw.append(element('summary','Source fields and provenance'),pre);body.append(raw);
  const resolved=await explore(worldId,{type:'resolve',refs});if(ticket!==generation)return;
  for(const ref of resolved){const li=element('li');li.append(element('span',ref.path.replaceAll('_',' ')+' → ','muted'));if(ref.label){const a=element('a',`${ref.label} · #${ref.id}`);a.href=recordURL(worldId,ref.kind,ref.id,suffix);li.append(a);}else li.append(element('span',`Unresolved ${kindNames[ref.kind]||ref.kind} #${ref.id}`));links.append(li);}
  if(!resolved.length)links.append(element('li','No supported explicit references in this record. Other fields remain available in the source inspector.'));
  if(kind==='historical_figures')body.insertBefore(biography(data,resolved,worldId,suffix),fieldDetails);
  if(kind==='historical_events')return;
  const timeline=element('section'),events=element('ul',undefined,'record-results'),note=element('p','Loading related events…'),controls=element('div',undefined,'record-pagination'),prev=element('button','Previous events','quiet'),next=element('button','Next events','quiet');prev.type=next.type='button';controls.append(prev,next);note.setAttribute('role','status');timeline.append(element('h2','Recorded events'),element('p','Events that explicitly reference this record, earliest first. Missing dates are placed last; equal or missing timestamps do not establish an exact sequence.','muted'),events,note,controls);body.insertBefore(timeline,raw);
  const filters=element('form',undefined,'timeline-filters');
  const type=element('select'),from=element('input'),to=element('input'),preset=element('select'),apply=element('button','Apply filters','quiet'),reset=element('button','Show all events','quiet');
  type.id='event-type';from.id='event-from';to.id='event-to';preset.id='event-preset';from.type=to.type='number';from.step=to.step='1';apply.type='submit';reset.type='button';
  for(const [node,label] of [[type,'Event type'],[from,'From year'],[to,'To year'],[preset,'Reading preset']]){const group=element('div'),labelEl=element('label',label);labelEl.htmlFor=node.id;group.append(labelEl,node);filters.append(group);}
  preset.add(new Option('All events','all'));preset.add(new Option('Major events','major'));preset.value=params.get('eventPreset')==='major'?'major':'all';from.value=params.get('eventFrom')||'';to.value=params.get('eventTo')||'';
  filters.append(apply,reset);timeline.insertBefore(filters,events);timeline.insertBefore(element('p','Major events hides job/state changes and organisation/site affiliation changes. Other types, including unknown types, remain visible. Year bounds exclude undated events.','muted'),events);
  let offset=0,request=0,typesLoaded=false;
  async function load(){const token=++request;prev.disabled=next.disabled=true;
   if(from.value!==''&&to.value!==''&&Number(from.value)>Number(to.value)){events.replaceChildren();note.textContent='From year must be no later than To year.';return;}
   const selection={type:typesLoaded?type.value:params.get('eventType')||'',from:from.value,to:to.value,preset:preset.value};
   const current=new URLSearchParams(params);for(const [key,value] of Object.entries({eventType:selection.type,eventFrom:selection.from,eventTo:selection.to,eventPreset:selection.preset==='all'?'':selection.preset})){if(value)current.set(key,value);else current.delete(key);}
   const query=current.size?'?'+current:'';history.replaceState(null,'',recordURL(worldId,kind,id,query));
   note.textContent='Loading events…';
   try{const result=await explore(worldId,{type:'related',kind,recordId:id,offset,filters:selection});if(ticket!==generation||token!==request)return;
    if(!typesLoaded){type.add(new Option('All types',''));for(const name of result.types)type.add(new Option(name,name));type.value=selection.type;if(type.selectedIndex<0){type.add(new Option(selection.type,selection.type));type.value=selection.type;}typesLoaded=true;}
    const records=await withDB(db=>Promise.all(result.rows.map(row=>getRecord(db,worldId,row.kind,row.id))));
    const stories=await narratives(records.filter(Boolean),worldId,query);if(ticket!==generation||token!==request)return;
    let storyIndex=0;events.replaceChildren(...result.rows.map((row,i)=>{const li=rowLink(row,worldId,query);if(records[i])li.append(stories[storyIndex++]);return li;}));
    note.textContent=(result.total?`Events ${offset+1}–${Math.min(offset+50,result.total)} of ${result.total.toLocaleString()}`:'No matching events.')+` · ${result.unfiltered-result.total} hidden by filters (${result.unfiltered} recorded references).`;
    prev.disabled=offset===0;next.disabled=offset+50>=result.total;
   }catch(error){if(ticket===generation&&token===request)note.textContent=error.message;}
  }
  filters.onsubmit=event=>{event.preventDefault();offset=0;void load();};reset.onclick=()=>{type.value='';from.value=to.value='';preset.value='all';offset=0;void load();};
  prev.onclick=()=>{offset=Math.max(0,offset-50);void load();};next.onclick=()=>{offset+=50;void load();};await load();
 }catch(error){if(ticket===generation)status.textContent=`Could not open record: ${error.message}`;}
}
