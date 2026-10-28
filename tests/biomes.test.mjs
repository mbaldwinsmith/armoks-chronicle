import test from 'node:test';import assert from 'node:assert/strict';
import {biomes,biomeForCode,biomeColour,biomeLegend,atlasLayer} from '../js/data/biomes.js';
test('verified biome IDs retain mountain, ocean, freshwater/saltwater and underground distinctions',()=>{
 assert.equal(biomes.length,51);assert.equal(biomeForCode(0).name,'Mountain');assert.equal(biomeForCode(12).name,'Taiga Forest');assert.equal(biomeForCode(18).name,'Temperate Grassland');assert.equal(biomeForCode(29).name,'Arctic Ocean');assert.equal(biomeForCode(36).name,'Temperate Freshwater Lake');assert.equal(biomeForCode(41).name,'Tropical Saltwater Lake');assert.equal(biomeForCode(50).name,'Subterranean Lava');
 assert.deepEqual(biomes.map(b=>b.code),Array.from({length:51},(_,i)=>i));assert(biomes.every(b=>b.known));
});
test('every mapped biome has its own valid colour, independent of elevation and alignment values',()=>{
 assert.equal(new Set(biomes.map(b=>b.colour)).size,51);assert(biomes.every(b=>/^#[0-9a-f]{6}$/i.test(b.colour)));
 assert.equal(biomeColour({biome_type:14,elevation:200,evilness:100}),biomeColour({biome_type:14,elevation:10,evilness:0}));assert.notEqual(biomeColour({biome_type:14}),biomeColour({biome_type:18}));
});
test('unknown codes are explicitly labelled and never guessed from their height or water flags',()=>{
 for(const code of [-1,51,999]){const biome=biomeForCode(code);assert.equal(biome.known,false);assert.equal(biome.name,`Unknown Biome (Code ${code})`);assert.equal(biomeColour({biome_type:code,elevation:10,flags:1}),biome.colour);}
});
test('world legend contains only present biome codes, with counts and matching palette entries',()=>{
 const cells=[{biome_type:29},{biome_type:14},{biome_type:29},{biome_type:999}],before=JSON.stringify(cells),legend=biomeLegend(cells);assert.deepEqual(legend.map(b=>[b.code,b.count]),[[14,1],[29,2],[999,1]]);assert.equal(legend[0].colour,biomeColour(cells[1]));assert.equal(legend[2].known,false);assert.equal(JSON.stringify(cells),before);assert.deepEqual(biomeLegend([]),[]);
});
test('Biomes is the default layer while explicit alternative links remain restorable',()=>{
 assert.equal(atlasLayer(null),'biomes');assert.equal(atlasLayer('future'),'biomes');for(const layer of ['biomes','elevation','evilness','savagery'])assert.equal(atlasLayer(layer),layer);
});

test('many unsupported codes cannot produce an unbounded legend or lose tile counts',()=>{
 const cells=Array.from({length:300},(_,i)=>({biome_type:1000+i}));cells.push({biome_type:0},{biome_type:29},{biome_type:1000});const legend=biomeLegend(cells);assert.equal(legend.length,19);assert.equal(legend.reduce((sum,row)=>sum+row.count,0),303);assert.equal(legend.at(-1).name,'Other Unknown Biome Codes');assert.equal(legend.find(row=>row.code===1000).count,2);assert.equal(legend.find(row=>row.code===29).name,'Arctic Ocean');
});
