import test from 'node:test';import assert from 'node:assert/strict';
import {recordKey} from '../js/data/exploration.js';
import {recordRelationships,relationshipNeighbourhood,graphPage,addGraphPage,layoutRelationships,relationshipLimits,relationshipWording,relationshipCurve} from '../js/data/relationships.js';
const figure=(id,data={},supplement)=>({kind:'historical_figures',id,data,supplement,sources:['standard','plus']});
const key=id=>recordKey('historical_figures',id);
test('explicit relationships retain direction, role, category and source evidence without inferring reciprocal family',()=>{
 const record=figure('1',{hf_link:[{hfid:'2',link_type:'child',link_strength:'80'},{hfid:'3',link_type:'friend'},{hfid:'4',link_type:'enemy'},{hfid:'5',link_type:'deity'},{hfid:'6',link_type:'future_type'}],entity_link:{entity_id:'0',link_type:'member'},site_link:{site_id:'9',link_type:'lair'}});
 const parsed=recordRelationships(record);assert.equal(parsed.edges.length,7);assert.deepEqual(parsed.edges.map(edge=>edge.category),['family','social','rivalry','worship','other','affiliation','affiliation']);
 assert.equal(parsed.edges[0].source,key('1'));assert.equal(parsed.edges[0].target,key('2'));assert.equal(parsed.edges[0].label,'Child');assert.equal(parsed.edges[0].evidence[0].path,'hf_link.0');assert.equal(parsed.edges[0].evidence[0].strength,'80');assert.equal(parsed.edges[5].target,recordKey('entities','0'));
 assert.equal(parsed.edges.some(edge=>edge.type==='parent'),false);
});
test('duplicate main and Plus links combine evidence; conflicting labels stay distinct and raw data is preserved',()=>{
 const record=figure('1',{hf_link:{hfid:'2',link_type:'spouse'}},{hf_link:[{hfid:'2',link_type:'spouse'},{hfid:'2',link_type:'enemy'}]});const before=JSON.stringify(record),parsed=recordRelationships(record);
 assert.equal(parsed.edges.length,2);assert.equal(parsed.edges[0].evidence.length,2);assert.equal(parsed.edges[1].label,'Enemy');assert.equal(parsed.edges[0].evidence[1].origin,'Legends Plus');assert.equal(JSON.stringify(record),before);
});
test('sentinels and malformed IDs do not create invented relatives; vague links and shared events do not create edges',()=>{
 const parsed=recordRelationships(figure('1',{hf_link:[{hfid:'-1',link_type:'father'},{hfid:'bad',link_type:'mother'},{hfid:'2',link_type:'spouse'}],hf_relationship:{hfid:'3',type:'companion'},some_hfid:'4'}));assert.equal(parsed.invalid,2);assert.equal(parsed.edges.length,1);
 assert.equal(recordRelationships({kind:'historical_events',id:'0',data:{hfid:'1',slayer_hfid:'2'}}).edges.length,0);
});
test('incoming-only, reciprocal and cyclic links stay inspectable without extra unrelated edges',()=>{
 const records=[figure('1',{hf_link:{hfid:'2',link_type:'parent'}}),figure('2',{hf_link:{hfid:'1',link_type:'child'}}),figure('3',{hf_link:[{hfid:'1',link_type:'friend'},{hfid:'9',link_type:'friend'}]})];
 const result=relationshipNeighbourhood(records,key('1'));assert.equal(result.edges.length,3);assert.equal(result.edges.filter(edge=>edge.source===key('3')).length,1);assert.equal(graphPage(result,{category:'family'}).total,2);assert.equal(graphPage(result,{category:'other'}).total,0);
});
test('neighbour pages are bounded and do not drop remaining edges between expansions',()=>{
 const links=Array.from({length:23},(_,i)=>({hfid:String(i+2),link_type:'spouse'})),result=relationshipNeighbourhood([figure('1',{hf_link:links})],key('1'));
 const pages=[0,8,16].map(offset=>graphPage(result,{offset}));assert.deepEqual(pages.map(page=>page.edges.length),[8,8,7]);assert.equal(new Set(pages.flatMap(page=>page.edges.map(edge=>edge.key))).size,23);assert.equal(pages.at(-1).next,23);
});
test('expansion caps node/edge growth, preserves self/cycle edges and does not duplicate nodes',()=>{
 const root={key:key('1'),kind:'historical_figures',id:'1'},result=relationshipNeighbourhood([figure('1',{hf_link:[{hfid:'1',link_type:'future'},{hfid:'2',link_type:'spouse'}]})],key('1')),page={...result,nodes:[root,{key:key('2'),kind:'historical_figures',id:'2'}]};
 const first=addGraphPage({nodes:[root],edges:[]},page),again=addGraphPage(first,page);assert.equal(again.nodes.length,2);assert.equal(again.edges.length,2);
 const full={nodes:Array.from({length:40},(_,i)=>({key:key(String(i+1))})),edges:[]},extra=recordRelationships(figure('1',{hf_link:{hfid:'999',link_type:'friend'}}));const capped=addGraphPage(full,{...extra,nodes:[{key:key('999')}]});assert.equal(capped.capped,true);assert.equal(capped.nodes.length,40);assert.equal(capped.edges.length,0);
});
test('large source lists report truncation and bounded evidence instead of implying completeness',()=>{
 const links=Array.from({length:relationshipLimits.linksPerRecord+1},()=>({hfid:'2',link_type:'spouse'})),result=recordRelationships(figure('1',{hf_link:links}));assert.equal(result.truncated,true);assert.equal(result.edges.length,1);assert.equal(result.edges[0].evidence.length,4);assert.equal(result.edges[0].moreEvidence,true);
});
test('bounded network layout is deterministic and keeps labels separate with the root fixed',()=>{
 const nodes=Array.from({length:40},(_,i)=>({key:key(String(i+1))})),edges=nodes.slice(1).map(node=>({source:key('1'),target:node.key}));const points=layoutRelationships(nodes,edges,key('1'));
 assert.deepEqual(points,layoutRelationships(nodes,edges,key('1')));assert.equal(points[0].x,0);assert.equal(points[0].y,0);assert(points.every(node=>Number.isFinite(node.x)&&Number.isFinite(node.y)));
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)assert(Math.abs(points[i].x-points[j].x)>=207||Math.abs(points[i].y-points[j].y)>=57,'Node labels overlap');
});

test('affiliation wording keeps the figure as member rather than describing the organisation as a member',()=>{
 const member=recordRelationships(figure('1',{entity_link:{entity_id:'5',link_type:'member'},site_link:{site_id:'2',link_type:'home'}})).edges;
 assert.deepEqual(relationshipWording(member[0]),{between:' is listed as a member of ',after:'.'});assert.deepEqual(relationshipWording(member[1]),{between:' lists ',after:' as a home.'});
 assert.deepEqual(relationshipWording({targetKind:'historical_figures',label:'Child'}),{between:' lists ',after:' as “Child”.'});
});

test('reciprocal edge labels occupy opposite sides of the same connection',()=>{
 const a={x:0,y:0},b={x:0,y:200},forward=relationshipCurve(a,b,0,'a','b'),reverse=relationshipCurve(b,a,1,'b','a');assert.equal(forward.labelX,-32);assert.equal(reverse.labelX,32);assert.equal(forward.labelY,reverse.labelY);assert(Math.hypot(forward.labelX-reverse.labelX,forward.labelY-reverse.labelY)>=64);
});
