import test from 'node:test';import assert from 'node:assert/strict';
import {findConnection} from '../js/data/connections.js';
import {recordRelationships} from '../js/data/relationships.js';
import {recordKey} from '../js/data/exploration.js';
const key=id=>recordKey('historical_figures',id),org=id=>recordKey('entities',id);
function edge(from,to,type='friend',kind='historical_figures'){return recordRelationships({kind:'historical_figures',id:from,data:{[kind==='entities'?'entity_link':'hf_link']:{[kind==='entities'?'entity_id':'hfid']:to,link_type:type}},sources:['standard']}).edges[0];}
function setup(edges,known){const nodes=new Set(known||edges.flatMap(edge=>[edge.source,edge.target]));return {exists:key=>nodes.has(key),getNeighbours:async key=>({edges:edges.filter(edge=>edge.source===key||edge.target===key),invalid:0,truncated:false,recordsRead:1}),yieldTask:async()=>{}};}
test('breadth-first connection is shortest with deterministic ties, cycles and original evidence',async()=>{
 const edges=[edge('1','2','child'),edge('2','3','friend'),edge('1','4','spouse'),edge('4','3','enemy'),edge('2','1','father')],options={start:key('1'),end:key('3'),...setup(edges)};
 const result=await findConnection(options);assert.equal(result.status,'found');assert.equal(result.shortest,true);assert.deepEqual(result.nodes,[key('1'),key('2'),key('3')]);assert.equal(result.steps[0].edge.label,'Child');assert.equal(result.steps[0].edge.evidence[0].path,'hf_link');assert.deepEqual((await findConnection(options)).steps,result.steps);
});
test('reverse traversal preserves source roles rather than inventing an inverse relationship',async()=>{
 const original=edge('1','2','child'),result=await findConnection({start:key('2'),end:key('1'),...setup([original])});assert.equal(result.steps.length,1);assert.equal(result.steps[0].reversed,true);assert.equal(result.steps[0].edge.source,key('1'));assert.equal(result.steps[0].edge.label,'Child');
});
test('organisation shortcuts are opt-in and retain both supporting affiliation records',async()=>{
 const edges=[edge('1','5','member','entities'),edge('2','5','member','entities')],options={start:key('1'),end:key('2'),...setup(edges)};
 assert.equal((await findConnection(options)).status,'no_path');const result=await findConnection({...options,organisations:true});assert.deepEqual(result.nodes,[key('1'),org('5'),key('2')]);assert.equal(result.steps[1].reversed,true);assert.equal(result.steps[1].edge.source,key('2'));
});
test('a depth limit differs from a fully exhausted component, including boundary leaves',async()=>{
 const options={start:key('1'),end:key('4'),...setup([edge('1','2'),edge('2','3'),edge('3','4')])};const limited=await findConnection({...options,maxDepth:2});assert.equal(limited.status,'limited');assert(limited.reasons.includes('depth_limit'));
 const complete=await findConnection({start:key('1'),end:key('9'),maxDepth:1,...setup([edge('1','2')],[key('1'),key('2'),key('9')])});assert.equal(complete.status,'no_path');assert.equal(complete.reasons.length,0);
});
test('missing endpoints and missing intermediate records are distinguished without invented links',async()=>{
 assert.equal((await findConnection({start:key('1'),end:key('999'),...setup([],[key('1')])})).status,'missing_endpoint');
 const result=await findConnection({start:key('1'),end:key('3'),...setup([edge('1','2'),edge('2','3')],[key('1'),key('3')])});assert.equal(result.status,'no_path');assert.equal(result.missingRecords,1);
});
test('partial source scans qualify found routes instead of claiming shortest or complete absence',async()=>{
 const edges=[edge('1','2'),edge('2','3')],base=setup(edges);const options={start:key('1'),end:key('3'),...base,getNeighbours:async key=>({...await base.getNeighbours(key),truncated:true})};const result=await findConnection(options);assert.equal(result.status,'found');assert.equal(result.shortest,false);assert(result.reasons.includes('neighbourhood_limit'));
 const missing=await findConnection({...options,end:key('9'),exists:()=>true});assert.equal(missing.status,'limited');
});
test('node, link and source-reading budgets remain explicit and bounded',async()=>{
 const edges=[edge('1','2'),edge('1','3'),edge('2','4'),edge('3','5')],options={start:key('1'),end:key('9'),...setup(edges,[...edges.flatMap(edge=>[edge.source,edge.target]),key('9')])};
 const nodeLimited=await findConnection({...options,limits:{nodes:2}});assert.equal(nodeLimited.status,'limited');assert(nodeLimited.reasons.includes('node_limit'));assert(nodeLimited.stats.discovered<=2);
 const edgeLimited=await findConnection({...options,limits:{edges:1}});assert.equal(edgeLimited.status,'limited');assert(edgeLimited.reasons.includes('edge_limit'));
 const base=setup(edges),sourceLimited=await findConnection({...options,limits:{sourceRecords:1},getNeighbours:async(key,remaining)=>remaining?base.getNeighbours(key):{edges:[],truncated:true,budgetLimited:true,recordsRead:0}});assert.equal(sourceLimited.status,'limited');assert(sourceLimited.reasons.includes('source_record_limit'));assert.equal(sourceLimited.stats.sourceRecords,1);
});
test('same-figure selection requires no traversal, and cancellation stops asynchronous work',async()=>{
 let reads=0;const same=await findConnection({start:key('1'),end:key('1'),exists:()=>true,getNeighbours:async()=>{reads++;return {edges:[]};}});assert.equal(same.status,'found');assert.equal(same.steps.length,0);assert.equal(reads,0);
 let cancelled=false;const result=await findConnection({start:key('1'),end:key('2'),exists:()=>true,isCancelled:()=>cancelled,getNeighbours:async()=>{reads++;cancelled=true;return {edges:[edge('1','2')]};}});assert.equal(result.status,'cancelled');assert.equal(reads,1);
});
test('direct routes are checked before filling the next-layer node budget',async()=>{
 const edges=Array.from({length:20},(_,i)=>edge('1',String(i+2))),result=await findConnection({start:key('1'),end:key('21'),limits:{nodes:2},...setup(edges)});assert.equal(result.status,'found');assert.equal(result.steps.length,1);assert.equal(result.shortest,true);
});
