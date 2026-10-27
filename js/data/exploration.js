export const kindNames = {historical_figures:'Historical figures',historical_events:'Historical events',sites:'Sites',entities:'Organisations',artifacts:'Artifacts',written_contents:'Written works',regions:'Regions',underground_regions:'Underground regions'};
export const normalise = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('en').trim();
export const recordKey = (kind,id) => JSON.stringify([kind,String(id)]);
export const recordURL = (world,kind,id,query='') => `#/world/${encodeURIComponent(world)}/record/${encodeURIComponent(kind)}/${encodeURIComponent(id)}${query}`;
const references = Object.fromEntries([
 ['historical_figures','hfid histfig_id historical_figure_id histfig hf slayer_hfid slayer_hf victim_hf creator_hfid appointer_hfid promise_to_hfid hf_target builder_hf identity_histfig_id'],
 ['sites','site_id site stash_site'], ['entities','entity_id entity civ_id civ site_civ_id site_civ'],
 ['artifacts','artifact_id artifact'], ['regions','region_id'], ['underground_regions','underground_region_id'], ['written_contents','written_content_id']
].flatMap(([kind,keys])=>keys.split(' ').map(key=>[key,kind])));
// Only documented, unambiguous ID fields. A generic target, owner, or id is not enough.
export function referenceKind(field,value) {
 return typeof value==='string' && /^\d+$/.test(value) ? references[field] || null : null;
}
export function collectReferences(data,path=[],result=[]) {
 if(!data || typeof data!=='object')return result;
 for(const [field,value] of Object.entries(data)) {
  const next=[...path,field];
  if(Array.isArray(value))value.forEach((item,i)=>collectReferences({[field]:item},[...path,String(i)],result));
  else if(value && typeof value==='object')collectReferences(value,next,result);
  else {const kind=referenceKind(field,value);if(kind)result.push({kind,id:value,path:next.join('.'),role:field});}
 }
 return result;
}
export function eventDate(data) {
 const year=Number(data?.year),seconds=Number(data?.seconds72);
 return {year:data?.year!==undefined && Number.isFinite(year)?year:null,seconds:data?.seconds72!==undefined&&Number.isFinite(seconds)&&seconds>=0?seconds:null};
}
export function compareEvents(a,b) {
 return (a.year??Infinity)-(b.year??Infinity) || (a.seconds??Infinity)-(b.seconds??Infinity) || String(a.id).localeCompare(String(b.id),'en',{numeric:true});
}
export function searchEntries(entries,{q='',kind='',sort='name',offset=0,limit=50}={}) {
 const term=normalise(q),idQuery=/^#\d+$/.test(term)?term.slice(1):null;
 const hits=entries.filter(row=>(!kind||row.kind===kind)&&(!term||(idQuery!==null?row.id===idQuery:row.search.includes(term)||row.id===term)));
 hits.sort((a,b)=>sort==='year' ? compareEvents(a,b)||a.key.localeCompare(b.key) : Number(b.search===term)-Number(a.search===term)||a.search.localeCompare(b.search,'en')||a.key.localeCompare(b.key,'en',{numeric:true}));
 return {total:hits.length,rows:hits.slice(offset,offset+limit).map(({search,...row})=>row)};
}
