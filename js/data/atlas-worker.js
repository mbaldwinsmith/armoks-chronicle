import {createWarfareIndex,collectionMembership,collectionKind} from './warfare.js?v=0.31.0';
import {cultureLabel} from './culture.js?v=0.31.0';
import {titleCase} from './language.js?v=0.31.0';
import {conflictRecord} from './conflicts.js?v=0.31.0';
import {openDatabase,getWorld} from './database.js?v=0.31.0';
import {parseTerrain,sitePosition} from './terrain.js?v=0.31.0';
self.onmessage=async({data})=>{let db;try{db=await openDatabase();const world=await getWorld(db,data.worldId);if(world?.status!=='ready')throw Error('World unavailable in this browser.');
 const get=(store,index,key)=>new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).index(index).getAll(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const [files,records,organisations]=await Promise.all([get('files','world',data.worldId),get('records','worldKind',[data.worldId,'sites']),get('records','worldKind',[data.worldId,'entities'])]);const file=files.find(row=>row.name.endsWith('world_map.csv'))?.file;
 if(!file){postMessage({missing:true,world});return;}if(file.size>64*1024*1024)throw Error('Map exceeds the supported 64 MB limit.');
 world.name=titleCase(world.name);
 const terrain=parseTerrain(await file.text()),sites=[];let unmapped=0;for(const record of records){const position=sitePosition(record.data,terrain.width,terrain.height);if(position)sites.push({id:record.id,label:cultureLabel(record),type:record.data.type||'site',owner:record.data.cur_owner_id,civilisation:record.data.civ_id,...position});else unmapped++;}
 let selected=null,collection=null,availableEvents=0;
 if(data.collectionId){if(!/^\d+$/.test(data.collectionId))throw Error('Invalid conflict collection ID.');const builder=createWarfareIndex();await new Promise((resolve,reject)=>{const r=db.transaction('records').objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([data.worldId,collectionKind]));r.onerror=()=>reject(r.error);r.onsuccess=()=>{const c=r.result;if(!c){resolve();return;}builder.accept(c.value);c.continue();};});const index=builder.finish(),root=index.collections.get(data.collectionId);if(!root)throw Error('Selected conflict collection is missing from this archive.');selected=collectionMembership(index,data.collectionId);collection={id:root.id,label:root.label,collections:selected.collectionIds.size,events:selected.eventIds.size,truncated:selected.truncated,missingCollections:selected.missingCollections.size,cycles:selected.cycles.size};}
 const conflicts=[];await new Promise((resolve,reject)=>{const request=db.transaction('records').objectStore('records').index('worldKind').openCursor(IDBKeyRange.only([data.worldId,'historical_events']));request.onerror=()=>reject(request.error);request.onsuccess=()=>{const cursor=request.result;if(!cursor){resolve();return;}if(!selected||selected.eventIds.has(String(cursor.value.id))){availableEvents++;const event=conflictRecord(cursor.value,sites,terrain.width,terrain.height);if(event)conflicts.push(event);}cursor.continue();};});
 if(collection)collection.missingEvents=collection.events-availableEvents;
 postMessage({world,terrain,sites,unmapped,conflicts,collection,entities:Object.fromEntries(organisations.map(record=>[record.id,cultureLabel(record)]))});
 }catch(error){postMessage({error:error.message});}finally{db?.close();}};
