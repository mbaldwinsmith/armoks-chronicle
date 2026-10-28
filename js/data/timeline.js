import {readingPresets,routineGroups} from './narrative.js?v=0.23.1';
export const timelineKeys=['eventType','eventFrom','eventTo','eventPreset','eventExclude','eventOffset'];
export function timelineSelection(params){
 return {type:params.get('eventType')||'',from:params.get('eventFrom')||'',to:params.get('eventTo')||'',preset:Object.hasOwn(readingPresets,params.get('eventPreset'))?params.get('eventPreset'):'all',exclude:(params.get('eventExclude')||'').split(',').filter(key=>Object.hasOwn(routineGroups,key))};
}
export function timelineParams(params,selection,offset=0){
 const result=new URLSearchParams(params);timelineKeys.forEach(key=>result.delete(key));
 const values={eventType:selection.type,eventFrom:selection.from,eventTo:selection.to,eventPreset:selection.preset==='all'?'':selection.preset,eventExclude:selection.exclude.join(','),eventOffset:offset?String(offset):''};
 for(const [key,value] of Object.entries(values))if(value)result.set(key,value);
 return result;
}
export function timelineGroups(rows){
 const groups=[];for(const row of rows){const label=row.year===null?'Year Not Recorded':`Year ${row.year}`;if(groups.at(-1)?.label!==label)groups.push({label,rows:[]});groups.at(-1).rows.push(row);}return groups;
}
