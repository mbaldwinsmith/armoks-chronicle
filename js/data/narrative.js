import {titleCase,readableValue,eventLabel} from './language.js?v=0.20.1';
// Deterministic export renderings, not inferred motives or generated fiction.
export const words=value=>String(value??'').replaceAll('_',' ');
const aliases={'hist figure died':'hf died','hist figure wounded':'hf wounded','created building':'created structure','change creature type':'changed creature type','hist figure new pet':'hf new pet','war peace accepted':'peace accepted','war peace rejected':'peace rejected'};
export function eventType(data){const type=words(data?.type).toLowerCase().trim().replace(/\s+/g,' ');return aliases[type]||type||'unknown event';}
const scalar=(d,...keys)=>keys.map(k=>d[k]).find(v=>typeof v==='string'&&v.trim()!==''&&v!=='-1');
const ref=(d,kind,keys,unknown)=>{const id=scalar(d,...keys);return id&&/^\d+$/.test(id)?{kind,id,unknown}:unknown;};
const hf=(d,...keys)=>ref(d,'historical_figures',keys,'an unidentified figure');
const site=d=>ref(d,'sites',['site_id','site'],'an unidentified site');
const entity=(d,...keys)=>ref(d,'entities',keys,'an unidentified organisation');
const artifact=d=>ref(d,'artifacts',['artifact_id','artifact'],'an unidentified artifact');
const subject=d=>hf(d,'hfid','hist_figure_id','histfig','hf');
const where=d=>scalar(d,'site_id','site')?[' at ',site(d)]:[];
const text=(d,...keys)=>words(scalar(d,...keys)||'not recorded');
const article=value=>/^[aeiou]/i.test(value)?'an ':'a ';
function stateStory(d){const state=text(d,'state').toLowerCase();if(['settled','settler'].includes(state))return [subject(d),' settled',...where(d)];if(['wandering','wanderer'].includes(state))return [subject(d),' began wandering',...where(d)];if(['visiting','visitor'].includes(state))return scalar(d,'site_id','site')?[subject(d),' visited ',site(d)]:[subject(d),' became a visitor'];if(state==='refugee')return [subject(d),' became a refugee',...where(d)];return [subject(d),' entered the state “',text(d,'state'),'”',...where(d)];}
function jobStory(d){const next=scalar(d,'new_job'),old=scalar(d,'old_job');if(next&&next.toLowerCase()!=='standard'){const job=words(next).toLowerCase();return [subject(d),' became ',article(job),job,...where(d)];}if(old&&old.toLowerCase()!=='standard'){const job=words(old).toLowerCase();return [subject(d),' stopped working as ',article(job),job,...where(d)];}return [subject(d),' changed occupation',...where(d)];}
function affiliationStory(d,remove=false){const relation=text(d,'link','link_type').toLowerCase(),organisation=entity(d,'civ_id','civ','entity_id','entity');if(relation==='member')return [subject(d),remove?' was no longer a member of ':' joined ',organisation];if(relation==='enemy')return [subject(d),remove?' was no longer listed as an enemy of ':' became an enemy of ',organisation];if(relation==='prisoner')return [subject(d),remove?' was no longer listed as a prisoner of ':' became a prisoner of ',organisation];if(relation==='position'){const position=scalar(d,'position');return position&&!/^\d+$/.test(position)?[subject(d),remove?' left the office of ':' became ',...(remove?[]:[article(words(position).toLowerCase())]),words(position).toLowerCase(),' in ',organisation]:[subject(d),remove?' left office in ':' took office in ',organisation];}return [subject(d),remove?' ended a ':' formed a ',relation,' association with ',organisation];}
function deathStory(d){const victim=hf(d,'hfid','victim_hf'),killer=scalar(d,'slayer_hfid','slayer_hf')?hf(d,'slayer_hfid','slayer_hf'):null,cause=text(d,'cause','death_cause').toLowerCase();
 if(cause==='old age')return [victim,' died of old age',...where(d),...(killer?['. The record also names ',killer,' as the killer']:[])];
 if(killer)return [victim,cause==='shot'?' was shot by ':cause==='murder'?' was murdered by ':' was killed by ',killer,...where(d)];
 if(scalar(d,'slayer_race'))return [victim,' was killed by an unnamed ',words(d.slayer_race).toLowerCase(),...(scalar(d,'slayer_caste')?[' (',words(d.slayer_caste).toLowerCase(),')']:[]),...where(d)];
 const endings={drown:' drowned',drowned:' drowned','drown self':' drowned',starvation:' died of starvation',thirst:' died of thirst',suffocation:' suffocated','leapt from height':' died after a fall',shot:' was shot',murder:' was murdered','execution generic':' was executed','struck down':' was struck down',struck:' was struck down'};return [victim,endings[cause]||' died',...where(d),...(!endings[cause]&&cause!=='not recorded'?['; cause: ',cause]:[])];}
