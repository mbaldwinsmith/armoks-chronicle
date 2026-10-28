import test from 'node:test';
import assert from 'node:assert/strict';
import {followThreads,threadReferences,threadSources,threadLimits} from '../js/data/threads.js';
import {recordKey} from '../js/data/exploration.js';
const record=(kind,id,data={})=>({kind,id:String(id),label:data.name||`${kind} ${id}`,data});
const lookup=records=>new Map(records.map(r=>[recordKey(r.kind,r.id),{...r,label:r.label}]));
test('source roles stay directed, incoming roles are never reversed and missing/self targets are excluded',()=>{
 const parent=record('historical_figures',1,{name:'Parent',hf_link:[{hfid:'2',link_type:'child'},{hfid:'999',link_type:'cousin'},{hfid:'1',link_type:'friend'}]}),child=record('historical_figures',2,{name:'Child'}),map=lookup([parent,child]);
 const outward=followThreads(parent,[],map),inward=followThreads(child,[parent],map);
 assert.equal(outward.rows.length,1);assert.equal(outward.rows[0].reason,'Parent lists Child as “Child”.');assert.equal(inward.rows[0].reason,outward.rows[0].reason);assert.equal(inward.rows[0].id,'1');assert(outward.missing>0);assert.equal(outward.rows[0].evidence[0].id,'1');
});
test('death and settlement recommendations reuse natural prose without swapping participants',()=>{
 const victim=record('historical_figures',1,{name:'Victim'}),killer=record('historical_figures',2,{name:'Killer'}),site=record('sites',3,{name:'Hall'}),death=record('historical_events',4,{type:'hf died',hfid:'1',slayer_hfid:'2',site_id:'3'}),settle=record('historical_events',5,{type:'change hf state',state:'settled',hfid:'1',site_id:'3'}),map=lookup([victim,killer,site,death,settle]);
 const data=followThreads(victim,[death,settle],map);assert(data.rows.find(r=>r.id==='2').reason.includes('Victim was killed by Killer at Hall.'));assert(data.rows.find(r=>r.id==='5').reason.includes('Victim settled at Hall.'));assert(!data.rows.some(r=>/friend|revenge/.test(r.reason)));assert.equal(data.rows.find(r=>r.id==='2').evidence[0].id,'4');
});
test('cultural authorship works in both directions; unrelated records do not create connections',()=>{
 const author=record('historical_figures',1,{name:'Author'}),work=record('written_contents',2,{author_hfid:'1'}),other=record('sites',3,{name:'Unrelated'}),map=lookup([author,work,other]);
 const result=followThreads(author,[work,other],map);assert.equal(result.rows.length,1);assert.equal(result.rows[0].kind,'written_contents');assert.match(result.rows[0].reason,/Author/);assert.equal(followThreads(work,[],map).rows[0].id,'1');
});
test('conflict membership supports wider wars, nested battles, event and participant source roles',()=>{
 const war=record('historical_event_collections',1,{type:'war',eventcol:'2'}),battle=record('historical_event_collections',2,{type:'battle',war_eventcol:'1',event:'3',attacking_hfid:'4'}),event=record('historical_events',3,{type:'hf died',hfid:'4'}),figure=record('historical_figures',4,{name:'Figure'}),map=lookup([war,battle,event,figure]);
 assert(threadReferences(battle).some(r=>r.kind==='historical_figures'&&r.id==='4'));const data=followThreads(battle,[war],map);assert(data.rows.some(r=>r.id==='1'&&r.reason.includes('Wider Conflict')));assert(data.rows.some(r=>r.id==='3'&&r.kind==='historical_events'));assert(followThreads(event,[battle],map).rows.some(r=>r.kind===battle.kind));
});
test('candidate bounds, deduplication, stable output, category diversity and truncation remain explicit',()=>{
 const root=record('sites',1,{name:'Hall'}),sources=Array.from({length:80},(_,i)=>record('historical_events',i,{type:'created site',site_id:'1',civ_id:'2'})),entity=record('entities',2,{name:'Founders'}),map=lookup([root,entity,...sources]);const before=JSON.stringify(sources),a=followThreads(root,sources,map),b=followThreads(root,sources,map);assert.equal(a.rows.length,threadLimits.candidates);assert(a.truncated);assert.deepEqual(a,b);assert.equal(JSON.stringify(sources),before);assert(a.rows.slice(0,6).some(r=>r.kind==='entities'));assert(a.rows.every(r=>r.evidence.length<=3));assert.equal(new Set(a.rows.map(r=>recordKey(r.kind,r.id))).size,a.rows.length);
});
test('source sampling is bounded and interleaves incoming families without a full-world scan',()=>{
 const rows=[...Array.from({length:100},(_,i)=>record('historical_events',i)),record('written_contents',1)],map=lookup(rows),sample=threadSources(map.keys(),map);assert.equal(sample.keys.length,60);assert(sample.truncated);assert.equal(JSON.parse(sample.keys[1])[0],'written_contents');assert.equal(threadSources([],map).keys.length,0);
});
test('missing references, unknown event types, anonymous records and markup are retained as text',()=>{
 const root=record('sites',1,{name:'<img src=x>'}),event=record('historical_events',2,{type:'<script>',site_id:'1',hfid:'999'}),map=lookup([root,event]),result=followThreads(root,[event],map);assert.equal(result.rows.length,1);assert.match(result.rows[0].reason,/<script>|<Script>/);assert(result.missing>0);assert.equal(followThreads(record('sites',5),[],map).rows.length,0);
});
test('an explicit home role outranks earlier shared-event context and keeps matching primary evidence',()=>{
 const site=record('sites',1,{name:'Hall'}),figure=record('historical_figures',2,{name:'Resident',site_link:{site_id:'1',link_type:'home'}}),event=record('historical_events',3,{type:'change hf state',state:'settled',hfid:'2',site_id:'1'}),map=lookup([site,figure,event]);const card=followThreads(site,[event,figure],map).rows.find(r=>r.kind===figure.kind);assert.equal(card.reason,'Resident lists Hall as a home.');assert.equal(card.priority,0);assert.equal(card.evidence[0].id,'2');assert.equal(card.evidence[1].id,'3');
});
