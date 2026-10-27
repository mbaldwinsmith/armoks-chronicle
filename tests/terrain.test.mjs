import test from 'node:test';import assert from 'node:assert/strict';import {parseTerrain,columns,sitePosition,reliefPoint,oceanSurface} from '../js/data/terrain.js';
const csv=rows=>`DFHACK_WORLD_MAP,3,2,1\n${columns.join(',')}\n${rows}`;
const rows='0,0,29,20,30,40,0,0,0,0\n1,0,1,10,20,140,7,20,2,15';
test('map v3 parses independent coordinates, flags and extrema',()=>{const map=parseTerrain(csv(rows.split('\n').reverse().join('\r\n')));assert.equal(map.cells[0].elevation,40);assert.equal(map.cells[1].flags,7);assert.equal(map.min,40);assert.equal(map.max,140);});
test('rejects missing, duplicate, out of bounds, unsupported version and bad fields',()=>{for(const text of [csv(rows.split('\n')[0]),csv(rows+'\n'+rows.split('\n')[0]),csv(rows.replace('1,0,1','2,0,1')),csv(rows).replace(',3,2,1',',4,2,1'),csv(rows.replace(',140,7',',999,7'))])assert.throws(()=>parseTerrain(text));});
test('site coords are world tiles with strict bounds; rectangles are not guessed',()=>{assert.deepEqual(sitePosition({coords:'1,0'},2,1),{x:1,y:0});assert.equal(sitePosition({coords:'2,0'},2,1),null);assert.equal(sitePosition({rectangle:'16,0:32,1'},2,1),null);assert.equal(sitePosition({coords:'-1,0'},2,1),null);});
test('relief projection moves east right/down, south left/down, elevation up',()=>{const a=reliefPoint(0,0,0,10),b=reliefPoint(1,0,0,10),c=reliefPoint(0,1,0,10),d=reliefPoint(0,0,200,10);assert(b.x>a.x&&b.y>a.y);assert(c.x<a.x&&c.y>a.y);assert(d.y<a.y);});

test('ocean surface fills sub-sea-level cells but excludes lakes and dry land',()=>{assert.equal(oceanSurface({elevation:1,flags:0}),100);assert.equal(oceanSurface({elevation:99,flags:6}),100);assert.equal(oceanSurface({elevation:100,flags:0}),null);assert.equal(oceanSurface({elevation:40,flags:1}),null);});
