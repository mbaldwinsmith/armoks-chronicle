import test from 'node:test';import assert from 'node:assert/strict';
import {createWarfareIndex} from '../js/data/warfare.js';
import {buildFactionSources,filterFactionNetwork,factionNetworkPage,factionEvidencePage,addFactionPage,factionPair,factionLimits} from '../js/data/faction-warfare.js';
const c=(id,data)=>({kind:'historical_event_collections',id:String(id),data});const e=(id,data)=>({kind:'historical_events',id:String(id),data});
function index(records){const b=createWarfareIndex();records.forEach(r=>b.accept(r));return b.finish();}
async function network(records,options={}){return filterFactionNetwork(await buildFactionSources(index(records)),options);}
const war=(id,a,b,extra={})=>c(id,{type:'war',aggressor_ent_id:String(a),defender_ent_id:String(b),...extra});
test('nested wars, counterattacking battles and repeated events count one group while keeping their separate role evidence',async()=>{
 const net=await network([war(1,5,6,{eventcol:['2','3'],event:'0'}),c(2,{type:'battle',war_eventcol:'1',attacking_enid:'5',defending_enid:'6',event:'0'}),c(3,{type:'battle',war_eventcol:'1',attacking_enid:'6',defending_enid:'5'}),e(0,{type:'attacked site',attacker_civ_id:'5',defender_civ_id:'6'})]);const page=factionNetworkPage(net,'5'),edge=page.edges[0];assert.equal(page.total,1);assert.equal(edge.count,1);assert.equal(edge.sourceCount,4);assert.equal(edge.directions.find(d=>d.role==='war-aggressor').from,'5');assert(edge.directions.some(d=>d.role==='attacker'&&d.from==='6'));assert.equal(factionEvidencePage(net,'5,6').total,4);
});
test('a battle attacker does not become a war aggressor and same-side co-membership or missing sides create no pair',async()=>{
 const net=await network([c(1,{type:'battle',attacking_enid:['1','2'],defending_enid:'3',involved_enid:'9'}),c(2,{type:'war',aggressor_ent_id:'4'}),e(0,{type:'hf died',entity_id:['4','5']}),e(1,{type:'field battle',attacker_civ_id:'6',defender_civ_id:'6'})]);assert.equal(net.edges.has('1,2'),false);assert.equal(net.edges.has('1,9'),false);assert.equal(net.edges.size,2);assert([...net.edges.values()].every(edge=>[...edge.directions.values()].every(d=>d.role==='attacker')));assert.equal(net.stats.oneSided,1);assert.equal(net.stats.selfPairs,1);
});
test('independent wars stay distinct while shared event memberships and cycles form one explicitly shared group',async()=>{
 const separate=await network([war(1,1,2),war(2,1,2)]);assert.equal(factionNetworkPage(separate,'1').edges[0].count,2);
 const shared=await network([war(1,1,2,{event:'0',eventcol:'2'}),war(2,1,2,{event:'0',eventcol:'1'}),e(0,{type:'field battle',attacker_civ_id:'1',defender_civ_id:'2'})]);const edge=factionNetworkPage(shared,'1').edges[0];assert.equal(edge.count,1);assert.equal(edge.sharedGroups,1);assert.equal(edge.sourceCount,3);
});
test('year and type filters select source evidence before counting and do not infer an ongoing end date',async()=>{
 const records=[war(1,1,2,{start_year:'1',end_year:'20',eventcol:'2'}),c(2,{type:'battle',start_year:'10',end_year:'10',attacking_enid:'2',defending_enid:'1'}),war(3,1,2,{start_year:'15',end_year:'-1'})];const battles=await network(records,{type:'collection:battle',from:'10',to:'10'});assert.equal(factionNetworkPage(battles,'1').edges[0].count,1);assert(factionNetworkPage(battles,'1').edges[0].directions.every(d=>d.role==='attacker'));
 const later=await network(records,{from:'16',to:'18'});assert.equal(factionNetworkPage(later,'1').edges[0].count,1);assert.equal((await network(records,{from:'20',to:'10'})).filters.invalid,true);assert.equal((await network(records,{type:'unsupported'})).edges.size,0);
});
test('standalone attack events are independent groups and sentinel/missing faction IDs do not invent organisations',async()=>{
 const net=await network([e(1,{type:'field battle',year:'10',attacker_civ_id:'1',defender_civ_id:'999'}),e(2,{type:'field battle',year:'11',attacker_civ_id:'1',defender_civ_id:'999'}),war(3,'-1',2)]);const edge=factionNetworkPage(net,'1').edges[0];assert.equal(edge.b,'999');assert.equal(edge.count,2);assert.equal(factionEvidencePage(net,'1,999').rows[0].group.kind,'historical_events');assert.equal(factionNetworkPage(net,'-1').total,0);
});
test('incomplete grouping is flagged on affected components without making unrelated complete groups uncertain',async()=>{
 const net=await network([war(1,1,2,{eventcol:'999'}),war(2,3,4)]);assert.equal(factionNetworkPage(net,'1').edges[0].countIncomplete,true);assert.equal(factionNetworkPage(net,'3').edges[0].countIncomplete,false);assert.equal(net.stats.missingParents,1);
});
test('neighbour and source pages are bounded, stable and preserve complete source-count definitions',async()=>{
 const records=Array.from({length:35},(_,i)=>war(i+1,1,i+2));records.push(...Array.from({length:40},(_,i)=>war(i+100,1,2)));const net=await network(records);const a=factionNetworkPage(net,'1'),b=factionNetworkPage(net,'1',10);assert.equal(a.edges.length,10);assert.equal(b.edges.length,10);assert.equal(a.total,35);assert.equal(a.edges[0].sourceCount,41);const evidence=factionEvidencePage(net,'1,2',24);assert.equal(evidence.rows.length,17);assert.equal(evidence.total,41);assert.equal(factionEvidencePage(net,'1,2',Infinity).offset,0);assert.equal(factionNetworkPage(net,'1',999).edges.length,5);
});
test('display expansion stops at faction/pair budgets without silently adding nodes or duplicating connections',async()=>{
 const net=await network(Array.from({length:40},(_,i)=>war(i,1,i+2)));let state={nodes:[{id:'1'}],edges:[]},capped=false;for(const offset of [0,10,20]){const page=factionNetworkPage(net,'1',offset);page.nodes=[...new Set(page.edges.flatMap(e=>[e.a,e.b]))].map(id=>({id}));const merged=addFactionPage(state,page,'1');state=merged;capped ||= merged.capped;}assert.equal(state.nodes.length,25);assert.equal(state.edges.length,24);assert(capped);const repeat=addFactionPage(state,{edges:state.edges,nodes:state.nodes},'1');assert.equal(repeat.edges.length,24);
});
test('source cross-products, role scans, membership scans and claim budgets disclose truncation and cancellation is reusable',async()=>{
 const idx=index([c(1,{type:'war',aggressor_ent_id:Array.from({length:20},(_,i)=>String(i+1)),defender_ent_id:Array.from({length:20},(_,i)=>String(i+30))})]);const wide=await buildFactionSources(idx);assert.equal(wide.sources.length,128);assert.equal(wide.stats.pairLimited,1);
 const small=await buildFactionSources(idx,{limits:{...factionLimits,claims:2}});assert.equal(small.sources.length,2);assert.equal(small.stats.claimLimited,true);const roles=await buildFactionSources(idx,{limits:{...factionLimits,roleReferences:1}});assert.equal(roles.stats.roleLimited,true);
 await assert.rejects(buildFactionSources(idx,{isCancelled:()=>true}),{name:'AbortError'});await assert.rejects(filterFactionNetwork(wide,{}, {isCancelled:()=>true}),{name:'AbortError'});assert.equal((await filterFactionNetwork(wide)).edges.size,128);
});
test('padded ID strings have canonical pair order and independent archives do not share graph sources',async()=>{
 assert.equal(factionPair('01','1'),factionPair('1','01'));const first=await network([war(1,1,2)]),second=await network([war(1,3,4)]);assert.equal(factionNetworkPage(first,'1').total,1);assert.equal(factionNetworkPage(second,'1').total,0);
});
test('fifty-thousand faction role claims remain worker-page sized and deduplicate by their thousand separate groups',async t=>{
 const started=performance.now(),records=Array.from({length:1000},(_,i)=>c(i,{type:'war',aggressor_ent_id:['1','2','3','4','5'],defender_ent_id:Array.from({length:10},(_,j)=>String(j+10))})),net=await network(records);assert.equal(net.edges.size,50);assert.equal(factionNetworkPage(net,'1').edges.length,10);assert.equal(factionNetworkPage(net,'1').edges[0].count,1000);assert.equal(factionEvidencePage(net,'1,10').rows.length,24);t.diagnostic(`Synthetic 50,000-claim build/filter: ${Math.round(performance.now()-started)} ms (Node; excludes browser storage/rendering).`);
});

test('truncated membership never presents an apparent orphan event as a confidently separate conflict group',async()=>{
 const net=await network([war(1,1,2,{event:Array.from({length:10001},(_,i)=>String(i))}),e(10000,{type:'field battle',attacker_civ_id:'1',defender_civ_id:'2'})]);const edge=factionNetworkPage(net,'1').edges[0];assert.equal(edge.count,2);assert.equal(edge.countIncomplete,true);assert(net.stats.incompleteSources>0);
});
