import { validateFiles } from '../import/manifest.js?v=0.28.0';
import { openDatabase, deleteWorld } from '../data/database.js?v=0.28.0';
export function setupImportPreview() {
  const input = document.querySelector('#export-files');
  const zone = document.querySelector('#drop-zone');
  const clear = document.querySelector('#clear-files');
  const list = document.querySelector('#file-list');
  const status = document.querySelector('#preview-status');
  let worker, requestId = 0, selectedFiles = [], busy = false, importWorker;
  const start=document.querySelector('#start-import'), cancel=document.querySelector('#cancel-import'), progress=document.querySelector('#import-progress'), importStatus=document.querySelector('#import-status'), manifestStatus=document.querySelector('#manifest-status');
  function manifest() {
    const error=validateFiles(selectedFiles);
    start.disabled=busy || !!error;
    manifestStatus.textContent=error || 'Matching filenames found. Import will validate the XML and save the companion files with this archive.';
  }
  function setBusy(value){busy=value;document.querySelector('#load-example').disabled=value;input.disabled=value;clear.disabled=value || !selectedFiles.length;cancel.hidden=!value;progress.hidden=!value;manifest();}
  start.addEventListener('click',()=>{
    if(busy || validateFiles(selectedFiles))return;
    stop();
    status.textContent='Selected files ready for import.';
    const worldId=crypto.randomUUID();
    try {
      importWorker=new Worker(new URL('../import/import-worker.js?v=0.28.0',import.meta.url),{type:'module'});
      setBusy(true);progress.removeAttribute('value');importStatus.textContent='Starting local import…';
      const cleanup=async message=>{importWorker?.terminate();importWorker=null;let db;try{db=await openDatabase();await deleteWorld(db,worldId);importStatus.textContent=message;}catch(error){importStatus.textContent=message+' Cleanup failed: '+error.message+' Use unfinished-import recovery on your next visit.';}finally{db?.close();setBusy(false);}};
      cancel.onclick=()=>void cleanup('Import cancelled. Existing worlds were not changed.');
      importWorker.onerror=()=>void cleanup('The import worker stopped unexpectedly. Retry the import.');
      importWorker.onmessage=({data})=>{
        if(data.worldId!==worldId)return;
        if(data.type==='progress'){importStatus.textContent=data.stage+(data.records?` · ${data.records.toLocaleString()} records`:'');if(data.percent===null)progress.removeAttribute('value');else progress.value=data.percent;}
        if(data.type==='error'){importWorker.terminate();importWorker=null;setBusy(false);importStatus.textContent='Import failed: '+data.message;}
        if(data.type==='complete'){importWorker.terminate();importWorker=null;setBusy(false);importStatus.textContent='World imported and saved on this device.';location.hash=`#/world/${data.world.id}/desk`;}
      };
      importWorker.postMessage({type:'import',worldId,files:selectedFiles});
    }catch(error){importWorker?.terminate();importWorker=null;setBusy(false);importStatus.textContent='Unable to start import: '+error.message;}
  });
  const stop = () => { worker?.terminate(); worker = null; requestId++; };
  function reset() { if(busy)return; selectedFiles=[];manifest();stop(); input.value = ''; list.replaceChildren(); clear.disabled = true; status.textContent = 'No files selected.'; }
  function preview(files) {
    if(busy)return;selectedFiles=files;manifest();importStatus.textContent='';
    stop(); list.replaceChildren();
    if (!files.length) { reset(); return; }
    if (files.length > 50) { status.textContent = 'Choose up to 50 files at a time.'; clear.disabled = false; return; }
    clear.disabled = false;
    status.textContent = `Checking ${files.length} file headers…`;
    try {
      worker = new Worker(new URL('../import/preview-worker.js?v=0.28.0', import.meta.url), { type: 'module' });
      worker.addEventListener('message', ({ data }) => {
        if (data.requestId !== requestId) return;
        if (data.type === 'complete') {
          status.textContent = `${data.count} file${data.count === 1 ? '' : 's'} checked. This is a header preview; no world has been imported.`;
          worker.terminate(); worker = null; return;
        }
        const row = document.querySelector('#file-row').content.cloneNode(true);
        row.querySelector('.filename').textContent = data.name;
        row.querySelector('.file-description').textContent = data.kind;
        row.querySelector('.file-size').textContent = data.size >= 1048576 ? `${(data.size / 1048576).toFixed(1)} MB` : `${Math.ceil(data.size / 1024)} KB`;
        list.append(row);
      });
      worker.addEventListener('error', () => { stop(); status.textContent = 'The file preview could not start. Reload or try another browser.'; });
      worker.postMessage({ type: 'preview', requestId, files });
    } catch { stop(); status.textContent = 'This browser cannot run the local file preview. Try a current browser served over HTTP or HTTPS.'; }
  }
  document.querySelector('#load-example').addEventListener('click',async()=>{
    if(busy)return;
    const button=document.querySelector('#load-example');button.disabled=true;
    try {
      const files=await Promise.all(['example-legends.xml','example-legends_plus.xml','example-world_map.csv'].map(async name=>{
        const response=await fetch(new URL('../../tests/fixtures/'+name,import.meta.url),{cache:'no-store'});
        if(!response.ok)throw Error('Example files are unavailable.');
        return new File([await response.blob()],name,{type:'text/xml'});
      }));
      preview(files);
    }catch(error){importStatus.textContent=error.message;}finally{button.disabled=busy;}
  });
  input.addEventListener('change', () => preview(Array.from(input.files)));
  clear.addEventListener('click', reset);
  zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('dragging'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('dragging'); input.value = ''; preview(Array.from(event.dataTransfer.files)); });
}
