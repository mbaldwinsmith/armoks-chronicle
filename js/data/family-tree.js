// Layout changes presentation only. It never creates relatives, couples or reciprocal source links.
const parents=new Set(['mother','father','parent']),children=new Set(['child','son','daughter']),siblings=new Set(['sibling','brother','sister']);
export function familyRelation(edge){
 if(edge.sourceKind!=='historical_figures'||edge.targetKind!=='historical_figures'||edge.category!=='family')return null;
 if(parents.has(edge.type))return {kind:'parent',a:edge.target,b:edge.source,delta:1};
 if(children.has(edge.type))return {kind:'parent',a:edge.source,b:edge.target,delta:1};
 if(edge.type==='spouse'||siblings.has(edge.type)){const [a,b]=[edge.source,edge.target].sort();return {kind:edge.type==='spouse'?'spouse':'sibling',a,b,delta:0};}
 return {kind:'relative',a:edge.source,b:edge.target,delta:null};
}
export function layoutFamilyTree(nodes,edges,root){
 const byKey=new Map(nodes.map(n=>[n.key,n])),relations=new Map();
 for(const edge of edges){const relation=familyRelation(edge);if(!relation||!byKey.has(relation.a)||!byKey.has(relation.b))continue;
  const key=JSON.stringify([relation.kind,relation.a,relation.b,relation.kind==='relative'?edge.type:'']);
  if(!relations.has(key))relations.set(key,{...relation,key,edges:[],conflict:false});relations.get(key).edges.push(edge);
 }
 const priority={parent:0,spouse:1,sibling:2,relative:3};
 const links=[...relations.values()].sort((a,b)=>priority[a.kind]-priority[b.kind]||a.key.localeCompare(b.key,'en',{numeric:true})),adj=new Map(nodes.map(n=>[n.key,[]]));
 function offsets(start){const found=new Map([[start,0]]),queue=[start];for(let i=0;i<queue.length;i++)for(const next of adj.get(queue[i])||[])if(!found.has(next.key)){found.set(next.key,found.get(queue[i])+next.delta);queue.push(next.key);}return found;}
 for(const link of links){if(link.delta===null)continue;const known=offsets(link.a);
  // A self-relative or self-spouse link is anomalous even when its zero delta is consistent.
  if(link.a===link.b||(known.has(link.b)&&known.get(link.b)!==link.delta)){link.conflict=true;continue;}
  adj.get(link.a).push({key:link.b,delta:link.delta});adj.get(link.b).push({key:link.a,delta:-link.delta});
 }
 const generations=offsets(root),rows=new Map(),unplaced=[];
 for(const node of nodes){if(!generations.has(node.key)){unplaced.push(node);continue;}const rank=generations.get(node.key);if(!rows.has(rank))rows.set(rank,[]);rows.get(rank).push(node);}
 const compare=(a,b)=>String(a.label||a.id||a.key).localeCompare(String(b.label||b.id||b.key),'en',{numeric:true})||a.key.localeCompare(b.key);
 const spouseAdj=new Map(nodes.map(n=>[n.key,new Set()]));for(const link of links)if(link.kind==='spouse'&&!link.conflict){spouseAdj.get(link.a).add(link.b);spouseAdj.get(link.b).add(link.a);}
 const points=[],bands=[];
 for(const [generation,members] of [...rows].sort(([a],[b])=>a-b)){
  const ordered=[],seen=new Set(),sorted=[...members].sort(compare),seeds=sorted.some(n=>n.key===root)?[byKey.get(root),...sorted.filter(n=>n.key!==root)]:sorted;
  // Keep each explicit spouse group contiguous; multiple spouses remain distinct nodes.
  for(const seed of seeds){if(seen.has(seed.key))continue;const queue=[seed];seen.add(seed.key);for(let i=0;i<queue.length;i++){const node=queue[i];ordered.push(node);for(const next of sorted)if(!seen.has(next.key)&&spouseAdj.get(node.key).has(next.key)){seen.add(next.key);queue.push(next);}}}
  const focus=ordered.findIndex(n=>n.key===root),centre=focus<0?(ordered.length-1)/2:focus;
  ordered.forEach((node,i)=>points.push({...node,generation,x:(i-centre)*270,y:generation*210,unplaced:false}));
  bands.push({generation,y:generation*210,label:generation===0?'Focused Generation':`${Math.abs(generation)} ${Math.abs(generation)===1?'Generation':'Generations'} ${generation<0?'Above':'Below'}`});
 }
 if(unplaced.length){const y=(Math.max(0,...rows.keys())+1)*210;unplaced.sort(compare).forEach((node,i)=>points.push({...node,generation:null,x:(i-(unplaced.length-1)/2)*270,y,unplaced:true}));bands.push({generation:null,y,label:'Unplaced Relatives — Generation Not Established'});}
 return {nodes:points,links,bands,conflicts:links.filter(l=>l.conflict).length,unplaced:unplaced.length,conflictEdges:new Set(links.filter(l=>l.conflict).flatMap(l=>l.edges.map(e=>e.key)))};
}
