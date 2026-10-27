export function setupImportPreview() {
  const input = document.querySelector('#export-files');
  const zone = document.querySelector('#drop-zone');
  const clear = document.querySelector('#clear-files');
  const list = document.querySelector('#file-list');
  const status = document.querySelector('#preview-status');
  let worker, requestId = 0;
  const stop = () => { worker?.terminate(); worker = null; requestId++; };
  function reset() { stop(); input.value = ''; list.replaceChildren(); clear.disabled = true; status.textContent = 'No files selected.'; }
  function preview(files) {
    stop(); list.replaceChildren();
    if (!files.length) { reset(); return; }
    if (files.length > 50) { status.textContent = 'Choose up to 50 files at a time.'; clear.disabled = false; return; }
    clear.disabled = false;
    status.textContent = `Checking ${files.length} file headers…`;
    try {
      worker = new Worker(new URL('../import/preview-worker.js', import.meta.url), { type: 'module' });
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
  input.addEventListener('change', () => preview(Array.from(input.files)));
  clear.addEventListener('click', reset);
  zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('dragging'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('dragging'); input.value = ''; preview(Array.from(event.dataTransfer.files)); });
}
