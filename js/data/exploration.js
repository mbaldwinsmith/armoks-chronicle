export const kindNames = {historical_eras:'Historical eras',historical_event_collections:'Historical collections',historical_figures:'Historical figures',historical_events:'Historical events',sites:'Sites',entities:'Organisations',artifacts:'Artifacts',written_contents:'Written works',poetic_forms:'Poetic forms',musical_forms:'Musical forms',dance_forms:'Dance forms',regions:'Regions',underground_regions:'Underground regions'};
export const normalise = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('en').trim();
export const recordKey = (kind,id) => JSON.stringify([kind,String(id)]);
export const recordURL = (world,kind,id,query='') => `#/world/${encodeURIComponent(world)}/record/${encodeURIComponent(kind)}/${encodeURIComponent(id)}${query}`;
const references = Object.fromEntries([
 ['historical_figures','doer_hfid hfid histfig_id historical_figure_id histfig hf slayer_hfid slayer_hf victim_hf creator_hfid appointer_hfid promise_to_hfid hf_target builder_hf identity_histfig_id hist_figure_id hist_fig_id builder_hfid woundee_hfid wounder_hfid woundee wounder hfid_target target_hfid snatcher_hfid attacker_hfid group_1_hfid group_2_hfid group_hfid student_hfid teacher_hfid student teacher changee_hfid changer_hfid changee changer giver_hist_figure_id receiver_hist_figure_id author_hfid holder_hfid'],
 ['sites','site_id site stash_site source_site_id dest_site_id'], ['entities','entity_id entity civ_id civ site_civ_id site_civ attacker_civ_id defender_civ_id giver_entity_id receiver_entity_id'],
 ['artifacts','artifact_id artifact'], ['regions','region_id'], ['underground_regions','underground_region_id'], ['written_contents','written_content_id wc_id']
].flatMap(([kind,keys])=>keys.split(' ').map(key=>[key,kind])));
// Only documented, unambiguous ID fields. A generic target, owner, or id is not enough.
export function referenceKind(field,value) {
 return typeof value==='string' && /^\d+$/.test(value) ? references[field] || null : null;
}
export function collectReferences(data,path=[],result=[]) {
 function visit(value,field,parts) {
  if(Array.isArray(value)){value.forEach((item,i)=>visit(item,field,[...parts,String(i)]));return;}
  if(value && typeof value==='object'){for(const [key,item] of Object.entries(value))visit(item,key,[...parts,key]);return;}
  const kind=referenceKind(field,value);if(kind)result.push({kind,id:value,path:parts.join('.'),role:field});
 }
 if(data && typeof data==='object')for(const [field,value] of Object.entries(data))visit(value,field,[...path,field]);
 return result;
}
export function eventDate(data) {
 const year=Number(data?.year),seconds=Number(data?.seconds72);
 return {year:typeof data?.year==='string' && data.year.trim()!=='' && Number.isSafeInteger(year)&&year!==-1?year:null,seconds:data?.seconds72!==undefined&&Number.isFinite(seconds)&&seconds>=0?seconds:null};
}
export function compareEvents(a,b) {
 return (a.year??Infinity)-(b.year??Infinity) || (a.seconds??Infinity)-(b.seconds??Infinity) || String(a.id).localeCompare(String(b.id),'en',{numeric:true});
}
export function searchEntries(entries,{q='',kind='',sort='name',offset=0,limit=50}={}) {
 const term=normalise(q),idQuery=/^#\d+$/.test(term)?term.slice(1):null;
 const hits=entries.filter(row=>(!kind||row.kind===kind)&&(!term||(idQuery!==null?row.id===idQuery:row.search.includes(term)||row.id===term||row.aliases?.some(alias=>alias.includes(term)))));
 hits.sort((a,b)=>sort==='year' ? compareEvents(a,b)||a.key.localeCompare(b.key) : Number(b.search===term)-Number(a.search===term)||a.search.localeCompare(b.search,'en')||a.key.localeCompare(b.key,'en',{numeric:true}));
 return {total:hits.length,rows:hits.slice(offset,offset+limit).map(({search,aliases,...row})=>row)};
}
