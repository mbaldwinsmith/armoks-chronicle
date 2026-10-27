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
export const formatters={
 'hf died':d=>[hf(d,'hfid','victim_hf'),' died',...(scalar(d,'slayer_hfid','slayer_hf')?['; the recorded killer was ',hf(d,'slayer_hfid','slayer_hf')]:scalar(d,'slayer_race')?['; the unnamed killer is recorded as ',text(d,'slayer_race'),...(scalar(d,'slayer_caste')?[' (',text(d,'slayer_caste'),')']:[])]:[]),...where(d),...(scalar(d,'cause','death_cause')?['. Recorded cause: ',text(d,'cause','death_cause')]:[])],
 'hf wounded':d=>[hf(d,'wounder_hfid','wounder'),' wounded ',hf(d,'woundee_hfid','woundee'),...where(d)],
 'hf abducted':d=>[hf(d,'snatcher_hfid'),' abducted ',hf(d,'target_hfid'),...where(d)],
 'change hf job':d=>[subject(d),' changed occupation',...(scalar(d,'old_job')?[' from ',text(d,'old_job')]:[]),...(scalar(d,'new_job')?[' to ',text(d,'new_job')]:[]),...where(d)],
 'change hf state':d=>[subject(d),' changed state to “',text(d,'state'),'”',...where(d)],
 'add hf entity link':d=>[subject(d),' gained a recorded ',text(d,'link','link_type'),' link to ',entity(d,'civ_id','civ','entity_id','entity')],
 'remove hf entity link':d=>[subject(d),' lost a recorded ',text(d,'link','link_type'),' link to ',entity(d,'civ_id','civ','entity_id','entity')],
 'add hf hf link':d=>[subject(d),' gained a recorded ',text(d,'link_type','link'),' link to ',hf(d,'hfid_target','hf_target')],
 'remove hf hf link':d=>[subject(d),' lost a recorded ',text(d,'link_type','link'),' link to ',hf(d,'hfid_target','hf_target')],
 'created site':d=>[site(d),' was founded; the recorded civilisation was ',entity(d,'civ_id','civ')],
 'reclaim site':d=>[entity(d,'civ_id','civ'),' reclaimed ',site(d)],
 'hf attacked site':d=>[hf(d,'attacker_hfid'),' attacked ',site(d)],
 'hf destroyed site':d=>[hf(d,'attacker_hfid'),' destroyed ',site(d)],
 'attacked site':d=>[entity(d,'attacker_civ_id'),' attacked ',site(d),'; the recorded defender was ',entity(d,'defender_civ_id')],
 'field battle':d=>['A field battle involved attacker ',entity(d,'attacker_civ_id'),' and defender ',entity(d,'defender_civ_id')],
 'artifact created':d=>[hf(d,'hist_figure_id','creator_hfid'),' created ',artifact(d),...where(d)],
 'artifact possessed':d=>[artifact(d),' was recorded in the possession of ',hf(d,'hist_figure_id'),...where(d)],
 'artifact claim formed':d=>['A claim was recorded for ',artifact(d),'; claim type: ',text(d,'claim'),...(scalar(d,'hist_figure_id')?['; figure: ',hf(d,'hist_figure_id')]:[]),...(scalar(d,'entity_id')?['; organisation: ',entity(d,'entity_id')]:[])],
 'artifact copied':d=>['A copy of ',artifact(d),' was recorded from ',ref(d,'sites',['source_site_id'],'an unidentified site'),' to ',ref(d,'sites',['dest_site_id'],'an unidentified site')],
 'artifact stored':d=>[artifact(d),' was stored',...where(d)],
 'artifact lost':d=>[artifact(d),' was lost',...where(d)],
 'artifact found':d=>[hf(d,'hist_figure_id'),' found ',artifact(d),...where(d)],
 'artifact given':d=>[artifact(d),' was given by ',scalar(d,'giver_hist_figure_id')?hf(d,'giver_hist_figure_id'):entity(d,'giver_entity_id'),' to ',scalar(d,'receiver_hist_figure_id')?hf(d,'receiver_hist_figure_id'):entity(d,'receiver_entity_id')],
 'written content composed':d=>[hf(d,'hist_figure_id'),' composed ',ref(d,'written_contents',['wc_id','written_content_id'],'an unidentified written work'),...where(d)],
 'knowledge discovered':d=>[subject(d),' discovered knowledge recorded as “',text(d,'knowledge'),'”'],
 'hf learns secret':d=>[hf(d,'student_hfid','student'),' learned a secret',...(scalar(d,'teacher_hfid','teacher')?[' from ',hf(d,'teacher_hfid','teacher')]:[]),...(scalar(d,'secret_text')?[': ',text(d,'secret_text')]:[])],
 'changed creature type':d=>[hf(d,'changee_hfid','changee'),' changed from ',text(d,'old_race'),' to ',text(d,'new_race')],
 'item stolen':d=>[hf(d,'histfig'),' stole an item',...(scalar(d,'item_type')?[' recorded as ',text(d,'item_type')]:[]),...where(d)],
 'entity created':d=>[entity(d,'entity_id','entity'),' was established',...where(d)],
 'entity dissolved':d=>[entity(d,'entity_id','entity'),' was dissolved',...(scalar(d,'reason')?['; recorded reason: ',text(d,'reason')]:[])],
 'hf gains secret goal':d=>[subject(d),' gained the secret goal “',text(d,'secret_goal'),'”']
};
export function narrateEvent(data){
 const type=eventType(data),formatter=formatters[type];
 const tokens=formatter?formatter(data):['Recorded event: ',type,...where(data),'. No prose template is available; inspect the source fields and linked roles'];
 return {type,fallback:!formatter,tokens:[...tokens,'.']};
}
export const routineTypes=new Set(['change hf job','change hf state','add hf entity link','remove hf entity link','add hf site link','remove hf site link']);
export function filterEvents(rows,{type='',from='',to='',preset='all'}={}){
 const lower=from!==''&&Number.isFinite(Number(from))?Number(from):null,upper=to!==''&&Number.isFinite(Number(to))?Number(to):null;
 return rows.filter(row=>(!type||row.eventType===type)&&(preset!=='major'||!routineTypes.has(row.eventType))&&((lower===null&&upper===null)||(row.year!==null&&(lower===null||row.year>=lower)&&(upper===null||row.year<=upper))));
}
export function lifeSummary(data){
 const year=key=>typeof data[key]==='string'&&data[key].trim()!==''&&data[key]!=='-1'&&Number.isFinite(Number(data[key]))?Number(data[key]):null;
 const birth=year('birth_year'),death=year('death_year'),appeared=year('appeared');
 const facts=[['Race',data.race||'Not recorded'],['Caste',data.caste||'Not recorded'],['Sex (source value)',data.sex===undefined||data.sex==='-1'?'Not recorded':data.sex],['Birth',birth===null?'Not recorded':`Year ${birth}`],['First appearance',appeared===null?'Not recorded':`Year ${appeared}`],['Death',death===null?'No death year recorded; this does not prove the figure is alive.':`Year ${death}`]];
 if(birth!==null&&death!==null)facts.push(['Lifespan',death>=birth?`${death-birth} calendar years between recorded birth and death years; exact age depends on dates.`:'Inconsistent birth/death years; age not calculated.']);
 return facts;
}
export function figureRelationships(data){
 const out=[];for(const [field,kind,idKey] of [['hf_link','historical_figures','hfid'],['entity_link','entities','entity_id'],['site_link','sites','site_id']]){
  const values=Array.isArray(data[field])?data[field]:data[field]?[data[field]]:[];
  for(const value of values)if(value&&typeof value==='object')out.push({kind,id:value[idKey],label:words(value.link_type||'unspecified relationship'),field});
 }return out;
}
