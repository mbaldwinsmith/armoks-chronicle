import test from 'node:test';
import assert from 'node:assert/strict';
import {grudgeFacts,createGrudgeLedger,grudgePage,grudgeFilters,grudgeLimits} from '../js/data/grudges.js';
import {recordKey} from '../js/data/exploration.js';
const rec=(kind,id,data={})=>({kind,id:String(id),label:data.name||`${kind} ${id}`,data});
const event=(id,data)=>rec('historical_events',id,data);
const ledger=records=>{const b=createGrudgeLedger();records.forEach(r=>b.accept(r));return b.finish();};
const lookup=records=>new Map(records.map(r=>[recordKey(r.kind,r.id),r]));
test('killings require explicit killing evidence and exclude natural or unexplained deaths',()=>{
 assert.equal(grudgeFacts(event(1,{type:'hf died',hfid:'1',slayer_hfid:'2'}))[0].category,'killings');
 for(const cause of ['old_age','starvation','thirst','drown','leapt from height'])assert.equal(grudgeFacts(event(1,{type:'hf died',slayer_hfid:'2',cause})).length,0);
 assert.equal(grudgeFacts(event(1,{type:'hf died',hfid:'1'})).length,0);assert.equal(grudgeFacts(event(1,{type:'hf died',slayer_hfid:'-1'})).length,0);
 assert.equal(grudgeFacts(event(1,{type:'hf died',cause:'murder'}))[0].category,'killings');assert.equal(grudgeFacts(event(1,{type:'hist_figure_died',slayer_race:'DRAGON'}))[0].category,'killings');
});
test('theft and abduction preserve explicit roles without inventing an owner or victim',()=>{
 const theft=grudgeFacts(event(1,{type:'item stolen',histfig:'2',artifact_id:'55',site_id:'1'}))[0],abduct=grudgeFacts(event(2,{type:'hf abducted',snatcher_hfid:'2',target_hfid:'3'}))[0];
 assert.equal(theft.category,'thefts');assert.equal(theft.refs.find(r=>r.kind==='historical_figures').role,'Recorded Thief');assert(!theft.refs.some(r=>/owner|victim/i.test(r.role)));assert.equal(theft.refs.filter(r=>r.id==='2').length,1);assert.equal(abduct.refs.find(r=>r.role==='Abducted Figure').id,'3');assert.equal(abduct.refs.find(r=>r.role==='Abductor').id,'2');
});
test('only exact explicit grudge labels qualify; direction, Plus deduplication and unknown dates remain intact',()=>{
 const root=rec('historical_figures',1,{hf_link:[{hfid:'2',link_type:'grudge_bearer'},{hfid:'3',link_type:'enemy'},{hfid:'4',link_type:'rival'},{hfid:'5',link_type:'friend'}]});root.supplement={hf_link:{hfid:'2',link_type:'grudge bearer'}};
 const rows=grudgeFacts(root);assert.equal(rows.length,1);assert.equal(rows[0].refs[0].id,'1');assert.equal(rows[0].refs[1].id,'2');assert.equal(rows[0].paths.length,2);assert.equal(rows[0].start,null);assert(!rows[0].tokens.join('').includes('revenge'));
});
test('faction source roles distinguish war aggression, counterattack and direct event opponents',()=>{
 const war=grudgeFacts(rec('historical_event_collections',1,{type:'war',aggressor_ent_id:'5',defender_ent_id:'6'}))[0],battle=grudgeFacts(rec('historical_event_collections',2,{type:'battle',attacking_enid:'6',defending_enid:'5',war_eventcol:'1'}))[0];assert.equal(war.refs.find(r=>r.role==='Recorded War Aggressor').id,'5');assert.equal(battle.refs.find(r=>r.role==='Attacking Organisation').id,'6');assert.equal(grudgeFacts(event(1,{type:'attacked site',attacker_civ_id:'5',defender_civ_id:'6'}))[0].category,'factions');assert.equal(grudgeFacts(rec('historical_event_collections',3,{type:'ceremony',attacking_enid:'5'})).length,0);
});
test('combined person, faction and place filters use direct named references, not membership projection',async()=>{
 const a=rec('historical_figures',1,{name:'Úrist Example',entity_link:{entity_id:'5',link_type:'member'}}),victim=rec('historical_figures',2,{name:'Victim'}),faction=rec('entities',5,{name:'Copper League'}),site=rec('sites',1,{name:'Hall'}),death=event(1,{type:'hf died',hfid:'2',slayer_hfid:'1',site_id:'1',year:'10'}),attack=event(2,{type:'attacked site',attacker_civ_id:'5',site_id:'1',year:'10'}),records=[a,victim,faction,site,death,attack],index=ledger(records),map=lookup(records);
 assert.equal((await grudgePage(index,map,{person:'urist',site:'#1'})).total,1);assert.equal((await grudgePage(index,map,{person:'#1',faction:'#5'})).total,0);assert.equal((await grudgePage(index,map,{faction:'copper',site:'hall'})).total,1);assert.equal((await grudgePage(index,map,{q:'#1'})).total,1);assert.equal((await grudgePage(index,map,{q:'Victim'})).total,1);
});
test('year filters exclude undated grudges and unknown/inconsistent ranges without assuming ongoing conflicts',async()=>{
 const records=[event(1,{type:'hf died',slayer_hfid:'2',year:'-1'}),event(2,{type:'item stolen',year:'-10'}),rec('historical_figures',1,{hf_link:{hfid:'2',link_type:'grudge'}}),rec('historical_event_collections',3,{type:'war',aggressor_ent_id:'5',start_year:'10',end_year:'-1'}),rec('historical_event_collections',4,{type:'war',aggressor_ent_id:'5',start_year:'20',end_year:'10'})],index=ledger(records),map=lookup(records);
 assert.equal((await grudgePage(index,map,{from:'-10',to:'-10'})).total,1);assert.equal((await grudgePage(index,map,{from:'11'})).total,0);assert.equal((await grudgePage(index,map,{from:'10',to:'10'})).total,1);assert.equal((await grudgePage(index,map)).total,5);
});
test('validation rejects malformed and reversed years, preserves category/order and bounds text',async()=>{
 for(const options of [{from:'1.5'},{from:'1e2'},{from:'abc'},{from:'9007199254740992'},{from:'20',to:'10'}]){assert(grudgeFilters(options).invalid);assert.equal((await grudgePage(ledger([]),new Map(),options)).total,0);}
 assert.equal(grudgeFilters({category:'fake',sort:'fake',q:'x'.repeat(300)}).q.length,160);assert.equal(grudgeFilters({category:'grudges',sort:'latest'}).category,'grudges');
});
test('stable bounded pages, category counts, duplicate source records and latest ordering keep unknown dates last',async()=>{
 const records=Array.from({length:55},(_,i)=>event(i,{type:'item stolen',histfig:'1',year:i===54?'-1':String(i)})),index=ledger([...records,records[0]]),map=lookup(records),first=await grudgePage(index,map),last=await grudgePage(index,map,{offset:9999}),latest=await grudgePage(index,map,{sort:'latest'});assert.equal(first.total,55);assert.equal(first.rows.length,24);assert.equal(first.counts.thefts,55);assert.equal(last.offset,48);assert.equal(last.rows.length,7);assert.equal(last.rows.at(-1).id,'54');assert.equal(latest.rows[0].id,'53');assert.equal(latest.rows.length,24);assert.deepEqual(first,await grudgePage(index,map));
});
test('builder scan, row and reference limits disclose incomplete results and never mutate source records',()=>{
 const source=rec('historical_event_collections',1,{type:'battle',attacking_enid:Array.from({length:30},(_,i)=>String(i)),defending_enid:'40'}),before=JSON.stringify(source),builder=createGrudgeLedger({...grudgeLimits,scanned:2,rows:1,references:3});assert(builder.accept(source));assert(builder.accept(event(2,{type:'item stolen'})));assert(!builder.accept(event(3,{type:'item stolen'})));const result=builder.finish();assert(result.stats.rowLimited&&result.stats.scanLimited&&result.stats.partial);assert.equal(result.rows[0].refs.length,3);assert.equal(JSON.stringify(source),before);
});
test('missing sources remain explicit, sentinel IDs disappear and unsupported event types are excluded',async()=>{
 const root=event(1,{type:'hf abducted',snatcher_hfid:'-1',target_hfid:'999'}),result=await grudgePage(ledger([root]),lookup([root]));assert(result.rows[0].refs[0].missing);assert(!result.rows[0].refs.some(r=>r.id==='-1'));assert.match(result.rows[0].reason,/Missing Figure #999/);assert.equal(grudgeFacts(event(2,{type:'<script>'})).length,0);
});
test('cancellation stops filtering and later queries can reuse the untouched cache',async()=>{
 const records=Array.from({length:2000},(_,i)=>event(i,{type:'item stolen',year:String(i)})),index=ledger(records),map=lookup(records);let cancelled=false;await assert.rejects(grudgePage(index,map,{}, {isCancelled:()=>cancelled,onProgress:()=>{cancelled=true;}}),{name:'AbortError'});assert.equal((await grudgePage(index,map)).total,2000);
});
test('large synthetic ledger remains paged and does not equate conflict sources with incident totals',async t=>{
 const builder=createGrudgeLedger(),map=new Map();for(let i=0;i<50000;i++){const r=event(i,{type:'item stolen',year:String(i%200)});builder.accept(r);map.set(recordKey(r.kind,r.id),r);}const start=performance.now(),result=await grudgePage(builder.finish(),map,{from:'100',to:'110'});assert.equal(result.total,2750);assert.equal(result.rows.length,24);assert.equal(Object.values(result.counts).reduce((a,b)=>a+b,0),result.total);t.diagnostic(`Synthetic 50,000-entry filter: ${Math.round(performance.now()-start)} ms (Node; not a browser latency guarantee).`);
});
