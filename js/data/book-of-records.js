import {createOfficeIndex,officeRankings} from './offices.js?v=0.25.0';
import {eventType} from './narrative.js?v=0.25.0';
import {recordKey} from './exploration.js?v=0.25.0';
export const recordCategories=Object.freeze([
 {id:'kills',title:'Deadliest Figures',unit:'named victims',kind:'historical_figures',definition:'Distinct historical figures explicitly named as victims in death events naming this killer. Repeated deaths for the same victim count once per killer. Self-kills, old-age deaths, missing victims and unnamed squad casualties are excluded. Conflicting killer attributions remain source claims, not a resolved verdict.'},
 {id:'lifespans',title:'Longest Completed Lives',unit:'calendar years',kind:'historical_figures',definition:'Death year minus birth year in the merged figure record. These are differences between calendar years, not exact birthdays. Both years must be recorded, neither may be the -1 sentinel, and death must not precede birth. Negative years other than -1 are retained. Supernatural figures are included.'},
 {id:'open-lives',title:'Open-ended Life Records',unit:'calendar years to latest event',kind:'historical_figures',definition:'Latest dated event year in this archive minus recorded birth year, for figures whose death_year is explicitly -1. This is an open-ended record span, not proof of survival or a measured lifespan. Missing death fields are excluded. The latest event is a reference date, not an inferred export date; supernatural figures are included.'},
 {id:'authors',title:'Most Prolific Authors',unit:'distinct written works',kind:'historical_figures',definition:'Distinct written-content records naming the figure as author (author_hfid, then author). Each work counts once, regardless of physical copies or composition events. Missing author records are excluded. Works without a recorded author do not count.'},
 {id:'sites',title:'Most Eventful Settlements',unit:'recorded events',kind:'sites',definition:'Distinct event records explicitly referencing the site through a recognised site-ID field. Multiple references in one event count once per site. Source and destination sites may both count. This measures recorded activity, including routine events, not population, importance, ownership changes or battles.'},
 {id:'scholars',title:'Most Recorded Knowledge Discoveries',unit:'discovery events',kind:'historical_figures',definition:'Distinct knowledge-discovered event records naming the figure (hfid, then hist_figure_id, histfig or hf). This counts recorded discovery events, not unique topics, learned secrets, books or overall intelligence.'},
 {id:'artifacts',title:'Most Chronicled Artifacts',unit:'recorded events',kind:'artifacts',definition:'Distinct event records explicitly referencing the artifact through recognised artifact-ID fields. Several references in one event count once. This measures the recorded history, not age, value, number of owners or physical copies.'},
 {id:'longest-terms',title:'Longest Completed Office Terms',unit:'calendar years',kind:'historical_figures',population:'recorded office term/endpoint entries',definition:'Each explicitly paired appointment/removal term is ranked separately, by removal year minus appointment year. Missing or ongoing endpoints, ambiguous event order, unresolved holders/organisations, conflicting office definitions and potentially overlapping terms in the same office are excluded. Concurrent different offices remain separate. Zero-year terms require ordered within-year timestamps. No death, next appointment or export date supplies a missing endpoint. All office types and supernatural figures are included; these are not exclusively royal reigns.'},
 {id:'shortest-terms',title:'Shortest Completed Office Terms',unit:'calendar years',kind:'historical_figures',population:'recorded office term/endpoint entries',definition:'The same eligible completed office terms as Longest Completed Office Terms, ordered shortest first. Year differences are not exact anniversaries. Repeated terms are not summed; distinct offices are not merged. Equal durations share competition ranks, including qualifying zero-year terms. Scan limits and missing export coverage can exclude further evidence.'},
 {id:'copies',title:'Works With the Most Recorded Copies',unit:'recorded physical artifacts',kind:'written_contents',definition:'Distinct artifact records explicitly referencing written content through writing or item.page_written_content_id. Repeated page references in one artifact count once. This counts recorded physical artifacts, not copying events, pages, surviving copies or all copies ever made.'}
]);
const array=v=>v===undefined?[]:Array.isArray(v)?v:[v];
const id=v=>typeof v==='string'&&/^\d+$/.test(v)?v:null;
const first=(d,...keys)=>keys.map(k=>id(d[k])).find(Boolean);
const year=v=>typeof v==='string'&&/^-?\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&v!=='-1'?Number(v):null;
export function recordsCategory(value){return recordCategories.find(c=>c.id===value)||recordCategories[0];}
// One streaming pass, with at most five sample evidence links per ranked entry.
export function createRecordBook(existingOffices=null){
 const offices=existingOffices?null:createOfficeIndex();
 const metrics=new Map(recordCategories.map(c=>[c.id,new Map()])),lives=[];let latestYear=null,referenceEvent=null;
 function add(category,kind,target,distinct,evidence){
  if(!target)return;const map=metrics.get(category),key=recordKey(kind,target);let row=map.get(key);
  if(!row){row={key,kind,id:target,value:0,seen:category==='kills'?new Map():new Set(),evidence:[]};map.set(key,row);}
  if(row.seen.has(distinct))return;if(category==='kills')row.seen.set(distinct,evidence);else row.seen.add(distinct);row.value++;
  if(row.evidence.length<5)row.evidence.push(evidence);
 }
 return {
  accept(record,refs=[]){
   offices?.accept(record);
   const d=record.data||{},key=recordKey(record.kind,record.id),evidence={kind:record.kind,id:String(record.id)};
   if(record.kind==='historical_figures'){
    const birth=year(d.birth_year),death=year(d.death_year);
    if(birth!==null)lives.push({key,kind:record.kind,id:String(record.id),birth,death,open:d.death_year==='-1'});
   }
   if(record.kind==='historical_events'){
    const dated=year(d.year);if(dated!==null&&(latestYear===null||dated>latestYear)){latestYear=dated;referenceEvent=evidence;}
    const type=eventType(d);
    if(type==='hf died'){
     const killer=first(d,'slayer_hfid','slayer_hf'),victim=first(d,'hfid','victim_hf');
     const cause=String(d.cause||d.death_cause||'').replaceAll('_',' ').toLowerCase();
     if(killer&&victim&&killer!==victim&&cause!=='old age')add('kills','historical_figures',killer,victim,{...evidence,victim});
    }
    if(type==='knowledge discovered')add('scholars','historical_figures',first(d,'hfid','hist_figure_id','histfig','hf'),key,evidence);
    const unique=new Set();for(const ref of refs){const token=recordKey(ref.kind,ref.id);if(unique.has(token))continue;unique.add(token);
     if(ref.kind==='sites')add('sites','sites',ref.id,key,evidence);
     if(ref.kind==='artifacts')add('artifacts','artifacts',ref.id,key,evidence);
    }
   }
   if(record.kind==='written_contents')add('authors','historical_figures',first(d,'author_hfid','author'),key,evidence);
   if(record.kind==='artifacts')for(const content of new Set([...array(d.writing),...array(d.item?.page_written_content_id)]))add('copies','written_contents',id(content),key,evidence);
  },
  finish(lookup){
   for(const life of lives){const category=life.death!==null?'lifespans':life.open&&latestYear!==null?'open-lives':null,end=life.death??latestYear;
    if(!category||end<life.birth||!Number.isSafeInteger(end-life.birth))continue;
    metrics.get(category).set(life.key,{key:life.key,kind:life.kind,id:life.id,value:end-life.birth,evidence:[{kind:life.kind,id:life.id}],detail:`Year ${life.birth} → Year ${end}${category==='open-lives'?' (latest dated event; survival unconfirmed)':''}`});
   }
   const results=new Map(),officeIndex=existingOffices||offices.finish();
   for(const category of recordCategories){if(category.population){results.set(category.id,officeRankings(officeIndex,lookup,category.id==='shortest-terms'));continue;}let unresolved=0;const rows=[];
    for(const raw of metrics.get(category.id).values()){
     if(!lookup.has(raw.key)){unresolved++;continue;}
     let value=raw.value,evidence=raw.evidence;
     if(category.id==='kills'){
      const known=[...raw.seen].filter(([v])=>lookup.has(recordKey('historical_figures',v)));
      value=known.length;evidence=known.slice(0,5).map(([,event])=>event);
     }
     if(value===0&&!['lifespans','open-lives'].includes(category.id))continue;
     rows.push({key:raw.key,kind:raw.kind,id:raw.id,label:lookup.get(raw.key).label,value,evidence,detail:raw.detail||''});
    }
    rows.sort((a,b)=>b.value-a.value||a.label.localeCompare(b.label,'en')||a.id.localeCompare(b.id,'en',{numeric:true}));
    let rank=0;rows.forEach((row,i)=>{if(i===0||row.value!==rows[i-1].value)rank=i+1;row.rank=rank;});
    const candidates=[...lookup.values()].filter(r=>r.kind===category.kind).length;
    results.set(category.id,{rows,candidates,excluded:candidates-rows.length,unresolved});
   }
   return {metrics:results,latestYear,referenceEvent,offices:officeIndex};
  }
 };
}
export function recordBookPage(book,category,offset=0){
 const selected=recordsCategory(category),result=book.metrics.get(selected.id);
 const requested=Number.isFinite(Number(offset))?Math.max(0,Math.floor(Number(offset)/50)*50):0;
 const start=Math.min(requested,Math.max(0,Math.ceil(result.rows.length/50)-1)*50);
 return {category:selected,...result,rows:result.rows.slice(start,start+50),total:result.rows.length,offset:start,latestYear:book.latestYear,referenceEvent:book.referenceEvent,
  highlights:recordCategories.map(c=>{const data=book.metrics.get(c.id),leader=data.rows[0];return {id:c.id,title:c.title,unit:c.unit,total:data.rows.length,leader:leader?{...leader,evidence:[]}:null,ties:leader?data.rows.filter(r=>r.value===leader.value).length:0};})};
}
