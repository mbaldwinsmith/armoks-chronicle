const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
async function preview(files) {
  const messages = []; let handler;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/import/preview-worker.js'),'utf8'), {
    self: { addEventListener: (_, callback) => {handler = callback;}, postMessage: message => messages.push(message) }
  });
  await handler({data:{type:'preview',requestId:7,files}});
  return messages;
}
test('classifies header content, labels filename hints, preserves untrusted names as data', async()=>{
  const files = [new File(['<df_world><regions/>'],'world-legends.xml'),new File(['<df_world><name>World</name>'],'world-legends_plus.xml'),new File(['DFHACK_WORLD_MAP,3,129,129\nx,y'],'map.csv'),new File(['Civilized World Population'],'pops.txt'),new File(['Civilizations'],'x-world_history.txt'),new File(['not XML'],'<img>.xml'),new File([],'empty.xml')];
  const messages = await preview(files);
  assert.deepEqual(messages.slice(0,-1).map(m=>m.kind),['Legends XML (world header found)','Legends Plus XML (filename hint)','World map CSV','Sites and populations report','World history report','Unrecognised export','Empty file']);
  assert.equal(messages[5].name,'<img>.xml'); assert.equal(messages.at(-1).count,7);
  assert(messages.every(m=>m.requestId===7));
});
test('reads bounded headers and reports individual failures without losing other files',async()=>{
  let range;
  const messages=await preview([{name:'large.xml',size:1000000000,slice:(start,end)=>{range=[start,end];return {text:async()=>'<df_world>'};}},{name:'bad.xml',size:9,slice:()=>({text:async()=>{throw Error('denied');}})}]);
  assert.deepEqual(range,[0,8192]);assert.equal(messages[1].kind,'Could not read this file');assert.equal(messages.at(-1).type,'complete');
});
