import test from 'node:test';import assert from 'node:assert/strict';
import {recordKey} from '../js/data/exploration.js';
import {recordRelationships} from '../js/data/relationships.js';
import {familyRelation,layoutFamilyTree} from '../js/data/family-tree.js';
const key=id=>recordKey('historical_figures',String(id));
const node=(id,extra={})=>({key:key(id),kind:'historical_figures',id:String(id),label:`Figure ${id}`,...extra});
const links=(id,values,supplement)=>recordRelationships({kind:'historical_figures',id:String(id),data:{hf_link:values},supplement}).edges;
const edge=(id,type)=>({hfid:String(id),link_type:type});
const at=(layout,id)=>layout.nodes.find(n=>n.id===String(id));
test('family direction follows target roles and reciprocal parent claims share one connector without inventing a couple',()=>{
 const source=[...links(1,[edge(2,'mother'),edge(3,'father')]),...links(2,[edge(1,'child')])],layout=layoutFamilyTree([node(1),node(2),node(3)],source,key(1));
 assert.equal(at(layout,1).generation,0);assert.equal(at(layout,2).generation,-1);assert.equal(at(layout,3).generation,-1);assert.equal(layout.links.length,2);assert.equal(layout.links.find(l=>l.a===key(2)).edges.length,2);assert(!layout.links.some(l=>l.kind==='spouse'));assert.equal(layout.conflicts,0);
});
test('multiple recorded spouses remain separate alongside the focused figure and child branches expand across generations',()=>{
 const edges=[...links(1,[edge(2,'spouse'),edge(3,'spouse'),edge(4,'daughter')]),...links(4,[edge(5,'son')])],layout=layoutFamilyTree([1,2,3,4,5].map(id=>node(id)),edges,key(1));
 assert.equal(at(layout,1).x,0);for(const id of [2,3])assert.equal(at(layout,id).y,at(layout,1).y);assert.notEqual(at(layout,2).x,at(layout,3).x);assert.equal(at(layout,4).generation,1);assert.equal(at(layout,5).generation,2);assert.equal(layout.links.filter(l=>l.kind==='spouse').length,2);
});
test('missing relatives retain explicit placement while extended relatives stay unplaced without an invented ancestry chain',()=>{
 const source=links(1,[edge(2,'father'),edge(3,'cousin'),edge(4,'aunt')]),layout=layoutFamilyTree([node(1),node(2,{missing:true}),node(3),node(4)],source,key(1));
 assert.equal(at(layout,2).generation,-1);assert.equal(at(layout,2).missing,true);assert.equal(at(layout,3).generation,null);assert.equal(layout.unplaced,2);assert.equal(layout.bands.at(-1).generation,null);
});
test('parent cycles terminate, flag the inconsistent claim and retain all original evidence',()=>{
 const edges=[...links(1,[edge(2,'child')]),...links(2,[edge(3,'child')]),...links(3,[edge(1,'child')])],before=JSON.stringify(edges),layout=layoutFamilyTree([1,2,3].map(id=>node(id)),edges,key(1));
 assert.equal(layout.conflicts,1);assert.equal(layout.links.length,3);assert.equal(layout.conflictEdges.size,1);assert.equal(layout.links.flatMap(l=>l.edges).length,3);assert.equal(JSON.stringify(edges),before);assert(layout.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)));
});
test('contradictory spouse and parent roles and self links stay inspectable instead of silently changing generations',()=>{
 const edges=links(1,[edge(2,'child'),edge(2,'spouse'),edge(1,'spouse'),edge(1,'father')]),layout=layoutFamilyTree([node(1),node(2)],edges,key(1));
 assert.equal(at(layout,2).generation,1);assert.equal(layout.conflicts,3);assert.equal(layout.links.length,4);assert.equal(layout.conflictEdges.size,3);
});
test('siblings have a shared relative generation, while social, organisation and event associations never place family',()=>{
 const edges=links(1,[edge(2,'sister'),edge(3,'friend')]),layout=layoutFamilyTree([node(1),node(2)],edges,key(1));assert.equal(at(layout,2).generation,0);assert.equal(layout.links.length,1);assert.equal(familyRelation(edges.find(e=>e.type==='friend')),null);
 assert.equal(familyRelation({sourceKind:'historical_figures',targetKind:'entities',category:'family',type:'parent'}),null);
});
test('forty-node rows are deterministic, do not overlap, and never duplicate multiply referenced ancestors',()=>{
 const nodes=Array.from({length:40},(_,i)=>node(i+1)),edges=links(1,nodes.slice(1).map(n=>edge(n.id,'spouse'))),before=JSON.stringify(nodes),one=layoutFamilyTree(nodes,edges,key(1)),two=layoutFamilyTree([...nodes].reverse(),[...edges].reverse(),key(1));
 assert.deepEqual(one.nodes,two.nodes);assert.equal(one.nodes.length,40);assert.equal(JSON.stringify(nodes),before);for(let i=0;i<one.nodes.length;i++)for(let j=i+1;j<one.nodes.length;j++)assert(Math.abs(one.nodes[i].x-one.nodes[j].x)>=208||Math.abs(one.nodes[i].y-one.nodes[j].y)>=58);
 const shared=[...links(1,[edge(2,'father'),edge(3,'mother')]),...links(2,[edge(4,'mother')]),...links(3,[edge(4,'mother')])],pedigree=layoutFamilyTree([1,2,3,4].map(id=>node(id)),shared,key(1));assert.equal(pedigree.nodes.length,4);assert.equal(at(pedigree,4).generation,-2);assert.equal(pedigree.conflicts,0);
});
test('merged and Plus family evidence retains independent claims and empty families still show the focused figure',()=>{
 const edges=links(1,[edge(2,'spouse')],{hf_link:[edge(2,'spouse'),edge(2,'father')]}),layout=layoutFamilyTree([node(1),node(2)],edges,key(1));assert.equal(layout.links.length,2);assert.equal(layout.links.find(l=>l.kind==='spouse').edges[0].evidence.length,2);assert.equal(layout.conflicts,1);
 const empty=layoutFamilyTree([node(1)],[],key(1));assert.equal(empty.nodes.length,1);assert.equal(empty.nodes[0].generation,0);assert.equal(empty.conflicts,0);assert.equal(empty.unplaced,0);
});
