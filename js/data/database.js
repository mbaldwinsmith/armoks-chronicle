import { mergeData, displayName } from './records.js?v=0.8.1';
const NAME = 'armoks-chronicle';
export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      const worlds = db.createObjectStore('worlds', {keyPath:'id'});
      worlds.createIndex('status','status');
      const records = db.createObjectStore('records', {keyPath:['worldId','kind','id']});
      records.createIndex('world','worldId');
      records.createIndex('worldKind',['worldId','kind']);
      const files = db.createObjectStore('files', {keyPath:['worldId','name']});
      files.createIndex('world','worldId');
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(Error('Close other Armok’s Chronicle tabs, then reload to update storage.'));
    request.onsuccess = () => { const db=request.result; db.onversionchange=()=>db.close(); resolve(db); };
  });
}
function finished(tx) { return new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error || Error('Storage transaction cancelled.'));tx.onerror=()=>{};}); }
export async function saveWorld(db, world) { const tx=db.transaction('worlds','readwrite');tx.objectStore('worlds').put(world);await finished(tx); }
export async function saveFile(db, worldId, file) { const tx=db.transaction('files','readwrite');tx.objectStore('files').put({worldId,name:file.name,file});await finished(tx); }
export function getWorld(db,id) { return new Promise((resolve,reject)=>{const req=db.transaction('worlds').objectStore('worlds').get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);}); }
export function listWorlds(db) { return new Promise((resolve,reject)=>{const req=db.transaction('worlds').objectStore('worlds').index('status').getAll('ready');req.onsuccess=()=>resolve(req.result.sort((a,b)=>b.importedAt-a.importedAt));req.onerror=()=>reject(req.error);}); }
export async function saveRecords(db, worldId, records, source) {
  const tx=db.transaction('records','readwrite'), store=tx.objectStore('records');
  const done=finished(tx);
  for(const record of records) {
    const req=store.get([worldId,record.kind,record.id]);
    req.onsuccess=()=>{
      const old=req.result;
      const data=old ? mergeData(old.data,record.data) : record.data;
      store.put({...(old||{}),worldId,kind:record.kind,id:record.id,data,label:displayName(data,record.kind,record.id),sources:[...new Set([...(old?.sources||[]),source])],...(source==='plus'?{supplement:record.data}:{})});
    };
  }
  await done;
}
export function countKind(db,worldId,kind) {return new Promise((resolve,reject)=>{const req=db.transaction('records').objectStore('records').index('worldKind').count([worldId,kind]);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export function readPage(db,worldId,kind,offset=0,limit=50) {
  return new Promise((resolve,reject)=>{
    const rows=[];let skipped=false;
    const req=db.transaction('records').objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([worldId,kind]));
    req.onerror=()=>reject(req.error);
    req.onsuccess=()=>{const cursor=req.result;if(!cursor || rows.length===limit){resolve(rows);return;}if(offset && !skipped){skipped=true;cursor.advance(offset);return;}rows.push(cursor.value);cursor.continue();};
  });
}
export async function deleteWorld(db,worldId) {
  const tx=db.transaction(['worlds','records','files'],'readwrite');const done=finished(tx);
  tx.objectStore('worlds').delete(worldId);
  for(const name of ['records','files']){const req=tx.objectStore(name).index('world').openCursor(IDBKeyRange.only(worldId));req.onsuccess=()=>{const cursor=req.result;if(cursor){cursor.delete();cursor.continue();}};}
  await done;
}
export function getRecord(db,worldId,kind,id) {return new Promise((resolve,reject)=>{const req=db.transaction('records').objectStore('records').get([worldId,kind,id]);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
