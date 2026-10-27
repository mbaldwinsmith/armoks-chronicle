import test from 'node:test';import assert from 'node:assert/strict';
import {filterEvents,eventType,narrateEvent} from '../js/data/narrative.js';
import {timelineSelection,timelineParams,timelineGroups} from '../js/data/timeline.js';
const rows=['change hf job','change hf state','add hf site link','hf died','knowledge discovered','item stolen','field battle','add hf hf link','future event'].map((eventType,i)=>({id:String(i),eventType,year:i===8?null:i-4}));
test('reading presets classify explicitly and retain unknown events in Major',()=>{
 assert.deepEqual(filterEvents(rows,{preset:'major'}).map(r=>r.id),['3','4','5','6','7','8']);
 assert.deepEqual(filterEvents(rows,{preset:'warfare'}).map(r=>r.id),['3','6']);
 assert.deepEqual(filterEvents(rows,{preset:'personal'}).map(r=>r.id),['0','1','2','3','4','7']);
 assert.equal(filterEvents(rows,{preset:'all'}).length,9);
});
test('routine exclusions compose with preset, exact type and inclusive year limits',()=>{
 assert.deepEqual(filterEvents(rows,{preset:'personal',exclude:['jobs','movement'],from:'-2',to:'0'}).map(r=>r.id),['2','3','4']);
 assert.equal(filterEvents(rows,{type:'change hf job',exclude:['jobs']}).length,0);
 assert.equal(filterEvents(rows,{exclude:['affiliations']}).length,8);
 assert.equal(filterEvents(rows,{from:'1'}).some(r=>r.year===null),false);
 assert.equal(filterEvents(rows,{from:'5',to:'1'}).length,0);
});
test('timeline URL state round trips without losing directory context and reset removes only timeline keys',()=>{
 const selection={type:'hf died',from:'-2',to:'20',preset:'personal',exclude:['jobs','affiliations']},params=new URLSearchParams('q=urist&kind=historical_figures&offset=50');
 const saved=timelineParams(params,selection,100);assert.deepEqual(timelineSelection(saved),selection);assert.equal(saved.get('eventOffset'),'100');assert.equal(saved.get('q'),'urist');
 const cleared=timelineParams(saved,{type:'',from:'',to:'',preset:'all',exclude:[]});assert.equal(cleared.toString(),params.toString());
 assert.deepEqual(timelineSelection(new URLSearchParams('eventPreset=future&eventExclude=jobs,bogus,__proto__')),{type:'',from:'',to:'',preset:'all',exclude:['jobs']});
});
test('year groups retain chronology, tied events and an explicit unknown-date group',()=>{
 const groups=timelineGroups([{id:'1',year:-2},{id:'2',year:1},{id:'3',year:1},{id:'4',year:null}]);assert.deepEqual(groups.map(g=>[g.label,g.rows.length]),[['Year -2',1],['Year 1',2],['Year Not Recorded',1]]);
 assert.deepEqual(timelineGroups([]),[]);
});
test('peace aliases receive prose without guessing participants or causes',()=>{
 const data={type:'war_peace_accepted',reason:'unknown'};assert.equal(eventType(data),'peace accepted');assert.equal(narrateEvent(data).tokens.join(''),'A peace proposal was accepted.');assert.equal(data.reason,'unknown');
});
