import {layoutFamilyTree} from '../data/family-tree.js?v=0.22.0';
import {drawFamilyTree} from './family-tree.js?v=0.22.0';
import {explore} from '../data/explorer-client.js?v=0.22.0';
import {recordKey,recordURL} from '../data/exploration.js?v=0.22.0';
import {relationshipCategories,relationshipLimits,addGraphPage,layoutRelationships,relationshipWording,relationshipCurve} from '../data/relationships.js?v=0.22.0';
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const svgEl=(tag,attrs={},text)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);if(text!==undefined)node.textContent=text;return node;};
const colours={family:'#a96692',social:'#497fa3',rivalry:'#bd6845',affiliation:'#658957',worship:'#9472bd',other:'#8a8b87'};
export function relationshipPanel(record,worldId,query,isCurrent=()=>true,options={}){
 const queryString=()=>typeof query==='function'?query():query;
 const root={key:recordKey(record.kind,record.id),kind:record.kind,id:record.id,label:record.label,missing:false};
 const section=el('section',undefined,'relationship-panel'),heading=el('h2','Family and Relationships'),introduction=el('p',undefined,'muted');section.append(heading,introduction);
 const toolbar=el('div',undefined,'relationship-toolbar'),category=el('select'),mode=el('select'),figure=el('select'),expand=el('button','Expand connections','quiet'),reset=el('button','Reset network','quiet');
 mode.id='relationship-layout';mode.add(new Option('Relationship Network','network'));mode.add(new Option('Family Tree','family'));mode.value=options.layout==='family'?'family':'network';
 category.id='relationship-category';figure.id='relationship-figure';category.add(new Option('All Recorded Relationships','all'));for(const [value,label] of Object.entries(relationshipCategories))category.add(new Option(label,value));
 for(const [node,label] of [[mode,'Diagram layout'],[category,'Relationship group'],[figure,'Expand a figure']]){const group=el('div'),caption=el('label',label);caption.htmlFor=node.id;group.append(caption,node);toolbar.append(group);}expand.type=reset.type='button';toolbar.append(expand,reset);
 const legend=el('ul',undefined,'relationship-legend');
 const status=el('p','Loading relationships…','notice'),detail=el('p',undefined,'muted');status.setAttribute('role','status');
 const zoom=el('div',undefined,'relationship-toolbar'),minus=el('button','Zoom out','quiet'),plus=el('button','Zoom in','quiet'),fit=el('button','Fit network','quiet');for(const button of [minus,plus,fit])button.type='button';zoom.append(minus,plus,fit,el('span','Scroll the diagram to pan. Names open record pages; expansion is also available in the list.','muted'));
 const viewport=el('div',undefined,'relationship-viewport');viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Relationship diagram; use arrow keys or scrollbars to pan');
 const svg=svgEl('svg',{role:'img','aria-label':`Recorded relationships around ${root.label}`});viewport.append(svg);
 const list=el('ul',undefined,'relationship-list');section.append(toolbar,legend,status,detail,zoom,viewport,el('h3','Recorded Connections'),el('p','Each row preserves the source’s relationship label and links to its supporting record. Snapshot links alone do not establish dates or current membership. Shared events and vague associations do not create connections here.','muted'),list);
 let state={nodes:[root],edges:[]},pages=new Map(),busy=false,serial=0,capped=false,scale=1,baseWidth=960,baseHeight=600,controller;
 section.dispose=()=>{serial++;controller?.abort();};
 const isFamily=()=>mode.value==='family';
 function presentation(){
  heading.textContent=isFamily()?'Family Tree':'Family and Relationships';
  introduction.textContent=isFamily()?'Parents appear above children; recorded spouses share a generation. Expand a figure to follow another branch. Shared parents do not establish a marriage, and missing links do not prove that someone has no family. Generations are relative to the focused figure, not birth dates.':'Explore explicit links from figure records, including links recorded only on the other person’s page. Arrows follow recorded links from their source to their target. Positions show a network, not generations.';
  expand.textContent=isFamily()?'Expand family branch':'Expand connections';reset.textContent=isFamily()?'Reset family tree':'Reset network';fit.textContent=isFamily()?'Fit family tree':'Fit network';
  viewport.setAttribute('aria-label',isFamily()?'Family tree diagram; use arrow keys or scrollbars to pan':'Relationship diagram; use arrow keys or scrollbars to pan');
 }
 function saveMode(){options.onLayout?.(mode.value);}
 function resetState(){state={nodes:[root],edges:[]};pages=new Map();capped=false;figure.value=root.key;void load(root.key);}
 function link(node,text){if(node.missing)return el('span',text||node.label,'muted');const a=el('a',text||node.label);a.href=recordURL(worldId,node.kind,node.id,queryString());return a;}
 function size(){svg.setAttribute('width',String(baseWidth*scale));svg.setAttribute('height',String(baseHeight*scale));}
 function fitNetwork(){scale=Math.min(1,Math.max(.15,Math.min((viewport.clientWidth||900)/baseWidth,(viewport.clientHeight||540)/baseHeight)));size();}
 plus.onclick=()=>{scale=Math.min(2.5,scale*1.25);size();};minus.onclick=()=>{scale=Math.max(.15,scale/1.25);size();};fit.onclick=fitNetwork;
 function render(){
  presentation();const tree=isFamily()?layoutFamilyTree(state.nodes,state.edges,root.key):null;
  const selected=figure.value||root.key;figure.replaceChildren();for(const node of state.nodes)if(node.kind==='historical_figures'&&!node.missing){const page=pages.get(node.key),complete=page&&page.next>=page.total;figure.add(new Option(`${node.label}${complete?' · expanded':''}`,node.key));}figure.value=state.nodes.some(node=>node.key===selected)?selected:root.key;
  const page=pages.get(figure.value);expand.disabled=busy||capped||Boolean(page&&page.next>=page.total);category.disabled=busy||isFamily();mode.disabled=reset.disabled=busy;
  const partial=[...pages.values()].some(page=>page.truncated),invalid=[...pages.values()].reduce((total,page)=>total+page.invalid,0),remaining=page?Math.max(0,page.total-page.next):null;
  status.textContent=`${state.nodes.length} records · ${state.edges.length} recorded connections`+(busy?' · Loading…':capped?' · Display limit reached. Reset or choose a relationship group to narrow the network.':state.edges.length===0?' · No matching explicit connections found in the records examined.':remaining?' · More connections are available for the selected figure.':'');
  detail.textContent=`Up to ${relationshipLimits.page} links per expansion, ${relationshipLimits.nodes} records and ${relationshipLimits.edges} connections on screen.`+(partial?' This neighbourhood is incomplete: a source-reading limit was reached. More relationships may exist in the source records.':'')+(invalid?` ${invalid} ${invalid===1?'link from an expanded record has an unusable target ID':'links from expanded records have unusable target IDs'}; inspect the source records for details.`:'')+(state.nodes.some(node=>node.missing)?' Dashed records are missing from this archive and cannot be opened.':'');
  if(tree)detail.textContent+=' Only explicit parent/child, spouse and sibling links place generations. Other relatives remain unplaced unless a direct chain establishes their row. '+(tree.conflicts?`${tree.conflicts} placement conflict(s): red dashed links disagree with this arrangement. A consistent subset determines positions; no source is chosen as historical truth.`:'No generation-placement conflicts in the displayed links.')+(tree.unplaced?` ${tree.unplaced} relative(s) have no established generation relative to the focused figure.`:'');
  legend.replaceChildren();for(const key of new Set(state.edges.map(edge=>edge.category))){const item=el('li'),swatch=el('span');swatch.style.backgroundColor=colours[key];swatch.setAttribute('aria-hidden','true');item.append(swatch,document.createTextNode(relationshipCategories[key]));legend.append(item);}
  if(tree){legend.replaceChildren();for(const [label,cls] of [['Parent → Child','family-parent'],['Recorded Spouses','family-spouse'],['Other Family Link','family-other'],['Placement Conflict','family-conflict']]){const item=el('li'),swatch=el('span',undefined,cls);swatch.setAttribute('aria-hidden','true');item.append(swatch,document.createTextNode(label));legend.append(item);}}
  list.replaceChildren();const byKey=new Map(state.nodes.map(node=>[node.key,node]));
  for(const edge of state.edges){const source=byKey.get(edge.source),target=byKey.get(edge.target),item=el('li'),wording=relationshipWording(edge);item.append(el('span',relationshipCategories[edge.category],'relationship-category'),link(source),document.createTextNode(wording.between),link(target),document.createTextNode(wording.after+' '));
   if(tree?.conflictEdges.has(edge.key))item.append(el('strong',' Generation placement conflict — inspect the original claims.','family-conflict-note'));
   for(const node of [source,target].filter((node,i,nodes)=>node.kind==='historical_figures'&&!node.missing&&nodes.findIndex(other=>other.key===node.key)===i)){const button=el('button',`Expand ${node.label}`,'quiet');button.type='button';const cursor=pages.get(node.key);button.disabled=busy||capped||Boolean(cursor&&cursor.next>=cursor.total);button.onclick=()=>{figure.value=node.key;void load(node.key);};item.append(button);}
   const evidence=el('details'),summary=el('summary','Source evidence'),facts=el('ul');for(const entry of edge.evidence){const fact=el('li',`${entry.origin}: ${entry.path}`+(entry.sources.length?` (${entry.sources.join(', ')})`:'')+(entry.strength!==undefined?` · link_strength: ${entry.strength}`:'')+(entry.startYear!==undefined?` · start_year: ${entry.startYear}`:'')+(entry.endYear!==undefined?` · end_year: ${entry.endYear}`:''));facts.append(fact);}evidence.append(summary,facts);
   if(edge.moreEvidence)evidence.append(el('p','More repeated evidence exists; inspect the source record.','muted'));
   const sourceQuery=new URLSearchParams(queryString().replace(/^\?/,''));sourceQuery.set('source','1');const sourceLink=el('a','Open supporting source record');sourceLink.href=recordURL(worldId,edge.sourceKind,edge.sourceId,'?'+sourceQuery);evidence.append(sourceLink);item.append(evidence);list.append(item);
  }
  if(!state.edges.length)list.append(el('li','No connections to list for this selection. Missing links do not prove that a figure has no relatives or associates.'));
  draw(tree);
 }
 function draw(tree){
  if(tree){const bounds=drawFamilyTree(svg,tree,root,worldId,queryString());baseWidth=bounds.width;baseHeight=bounds.height;fitNetwork();return;}
  svg.setAttribute('aria-label',`Recorded relationships around ${root.label}`);
  const points=layoutRelationships(state.nodes,state.edges,root.key),byKey=new Map(points.map(node=>[node.key,node])),minX=Math.min(...points.map(node=>node.x))-135,minY=Math.min(...points.map(node=>node.y))-90;
  baseWidth=Math.max(420,Math.max(...points.map(node=>node.x))-minX+135);baseHeight=Math.max(250,Math.max(...points.map(node=>node.y))-minY+90);svg.setAttribute('viewBox',`${minX} ${minY} ${baseWidth} ${baseHeight}`);svg.replaceChildren(svgEl('title',{},`Recorded relationships around ${root.label}`));
  const defs=svgEl('defs');for(const [key,colour] of Object.entries(colours)){const marker=svgEl('marker',{id:`relationship-arrow-${key}`,viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'});marker.append(svgEl('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:colour}));defs.append(marker);}svg.append(defs);
  const pairCounts=new Map();for(const edge of state.edges){const a=byKey.get(edge.source),b=byKey.get(edge.target);if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
   const endPoint=(node,sign)=>{const factor=Math.min(104/(Math.abs(dx)||1),29/(Math.abs(dy)||1));return {x:node.x+dx*factor*sign,y:node.y+dy*factor*sign};};
   const start=endPoint(a,1),end=endPoint(b,-1),pair=[edge.source,edge.target].sort().join('|'),n=pairCounts.get(pair)||0;pairCounts.set(pair,n+1);const curve=relationshipCurve(a,b,n,edge.source,edge.target),mx=curve.x,my=curve.y;
   const path=a===b?`M ${a.x+100} ${a.y} C ${a.x+190} ${a.y-100}, ${a.x-30} ${a.y-130}, ${a.x} ${a.y-29}`:`M ${start.x} ${start.y} Q ${mx} ${my} ${end.x} ${end.y}`;
   const line=svgEl('path',{d:path,fill:'none',stroke:colours[edge.category],'stroke-width':'2','marker-end':`url(#relationship-arrow-${edge.category})`});line.append(svgEl('title',{},`${a.label}${relationshipWording(edge).between}${b.label}${relationshipWording(edge).after}`));svg.append(line,svgEl('text',{x:a===b?a.x+65:curve.labelX,y:a===b?a.y-80:curve.labelY-4,'text-anchor':'middle',class:'relationship-edge-label'},edge.label.length>28?edge.label.slice(0,26)+'…':edge.label));
  }
  for(const node of points){const wrapper=svgEl(node.missing?'g':'a',node.missing?{}:{href:recordURL(worldId,node.kind,node.id,queryString()),'aria-label':`Open ${node.label}`}),group=svgEl('g',{'class':`relationship-node${node.missing?' missing':''}${node.key===root.key?' root':''}`});wrapper.append(svgEl('title',{},node.label),group);group.append(svgEl('rect',{x:node.x-104,y:node.y-29,width:208,height:58,rx:node.kind==='historical_figures'?12:2}));const label=Array.from(node.label),short=label.length>24?label.slice(0,22).join('')+'…':node.label;group.append(svgEl('text',{x:node.x,y:node.y-2,'text-anchor':'middle'},short),svgEl('text',{x:node.x,y:node.y+17,'text-anchor':'middle',class:'relationship-node-kind'},node.kind==='historical_figures'?'Figure':node.kind==='entities'?'Organisation':'Site'));svg.append(wrapper);}
  fitNetwork();
 }
 async function load(key){
  if(busy||!isCurrent())return;const focusTarget=document.activeElement,restoreFocus=section.contains(focusTarget);busy=true;controller=new AbortController();const signal=controller.signal;const ticket=++serial;render();
  try{const node=state.nodes.find(node=>node.key===key),previous=pages.get(key),page=await explore(worldId,{type:'relationships',kind:node.kind,recordId:node.id,category:category.value,offset:previous?.next||0},undefined,signal);if(ticket!==serial||!isCurrent())return;
   const merged=addGraphPage(state,page);state={nodes:merged.nodes,edges:merged.edges};capped=merged.capped;pages.set(key,page);busy=false;render();if(restoreFocus)(section.contains(focusTarget)&&!focusTarget.disabled?focusTarget:figure).focus();
  }catch(error){if(ticket===serial&&isCurrent()){busy=false;render();status.textContent=`Relationships unavailable: ${error.message} You can try expanding again.`;}}
 }
 figure.onchange=()=>render();expand.onclick=()=>void load(figure.value);reset.onclick=category.onchange=resetState;
 mode.onchange=()=>{category.value=isFamily()?'family':'all';saveMode();resetState();};
 if(isFamily())category.value='family';presentation();
 void load(root.key);return section;
}
