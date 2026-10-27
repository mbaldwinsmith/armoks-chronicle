import {conflictRecord} from './conflicts.js?v=0.8.1';
import {openDatabase,getWorld} from './database.js?v=0.8.1';
import {parseTerrain,sitePosition} from './terrain.js?v=0.8.1';
self.onmessage=async({data})=>{let db;try{db=await openDatabase();const world=await getWorld(db,data.worldId);if(world?.status!=='ready')throw Error('World unavailable in this browser.');
 const get=(store,index,key)=>new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).index(index).getAll(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const [files,records,organisations]=await Promise.all([get('files','world',data.worldId),get('records','worldKind',[data.worldId,'sites']),get('records','worldKind',[data.worldId,'entities'])]);const file=files.find(row=>row.name.endsWith('world_map.csv'))?.file;
 if(!file){postMessage({missing:true,world});return;}if(file.size>64*1024*1024)throw Error('Map exceeds the supported 64 MB limit.');
 const terrain=parseTerrain(await file.text()),sites=[];let unmapped=0;for(const record of records){const position=sitePosition(record.data,terrain.width,terrain.height);if(position)sites.push({id:record.id,label:record.label,type:record.data.type||'site',owner:record.data.cur_owner_id,civilisation:record.data.civ_id,...position});else unmapped++;}
 const conflicts=[];await new Promise((resolve,reject)=>{const request=db.transaction('records').objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([data.worldId,'historical_events']));request.onerror=()=>reject(request.error);request.onsuccess=()=>{const cursor=request.result;if(!cursor){resolve();return;}const event=conflictRecord(cursor.value,sites,terrain.width,terrain.height);if(event)conflicts.push(event);cursor.continue();};});
 postMessage({world,terrain,sites,unmapped,conflicts,entities:Object.fromEntries(organisations.map(record=>[record.id,record.label]))});
 }catch(error){postMessage({error:error.message});}finally{db?.close();}};
