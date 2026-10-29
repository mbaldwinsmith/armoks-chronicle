import {trackTransaction} from '../offline/activity.js?v=0.34.0';
export const BACKUP_LIMIT=5*1024*1024;
export function parseTags(text){return [...new Set(String(text).split(',').map(tag=>tag.trim()).filter(Boolean))].slice(0,20).map(tag=>tag.slice(0,40));}
export function validateEntry(value){
 if(!value||typeof value!=='object'||! /^[a-z_]{1,80}$/.test(value.kind)||typeof value.id!=='string'||value.id.length<1||value.id.length>150||typeof value.label!=='string'||value.label.length>500||typeof value.note!=='string'||value.note.length>20000||typeof value.bookmarked!=='boolean'||!Array.isArray(value.tags)||value.tags.length>20||value.tags.some(tag=>typeof tag!=='string'||tag.length>40))throw Error('Invalid research entry or field limits exceeded.');
 return {kind:value.kind,id:value.id,label:value.label,note:value.note,bookmarked:value.bookmarked,tags:[...new Set(value.tags)]};
}
export function parseBackup(text){if(new TextEncoder().encode(text).length>BACKUP_LIMIT)throw Error('Backup exceeds 5 MB.');let data;try{data=JSON.parse(text);}catch{throw Error('Backup is not valid JSON.');}
 if(data?.format!=='armoks-chronicle-research'||data.version!==1||typeof data.world?.id!=='string'||data.world.id.length<1||data.world.id.length>150||typeof data.world.name!=='string'||data.world.name.length>500||!Array.isArray(data.entries)||data.entries.length>10000)throw Error('Unsupported or invalid research backup.');
 const keys=new Set(),entries=data.entries.map(value=>{const entry=validateEntry(value),key=JSON.stringify([entry.kind,entry.id]);if(keys.has(key))throw Error('Duplicate record in backup.');keys.add(key);return entry;});return {world:{id:data.world.id,name:data.world.name},entries};
}
export function makeBackup(world,entries){return JSON.stringify({format:'armoks-chronicle-research',version:1,exportedAt:new Date().toISOString(),world:{id:world.id,name:world.name},entries:entries.map(validateEntry)},null,2);}
const result=request=>new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
const done=tx=>(trackTransaction(tx),new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('Research save cancelled.'));tx.onerror=()=>{};}));
export const getResearch=(db,world,kind,id)=>result(db.transaction('annotations').objectStore('annotations').get([world,kind,id]));
export const listResearch=db=>result(db.transaction('annotations').objectStore('annotations').getAll());
export async function saveResearch(db,world,entry,expectedRevision){const clean=validateEntry(entry),tx=db.transaction('annotations','readwrite'),finished=done(tx),store=tx.objectStore('annotations');let saved,conflict=false;
 const request=store.get([world.id,clean.kind,clean.id]);request.onsuccess=()=>{const old=request.result;if((old?.updatedAt||0)!==expectedRevision){conflict=true;tx.abort();return;}saved={...clean,worldId:world.id,worldName:world.name,updatedAt:Math.max(Date.now(),(old?.updatedAt||0)+1)};store.put(saved);};
 try{await finished;}catch(error){if(conflict)throw Error('This entry changed in another tab. Your draft is still here; copy it before reopening the record.');throw error;}return saved;
}
export async function restoreResearch(db,world,entries){const clean=entries.map(validateEntry),tx=db.transaction(['annotations','worlds'],'readwrite'),finished=done(tx),store=tx.objectStore('annotations');let added=0,skipped=0,unavailable=false;const worldRequest=tx.objectStore('worlds').get(world.id);worldRequest.onsuccess=()=>{if(worldRequest.result?.status!=='ready'){unavailable=true;tx.abort();return;}for(const entry of clean){const request=store.get([world.id,entry.kind,entry.id]);request.onsuccess=()=>{if(request.result){skipped++;return;}store.put({...entry,worldId:world.id,worldName:world.name,updatedAt:Date.now()});added++;};}};
 try{await finished;}catch(error){if(unavailable)throw Error('Target world is no longer available.');throw error;}return {added,skipped};
}
// Scoped deletion is used for disposable integration fixtures; source-world deletion never calls it.
export async function removeResearchEntry(db,worldId,kind,id){const tx=db.transaction('annotations','readwrite'),finished=done(tx);tx.objectStore('annotations').delete([worldId,kind,id]);await finished;}
