import test from 'node:test';
import assert from 'node:assert/strict';
import {normalise,searchEntries,collectReferences,eventDate,compareEvents,recordURL} from '../js/data/exploration.js';
const row=(kind,id,label,data={})=>({key:JSON.stringify([kind,id]),kind,id,label,search:normalise(label),...eventDate(data)});
test('search preserves names, folds accents, prioritises exact names and filters IDs by family',()=>{
 const rows=[row('sites','2','Élan Hall'),row('historical_figures','2','Élan'),row('sites','3','Other')];
 assert.deepEqual(searchEntries(rows,{q:'ELAN'}).rows.map(r=>r.label),['Élan','Élan Hall']);
 assert.equal(searchEntries(rows,{q:'#2',kind:'sites'}).rows[0].label,'Élan Hall');
 assert.equal(searchEntries(rows,{q:'missing'}).total,0);
 assert.equal(searchEntries(rows,{q:'elan',offset:1,limit:1}).rows.length,1);
});
test('references preserve nested paths and source roles; sentinels and ambiguous fields do not link',()=>{
 const refs=collectReferences({hf_link:[{hfid:'2',link_type:'spouse'},{hfid:'-1'}],slayer_hf:'7',site:'3',target:'8',id:'9'});
 assert.deepEqual(refs.map(r=>[r.kind,r.id,r.role]),[['historical_figures','2','hfid'],['historical_figures','7','slayer_hf'],['sites','3','site']]);
 assert.equal(refs[0].path,'0.hf_link.hfid');
});
test('chronology retains negative years, unknown dates last, stable IDs for ties',()=>{
 const rows=[row('historical_events','4','unknown'),row('historical_events','10','tie',{year:'1'}),row('historical_events','2','tie',{year:'1'}),row('historical_events','8','early',{year:'-10'})];
 assert.deepEqual(rows.sort(compareEvents).map(r=>r.id),['8','2','10','4']);
 assert.equal(eventDate({year:'bad',seconds72:'-1'}).year,null);
});
test('record routes encode source IDs and preserve search context',()=>{assert.equal(recordURL('world','sites','a/b','?q=Urist'),'#/world/world/record/sites/a%2Fb?q=Urist');});
