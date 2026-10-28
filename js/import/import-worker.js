import { parseXML, PARSER_VERSION } from './parser.js?v=0.22.0';
import { openDatabase, saveWorld, saveRecords, countKind, saveFile, deleteWorld } from '../data/database.js?v=0.22.0';
self.addEventListener('message', async ({data}) => {
  if(data.type !== 'import') return;
  const {worldId,files}=data;
  let db;
  const send = message => self.postMessage({worldId,...message});
  try {
    const standard=files.find(f=>/(?:^|-)legends\.xml$/i.test(f.name));
    const plus=files.find(f=>/(?:^|-)legends_plus\.xml$/i.test(f.name));
    if(!standard) throw Error('Select a standard legends.xml export.');
    db=await openDatabase();
    const world={id:worldId,status:'staging',name:standard.name.replace(/-?legends\.xml$/i,''),importedAt:Date.now(),parserVersion:PARSER_VERSION,files:files.map(f=>({name:f.name,size:f.size})),counts:{},diagnostics:[]};
    await saveWorld(db,world);
    const kinds=new Set();
    for(const [source,file] of [['standard',standard],['plus',plus]]) {
      if(!file) continue;
      send({type:'progress',stage:`Reading ${file.name}`,percent:0});
      const result=await parseXML(file,async records=>{
        for(const r of records) kinds.add(r.kind);
        await saveRecords(db,worldId,records,source);
      },progress=>send({type:'progress',stage:`Parsing and saving ${file.name}`,percent:Math.round(progress.bytes / progress.total * 100),records:progress.records}));
      if(result.meta.name) world.name=result.meta.name;
      if(result.meta.altname) world.alternativeName=result.meta.altname;
      world.diagnostics.push({file:file.name,...result,meta:undefined});
    }
    for(const file of files.filter(f=>f!==standard && f!==plus)) {
      send({type:'progress',stage:`Keeping supplementary file: ${file.name}`,percent:null});
      await saveFile(db,worldId,file);
    }
    send({type:'progress',stage:'Finalising record indexes',percent:null});
    for(const kind of kinds) world.counts[kind]=await countKind(db,worldId,kind);
    world.status='ready';
    await saveWorld(db,world);
    send({type:'complete',world});
  } catch(error) {
    if(db) { try { await deleteWorld(db,worldId); } catch { /* A staging record remains visible in recovery tools. */ } }
    send({type:'error',message:error.name==='QuotaExceededError'?'Browser storage is full. Free space or choose a smaller export, then retry.':error.message});
  } finally { db?.close(); }
});
