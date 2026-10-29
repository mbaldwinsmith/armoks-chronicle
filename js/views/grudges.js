import {explore} from '../data/explorer-client.js?v=0.32.0';
import {openDatabase,getWorld} from '../data/database.js?v=0.32.0';
import {recordURL} from '../data/exploration.js?v=0.32.0';
import {titleCase} from '../data/language.js?v=0.32.0';
import {grudgeCategories,grudgeFilters} from '../data/grudges.js?v=0.32.0';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(label,href,cls)=>{const a=el('a',label,cls);a.href=href;return a;};
const node=(ref,world,query='')=>ref.missing?el('span',ref.label,'muted'):link(ref.label,recordURL(world,ref.kind,ref.id,query));
export function grudgeDate(row){return row.start===null&&row.end===null?'Date Not Recorded':row.start!==null&&row.end!==null?(row.start>row.end?'Inconsistent Source Dates':row.start===row.end?`Year ${row.start}`:`Years ${row.start}–${row.end}`):row.start!==null?`From Year ${row.start} · End Not Recorded`:`Ends in Year ${row.end} · Start Not Recorded`;}
export function grudgeCard(row,world,query=''){
 const origin=new URLSearchParams({ledgerOrigin:query.replace(/^\?/, '')});
 const card=el('article',undefined,'grudge-card'),h=el('h2');h.append(node(row.source,world,'?'+origin));card.append(el('p',`${grudgeCategories[row.category]} · ${grudgeDate(row)}`,'small-label'),h);
 const story=el('p',undefined,'grudge-story');for(const token of row.tokens)story.append(typeof token==='string'?document.createTextNode(token):node(token,world));card.append(story);
 const facts=el('dl',undefined,'grudge-roles');for(const ref of row.refs){facts.append(el('dt',ref.role),el('dd'));facts.lastChild.append(node(ref,world));}if(row.refs.length)card.append(facts);
 if(row.category==='grudges')card.append(el('p','An explicit relationship label, recorded in this figure’s source. Its date and the cause of the grudge are not established.','muted'));
 if(row.category==='factions')card.append(el('p','A conflict source entry. Related wars, battles and member events can overlap; these entries are not independent incident totals.','muted'));
 if(row.partial)card.append(el('p','Some source roles were omitted by the display limits. Inspect the complete source record.','muted'));
 const details=el('details');details.append(el('summary','Evidence and Next Steps'),link('Inspect source fields →',recordURL(world,row.kind,row.id,'?'+new URLSearchParams({source:'1',ledgerOrigin:query.replace(/^\?/, '')}))));for(const path of row.paths.slice(0,6))details.append(el('small',path,'muted'));details.append(link('Open record and Follow the Thread →',recordURL(world,row.kind,row.id,'?'+origin)));
 if(row.category==='factions'&&row.kind==='historical_event_collections')details.append(link('Explore this conflict’s history →',recordURL(world,row.kind,row.id,'?'+new URLSearchParams({warTab:'chronicle',ledgerOrigin:query.replace(/^\?/, '')}))));
 card.append(details);return card;
}
let generation=0,controller;
export function cancelGrudges(){generation++;controller?.abort();controller=null;}
export async function renderGrudges(worldId,params){const ticket=++generation;controller=new AbortController();const signal=controller.signal,current=()=>ticket===generation;
 const content=document.querySelector('#grudge-entries'),status=document.querySelector('#grudge-status'),pages=document.querySelector('#grudge-pages'),summary=document.querySelector('#grudge-summary'),form=document.querySelector('#grudge-filters'),worldTitle=document.querySelector('#grudge-world');let request=0,offset=params.get('offset')||0,queryController;
 signal.addEventListener('abort',()=>queryController?.abort(),{once:true});content.replaceChildren();pages.replaceChildren();summary.replaceChildren();worldTitle.textContent='';status.textContent='Opening the Grudge Ledger…';document.querySelector('#grudge-back').href=`#/world/${encodeURIComponent(worldId)}/desk`;
 const controls=Object.fromEntries(['q','person','faction','site','category','from','to','sort'].map(k=>[k,form.elements.namedItem(k)])),restored=grudgeFilters(Object.fromEntries(params));controls.category.replaceChildren(new Option('All Ledger Entries',''));for(const [key,label] of Object.entries(grudgeCategories))controls.category.add(new Option(label,key));for(const [key,input] of Object.entries(controls))input.value=restored[key];
 const apply=form.querySelector('[type=submit]');apply.disabled=true;form.onsubmit=e=>{e.preventDefault();offset=0;void load();};document.querySelector('#grudge-clear').onclick=()=>{for(const [key,input] of Object.entries(controls))input.value=key==='sort'?'earliest':'';offset=0;void load();};
 let db;try{db=await openDatabase();const world=await getWorld(db,worldId);if(!current())return;if(world?.status!=='ready')throw Error('This archive is not available in this browser. Choose a saved world from the bookshelf.');worldTitle.textContent=titleCase(world.name);document.title=`Grudge Ledger · ${titleCase(world.name)} · Armok’s Chronicle`;apply.disabled=false;await load();}catch(error){if(current())status.textContent=error.message;}finally{db?.close();}
 async function load(){if(!current()||apply.disabled)return;queryController?.abort();queryController=new AbortController();const token=++request;content.replaceChildren();pages.replaceChildren();summary.replaceChildren();status.textContent='Reading recorded harms and explicit grudge links…';
  const options=grudgeFilters(Object.fromEntries(Object.entries(controls).map(([key,input])=>[key,input.value]))),q=new URLSearchParams();for(const key of Object.keys(controls))if(options[key]!==''&&!(key==='sort'&&options.sort==='earliest'))q.set(key,options[key]);if(offset)q.set('offset',offset);const save=()=>history.replaceState(null,'',`#/world/${encodeURIComponent(worldId)}/grudges${q.size?'?'+q:''}`);save();
  try{const result=await explore(worldId,{type:'grudges',options:{...options,offset}},(count,phase)=>{if(current()&&token===request)status.textContent=`${phase==='ledger'?'Reading ledger sources':'Opening archive'}: ${count.toLocaleString()} records examined…`;},queryController.signal);if(!current()||token!==request)return;offset=result.offset;if(offset)q.set('offset',offset);else q.delete('offset');save();
   for(const [key,label] of Object.entries(grudgeCategories)){const tile=el('div');tile.append(el('strong',result.counts[key].toLocaleString()),el('span',label));summary.append(tile);}const suffix=q.size?'?'+q:'';content.replaceChildren(...result.rows.map(row=>grudgeCard(row,worldId,suffix)));
   status.textContent=result.invalid?'Enter whole years with From no later than To.':result.total?`${offset+1}–${Math.min(offset+result.size,result.total)} of ${result.total.toLocaleString()} matching source entries.`:'No matching source entries. Clear the filters to see more; absence from the ledger does not prove that no harm or grudge existed.';
   if(result.stats.scanLimited||result.stats.rowLimited||result.stats.partial)status.textContent+=' Source or reference limits were reached; this ledger is incomplete.';
   if(result.total)for(const [label,next,disabled] of [['← Previous',Math.max(0,offset-result.size),offset===0],['Next →',offset+result.size,offset+result.size>=result.total]]){const button=el('button',label,'quiet');button.type='button';button.disabled=disabled;button.onclick=()=>{offset=next;void load();};pages.append(button);}
  }catch(error){if(current()&&token===request&&error.name!=='AbortError')status.textContent=`Ledger unavailable: ${error.message}`;}
 }
}
