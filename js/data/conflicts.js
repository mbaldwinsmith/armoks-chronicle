import {eventType} from './narrative.js?v=0.29.0';
import {eventDate,compareEvents} from './exploration.js?v=0.29.0';
import {sitePosition} from './terrain.js?v=0.29.0';
export const conflictTypes=new Set(['field battle','attacked site','hf attacked site','destroyed site','hf destroyed site','plundered site','hf simple battle event','hf wounded','hf died','hf abducted']);
export function conflictRecord(record,sites,width,height){const d=record.data,type=eventType(d);if(!conflictTypes.has(type))return null;
 const siteId=[d.site_id,d.site].find(value=>typeof value==='string'&&/^\d+$/.test(value));const site=sites.find(site=>site.id===siteId);
 const position=site?{x:site.x,y:site.y}:sitePosition(d,width,height);
 const roles=['attacker_civ_id','defender_civ_id','civ_id','site_civ_id','entity_id','entity','civ','site_civ','victim_entity'];const factions=[...new Set(roles.map(key=>d[key]).filter(value=>typeof value==='string'&&/^\d+$/.test(value)))];
 return {id:record.id,type,...eventDate(d),...(position||{}),siteId:site?.id||null,location:site?site.label:position?`Tile ${position.x}, ${position.y}`:'Location not recorded',locationEvidence:site?'Referenced site coordinates':position?'Event coordinates':'No usable site or coordinates',factions};
}
export function filterConflicts(events,{type='',from='',to='',faction=''}={}){return events.filter(event=>(!type||event.type===type)&&(!faction||event.factions.includes(faction))&&((from===''&&to==='')||(event.year!==null&&(from===''||event.year>=Number(from))&&(to===''||event.year<=Number(to))))).sort(compareEvents);}
export function conflictClusters(events){const clusters=new Map();for(const event of events){if(event.x===undefined)continue;const key=`${event.x},${event.y}`;if(!clusters.has(key))clusters.set(key,{x:event.x,y:event.y,count:0});clusters.get(key).count++;}return [...clusters.values()];}
export function mapConnections(cell,width,height,cells,kind){const out=[];for(const [dx,dy,bit] of [[0,-1,1],[0,1,2],[-1,0,4],[1,0,8]]){const x=cell.x+dx,y=cell.y+dy;if(x<0||y<0||x>=width||y>=height)continue;if(kind==='river'?(cell.river_dirs&bit):((cell.flags&4)&&(cells[y*width+x].flags&4)))out.push({x,y,dx,dy});}return out;}
