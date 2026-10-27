// Breadth-first traversal of explicit links in either direction. Source roles never change.
export const connectionLimits={nodes:500,edges:40000,sourceRecords:4000,depth:8};
export function connectionEdgeAllowed(edge,organisations=false){
 const kinds=organisations?['historical_figures','entities']:['historical_figures'];
 return kinds.includes(edge.sourceKind)&&kinds.includes(edge.targetKind);
}
export async function findConnection({start,end,getNeighbours,exists,organisations=false,maxDepth=6,limits={},isCancelled=()=>false,onProgress=()=>{},yieldTask=()=>new Promise(resolve=>setTimeout(resolve,0))}){
 const budget={...connectionLimits,...limits},depth=Math.max(1,Math.min(budget.depth,Math.floor(Number(maxDepth)||6))),stats={examined:0,discovered:1,edges:0,sourceRecords:0,invalidLinks:0},reasons=new Set(),missing=new Set();
 const result=(status,extra={})=>({status,...extra,stats:{...stats},reasons:[...reasons].sort(),missingRecords:missing.size,maxDepth:depth,organisations});
 if(!exists(start)||!exists(end))return result('missing_endpoint',{missingEndpoints:[start,end].filter(key=>!exists(key))});
 if(start===end)return result('found',{nodes:[start],steps:[],shortest:true});
 const parents=new Map([[start,null]]),queue=[{key:start,depth:0}];let head=0;
 function found(current,edge){
  const steps=[{from:current,to:end,edge,reversed:edge.source!==current}];let cursor=current;
  while(parents.get(cursor)){const parent=parents.get(cursor);steps.unshift({from:parent.from,to:cursor,edge:parent.edge,reversed:parent.edge.source!==parent.from});cursor=parent.from;}
  return result('found',{nodes:[start,...steps.map(step=>step.to)],steps,shortest:steps.length<=1||reasons.size===0});
 }
 while(head<queue.length){
  if(isCancelled())return result('cancelled');
  const current=queue[head++];stats.examined++;onProgress(stats.examined);
  const neighbours=await getNeighbours(current.key,Math.max(0,budget.sourceRecords-stats.sourceRecords));
  if(isCancelled())return result('cancelled');
  stats.sourceRecords+=neighbours.recordsRead||0;stats.invalidLinks+=neighbours.invalid||0;
  if(neighbours.truncated)reasons.add(neighbours.budgetLimited?'source_record_limit':'neighbourhood_limit');
  const candidates=[];
  // Check all direct candidates before filling the next layer's node budget.
  for(const edge of neighbours.edges){
   if(++stats.edges>budget.edges){reasons.add('edge_limit');return result('limited');}
   if(!connectionEdgeAllowed(edge,organisations)||!(edge.source===current.key||edge.target===current.key))continue;
   const next=edge.source===current.key?edge.target:edge.source;
   if(!exists(next)){missing.add(next);continue;}
   if(parents.has(next))continue;
   if(current.depth>=depth){reasons.add('depth_limit');continue;}
   if(next===end)return found(current.key,edge);
   candidates.push({next,edge});
  }
  for(const {next,edge} of candidates){
   if(parents.has(next))continue;
   if(parents.size>=budget.nodes){reasons.add('node_limit');continue;}
   parents.set(next,{from:current.key,edge});queue.push({key:next,depth:current.depth+1});stats.discovered=parents.size;
  }
  if(stats.examined%8===0)await yieldTask();
 }
 return result(reasons.size?'limited':'no_path');
}
