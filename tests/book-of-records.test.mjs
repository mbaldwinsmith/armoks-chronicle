import test from 'node:test';import assert from 'node:assert/strict';
import {createRecordBook,recordBookPage,recordsCategory} from '../js/data/book-of-records.js';
import {collectReferences,recordKey} from '../js/data/exploration.js';
const r=(kind,id,data)=>({kind,id:String(id),data,label:data.name||data.title||`${kind} ${id}`});
const hf=(id,data={})=>r('historical_figures',id,{name:`Figure ${id}`,...data});
const event=(id,data)=>r('historical_events',id,data);
function book(records){const lookup=new Map(records.map(row=>[recordKey(row.kind,row.id),row]));const builder=createRecordBook();for(const row of records)builder.accept(row,collectReferences(row.data));return builder.finish(lookup);}
const page=(records,category)=>recordBookPage(book(records),category);
test('kill ranks count distinct available victims, retain supporting deaths and exclude old age, self and missing victims',()=>{
 const records=[hf(1),hf(2),hf(3),hf(4),event(1,{type:'hist_figure_died',hfid:'2',slayer_hfid:'1'}),event(2,{type:'hf died',hfid:'2',slayer_hf:'1'}),event(3,{type:'hf died',hfid:'3',slayer_hfid:'1',cause:'old_age'}),event(4,{type:'hf died',hfid:'1',slayer_hfid:'1'}),event(5,{type:'hf died',hfid:'999',slayer_hfid:'1'}),event(6,{type:'hf died',hfid:'4',slayer_hfid:'888'})];
 const result=page(records,'kills');assert.equal(result.total,1);assert.equal(result.rows[0].value,1);assert.equal(result.rows[0].evidence[0].id,'1');assert.equal(result.unresolved,1);assert.equal(result.excluded,3);
});
test('lifespans keep negative prehistory years and zero-year lives but exclude sentinels, missing dates and inverted ranges',()=>{
 const records=[hf(1,{birth_year:'-10',death_year:'20'}),hf(2,{birth_year:'0',death_year:'30'}),hf(3,{birth_year:'10',death_year:'5'}),hf(4,{birth_year:'-1',death_year:'20'}),hf(5,{birth_year:'10',death_year:'10'}),hf(6,{death_year:'50'})];const result=page(records,'lifespans');
 assert.deepEqual(result.rows.map(r=>[r.id,r.value,r.rank]),[['1',30,1],['2',30,1],['5',0,3]]);assert.equal(result.excluded,3);assert.match(result.rows[0].detail,/Year -10/);
});
test('open-ended spans use latest dated event, require explicit sentinel and never claim survival',()=>{
 const records=[hf(1,{birth_year:'1',death_year:'-1'}),hf(2,{birth_year:'1'}),hf(3,{birth_year:'30',death_year:'-1'}),hf(4,{birth_year:'1',death_year:'nonsense'}),event(1,{year:'20'}),event(2,{year:'-1'})];const result=page(records,'open-lives');assert.equal(result.latestYear,20);assert.equal(result.total,1);assert.equal(result.rows[0].value,19);assert.match(result.rows[0].detail,/survival unconfirmed/);assert.equal(page([records[0]],'open-lives').total,0);
});
test('authors count distinct works, copies count distinct artifacts and page references do not inflate totals',()=>{
 const records=[hf(1),r('written_contents',1,{author_hfid:'1',author:'99'}),r('written_contents',2,{author:'1'}),r('artifacts',1,{writing:['1','1'],item:{page_written_content_id:['1','2']}}),r('artifacts',2,{writing:'1'}),event(1,{type:'written content composed',wc_id:'1',hist_figure_id:'1'})];
 assert.equal(page(records,'authors').rows[0].value,2);const copies=page(records,'copies');assert.deepEqual(copies.rows.map(r=>[r.id,r.value]),[['1',2],['2',1]]);assert.equal(copies.rows[0].evidence.length,2);
});
test('event metrics deduplicate repeated references and separate discovery events from secrets and composition',()=>{
 const records=[hf(1),r('sites',1,{}),r('artifacts',1,{}),event(1,{type:'knowledge_discovered',hfid:'1',knowledge:'topic',site:'1',site_id:'1',artifact_id:'1',artifact:'1'}),event(2,{type:'knowledge discovered',hfid:'1',knowledge:'topic'}),event(3,{type:'hf learns secret',student_hfid:'1'})];
 assert.equal(page(records,'sites').rows[0].value,1);assert.equal(page(records,'artifacts').rows[0].value,1);assert.equal(page(records,'scholars').rows[0].value,2);
});
test('bounded evidence samples retain known victims after missing early references',()=>{
 const records=[hf(1),...Array.from({length:8},(_,i)=>hf(i+2)),...Array.from({length:15},(_,i)=>event(i,{type:'hf died',slayer_hfid:'1',hfid:String(i<7?100+i:i-5)}))];const result=page(records,'kills');assert.equal(result.rows[0].value,8);assert.equal(result.rows[0].evidence.length,5);assert.equal(result.rows[0].evidence[0].victim,'2');
});
test('pagination is deterministic across ties, clamps invalid offsets and preserves ranks beyond the first fifty',()=>{
 const records=[];for(let i=1;i<=55;i++){records.push(hf(i),r('written_contents',i,{author_hfid:String(i)}));}
 const all=book(records),first=recordBookPage(all,'authors'),second=recordBookPage(all,'authors',50),invalid=recordBookPage(all,'authors',Infinity),beyond=recordBookPage(all,'authors',5000);
 assert.equal(first.total,55);assert.equal(first.rows.length,50);assert.equal(second.rows.length,5);assert(second.rows.every(row=>row.rank===1));assert.equal(new Set([...first.rows,...second.rows].map(r=>r.key)).size,55);assert.equal(second.highlights.find(c=>c.id==='authors').ties,55);assert.equal(invalid.offset,0);assert.equal(beyond.offset,50);assert.equal(recordsCategory('bad').id,'kills');
});
test('independent world calculations have empty-state categories and do not retain source mutations',()=>{
 const source=[hf(1),r('written_contents',1,{author_hfid:'1'})],before=JSON.stringify(source),one=book(source),two=book([hf(1)]);assert.equal(recordBookPage(one,'authors').total,1);assert.equal(recordBookPage(two,'authors').total,0);assert.equal(recordBookPage(two,'authors').highlights.length,8);assert.equal(JSON.stringify(source),before);
});
