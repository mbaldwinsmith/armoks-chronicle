// Header preview only. Full XML parsing belongs to a later import phase.
self.addEventListener('message', async ({ data }) => {
  if (data.type !== 'preview') return;
  const { requestId, files } = data;
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    try {
      const header = await file.slice(0, 8192).text();
      let kind = 'Unrecognised export';
      if (!file.size) kind = 'Empty file';
      else if (/^\uFEFF?DFHACK_WORLD_MAP,\d+,\d+,\d+/.test(header)) kind = 'World map CSV';
      else if (/<df_world[\s>]/.test(header)) {
        kind = /-legends_plus\.xml$/i.test(file.name) ? 'Legends Plus XML (filename hint)' : 'Legends XML (world header found)';
      } else if (/Civilized World Population/.test(header)) kind = 'Sites and populations report';
      else if (/Civilizations/.test(header) && /-world_history\.txt$/i.test(file.name)) kind = 'World history report';
      self.postMessage({ type: 'file', requestId, index, name: file.name, size: file.size, kind });
    } catch {
      self.postMessage({ type: 'file', requestId, index, name: file.name, size: file.size, kind: 'Could not read this file' });
    }
  }
  self.postMessage({ type: 'complete', requestId, count: files.length });
});
