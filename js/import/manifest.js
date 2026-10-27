export function validateFiles(files) {
  if(!files.length) return 'Choose your export files first.';
  if(files.length>50) return 'Choose up to 50 files at a time.';
  if(new Set(files.map(f=>f.name)).size!==files.length) return 'Duplicate filenames found. Choose one copy of each export.';
  if(files.some(f=>f.size===0)) return 'Remove empty files before importing.';
  const standard=files.filter(f=>/(?:^|-)legends\.xml$/i.test(f.name));
  if(standard.length!==1) return 'Choose exactly one standard legends.xml file for this world.';
  const prefix=standard[0].name.replace(/legends\.xml$/i,'');
  const allowed=['legends.xml','legends_plus.xml','world_map.csv','world_history.txt','world_sites_and_pops.txt'];
  if(files.some(f=>!allowed.some(suffix=>f.name.toLowerCase()===(prefix+suffix).toLowerCase()))) return 'These filenames do not form one matching export set. Choose files with the same world and date prefix.';
  return null;
}
