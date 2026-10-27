import {openDatabase,getWorld} from './database.js?v=0.6.0';
import {parseTerrain,sitePosition} from './terrain.js?v=0.6.0';
self.onmessage=async({data})=>{let db;try{db=await openDatabase();const world=await getWorld(db,data.worldId);if(world?.status!=='ready')throw Error('World unavailable in this browser.');
 const get=(store,index,key)=>new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).index(index).getAll(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const [files,records,organisations]=await Promise.all([get('files','world',data.worldId),get('records','worldKind',[data.worldId,'sites']),get('records','worldKind',[data.worldId,'entities'])]);const file=files.find(row=>row.name.endsWith('world_map.csv'))?.file;
 if(!file){postMessage({missing:true,world});return;}if(file.size>64*1024*1024)throw Error('Map exceeds the supported 64 MB limit.');
 const terrain=parseTerrain(await file.text()),sites=[];let unmapped=0;for(const record of records){const position=sitePosition(record.data,terrain.width,terrain.height);if(position)sites.push({id:record.id,label:record.label,type:record.data.type||'site',owner:record.data.cur_owner_id,civilisation:record.data.civ_id,...position});else unmapped++;}
 postMessage({world,terrain,sites,unmapped,entities:Object.fromEntries(organisations.map(record=>[record.id,record.label]))});
 }catch(error){postMessage({error:error.message});}finally{db?.close();}};
