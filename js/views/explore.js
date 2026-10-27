import {openDatabase,getWorld,getRecord} from '../data/database.js?v=0.3.0';
import {explore} from '../data/explorer-client.js?v=0.3.0';
import {kindNames,recordURL,collectReferences,eventDate} from '../data/exploration.js?v=0.3.0';
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
  const data=record.data,fields=element('dl',undefined,'record-facts');
  for(const [key,value] of Object.entries(data))if(typeof value==='string'&&!['id','name'].includes(key)){
   fields.append(element('dt',key.replaceAll('_',' ')),element('dd',value==='-1'?'Unknown / not recorded (−1)':value));
  }
  body.append(fields);
  if(kind==='historical_events'){const d=eventDate(data);body.append(element('p',`Recorded event: ${data.type||'unknown type'}. ${d.year===null?'Year not recorded.':`Year ${d.year}.`} Structured source fields are shown above; narrative wording is not yet available.`,'notice'));}
  const refs=collectReferences({standard:data,plus:record.supplement});
  const section=element('section'),heading=element('h2','Linked references'),links=element('ul',undefined,'reference-list');section.append(heading,element('p','Field paths retain the source roles. A reference alone does not establish friendship, ownership, or current membership.','muted'),links);body.append(section);
  const raw=element('details',undefined,'guide-card'),pre=element('pre',JSON.stringify({fields:data,sources:record.sources,supplementaryFields:record.supplement},null,2));raw.append(element('summary','Source fields and provenance'),pre);body.append(raw);
  const resolved=await explore(worldId,{type:'resolve',refs});if(ticket!==generation)return;
  for(const ref of resolved){const li=element('li');li.append(element('span',ref.path.replaceAll('_',' ')+' → ','muted'));if(ref.label){const a=element('a',`${ref.label} · #${ref.id}`);a.href=recordURL(worldId,ref.kind,ref.id,suffix);li.append(a);}else li.append(element('span',`Unresolved ${kindNames[ref.kind]||ref.kind} #${ref.id}`));links.append(li);}
  if(!resolved.length)links.append(element('li','No supported explicit references in this record. Other fields remain available in the source inspector.'));
  if(kind==='historical_events')return;
  const timeline=element('section'),events=element('ul',undefined,'record-results'),note=element('p','Loading related events…'),controls=element('div',undefined,'record-pagination'),prev=element('button','Previous events','quiet'),next=element('button','Next events','quiet');prev.type=next.type='button';controls.append(prev,next);note.setAttribute('role','status');timeline.append(element('h2','Recorded events'),element('p','Events that explicitly reference this record, earliest first. Missing dates are placed last; equal or missing timestamps do not establish an exact sequence.','muted'),events,note,controls);body.insertBefore(timeline,raw);
  let offset=0,request=0;
  async function load(){const token=++request;prev.disabled=next.disabled=true;try{const result=await explore(worldId,{type:'related',kind,recordId:id,offset});if(ticket!==generation||token!==request)return;events.replaceChildren(...result.rows.map(row=>rowLink(row,worldId,suffix)));note.textContent=result.total?`Events ${offset+1}–${Math.min(offset+50,result.total)} of ${result.total.toLocaleString()}`:'No events with supported explicit references were found.';prev.disabled=offset===0;next.disabled=offset+50>=result.total;}catch(error){if(ticket===generation)note.textContent=error.message;}}
  prev.onclick=()=>{offset=Math.max(0,offset-50);void load();};next.onclick=()=>{offset+=50;void load();};await load();
 }catch(error){if(ticket===generation)status.textContent=`Could not open record: ${error.message}`;}
}
