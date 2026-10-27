import test from 'node:test';import assert from 'node:assert/strict';
import {narrateEvent,eventType,lifeSummary,figureRelationships,filterEvents} from '../js/data/narrative.js';
const refs=story=>story.tokens.filter(t=>typeof t==='object');
const text=story=>story.tokens.map(t=>typeof t==='string'?t:`[${t.kind}:${t.id}]`).join('');
test('death aliases preserve victim/killer roles and standard field precedence',()=>{
 const story=narrateEvent({type:'hist_figure_died',hfid:'1',victim_hf:'99',slayer_hfid:'2',site_id:'3',cause:'struck'});
 assert.equal(eventType({type:'hf_died'}),'hf died');assert.deepEqual(refs(story).map(t=>t.id),['1','2','3']);assert.match(text(story),/\[historical_figures:1\] was killed by/);assert.match(text(story),/was killed by \[historical_figures:2\]/);
});
test('missing and sentinel references never become links; unnamed killer details survive',()=>{
 const story=narrateEvent({type:'hf died',hfid:'-1',slayer_hfid:'-1',slayer_race:'DRAGON',slayer_caste:'FEMALE',site_id:'-1'});
 assert.equal(refs(story).length,0);assert.match(text(story),/unidentified figure/);assert.match(text(story),/dragon \(female\)/);assert.doesNotMatch(text(story),/ at /);
});
test('wounds and abductions keep actor and target distinct',()=>{
 assert.deepEqual(refs(narrateEvent({type:'hf wounded',woundee_hfid:'1',wounder_hfid:'2'})).map(t=>t.id),['2','1']);
 assert.deepEqual(refs(narrateEvent({type:'hf abducted',snatcher_hfid:'4',target_hfid:'5'})).map(t=>t.id),['4','5']);
});
test('unknown events retain an explicit fallback and user text stays plain tokens',()=>{
 const story=narrateEvent({type:'future <script> event'});assert.equal(story.fallback,true);assert.match(text(story),/future <script> event/i);assert.match(text(story),/No prose template/);
});
test('life dates allow prehistory, qualify year differences, and do not infer survival',()=>{
 assert.match(lifeSummary({birth_year:'-20',death_year:'10'}).find(([k])=>k==='Lifespan')[1],/30 calendar years/);
 assert.match(lifeSummary({death_year:'-1'}).find(([k])=>k==='Death')[1],/does not prove/);
 assert.match(lifeSummary({birth_year:'20',death_year:'10'}).find(([k])=>k==='Lifespan')[1],/Inconsistent/);
 assert.equal(lifeSummary({birth_year:''}).find(([k])=>k==='Birth')[1],'Not recorded');
});
test('relationship labels preserve direction and repeated source links',()=>{
 assert.deepEqual(figureRelationships({hf_link:[{hfid:'2',link_type:'child'},{hfid:'3',link_type:'spouse'}]}).map(r=>[r.id,r.label]),[['2','Child'],['3','Spouse']]);
});
test('timeline filters compose; major preset keeps unknown events; date bounds exclude undated',()=>{
 const rows=[{id:'1',year:10,eventType:'hf died'},{id:'2',year:null,eventType:'new type'},{id:'3',year:20,eventType:'change hf job'},{id:'4',year:-20,eventType:'hf died'}];
 assert.deepEqual(filterEvents(rows,{preset:'major'}).map(r=>r.id),['1','2','4']);
 assert.deepEqual(filterEvents(rows,{from:'0',to:'10',type:'hf died'}).map(r=>r.id),['1']);
 assert.deepEqual(filterEvents(rows,{to:'0'}).map(r=>r.id),['4']);
 assert.equal(filterEvents(rows,{}).length,4);
});
