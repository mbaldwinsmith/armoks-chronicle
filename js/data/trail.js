import {clippedLabel} from './language.js?v=0.24.0';
export const trailLimit=12;
export const trailKey=worldId=>'armoks-chronicle:trail:v1:'+encodeURIComponent(worldId);
const fallbackStorage=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
const valid=r=>r&&typeof r.kind==='string'&&/^[a-z_]{1,80}$/.test(r.kind)&&typeof r.id==='string'&&r.id.length>0&&r.id.length<=128&&typeof r.label==='string'&&r.label.trim()!==''&&r.label.length<=480&&Number.isSafeInteger(r.visitedAt)&&r.visitedAt>=0&&r.visitedAt<=8640000000000000;
export function readTrail(worldId,storage=fallbackStorage()){
 if(!storage)return {entries:[],available:false};try{const raw=storage.getItem(trailKey(worldId));if(raw===null)return {entries:[],available:true};if(raw.length>64000)throw Error('Oversized trail');const data=JSON.parse(raw);if(data.version!==1||data.worldId!==worldId||!Array.isArray(data.entries)||data.entries.length>trailLimit||!data.entries.every(valid))throw Error('Invalid trail');const seen=new Set(),entries=[];for(const r of data.entries){const key=JSON.stringify([r.kind,r.id]);if(seen.has(key))continue;seen.add(key);entries.push({...r,label:clippedLabel(r.label)});}return {entries,available:true};}catch{return {entries:[],available:false};}
}
export function recordVisit(worldId,record,storage=fallbackStorage(),now=Date.now()){
 const entry={kind:record.kind,id:String(record.id),label:clippedLabel(record.label),visitedAt:now};if(!storage||!valid(entry))return false;try{const previous=readTrail(worldId,storage).entries.filter(r=>r.kind!==entry.kind||r.id!==entry.id),entries=[entry,...previous].slice(0,trailLimit);storage.setItem(trailKey(worldId),JSON.stringify({version:1,worldId,entries}));return true;}catch{return false;}
}
export function clearTrail(worldId,storage=fallbackStorage()){if(!storage)return false;try{storage.removeItem(trailKey(worldId));return true;}catch{return false;}}
