let worker,world,serial=0;
const pending=new Map();
export function stopExplorer(){worker?.terminate();worker=null;world=null;for(const {reject,cleanup} of pending.values()){cleanup();reject(Error('Navigation changed.'));}pending.clear();}
export function explore(worldId,request,onProgress,signal) {
 if(signal?.aborted)return Promise.reject(new DOMException('Search cancelled.','AbortError'));
 if(world!==worldId)stopExplorer();
 if(!worker){world=worldId;worker=new Worker(new URL('./explorer-worker.js?v=0.16.0',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{if(data.type==='progress'){if(data.id)pending.get(data.id)?.onProgress?.(data.count,data.phase);else for(const p of pending.values())p.onProgress?.(data.count,'index');return;}const p=pending.get(data.id);if(!p)return;pending.delete(data.id);p.cleanup();data.error?p.reject(Error(data.error)):p.resolve(data.result);};
  worker.onerror=()=>stopExplorer();
 }
 return new Promise((resolve,reject)=>{const id=++serial,currentWorker=worker;const abort=()=>{pending.delete(id);signal.removeEventListener('abort',abort);currentWorker.postMessage({type:'cancel',cancelId:id});reject(new DOMException('Search cancelled.','AbortError'));};const cleanup=()=>signal?.removeEventListener('abort',abort);pending.set(id,{resolve,reject,onProgress,cleanup});signal?.addEventListener('abort',abort,{once:true});worker.postMessage({...request,worldId,id});});
}
