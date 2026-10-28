import test from 'node:test';import assert from 'node:assert/strict';
import {randomRecord,uniformIndex,randomCategory,namedRecord,eraFact,eraPage,deskDiscoveries,clippedLabel} from '../js/data/desk.js';
import {recordKey} from '../js/data/exploration.js';
import {recordVisit,readTrail,clearTrail,trailKey} from '../js/data/trail.js';
const row=(kind,id,named=true)=>({kind,id:String(id),key:recordKey(kind,String(id)),label:`Record ${id}`,named});
function storage(){const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
test('random records prefer named choices and avoid the preceding eligible record without changing source rows',()=>{
 const rows=[row('historical_figures',1),row('historical_figures',2),row('historical_figures',3,false),row('sites',1)],before=JSON.stringify(rows),result=randomRecord(rows,{exclude:rows[0].key},()=>0);assert.equal(result.row.id,'2');assert.equal(result.pool,2);assert.equal(result.total,3);assert.equal(result.namedPreferred,true);assert.equal(JSON.stringify(rows),before);
 assert.equal(randomRecord([rows[0],rows[2]],{exclude:rows[0].key},()=>0).onlyOne,true);
});
test('random categories isolate families, exclude sentinels and unsupported raw records, and retain anonymous fallback',()=>{
 const rows=[row('historical_events',1,false),row('historical_figures','-1'),row('creature_raw',1),{...row('historical_event_collections',2),collectionType:'war'},{...row('historical_event_collections',3),collectionType:'ceremony'}];assert.equal(randomRecord(rows,{category:'conflicts'},()=>0).row.id,'2');assert.equal(randomRecord(rows,{category:'historical_events'},()=>0).namedPreferred,false);assert.equal(randomRecord(rows,{category:'sites'},()=>0).row,null);assert.equal(randomRecord(rows,{category:'all'},()=>0).row.kind,'historical_event_collections');assert.equal(randomCategory('bogus'),'historical_figures');
});
test('uniform random selection rejects the modulo-biased tail, invalid sources and unbounded retries',()=>{
 const values=[0xffffffff,2];assert.equal(uniformIndex(3,()=>values.shift()),2);assert.equal(uniformIndex(1,()=>0xffffffff),0);assert.throws(()=>uniformIndex(0,()=>0));assert.throws(()=>uniformIndex(3,()=>-1));assert.throws(()=>uniformIndex(3,()=>0xffffffff),/Try again/);
});
test('name eligibility requires explicit names/titles rather than descriptive fallback types',()=>{
 assert(namedRecord({kind:'written_contents',data:{title:'A Work'}}));assert(namedRecord({kind:'artifacts',data:{item:{name_string:'A Book'}}}));assert(!namedRecord({kind:'historical_events',data:{type:'hf died'}}));assert(!namedRecord({data:{name:'   '}}));assert.equal(Array.from(clippedLabel('😀'.repeat(1000))).length,240);
});
test('era dates retain unknown ends and negative years without deriving boundaries from the next start',()=>{
 const a=eraFact({kind:'historical_eras',id:'@0',label:'Era A',data:{start_year:'-10'}}),b=eraFact({kind:'historical_eras',id:'@1',label:'Era B',data:{start_year:'20'}}),bad=eraFact({kind:'historical_eras',id:'@2',label:'Bad Era',data:{start_year:'20',end_year:'10'}});assert.equal(a.end,null);assert.equal(eraPage([b,a]).rows[0].start,-10);assert.equal(bad.inconsistent,true);assert.equal(eraFact({data:{start_year:'-1',end_year:'bad'}}).start,null);
 const many=Array.from({length:15},(_,i)=>({kind:'historical_eras',id:String(i),label:'Era',start:i,end:null}));assert.equal(eraPage(many,12).rows.length,3);assert.equal(eraPage(many,999).offset,12);assert.equal(eraPage(many,Infinity).offset,0);
});
test('discovery cards reuse ranked leaders, expose ties and definitions, and remain bounded with empty categories',()=>{
 const highlights=['lifespans','authors','sites','artifacts','kills'].map((id,i)=>({id,leader:{kind:i===2?'sites':'historical_figures',id:String(i),value:3,label:'Example'},ties:2})),cards=deskDiscoveries(highlights);assert.equal(cards.length,4);assert.equal(cards[0].ties,2);assert.match(cards[0].definition,/calendar years/);assert.match(cards[1].description,/distinct written works/);assert.deepEqual(deskDiscoveries([]),[]);assert.equal(deskDiscoveries([{id:'lifespans',leader:{value:0}}]).length,0);
});
test('recent trails keep twelve distinct visits in action order and isolate world and record-family identities',()=>{
 const s=storage();for(let i=0;i<15;i++)assert(recordVisit('one',row('sites',i),s,100+i));let entries=readTrail('one',s).entries;assert.equal(entries.length,12);assert.equal(entries[0].id,'14');assert.equal(entries.at(-1).id,'3');recordVisit('one',row('sites',5),s,99);assert.equal(readTrail('one',s).entries[0].id,'5');recordVisit('one',row('historical_figures',5),s,200);assert.equal(readTrail('one',s).entries[1].kind,'sites');recordVisit('two',row('sites',77),s,300);assert.equal(readTrail('two',s).entries.length,1);clearTrail('one',s);assert.equal(readTrail('one',s).entries.length,0);assert.equal(readTrail('two',s).entries[0].id,'77');
});
test('blocked, corrupt and oversized trail storage is recoverable and never touches unrelated keys',()=>{
 const s=storage();s.setItem('unrelated','preserve');s.setItem(trailKey('one'),'{broken');assert.equal(readTrail('one',s).available,false);assert(recordVisit('one',row('sites',1),s,1));assert.equal(readTrail('one',s).entries.length,1);s.setItem(trailKey('one'),'x'.repeat(64001));assert.equal(readTrail('one',s).available,false);clearTrail('one',s);assert.equal(s.getItem('unrelated'),'preserve');const blocked={getItem(){throw Error('Blocked');},setItem(){throw Error('Blocked');},removeItem(){throw Error('Blocked');}};assert.equal(readTrail('one',blocked).available,false);assert.equal(recordVisit('one',row('sites',1),blocked,1),false);assert.equal(clearTrail('one',blocked),false);assert.equal(readTrail('one',null).available,false);
});
test('trail validation rejects foreign world metadata, invalid fields and unsafe timestamps while keeping labels bounded',()=>{
 const s=storage();s.setItem(trailKey('one'),JSON.stringify({version:1,worldId:'two',entries:[]}));assert.equal(readTrail('one',s).available,false);assert.equal(recordVisit('one',{kind:'<script>',id:'1',label:'bad'},s,1),false);assert.equal(recordVisit('one',row('sites',1),s,Infinity),false);recordVisit('one',{...row('sites',1),label:'😀'.repeat(1000)},s,1);assert.equal(Array.from(readTrail('one',s).entries[0].label).length,240);
});