export const formatters={
 'hf died':deathStory,
 'hf simple battle event':d=>[hf(d,'group_1_hfid'),' clashed with ',hf(d,'group_2_hfid'),...where(d)],
 'hf wounded':d=>[hf(d,'wounder_hfid','wounder'),' wounded ',hf(d,'woundee_hfid','woundee'),...where(d)],
 'hf abducted':d=>[hf(d,'snatcher_hfid'),' abducted ',hf(d,'target_hfid'),...where(d)],
 'change hf job':jobStory,
 'change hf state':stateStory,
 'add hf entity link':d=>affiliationStory(d),
 'remove hf entity link':d=>affiliationStory(d,true),
 'add hf hf link':d=>text(d,'link_type','link')==='spouse'?[subject(d),' married ',hf(d,'hfid_target','hf_target')]:[subject(d),' formed a ',text(d,'link_type','link'),' relationship with ',hf(d,'hfid_target','hf_target')],
 'remove hf hf link':d=>text(d,'link_type','link')==='spouse'?[subject(d),' was no longer recorded as married to ',hf(d,'hfid_target','hf_target')]:[subject(d),' ended a ',text(d,'link_type','link'),' relationship with ',hf(d,'hfid_target','hf_target')],
 'created site':d=>[entity(d,'civ_id','civ'),' founded ',site(d)],
 'reclaim site':d=>[entity(d,'civ_id','civ'),' reclaimed ',site(d)],
 'hf attacked site':d=>[hf(d,'attacker_hfid'),' attacked ',site(d)],
 'hf destroyed site':d=>[hf(d,'attacker_hfid'),' destroyed ',site(d)],
 'attacked site':d=>[entity(d,'attacker_civ_id'),' attacked ',site(d),'; the recorded defender was ',entity(d,'defender_civ_id')],
 'field battle':d=>[entity(d,'attacker_civ_id'),' fought ',entity(d,'defender_civ_id'),' in a field battle'],
 'artifact created':d=>[hf(d,'hist_figure_id','creator_hfid'),' created ',artifact(d),...where(d)],
 'artifact possessed':d=>[hf(d,'hist_figure_id'),' took possession of ',artifact(d),...where(d)],
 'artifact claim formed':d=>['A claim was recorded for ',artifact(d),'; claim type: ',text(d,'claim'),...(scalar(d,'hist_figure_id')?['; figure: ',hf(d,'hist_figure_id')]:[]),...(scalar(d,'entity_id')?['; organisation: ',entity(d,'entity_id')]:[])],
 'artifact copied':d=>[artifact(d),' was copied from ',ref(d,'sites',['source_site_id'],'an unidentified site'),' to ',ref(d,'sites',['dest_site_id'],'an unidentified site')],
 'artifact stored':d=>[artifact(d),' was stored',...where(d)],
 'artifact lost':d=>[artifact(d),' was lost',...where(d)],
 'artifact found':d=>[hf(d,'hist_figure_id'),' found ',artifact(d),...where(d)],
 'artifact given':d=>[scalar(d,'giver_hist_figure_id')?hf(d,'giver_hist_figure_id'):entity(d,'giver_entity_id'),' gave ',artifact(d),' to ',scalar(d,'receiver_hist_figure_id')?hf(d,'receiver_hist_figure_id'):entity(d,'receiver_entity_id')],
 'written content composed':d=>[hf(d,'hist_figure_id'),' composed ',ref(d,'written_contents',['wc_id','written_content_id'],'an unidentified written work'),...where(d)],
 'knowledge discovered':d=>[subject(d),' discovered knowledge recorded as “',text(d,'knowledge'),'”'],
 'hf learns secret':d=>[hf(d,'student_hfid','student'),' learned a secret',...(scalar(d,'teacher_hfid','teacher')?[' from ',hf(d,'teacher_hfid','teacher')]:[]),...(scalar(d,'secret_text')?[': ',text(d,'secret_text')]:[])],
 'changed creature type':d=>[hf(d,'changee_hfid','changee'),' changed from ',text(d,'old_race'),' to ',text(d,'new_race')],
 'item stolen':d=>[hf(d,'histfig'),' stole an item',...(scalar(d,'item_type')?[' recorded as ',text(d,'item_type')]:[]),...where(d)],
 'peace accepted':d=>['A peace proposal was accepted',...where(d)],
 'peace rejected':d=>['A peace proposal was rejected',...where(d)],
 'add hf site link':d=>[subject(d),' became associated with ',site(d),...(scalar(d,'link_type','link')?[' as ',article(text(d,'link_type','link')),text(d,'link_type','link')]:[])],
 'remove hf site link':d=>[subject(d),' was no longer recorded as ',article(text(d,'link_type','link')),text(d,'link_type','link'),' at ',site(d)],
 'created structure':d=>[hf(d,'builder_hfid','builder_hf'),' built a structure',...where(d)],
 'hf new pet':d=>[subject(d),' acquired a new pet',...where(d)],
 'entity created':d=>[entity(d,'entity_id','entity'),' was established',...where(d)],
 'entity dissolved':d=>[entity(d,'entity_id','entity'),' was dissolved',...(scalar(d,'reason')?['; recorded reason: ',text(d,'reason')]:[])],
 'hf gains secret goal':d=>[subject(d),' gained the secret goal “',text(d,'secret_goal'),'”']
};
export function narrateEvent(data){
 const type=eventType(data),formatter=formatters[type];
 const tokens=formatter?formatter(data):['Recorded event: ',eventLabel(type),...where(data),'. No prose template is available; inspect the source fields and linked roles'];
 if(typeof tokens[0]==='string')tokens[0]=tokens[0].replace(/^\p{Ll}/u,letter=>letter.toLocaleUpperCase('en'));
 return {type,fallback:!formatter,tokens:[...tokens,'.']};
}
export const routineGroups={
 jobs:{label:'Occupation changes',types:['change hf job']},
 movement:{label:'Settlement and movement',types:['change hf state']},
 affiliations:{label:'Organisation and site affiliations',types:['add hf entity link','remove hf entity link','add hf site link','remove hf site link']}
};
export const routineTypes=new Set(Object.values(routineGroups).flatMap(group=>group.types));
// Explicit categories: unknown types remain visible in All/Major, without a guessed classification.
export const warfareTypes=new Set(['hf died','hf wounded','hf abducted','hf simple battle event','hf attacked site','hf destroyed site','attacked site','destroyed site','field battle','site taken over','war field battle','war attacked site','peace accepted','peace rejected','war peace accepted','war peace rejected','war declared','plundered site','razed structure']);
export const personalTypes=new Set(['hf died','hf wounded','hf abducted','change hf job','change hf state','add hf entity link','remove hf entity link','add hf site link','remove hf site link','add hf hf link','remove hf hf link','hf new pet','hf learns secret','hf gains secret goal','changed creature type','artifact created','artifact possessed','artifact found','artifact given','written content composed','knowledge discovered']);
export const readingPresets={all:'All Events',major:'Major Events',warfare:'Warfare',personal:'Personal History'};
export function filterEvents(rows,{type='',from='',to='',preset='all',exclude=[]}={}){
 const lower=from!==''&&Number.isFinite(Number(from))?Number(from):null,upper=to!==''&&Number.isFinite(Number(to))?Number(to):null;
 const hidden=new Set((Array.isArray(exclude)?exclude:[]).flatMap(key=>routineGroups[key]?.types||[]));
 return rows.filter(row=>(!type||row.eventType===type)&&!hidden.has(row.eventType)&&(preset!=='major'||!routineTypes.has(row.eventType))&&(preset!=='warfare'||warfareTypes.has(row.eventType))&&(preset!=='personal'||personalTypes.has(row.eventType))&&((lower===null&&upper===null)||(row.year!==null&&(lower===null||row.year>=lower)&&(upper===null||row.year<=upper))));
}
export function lifeSummary(data){
 const year=key=>typeof data[key]==='string'&&data[key].trim()!==''&&data[key]!=='-1'&&Number.isFinite(Number(data[key]))?Number(data[key]):null;
 const birth=year('birth_year'),death=year('death_year'),appeared=year('appeared');
 const facts=[['Race',readableValue(data.race)||'Not recorded'],['Caste',readableValue(data.caste)||'Not recorded'],['Sex (source value)',data.sex===undefined||data.sex==='-1'?'Not recorded':data.sex],['Birth',birth===null?'Not recorded':`Year ${birth}`],['First appearance',appeared===null?'Not recorded':`Year ${appeared}`],['Death',death===null?'No death year recorded; this does not prove the figure is alive.':`Year ${death}`]];
 if(birth!==null&&death!==null)facts.push(['Lifespan',death>=birth?`${death-birth} calendar years between recorded birth and death years; exact age depends on dates.`:'Inconsistent birth/death years; age not calculated.']);
 return facts;
}
export function figureRelationships(data){
 const out=[];for(const [field,kind,idKey] of [['hf_link','historical_figures','hfid'],['entity_link','entities','entity_id'],['site_link','sites','site_id']]){
  const values=Array.isArray(data[field])?data[field]:data[field]?[data[field]]:[];
  for(const value of values)if(value&&typeof value==='object')out.push({kind,id:value[idKey],label:readableValue(value.link_type||'unspecified relationship'),field});
 }return out;
}
