import {titleCase,eventLabel,readableValue} from './language.js?v=0.17.1';
import {eventType} from './narrative.js?v=0.17.1';
const valid=value=>typeof value==='string'&&/^\d+$/.test(value);
const array=value=>value===undefined?[]:Array.isArray(value)?value:[value];
export const culturalKinds=new Set(['artifacts','written_contents','poetic_forms','musical_forms','dance_forms']);
export function cultureLabel(record){const name=record.data?.item?.name_string;return record.kind==='historical_events'?eventLabel(eventType(record.data)):titleCase(record.kind==='artifacts'&&(!record.data.name)&&typeof name==='string'?name:record.label);}
export function cultureReferences(record){const refs=[];const add=(kind,id,path,role)=>{if(valid(id))refs.push({kind,id,path,role});};
 for(const [source,d] of [['merged',record.data],['plus',record.supplement]]){if(!d)continue;
 if(record.kind==='artifacts'){for(const value of array(d.writing))add('written_contents',value,source+'.writing','Written content');for(const value of array(d.item?.page_written_content_id))add('written_contents',value,source+'.item.page_written_content_id','Written content');add('historical_figures',d.holder_hfid,source+'.holder_hfid','Recorded physical holder');add('sites',d.site_id,source+'.site_id','Recorded site');}
 if(record.kind==='written_contents'){add('historical_figures',d.author_hfid??d.author,source+'.author','Author');const forms={poem:'poetic_forms',musicalcomposition:'musical_forms',choreography:'dance_forms'};const form=forms[String(d.form||d.type||'').toLowerCase().replace(/[ _]/g,'')];if(form)add(form,d.form_id,source+'.form_id','Artistic form');
 for(const [i,reference] of array(d.reference).entries()){const kind={WRITTEN_CONTENT:'written_contents',HISTORICAL_EVENT:'historical_events',POETIC_FORM:'poetic_forms',SITE:'sites',ENTITY:'entities'}[reference?.type];if(kind)add(kind,reference.id,`${source}.reference.${i}`,'Reference ('+readableValue(reference.type)+')');}
 }
 if(record.kind==='historical_events'){const type=String(d.type||'').replaceAll('_',' ');const form={'poetic form created':'poetic_forms','musical form created':'musical_forms','dance form created':'dance_forms'}[type];if(form)add(form,d.form_id,source+'.form_id','Created form');}
 }
 return refs;
}
export function cultureFacts(record){const d=record.data;
 if(record.kind==='artifacts')return [['Item',titleCase(d.item?.name_string)||'Not recorded'],['Item type',readableValue(d.item_type)||'Not recorded'],['Subtype',readableValue(d.item_subtype)||'Not recorded'],['Material',readableValue(d.mat)||'Not recorded'],['Page count',d.page_count||'Not recorded']];
 if(record.kind==='written_contents')return [['Title',titleCase(d.title)||'Untitled work'],['Form (source)',readableValue(d.form||d.type)||'Not recorded'],['Style (source)',readableValue(d.style).replace(/:(\d+)/g,' ($1)')||'Not recorded'],['Page range',d.page_start!==undefined&&d.page_end!==undefined?`${d.page_start}–${d.page_end}`:'Not recorded']];return [];
}
export function descriptionParagraphs(value){return typeof value==='string'?value.split(/\[B\]|\r?\n/).map(s=>s.trim()).filter(Boolean):[];}
