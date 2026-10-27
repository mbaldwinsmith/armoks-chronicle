let worker,world,serial=0;
const pending=new Map();
export function stopExplorer(){worker?.terminate();worker=null;world=null;for(const {reject} of pending.values())reject(Error('Navigation changed.'));pending.clear();}
export function explore(worldId,request,onProgress) {
 if(world!==worldId)stopExplorer();
 if(!worker){world=worldId;worker=new Worker(new URL('./explorer-worker.js?v=0.3.0',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{if(data.type==='progress'){for(const p of pending.values())p.onProgress?.(data.count);return;}const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.error?p.reject(Error(data.error)):p.resolve(data.result);};
  worker.onerror=()=>stopExplorer();
 }
 return new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject,onProgress});worker.postMessage({...request,worldId,id});});
}
