import {reportsPanel} from './reports.js?v=0.32.0';
import {structuresPanel} from './structures.js?v=0.32.0';
import {structureReferences} from '../data/structures.js?v=0.32.0';
import {intriguePanel,intrigueDossier} from './intrigue.js?v=0.32.0';
import {intrigueReferences} from '../data/intrigue.js?v=0.32.0';
import {religionPanel} from './religion.js?v=0.32.0';
import {religionReferences} from '../data/religion.js?v=0.32.0';
import {artifactPanel} from './artifacts.js?v=0.32.0';
import {settlementPanel} from './settlements.js?v=0.32.0';
import {settlementReferences} from '../data/settlements.js?v=0.32.0';
import {officesPanel} from './offices.js?v=0.32.0';
import {journeyPanel} from './journeys.js?v=0.32.0';
import {supernaturalPanel,supernaturalControls,supernaturalBadges} from './supernatural.js?v=0.32.0';
import {supernaturalFilters,hasSupernaturalFilters} from '../data/supernatural.js?v=0.32.0';
import {chronicleCollector} from './chronicles.js?v=0.32.0';
import {threadPanel} from './threads.js?v=0.32.0';
import {recordVisit} from '../data/trail.js?v=0.32.0';
import {timelineParams,timelineKeys} from '../data/timeline.js?v=0.32.0';
import {timelineFilters,renderTimeline,timelineCount} from './timeline.js?v=0.32.0';
import {titleCase,eventLabel,readableValue,referenceLabel} from '../data/language.js?v=0.32.0';
import {researchEditor} from './research.js?v=0.32.0';
import {culturePanel,associations} from './culture.js?v=0.32.0';
import {cultureReferences,culturalKinds,cultureLabel} from '../data/culture.js?v=0.32.0';
import {conflictRecord} from '../data/conflicts.js?v=0.32.0';
import {sitePosition} from '../data/terrain.js?v=0.32.0';
import {narratives,biography} from './narrative.js?v=0.32.0';
import {openDatabase,getWorld,getRecord} from '../data/database.js?v=0.32.0';
import {explore} from '../data/explorer-client.js?v=0.32.0';
import {kindNames,recordURL,collectReferences,eventDate} from '../data/exploration.js?v=0.32.0';
let generation=0,timer,disposeReports,disposeStructures,disposeIntrigue,disposeReligion,disposeConnections,disposeRelationships,disposeConflict,disposeThreads,disposeSupernatural,disposeJourney,disposeOffices,disposeSettlement,disposeArtifact;
export function cancelExploration(){generation++;disposeReports?.();disposeReports=null;disposeStructures?.();disposeStructures=null;disposeIntrigue?.();disposeIntrigue=null;disposeReligion?.();disposeReligion=null;disposeArtifact?.();disposeArtifact=null;disposeSettlement?.();disposeSettlement=null;disposeOffices?.();disposeOffices=null;disposeJourney?.();disposeJourney=null;disposeSupernatural?.();disposeSupernatural=null;disposeThreads?.();disposeThreads=null;clearTimeout(timer);disposeConnections?.();disposeConnections=null;disposeRelationships?.();disposeRelationships=null;disposeConflict?.();disposeConflict=null;}
const element=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
function rowLink(row,world,query){const li=element('li'),a=element('a',row.label);a.href=recordURL(world,row.kind,row.id,query);li.append(a,element('span',`${kindNames[row.kind]||titleCase(row.kind.replaceAll('_',' '))} · #${row.id}${row.year!==null&&row.year!==undefined?` · Year ${row.year}`:''}`,'muted'));if(row.supernatural)li.append(supernaturalBadges(row.supernatural));return li;}
export async function renderDirectory(id,params) {
 const ticket=++generation;let request=0;
 const list=document.querySelector('#records'),status=document.querySelector('#record-status'),input=document.querySelector('#record-search'),select=document.querySelector('#record-kind'),sort=document.querySelector('#record-sort');
 let offset=Math.max(0,Number(params.get('offset'))||0);offset=Math.floor(offset/50)*50;
 input.value=params.get('q')||'';sort.value=params.get('sort')==='year'||(!params.has('sort')&&params.get('kind')==='historical_events')?'year':'name';
 const world=await withDB(db=>getWorld(db,id));if(ticket!==generation||world?.status!=='ready')return;
 select.replaceChildren(new Option('All record categories',''));
 for(const [kind,count] of Object.entries(world.counts).sort(([a],[b])=>a.localeCompare(b)))select.add(new Option(`${kindNames[kind]||titleCase(kind.replaceAll('_',' '))} (${count.toLocaleString()})`,kind));
 if(!Object.hasOwn(world.counts,'historical_figures'))select.add(new Option('Historical Figures (0)','historical_figures'));
 select.value=params.get('kind')||'';if(select.selectedIndex<0)select.value='';if(hasSupernaturalFilters(supernaturalFilters(params)))select.value='historical_figures';
 const previous=document.querySelector('#previous-records'),next=document.querySelector('#next-records');
 document.querySelector('#directory-timeline-filters')?.remove();
 const reader=timelineFilters(params,()=>{offset=0;void search();},'directory-event');reader.form.id='directory-timeline-filters';list.before(reader.form,status);
 reader.form.hidden=select.value!=='historical_events';
 document.querySelector('#directory-supernatural-filters')?.remove();const superControls=supernaturalControls(params,()=>{offset=0;void search();});list.before(superControls.element,status);superControls.element.hidden=select.value!=='historical_figures';
 async function search(){
  const token=++request;previous.disabled=true;next.disabled=true;list.replaceChildren();status.textContent='Preparing search…';
  const query=timelineParams(new URLSearchParams(),reader.selection());query.delete('eventOffset');if(input.value)query.set('q',input.value);if(select.value)query.set('kind',select.value);if(sort.value!=='name'||select.value==='historical_events')query.set('sort',sort.value);if(offset)query.set('offset',offset);
  if(select.value==='historical_figures'){const q=superControls.params(query);for(const [key,value] of q)query.set(key,value);}let suffix=query.size?'?'+query:'';reader.form.hidden=select.value!=='historical_events';superControls.element.hidden=select.value!=='historical_figures';
  history.replaceState(null,'',`#/world/${encodeURIComponent(id)}${suffix}`);
  try{
   const result=await explore(id,{type:'search',options:{q:input.value,kind:select.value,sort:sort.value,offset},filters:select.value==='historical_events'?reader.selection():null,supernatural:superControls.selection()},count=>{if(ticket===generation&&token===request)status.textContent=`Preparing search: ${count.toLocaleString()} records indexed…`;});
   if(ticket!==generation||token!==request)return;
   if(result.offset!==undefined&&offset!==result.offset){offset=result.offset;if(offset)query.set('offset',offset);else query.delete('offset');suffix=query.size?'?'+query:'';history.replaceState(null,'',`#/world/${encodeURIComponent(id)}${suffix}`);}
   const eventRows=result.rows.filter(row=>row.kind==='historical_events'),storiesById=new Map();
   if(eventRows.length){const records=await withDB(db=>Promise.all(eventRows.map(row=>getRecord(db,id,row.kind,row.id))));const present=records.filter(Boolean),stories=await narratives(present,id,suffix);if(ticket!==generation||token!==request)return;present.forEach((record,i)=>storiesById.set(record.id,stories[i]));}
   const makeRow=row=>{const li=rowLink(row,id,suffix);if(storiesById.has(row.id)&&row.kind==='historical_events')li.append(storiesById.get(row.id));return li;};
   if(select.value==='historical_events'&&sort.value==='year')renderTimeline(list,result.rows,makeRow);else list.replaceChildren(...result.rows.map(makeRow));
   if(select.value==='historical_events'){reader.setTypes(result.types);status.textContent=timelineCount(result.total,result.unfiltered,offset);}
   else status.textContent=result.total?`${(offset+1).toLocaleString()}–${Math.min(offset+50,result.total).toLocaleString()} of ${result.total.toLocaleString()} matching records`:'No matching records. Try a shorter name, # followed by an ID, or clear the category filter.';
   if(result.ruleVersion)status.textContent+=` · Supernatural evidence rules v${result.ruleVersion}.`+(result.supernaturalStats?.figureLimited||result.supernaturalStats?.scanLimited||result.supernaturalStats?.partialSources?' Source index limits reached; unknown results can include unexamined evidence.':'');
   previous.disabled=offset===0;next.disabled=offset+50>=result.total;
  }catch(error){if(ticket===generation&&token===request)status.textContent=`Search unavailable: ${error.message}`;}
 }
 input.oninput=()=>{clearTimeout(timer);request++;timer=setTimeout(()=>{offset=0;void search();},200);};
 select.onchange=()=>{clearTimeout(timer);offset=0;if(select.value==='historical_events')sort.value='year';void search();};sort.onchange=()=>{clearTimeout(timer);offset=0;void search();};
 document.querySelector('#clear-search').onclick=()=>{clearTimeout(timer);reader.reset(false);superControls.reset();input.value='';select.value='';sort.value='name';offset=0;void search();input.focus();};
 previous.onclick=()=>{offset=Math.max(0,offset-50);void search();};next.onclick=()=>{offset+=50;void search();};
 await search();
}
async function withDB(fn){const db=await openDatabase();try{return await fn(db);}finally{db.close();}}
export async function renderRecord(worldId,kind,id,params) {
 const ticket=++generation,title=document.querySelector('#detail-title'),body=document.querySelector('#detail-body'),status=document.querySelector('#detail-status');
 title.textContent='Opening record…';body.replaceChildren();status.textContent='';
 document.querySelector('#detail-desk').href=`#/world/${encodeURIComponent(worldId)}/desk`;
 const suffix=params.size?'?'+params:'';const back=document.querySelector('#back-results');back.textContent=kind==='artifacts'&&params.get('artifactCabinet')==='1'?'← Back to the Artifact Cabinet':'← Back to Search Results';back.href=kind==='artifacts'&&params.get('artifactCabinet')==='1'?`#/world/${encodeURIComponent(worldId)}/artifacts${suffix}`:`#/world/${encodeURIComponent(worldId)}${suffix}`;
 try {
  const {world,record}=await withDB(async db=>({world:await getWorld(db,worldId),record:await getRecord(db,worldId,kind,id)}));
  if(ticket!==generation)return;
  if(world?.status!=='ready'||!record){title.textContent='Record unavailable';status.textContent='This record is missing, or this world is not saved in this browser. Importing a world creates a new local address.';return;}
  recordVisit(worldId,{kind:record.kind,id:record.id,label:cultureLabel(record)});
  title.textContent=cultureLabel(record);document.title=`${cultureLabel(record)} · Armok’s Chronicle`;
  body.append(element('p',`${titleCase(world.name)} · ${kindNames[kind]||titleCase(kind.replaceAll('_',' '))} · #${id}`,'intro'));
  const editor=await researchEditor(world,{...record,label:cultureLabel(record)});if(ticket!==generation)return;body.append(editor);
  if(params.has('ledgerOrigin')){const ledgerBack=element('a','← Return to this Grudge Ledger','button quiet');const ledgerQuery=new URLSearchParams(params.get('ledgerOrigin'));ledgerBack.href=`#/world/${encodeURIComponent(worldId)}/grudges${ledgerQuery.size?'?'+ledgerQuery:''}`;body.append(ledgerBack);}
  const collector=await chronicleCollector(world,record);if(ticket!==generation)return;body.append(collector);
  const data=record.data;let specialisedConflict=false;
  if(params.has('populationReturn')){const incoming=new URLSearchParams(params.get('populationReturn')),q=new URLSearchParams();for(const key of ['popQ','popScope','popMatch','popSection','popOffset','reportFile','reportEncoding','reportMode','reportLine','reportOrigin','reportOriginQ','textOffset'])if(incoming.has(key))q.set(key,incoming.get(key).slice(0,512));const back=element('a','← Return to This Population Report','button quiet');back.href=`#/world/${encodeURIComponent(worldId)}/reports${q.size?'?'+q:''}`;body.append(back);}
  if(params.has('buildingReturn')){const incoming=new URLSearchParams(params.get('buildingReturn')),q=new URLSearchParams();for(const key of ['stQ','stType','stSite','stState','stCategory','stOffset','buildingSite','buildingId'])if(incoming.has(key))q.set(key,incoming.get(key).slice(0,240));const back=element('a','← Return to This Structure Dossier','button quiet');back.href=`#/world/${encodeURIComponent(worldId)}/structures${q.size?'?'+q:''}`;body.append(back);}
  if(params.has('intrigueReturn')){const incoming=new URLSearchParams(params.get('intrigueReturn')),q=new URLSearchParams();for(const key of ['inQ','inCategory','inOutcome','inFrom','inTo','inOffset','inKind','inId','inOwner'])if(incoming.has(key))q.set(key,incoming.get(key).slice(0,240));const back=element('a','← Return to This Intrigue Dossier','button quiet');back.href=`#/world/${encodeURIComponent(worldId)}/intrigue${q.size?'?'+q:''}`;body.append(back);}
  if(params.has('faithReturn')){const incoming=new URLSearchParams(params.get('faithReturn')),q=new URLSearchParams();for(const key of ['faithQ','faithSphere','faithCategory','faithOffset','faithKind','faithId'])if(incoming.has(key))q.set(key,incoming.get(key).slice(0,240));const back=element('a','← Return to These Sacred Annals','button quiet');back.href=`#/world/${encodeURIComponent(worldId)}/religion${q.size?'?'+q:''}`;body.append(back);}
  if(kind==='historical_events'&&/^\d{1,128}$/.test(params.get('artifactOrigin')||'')){const q=new URLSearchParams(params.get('artifactQuery')||'');q.delete('source');q.delete('artifactOrigin');q.delete('artifactQuery');const back=element('a','← Return to This Artifact Dossier','button quiet');back.href=recordURL(worldId,'artifacts',params.get('artifactOrigin'),q.size?'?'+q:'');body.append(back);}
  if(kind==='historical_events'&&/^\d{1,128}$/.test(params.get('settlementOrigin')||'')){const back=element('a','← Return to This Settlement Chronicle','button quiet'),q=new URLSearchParams(params.get('settlementQuery')||'');q.delete('source');q.delete('settlementOrigin');q.delete('settlementQuery');back.href=recordURL(worldId,'sites',params.get('settlementOrigin'),q.size?'?'+q:'');body.append(back);}
  if(kind==='historical_event_collections'){
   const {collectionType,warfareTypes}=await import('../data/warfare.js?v=0.32.0');if(ticket!==generation)return;
   if(warfareTypes.has(collectionType(data))){const {warfarePanel}=await import('./warfare.js?v=0.32.0');if(ticket!==generation)return;const panel=warfarePanel(record,world,params,()=>ticket===generation);disposeConflict=panel.dispose;body.append(panel.element);specialisedConflict=true;}
  }
  if(kind==='historical_events'&&/^\d+$/.test(params.get('conflictOrigin')||'')){const origin=new URLSearchParams(params);origin.delete('conflictOrigin');origin.set('warTab','chronicle');body.append(element('p','This event belongs to the conflict history you were reading.'));const backConflict=element('a','← Return to this conflict','button quiet');backConflict.href=recordURL(worldId,'historical_event_collections',params.get('conflictOrigin'),'?'+origin);body.append(backConflict);}

  if(kind==='entities'){const networkLink=element('a','Explore warfare network','button quiet');networkLink.href=`#/world/${encodeURIComponent(worldId)}/factions/${encodeURIComponent(id)}/warfare`;body.append(networkLink);for(const [basis,label] of [['owner','Show settlements owned by this organisation'],['civilisation','Show settlements with this recorded civilisation']]){const link=element('a',label,'button quiet');link.href=`#/world/${encodeURIComponent(worldId)}/atlas?basis=${basis}&faction=${encodeURIComponent(id)}`;body.append(link);}}

  if(kind==='historical_events'){
   const siteId=[data.site_id,data.site].find(value=>typeof value==='string'&&/^\d+$/.test(value));const site=siteId?await withDB(db=>getRecord(db,worldId,'sites',siteId)):null;if(ticket!==generation)return;
   const pos=site&&sitePosition(site.data,1025,1025);const event=conflictRecord(record,pos?[{id:site.id,label:site.label,...pos}]:[],1025,1025);
   if(event){if(event.x!==undefined){const query=new URLSearchParams({x:event.x,y:event.y,conflicts:'1',conflictType:event.type});if(event.year!==null){query.set('conflictFrom',event.year);query.set('conflictTo',event.year);}const link=element('a','Show this conflict in the atlas','button quiet');link.href=`#/world/${encodeURIComponent(worldId)}/atlas?${query}`;body.append(link);}else body.append(element('p','This conflict has no usable recorded location; it remains available in the atlas event list.','muted'));}
  }
  const fields=element('dl',undefined,'record-facts');
  for(const [key,value] of Object.entries(data))if(typeof value==='string'&&!['id','name'].includes(key)){
   fields.append(element('dt',key.replaceAll('_',' ')),element('dd',value==='-1'?'Unknown / not recorded (−1)':key==='type'&&kind==='historical_events'?eventLabel(value):['type','race','caste','associated_type'].includes(key)?readableValue(value):value));
  }
  const fieldDetails=element('details',undefined,'guide-card');fieldDetails.append(element('summary','Recorded Fields'),fields);
  if(kind==='entities'||kind==='sites'||kind==='historical_figures'||kind==='historical_events'||kind==='historical_event_collections'||culturalKinds.has(kind))body.append(fieldDetails);else body.append(fields);
  if(kind==='historical_events'){const [story]=await narratives([record],worldId,suffix);if(ticket!==generation)return;const date=eventDate(data);story.prepend(element('p',date.year===null?'Year not recorded':`Year ${date.year}`,'small-label'));body.insertBefore(story,fieldDetails);}
  const extraRefs=[...structureReferences(record),...intrigueReferences(record),...religionReferences(record),...cultureReferences(record),...settlementReferences(record)];const refs=[...collectReferences({merged:data,plus:record.supplement}),...extraRefs];
  const section=element('details',undefined,'guide-card'),heading=element('summary',`Linked references (${refs.length})`),links=element('ul',undefined,'reference-list');section.open=refs.length<=10;section.append(heading,element('p','Roles follow the export. The source inspector retains the original fields and IDs.','muted'),links);body.append(section);
  const raw=element('details',undefined,'guide-card'),pre=element('pre');const fillSource=()=>{if(!pre.textContent)pre.textContent=JSON.stringify({fields:data,sources:record.sources,supplementaryFields:record.supplement},null,2);};raw.append(element('summary','Source fields and provenance'),pre);raw.open=params.get('source')==='1';if(kind!=='historical_event_collections'||raw.open)fillSource();raw.ontoggle=()=>{if(raw.open)fillSource();};body.append(raw);
  const resolved=await explore(worldId,{type:'resolve',refs});if(ticket!==generation)return;
  const shown=new Set();for(const ref of resolved){const label=referenceLabel(ref.role,kind==='historical_events'&&/died$/.test(String(data.type).replaceAll('_',' '))),key=JSON.stringify([ref.kind,ref.id,label]);if(shown.has(key))continue;shown.add(key);const li=element('li');li.title=ref.path;li.append(element('span',label+': ','muted'));if(ref.label){const a=element('a',`${ref.label} · #${ref.id}`);a.href=recordURL(worldId,ref.kind,ref.id,suffix);li.append(a);}else li.append(element('span',`Unresolved ${kindNames[ref.kind]||ref.kind} #${ref.id}`));links.append(li);}
  heading.textContent=`Linked references (${shown.size})`;section.open=shown.size<=10;
  if(!resolved.length&&culturalKinds.has(kind))section.hidden=true;
  if(!resolved.length)links.append(element('li','No supported explicit references in this record. Other fields remain available in the source inspector.'));
  if(kind==='historical_figures'){
   body.insertBefore(biography(data,resolved,worldId,suffix),fieldDetails);
   const supernatural=supernaturalPanel(record,worldId,()=>ticket===generation,params);disposeSupernatural=supernatural.dispose;body.insertBefore(supernatural.element,fieldDetails);
   const find=element('button','Find a connection','quiet record-tool');find.type='button';body.insertBefore(find,fieldDetails);
   find.onclick=async()=>{find.disabled=true;try{const {connectionFinder}=await import('./connections.js?v=0.32.0');if(ticket!==generation)return;const finder=connectionFinder({...record,label:cultureLabel(record)},worldId,()=>{const query=location.hash.split('?')[1]||'';return query?'?'+query:'';},()=>ticket===generation);disposeConnections=finder.dispose;find.replaceWith(finder.element);const heading=finder.element.querySelector('h2');heading.tabIndex=-1;heading.focus();}catch(error){if(ticket===generation){find.disabled=false;status.textContent=error.message;}}};
   const launchers=element('div',undefined,'relationship-toolbar'),family=element('button','Open family tree','quiet record-tool'),launch=element('button','Explore family and relationships','quiet record-tool');family.type=launch.type='button';launchers.append(family,launch);body.insertBefore(launchers,fieldDetails);
   const openRelationships=async layout=>{family.disabled=launch.disabled=true;try{const {relationshipPanel}=await import('./relationships.js?v=0.32.0');if(ticket!==generation)return;
    const onLayout=value=>{const query=new URLSearchParams(location.hash.split('?')[1]||'');query.set('relationships',value);history.replaceState(null,'',recordURL(worldId,kind,id,'?'+query));};
    const panel=relationshipPanel({...record,label:cultureLabel(record)},worldId,()=>{const query=location.hash.split('?')[1]||'';return query?'?'+query:'';},()=>ticket===generation,{layout,onLayout});disposeRelationships=panel.dispose;onLayout(layout);launchers.replaceWith(panel);panel.querySelector('h2').tabIndex=-1;panel.querySelector('h2').focus();
   }catch(error){if(ticket===generation){family.disabled=launch.disabled=false;status.textContent=error.message;}}};
   launch.onclick=()=>void openRelationships('network');family.onclick=()=>void openRelationships('family');
   if(['family','network'].includes(params.get('relationships')))void openRelationships(params.get('relationships'));
  }
  if(['sites','entities'].includes(kind)){const reports=reportsPanel(record,worldId,()=>ticket===generation,params);disposeReports=reports.dispose;body.insertBefore(reports.element,fieldDetails.isConnected?fieldDetails:section);}
  if(['sites','historical_figures','entities','artifacts'].includes(kind)){const buildings=structuresPanel(record,worldId,()=>ticket===generation);disposeStructures=buildings.dispose;body.insertBefore(buildings.element,fieldDetails.isConnected?fieldDetails:section);}
  if(kind==='historical_figures'){const intrigue=intriguePanel(record,worldId,()=>ticket===generation);disposeIntrigue=intrigue.dispose;body.insertBefore(intrigue.element,fieldDetails.isConnected?fieldDetails:section);}
  if(kind==='identities'){const persona=await explore(worldId,{type:'intrigue-detail',kind,recordId:id});if(ticket!==generation)return;if(persona)body.insertBefore(intrigueDossier(persona,worldId,new URLSearchParams('inCategory=identities')),fields);}
  if(['historical_figures','entities','sites'].includes(kind)){const faith=religionPanel(record,worldId,()=>ticket===generation);disposeReligion=faith.dispose;body.insertBefore(faith.element,fieldDetails.isConnected?fieldDetails:section);}
  if(kind==='artifacts'){const dossier=artifactPanel(record,worldId,()=>ticket===generation);disposeArtifact=dossier.dispose;body.insertBefore(dossier.element,fieldDetails);}
  if(kind==='sites'){const settlement=settlementPanel(record,worldId,()=>ticket===generation,params);disposeSettlement=settlement.dispose;body.insertBefore(settlement.element,fieldDetails.isConnected?fieldDetails:section);}
  if(['historical_figures','entities'].includes(kind)){const offices=officesPanel(record,worldId,()=>ticket===generation,params);disposeOffices=offices.dispose;body.insertBefore(offices.element,fieldDetails.isConnected?fieldDetails:section);}
  if(['historical_figures','artifacts'].includes(kind)){const journey=journeyPanel(record,worldId,()=>ticket===generation,params);disposeJourney=journey.dispose;body.insertBefore(journey.element,fieldDetails.isConnected?fieldDetails:section);}
  if(culturalKinds.has(kind)&&kind!=='artifacts'){const resolvedCulture=await explore(worldId,{type:'resolve',refs:extraRefs});if(ticket!==generation)return;body.insertBefore(culturePanel(record,resolvedCulture,worldId,suffix),fieldDetails);}
  const connected=await associations(record,worldId,suffix,()=>ticket===generation);if(ticket!==generation)return;for(const section of connected)body.insertBefore(section,raw);
  const threads=threadPanel(record,worldId,()=>ticket===generation);disposeThreads=threads.dispose;body.append(threads.element);
  if(kind==='historical_events'||specialisedConflict)return;
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
