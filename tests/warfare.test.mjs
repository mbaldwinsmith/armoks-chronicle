import test from 'node:test';import assert from 'node:assert/strict';
import {createWarfareIndex,collectionFacts,collectionMembership,conflictDetails,warfareDirectory,warfarePage,warfareLimits} from '../js/data/warfare.js';
const c=(id,data)=>({kind:'historical_event_collections',id:String(id),data});const e=(id,data)=>({kind:'historical_events',id:String(id),data});
function index(records){const b=createWarfareIndex();records.forEach(r=>b.accept(r));return b.finish();}
const battle=(id,data={})=>c(id,{type:'battle',...data});
test('collection aliases and repeated membership IDs keep explicit parent links and source roles without treating ordinary collections as wars',()=>{
 const idx=index([c(1,{type:'war',eventcol:['2','2'],aggressor_ent_id:['0','3']}),battle(2,{war_eventcol:'1',event:['0','0','-1'],attacking_hfid:['4','4']}),c(3,{type:'ceremony'})]);const scope=collectionMembership(idx,'1');assert.equal(scope.collectionIds.size,2);assert.equal(scope.eventIds.size,1);assert.equal(scope.invalid,1);assert.deepEqual([...idx.children.get('1')],['2']);assert.equal(idx.collections.get('2').refs[0].role,'Attacking Figure');assert.equal(warfareDirectory(idx).total,2);assert.equal(warfareDirectory(idx,{type:'war'}).total,1);
});
test('nested death events deduplicate by event and victim while named deaths remain separate from squad reports',async()=>{
 const idx=index([c(1,{type:'war',eventcol:['2','3'],event:'0'}),battle(2,{eventcol:'4',event:['0','1'],attacking_squad_deaths:['2','3'],defending_squad_deaths:'1'}),battle(3,{event:'2',attacking_squad_deaths:'4',defending_squad_deaths:'2'}),c(4,{type:'duel',parent_eventcol:'2',event:'0'}),e(0,{type:'hist_figure_died',hfid:'8',year:'10'}),e(1,{type:'hf wounded',year:'10'}),e(2,{type:'hf died',hfid:'9',year:'12'})]);const result=await conflictDetails(idx,'1');assert.equal(result.events.length,3);assert.equal(result.victims,2);assert.deepEqual(result.squads.totals,{attacker:9,defender:3});assert.equal(result.membership.collections,4);assert.equal(result.squads.overlap,false);
});
test('parent squad rollups are not added to their more-specific descendant reports',async()=>{
 const idx=index([battle(1,{eventcol:'2',attacking_squad_deaths:'100',defending_squad_deaths:'50'}),battle(2,{event:'0',attacking_squad_deaths:'3',defending_squad_deaths:'0'}),e(0,{type:'hf died',hfid:'8'})]);const result=await conflictDetails(idx,'1');assert.equal(result.squads.rollups,1);assert.deepEqual(result.squads.totals,{attacker:3,defender:0});assert.equal(result.reports.find(r=>r.id==='1').rollup,true);
});
test('shared descendant memberships or distinct death events naming the same victim suppress combined squad totals',async()=>{
 for(const sameEvent of [true,false]){const idx=index([c(1,{type:'war',eventcol:['2','3']}),battle(2,{event:'0',attacking_squad_deaths:'3'}),battle(3,{event:sameEvent?'0':'1',attacking_squad_deaths:'4'}),e(0,{type:'hf died',hfid:'8'}),e(1,{type:'hf died',hfid:'8'})]);const result=await conflictDetails(idx,'1');assert.equal(result.squads.totals,null);assert.equal(result.squads.overlap,true);assert.equal(result.victims,1);}
});
test('cycles, missing membership and traversal bounds are explicit and never yield a confident squad sum',async()=>{
 const idx=index([battle(1,{eventcol:['2','99'],attacking_squad_deaths:'2'}),battle(2,{parent_eventcol:'1',eventcol:'1',event:'99',attacking_squad_deaths:'1'})]);const result=await conflictDetails(idx,'1');assert.equal(result.membership.cycles,1);assert.equal(result.membership.missingCollectionCount,1);assert.equal(result.membership.missingEvents,1);assert.equal(result.squads.totals,null);
 const large=index(Array.from({length:2005},(_,i)=>c(i,{type:'war',eventcol:String(i+1)})));const scope=collectionMembership(large,'0');assert.equal(scope.collectionIds.size,2000);assert.equal(scope.truncated,true);
});
test('unknown and malformed squad values remain distinct from zero and unsafe aggregate sums are withheld',async()=>{
 const raw=collectionFacts(battle(1,{attacking_squad_deaths:['0','-1','bad'],defending_squad_deaths:'0'}));assert.deepEqual(raw.squads.attacker,{value:0,invalid:2});assert.deepEqual(raw.squads.defender,{value:0,invalid:0});assert.equal(collectionFacts(battle(2,{})).squads.attacker.value,null);
 const partial=await conflictDetails(index([battle(1,{attacking_squad_deaths:['2','bad']})]),'1');assert.equal(partial.squads.partial,true);assert.equal(partial.squads.totals.attacker,2);
 const unsafe=await conflictDetails(index([battle(1,{attacking_squad_deaths:String(Number.MAX_SAFE_INTEGER),defending_squad_deaths:'1'})]),'1');assert.equal(unsafe.squads.totals,null);assert.equal(unsafe.squads.limited,true);
});
test('directory year filters intersect only recorded bounds and do not infer an ongoing war from an unknown end',()=>{
 const idx=index([c(1,{type:'war',name:'A',start_year:'10',end_year:'20'}),c(2,{type:'war',start_year:'15',end_year:'-1'}),c(3,{type:'war'}),c(4,{type:'battle',start_year:'30',end_year:'20'})]);assert.equal(warfareDirectory(idx,{from:'16',to:'18'}).total,1);assert.equal(warfareDirectory(idx,{from:'15',to:'15'}).total,2);assert.equal(warfareDirectory(idx,{from:'bad'}).invalid,true);assert.equal(warfareDirectory(idx,{q:'#2'}).rows[0].id,'2');assert.equal(warfareDirectory(idx,{from:'20',to:'10'}).total,0);
});
test('chronicles have stable year/ID order, bounded pages and year filters without changing overview totals',async()=>{
 const records=[c(1,{type:'war',event:Array.from({length:55},(_,i)=>String(i))}),...Array.from({length:55},(_,i)=>e(i,{type:'hf died',hfid:String(i),year:String(Math.floor(i/2))}))],idx=index(records),details=await conflictDetails(idx,'1');const first=warfarePage(idx,details),second=warfarePage(idx,details,{offset:50}),filtered=warfarePage(idx,details,{from:'0',to:'0'});assert.equal(first.rows.length,50);assert.equal(second.rows.length,5);assert.equal(second.rows[0].id,'50');assert.equal(filtered.rows.length,2);assert.equal(filtered.counts.chronicle,55);assert.equal(filtered.victims,55);assert.equal(warfarePage(idx,details,{offset:Infinity}).offset,0);
});
test('participants retain distinct explicit and event-mentioned roles with bounded evidence, without shared-event guilt',async()=>{
 const idx=index([c(1,{type:'duel',attacking_hfid:'2',defending_hfid:'3',noncom_hfid:'4',event:['0','1','2','3']}),...Array.from({length:4},(_,i)=>e(i,{type:'hf died',hfid:'4',slayer_hfid:'2'}))]);const result=await conflictDetails(idx,'1');const noncom=result.participants.find(r=>r.id==='4'&&r.role==='Recorded Non-combatant'),victim=result.participants.find(r=>r.id==='4'&&r.role.includes('Victim'));assert(noncom);assert(victim);assert.equal(victim.evidence.length,3);assert.equal(victim.count,4);assert(!result.participants.some(r=>r.id==='4'&&r.role==='Attacking Figure'));
});
test('analysis work limits are disclosed and cancellation stops expensive traversal while leaving future calculations usable',async()=>{
 const idx=index([battle(1,{eventcol:'2',attacking_squad_deaths:'1'}),battle(2,{attacking_squad_deaths:'2'})]);const limited=await conflictDetails(idx,'1',{limits:{...warfareLimits,casualtyWork:0}});assert.equal(limited.squads.limited,true);assert.equal(limited.squads.totals,null);
 const large=index([c(1,{type:'war',event:Array.from({length:600},(_,i)=>String(i))}),...Array.from({length:600},(_,i)=>e(i,{type:'hf died',hfid:'2'}))]);let cancelled=false;await assert.rejects(conflictDetails(large,'1',{isCancelled:()=>cancelled,onProgress:()=>{cancelled=true;}}),{name:'AbortError'});assert.equal((await conflictDetails(idx,'2')).squads.totals.attacker,2);
});
test('independent archives never share indexed collection membership or calculated conflict results',async()=>{
 const first=index([c(1,{type:'war',event:'0'}),e(0,{type:'hf died',hfid:'2'})]),second=index([c(1,{type:'war'})]);assert.equal((await conflictDetails(first,'1')).victims,1);assert.equal((await conflictDetails(second,'1')).victims,0);
});
