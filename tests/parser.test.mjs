import test from 'node:test';
import assert from 'node:assert/strict';
import {parseXML} from '../js/import/parser.js';
import {mergeData} from '../js/data/records.js';
import {validateFiles} from '../js/import/manifest.js';
const file = text => new File([text],'world-legends.xml');
async function parse(f) {const records=[];const result=await parseXML(f,b=>records.push(...b));return {...result,records};}
test('repeated tags, nested structures, decoded entities, unknown sections and scalar metadata',async()=>{
 const r=await parse(file('<df_world><name>A &amp; B</name><sites><site><id>0</id><name>Ér</name><link>x</link><link>y</link><structures><structure><id>2</id></structure></structures></site></sites><unknown><thing><id>8</id><__proto__>safe</__proto__></thing></unknown></df_world>'));
 assert.equal(r.meta.name,'A & B');assert.deepEqual(r.records[0].data.link,['x','y']);assert.equal(r.records[0].data.structures.structure.id,'2');assert.equal(r.records[1].data.__proto__,'safe');
});
test('CP437 and invalid control character diagnostics',async()=>{
 const bytes=Buffer.concat([Buffer.from('<?xml version="1.0" encoding="CP437"?><df_world><sites><site><id>0</id><name>'),Buffer.from([0x82,17,16]),Buffer.from('</name></site></sites></df_world>')]);
 const r=await parse(file(bytes));assert.equal(r.records[0].data.name,'é');assert.equal(r.removedControls,2);
});
test('UTF8 characters survive chunk boundaries',async()=>{const prefix='<df_world><sites><site><id>1</id><name>';const value='x'.repeat(65535-prefix.length)+'é';const r=await parse(file(prefix+value+'</name></site></sites></df_world>'));assert.equal(r.records[0].data.name,value);});
test('rejects duplicates, malformed XML, DTD and unsupported encoding',async()=>{
 for(const xml of ['<df_world><sites><site><id>1</id></site><site><id>1</id></site></sites></df_world>','<df_world><sites>','<!DOCTYPE df_world [<!ENTITY test "hello">]><df_world/>','<?xml version="1.0" encoding="UTF-16"?><df_world/>'])await assert.rejects(()=>parse(file(xml)));
});
test('supplementary fields preserve authoritative standard values',()=>{const merged=mergeData({name:'base',race:'DWARF',nested:{a:'1'}},{race:'dwarf',sex:'1',nested:{b:'2'}});assert.equal(merged.race,'DWARF');assert.equal(merged.sex,'1');assert.equal(merged.nested.b,'2');});
test('manifest rejects missing core, mixed worlds, duplicate and empty files',()=>{
 const f=name=>({name,size:1});assert.equal(validateFiles([f('r-1-legends.xml'),f('r-1-legends_plus.xml')]),null);
 for(const files of [[f('r-1-legends_plus.xml')],[f('r-1-legends.xml'),f('r-2-legends_plus.xml')],[f('r-1-legends.xml'),f('r-1-legends.xml')],[{name:'r-legends.xml',size:0}]])assert.ok(validateFiles(files));
});
