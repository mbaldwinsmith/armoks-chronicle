import {recordCategories,recordsCategory} from '../data/book-of-records.js?v=0.16.2';
import {explore} from '../data/explorer-client.js?v=0.16.2';
import {openDatabase,getWorld} from '../data/database.js?v=0.16.2';
import {recordURL,kindNames} from '../data/exploration.js?v=0.16.2';
import {titleCase} from '../data/language.js?v=0.16.2';
const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const bookURL=(world,category,offset=0)=>`#/world/${encodeURIComponent(world)}/records?category=${category}${offset?'&offset='+offset:''}`;
const link=(label,href,className)=>{const a=el('a',label,className);a.href=href;return a;};
let generation=0,controller;
export function cancelRecordBook(){generation++;controller?.abort();controller=null;}
export function rankingTable(page,world){
 const wrapper=el('div',undefined,'book-table-wrap');wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label',`${page.category.title} ranking table`);
 const table=el('table',undefined,'book-table');table.append(el('caption',`${page.category.title} — among recorded ${kindNames[page.category.kind]?.toLowerCase()||'records'}`));
 const head=el('thead'),header=el('tr');for(const label of ['Rank','Record',page.category.unit,'Supporting records']){const th=el('th',label);th.scope='col';header.append(th);}head.append(header);table.append(head);
 const body=el('tbody');for(const row of page.rows){
  const tr=el('tr');tr.append(el('td',String(row.rank)));const name=el('th');name.scope='row';name.append(link(row.label,recordURL(world,row.kind,row.id)),el('small',`#${row.id}${row.detail?' · '+row.detail:''}`,'muted'));tr.append(name,el('td',row.value.toLocaleString()));
  const support=el('td'),details=el('details');details.append(el('summary','Inspect evidence'));const list=el('ul');
  for(const ref of row.evidence){const li=el('li');li.append(link(`${ref.label||'Source record'} · #${ref.id}`,recordURL(world,ref.kind,ref.id)));if(ref.victim)li.append(' · victim ',link(`#${ref.victim}`,recordURL(world,'historical_figures',ref.victim)));list.append(li);}
  details.append(el('p',row.detail?'Life dates come from the linked figure’s source fields.':'Sample of up to five supporting records. Open the ranked record for its linked history and source fields.'),list);
  support.append(details);tr.append(support);body.append(tr);
 }table.append(body);wrapper.append(table);return wrapper;
}
export async function renderRecordBook(worldId,params){
 const ticket=++generation;controller=new AbortController();const signal=controller.signal;
 const status=document.querySelector('#book-status'),content=document.querySelector('#book-content'),highlights=document.querySelector('#book-highlights'),pagination=document.querySelector('#book-pagination'),nav=document.querySelector('#book-categories');
 content.replaceChildren();highlights.replaceChildren();pagination.replaceChildren();nav.replaceChildren();document.querySelector('#book-world').textContent='Opening archive…';status.textContent='Preparing rankings…';
 document.querySelector('#book-back').href=`#/world/${encodeURIComponent(worldId)}`;
 const category=recordsCategory(params.get('category'));
 for(const item of recordCategories){const a=link(item.title,bookURL(worldId,item.id),'button quiet');if(item.id===category.id)a.setAttribute('aria-current','page');nav.append(a);}
 let db;try{
  db=await openDatabase();const world=await getWorld(db,worldId);if(ticket!==generation)return;
  if(world?.status!=='ready')throw Error('This archive is not available in this browser. Import it or choose a saved world from the bookshelf.');
  document.querySelector('#book-world').textContent=`${titleCase(world.name)} · imported ${new Date(world.importedAt).toLocaleDateString()}`;
  document.title=`Book of Records · ${titleCase(world.name)} · Armok’s Chronicle`;
  const page=await explore(worldId,{type:'records',category:category.id,offset:params.get('offset')},(count,phase)=>{if(ticket===generation)status.textContent=`${phase==='rankings'?'Counting evidence':'Indexing archive'}: ${count.toLocaleString()} records…`;},signal);
  if(ticket!==generation)return;
  history.replaceState(null,'',bookURL(worldId,page.category.id,page.offset));
  for(const card of page.highlights){const article=el('article',undefined,'guide-card');article.append(link(card.title,bookURL(worldId,card.id)));
   article.append(el('p',card.leader?`${card.leader.label} · ${card.leader.value.toLocaleString()} ${card.unit}${card.ties>1?` · ${card.ties} tied for first`:''}`:'No eligible records in this archive.'));highlights.append(article);
  }
  content.append(el('h2',page.category.title),el('p',page.category.definition));
  content.append(el('p',`${page.total.toLocaleString()} eligible of ${page.candidates.toLocaleString()} recorded ${kindNames[page.category.kind].toLowerCase()}; ${page.excluded.toLocaleString()} excluded for missing, invalid or non-qualifying evidence. ${page.unresolved.toLocaleString()} additional ranking targets were missing. Equal values share a competition rank (1, 1, 3); names order tied rows.`, 'muted'));
  if(page.category.id==='open-lives')content.append(el('p',page.latestYear===null?'No dated event is available as a reference year.':`Reference: Year ${page.latestYear}, the latest dated event in this archive. No survival claim is made.`,'notice'));
  if(page.category.id==='open-lives'&&page.referenceEvent)content.append(link(`Inspect reference event #${page.referenceEvent.id}`,recordURL(worldId,page.referenceEvent.kind,page.referenceEvent.id),'text-link'));
  if(page.total){content.append(rankingTable(page,worldId));status.textContent=`${page.offset+1}–${Math.min(page.offset+50,page.total)} of ${page.total.toLocaleString()} eligible records.`;}
  else status.textContent='No eligible records for this category. Optional Plus data may add evidence; this does not establish that no such figures, works or events existed.';
  if(page.offset>0)pagination.append(link('← Previous 50',bookURL(worldId,category.id,page.offset-50),'button quiet'));
  if(page.offset+50<page.total)pagination.append(link('Next 50 →',bookURL(worldId,category.id,page.offset+50),'button quiet'));
 }catch(error){if(ticket===generation){document.querySelector('#book-world').textContent='Rankings unavailable';status.textContent=error.message;}}
 finally{db?.close();}
}
