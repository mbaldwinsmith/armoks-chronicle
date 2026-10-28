import {recordURL} from '../data/exploration.js?v=0.16.1';
import {relationshipWording} from '../data/relationships.js?v=0.16.1';
const svgEl=(tag,attrs={},text)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);if(text!==undefined)node.textContent=text;return node;};
export function drawFamilyTree(svg,layout,root,worldId,query){
 const points=layout.nodes,byKey=new Map(points.map(n=>[n.key,n])),minX=Math.min(...points.map(n=>n.x))-170,minY=Math.min(...points.map(n=>n.y))-110;
 const width=Math.max(500,Math.max(...points.map(n=>n.x))-minX+170),height=Math.max(280,Math.max(...points.map(n=>n.y))-minY+150);
 svg.setAttribute('viewBox',`${minX} ${minY} ${width} ${height}`);svg.setAttribute('aria-label',`Recorded family tree around ${root.label}`);svg.replaceChildren(svgEl('title',{},`Recorded family tree around ${root.label}`),svgEl('desc',{},'Parents are placed above children; spouses share a row. Red dashed links disagree with the chosen generation layout. Other relatives have dashed connectors. Each source claim is also available in the recorded connections list.'));
 const defs=svgEl('defs'),marker=svgEl('marker',{id:'family-child-arrow',viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto'});marker.append(svgEl('path',{d:'M 0 0 L 10 5 L 0 10 z',class:'family-arrow'}));defs.append(marker);svg.append(defs);
 for(const band of layout.bands){svg.append(svgEl('text',{x:minX+12,y:band.y-82,class:'family-generation'},band.label),svgEl('line',{x1:minX+12,x2:minX+width-12,y1:band.y-66,y2:band.y-66,class:'family-generation-rule'}));}
 const pairCounts=new Map();for(const relation of layout.links){const a=byKey.get(relation.a),b=byKey.get(relation.b);if(!a||!b)continue;
  const pair=[a.key,b.key].sort().join('|'),lane=pairCounts.get(pair)||0;pairCounts.set(pair,lane+1);let path,x,y;
  if(relation.kind==='parent'&&!relation.conflict&&!a.unplaced&&!b.unplaced){
   const middle=(a.y+b.y)/2+lane*10;path=`M ${a.x} ${a.y+29} C ${a.x} ${middle}, ${b.x} ${middle}, ${b.x} ${b.y-29}`;x=(a.x+b.x)/2;y=middle-8;
  }else if(a.key===b.key){path=`M ${a.x+104} ${a.y} C ${a.x+170} ${a.y-65}, ${a.x+40} ${a.y-100}, ${a.x} ${a.y-29}`;x=a.x+70;y=a.y-55;
  }else if(a.y===b.y){
   const left=a.x<b.x?a:b,right=a.x<b.x?b:a,rail=a.y-43-lane*14;
   path=`M ${left.x+104} ${left.y} Q ${(left.x+right.x)/2} ${rail-35}, ${right.x-104} ${right.y}`;x=(left.x+right.x)/2;y=rail-4;
  }else{
   const rail=Math.max(a.x,b.x)+130+lane*18;path=`M ${a.x+104} ${a.y} C ${rail} ${a.y}, ${rail} ${b.y}, ${b.x+104} ${b.y}`;x=rail;y=(a.y+b.y)/2;
  }
  const line=svgEl('path',{d:path,fill:'none',class:`family-line ${relation.conflict?'family-conflict':relation.kind==='parent'?'family-parent':relation.kind==='spouse'?'family-spouse':'family-other'}`,...(relation.kind==='parent'&&!relation.conflict&&!a.unplaced&&!b.unplaced?{'marker-end':'url(#family-child-arrow)'}:{})});
  const source=relation.edges[0],s=byKey.get(source.source),t=byKey.get(source.target),wording=relationshipWording(source);line.append(svgEl('title',{},`${s.label}${wording.between}${t.label}${wording.after}${relation.conflict?' Placement conflict; inspect source evidence.':''}`));
  const label=relation.conflict?'Placement Conflict':relation.kind==='parent'?'Parent → Child':relation.kind==='spouse'?'Spouses':relation.edges.map(e=>e.label).filter((v,i,a)=>a.indexOf(v)===i).join(' / ');
  svg.append(line,svgEl('text',{x,y,'text-anchor':'middle',class:'relationship-edge-label'},label));
 }
 for(const node of points){const wrapper=svgEl(node.missing?'g':'a',node.missing?{}:{href:recordURL(worldId,node.kind,node.id,query),'aria-label':`Open ${node.label}`}),group=svgEl('g',{class:`relationship-node${node.missing?' missing':''}${node.key===root.key?' root':''}`});wrapper.append(svgEl('title',{},node.label),group);group.append(svgEl('rect',{x:node.x-104,y:node.y-29,width:208,height:58,rx:12}));const chars=Array.from(node.label),name=chars.length>24?chars.slice(0,22).join('')+'…':node.label;
  group.append(svgEl('text',{x:node.x,y:node.y-2,'text-anchor':'middle'},name),svgEl('text',{x:node.x,y:node.y+17,'text-anchor':'middle',class:'relationship-node-kind'},node.missing?'Missing Figure':node.key===root.key?'Focused Figure':node.unplaced?'Generation Unplaced':`Generation ${node.generation>0?'+':''}${node.generation}`));svg.append(wrapper);
 }
 return {width,height};
}
