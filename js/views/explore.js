import {timelineParams,timelineKeys} from '../data/timeline.js?v=0.12.1';
import {timelineFilters,renderTimeline,timelineCount} from './timeline.js?v=0.12.1';
import {titleCase,eventLabel,readableValue,referenceLabel} from '../data/language.js?v=0.12.1';
import {researchEditor} from './research.js?v=0.12.1';
import {culturePanel,associations} from './culture.js?v=0.12.1';
import {cultureReferences,culturalKinds,cultureLabel} from '../data/culture.js?v=0.12.1';
import {conflictRecord} from '../data/conflicts.js?v=0.12.1';
import {sitePosition} from '../data/terrain.js?v=0.12.1';
import {narratives,biography} from './narrative.js?v=0.12.1';
import {openDatabase,getWorld,getRecord} from '../data/database.js?v=0.12.1';
import {explore} from '../data/explorer-client.js?v=0.12.1';
import {kindNames,recordURL,collectReferences,eventDate} from '../data/exploration.js?v=0.12.1';
let generation=0,timer;
export function cancelExploration(){generation++;clearTimeout(timer);}
const element=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
function rowLink(row,world,query){const li=element('li'),a=element('a',row.label);a.href=recordURL(world,row.kind,row.id,query);li.append(a,element('span',`${kindNames[row.kind]||titleCase(row.kind.replaceAll('_',' '))} · #${row.id}${row.year!==null&&row.year!==undefined?` · Year ${row.year}`:''}`,'muted'));return li;}
export async function renderDirectory(id,params) {
 const ticket=++generation;let request=0;
 const list=document.querySelector('#records'),status=document.querySelector('#record-status'),input=document.querySelector('#record-search'),select=document.querySelector('#record-kind'),sort=document.querySelector('#record-sort');
 let offset=Math.max(0,Number(params.get('offset'))||0);offset=Math.floor(offset/50)*50;
 input.value=params.get('q')||'';sort.value=params.get('sort')==='year'||(!params.has('sort')&&params.get('kind')==='historical_events')?'year':'name';
 const world=await withDB(db=>getWorld(db,id));if(ticket!==generation||world?.status!=='ready')return;
 select.replaceChildren(new Option('All record categories',''));
 for(const [kind,count] of Object.entries(world.counts).sort(([a],[b])=>a.localeCompare(b)))select.add(new Option(`${kindNames[kind]||titleCase(kind.replaceAll('_',' '))} (${count.toLocaleString()})`,kind));
 select.value=params.get('kind')||'';if(select.selectedIndex<0)select.value='';
 const previous=document.querySelector('#previous-records'),next=document.querySelector('#next-records');
 document.querySelector('#directory-timeline-filters')?.remove();
 const reader=timelineFilters(params,()=>{offset=0;void search();},'directory-event');reader.form.id='directory-timeline-filters';list.before(reader.form,status);
 reader.form.hidden=select.value!=='historical_events';
 async function search(){
  const token=++request;previous.disabled=true;next.disabled=true;list.replaceChildren();status.textContent='Preparing search…';
  const query=timelineParams(new URLSearchParams(),reader.selection());query.delete('eventOffset');if(input.value)query.set('q',input.value);if(select.value)query.set('kind',select.value);if(sort.value!=='name'||select.value==='historical_events')query.set('sort',sort.value);if(offset)query.set('offset',offset);
  const suffix=query.size?'?'+query:'';reader.form.hidden=select.value!=='historical_events';
  history.replaceState(null,'',`#/world/${encodeURIComponent(id)}${suffix}`);
  try{
   const result=await explore(id,{type:'search',options:{q:input.value,kind:select.value,sort:sort.value,offset},filters:select.value==='historical_events'?reader.selection():null},count=>{if(ticket===generation&&token===request)status.textContent=`Preparing search: ${count.toLocaleString()} records indexed…`;});
   if(ticket!==generation||token!==request)return;
   const eventRows=result.rows.filter(row=>row.kind==='historical_events'),storiesById=new Map();
   if(eventRows.length){const records=await withDB(db=>Promise.all(eventRows.map(row=>getRecord(db,id,row.kind,row.id))));const present=records.filter(Boolean),stories=await narratives(present,id,suffix);if(ticket!==generation||token!==request)return;present.forEach((record,i)=>storiesById.set(record.id,stories[i]));}
   const makeRow=row=>{const li=rowLink(row,id,suffix);if(storiesById.has(row.id)&&row.kind==='historical_events')li.append(storiesById.get(row.id));return li;};
   if(select.value==='historical_events'&&sort.value==='year')renderTimeline(list,result.rows,makeRow);else list.replaceChildren(...result.rows.map(makeRow));
   if(select.value==='historical_events'){reader.setTypes(result.types);status.textContent=timelineCount(result.total,result.unfiltered,offset);}
   else status.textContent=result.total?`${(offset+1).toLocaleString()}–${Math.min(offset+50,result.total).toLocaleString()} of ${result.total.toLocaleString()} matching records`:'No matching records. Try a shorter name, # followed by an ID, or clear the category filter.';
   previous.disabled=offset===0;next.disabled=offset+50>=result.total;
  }catch(error){if(ticket===generation&&token===request)status.textContent=`Search unavailable: ${error.message}`;}
 }
 input.oninput=()=>{clearTimeout(timer);request++;timer=setTimeout(()=>{offset=0;void search();},200);};
 select.onchange=()=>{clearTimeout(timer);offset=0;if(select.value==='historical_events')sort.value='year';void search();};sort.onchange=()=>{clearTimeout(timer);offset=0;void search();};
 document.querySelector('#clear-search').onclick=()=>{clearTimeout(timer);reader.reset(false);input.value='';select.value='';sort.value='name';offset=0;void search();input.focus();};
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
  title.textContent=cultureLabel(record);document.title=`${cultureLabel(record)} · Armok’s Chronicle`;
  body.append(element('p',`${titleCase(world.name)} · ${kindNames[kind]||titleCase(kind.replaceAll('_',' '))} · #${id}`,'intro'));
  const editor=await researchEditor(world,{...record,label:cultureLabel(record)});if(ticket!==generation)return;body.append(editor);
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
   fields.append(element('dt',key.replaceAll('_',' ')),element('dd',value==='-1'?'Unknown / not recorded (−1)':key==='type'&&kind==='historical_events'?eventLabel(value):['type','race','caste','associated_type'].includes(key)?readableValue(value):value));
  }
  const fieldDetails=element('details',undefined,'guide-card');fieldDetails.append(element('summary','Recorded fields'),fields);
  if(kind==='historical_figures'||kind==='historical_events'||culturalKinds.has(kind))body.append(fieldDetails);else body.append(fields);
  if(kind==='historical_events'){const [story]=await narratives([record],worldId,suffix);if(ticket!==generation)return;const date=eventDate(data);story.prepend(element('p',date.year===null?'Year not recorded':`Year ${date.year}`,'small-label'));body.insertBefore(story,fieldDetails);}
  const extraRefs=cultureReferences(record);const refs=[...collectReferences({merged:data,plus:record.supplement}),...extraRefs];
  const section=element('details',undefined,'guide-card'),heading=element('summary',`Linked references (${refs.length})`),links=element('ul',undefined,'reference-list');section.open=refs.length<=10;section.append(heading,element('p','Roles follow the export. The source inspector retains the original fields and IDs.','muted'),links);body.append(section);
  const raw=element('details',undefined,'guide-card'),pre=element('pre',JSON.stringify({fields:data,sources:record.sources,supplementaryFields:record.supplement},null,2));raw.append(element('summary','Source fields and provenance'),pre);raw.open=params.get('source')==='1';body.append(raw);
  const resolved=await explore(worldId,{type:'resolve',refs});if(ticket!==generation)return;
  const shown=new Set();for(const ref of resolved){const label=referenceLabel(ref.role,kind==='historical_events'&&/died$/.test(String(data.type).replaceAll('_',' '))),key=JSON.stringify([ref.kind,ref.id,label]);if(shown.has(key))continue;shown.add(key);const li=element('li');li.title=ref.path;li.append(element('span',label+': ','muted'));if(ref.label){const a=element('a',`${ref.label} · #${ref.id}`);a.href=recordURL(worldId,ref.kind,ref.id,suffix);li.append(a);}else li.append(element('span',`Unresolved ${kindNames[ref.kind]||ref.kind} #${ref.id}`));links.append(li);}
  heading.textContent=`Linked references (${shown.size})`;section.open=shown.size<=10;
  if(!resolved.length&&culturalKinds.has(kind))section.hidden=true;
  if(!resolved.length)links.append(element('li','No supported explicit references in this record. Other fields remain available in the source inspector.'));
  if(kind==='historical_figures'){
   body.insertBefore(biography(data,resolved,worldId,suffix),fieldDetails);
   const launch=element('button','Explore family and relationships','quiet');launch.type='button';body.insertBefore(launch,fieldDetails);
   launch.onclick=async()=>{launch.disabled=true;launch.textContent='Opening relationships…';try{const {relationshipPanel}=await import('./relationships.js?v=0.12.1');if(ticket!==generation)return;const panel=relationshipPanel({...record,label:cultureLabel(record)},worldId,()=>{const query=location.hash.split('?')[1]||'';return query?'?'+query:'';},()=>ticket===generation);launch.replaceWith(panel);panel.querySelector('h2').tabIndex=-1;panel.querySelector('h2').focus();}catch(error){if(ticket===generation){launch.disabled=false;launch.textContent='Try opening relationships again';status.textContent=error.message;}}};
  }
  if(culturalKinds.has(kind)){const resolvedCulture=await explore(worldId,{type:'resolve',refs:extraRefs});if(ticket!==generation)return;body.insertBefore(culturePanel(record,resolvedCulture,worldId,suffix),fieldDetails);}
  const connected=await associations(record,worldId,suffix,()=>ticket===generation);if(ticket!==generation)return;for(const section of connected)body.insertBefore(section,raw);
  if(kind==='historical_events')return;
  const timeline=element('section'),events=element('ul',undefined,'record-results'),note=element('p','Loading related events…'),controls=element('div',undefined,'record-pagination'),prev=element('button','Previous events','quiet'),next=element('button','Next events','quiet');prev.type=next.type='button';controls.append(prev,next);note.setAttribute('role','status');timeline.append(element('h2','Recorded events'),element('p','Events that explicitly reference this record, earliest first. Missing dates are placed last; equal or missing timestamps do not establish an exact sequence.','muted'),events,note,controls);body.insertBefore(timeline,raw);
  let offset=Math.max(0,Math.floor((Number(params.get('eventOffset'))||0)/50)*50),request=0;
  const reader=timelineFilters(params,()=>{offset=0;void load();});timeline.insertBefore(reader.form,events);timeline.insertBefore(note,events);
  async function load(){const token=++request;prev.disabled=next.disabled=true;
   const selection=reader.selection(),current=timelineParams(params,selection,offset);
   const query=current.size?'?'+current:'';history.replaceState(null,'',recordURL(worldId,kind,id,query));
   // Update already-rendered references as well as newly-rendered event links.
   for(const link of [...body.querySelectorAll('a'),back]){
    const hash=link.getAttribute('href')||'';if(!hash.startsWith(`#/world/${encodeURIComponent(worldId)}`)||hash.includes('/atlas'))continue;
    const [route,existing='']=hash.split('?'),linked=timelineParams(new URLSearchParams(existing),selection,offset);link.setAttribute('href',route+(linked.size?'?'+linked:''));
   }
   note.textContent='Loading events…';
   try{const result=await explore(worldId,{type:'related',kind,recordId:id,offset,filters:selection});if(ticket!==generation||token!==request)return;
    reader.form.hidden=result.unfiltered===0;controls.hidden=result.unfiltered===0;reader.setTypes(result.types);
    if(result.total&&offset>=result.total){offset=Math.floor((result.total-1)/50)*50;return load();}
    const records=await withDB(db=>Promise.all(result.rows.map(row=>getRecord(db,worldId,row.kind,row.id))));
    const stories=await narratives(records.filter(Boolean),worldId,query);if(ticket!==generation||token!==request)return;
    let storyIndex=0;renderTimeline(events,result.rows,row=>{const index=result.rows.indexOf(row),li=rowLink(row,worldId,query);if(records[index])li.append(stories[storyIndex++]);return li;});
    note.textContent=timelineCount(result.total,result.unfiltered,offset);
    prev.disabled=offset===0;next.disabled=offset+50>=result.total;
   }catch(error){if(ticket===generation&&token===request)note.textContent=error.message;}
  }
  prev.onclick=()=>{offset=Math.max(0,offset-50);void load();};next.onclick=()=>{offset+=50;void load();};await load();
 }catch(error){if(ticket===generation)status.textContent=`Could not open record: ${error.message}`;}
}
