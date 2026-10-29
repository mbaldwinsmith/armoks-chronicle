// Native EGL smoke fixture: exactly the shipped shaders and generated terrain/overlay buffers.
import {writeFileSync,readFileSync} from 'node:fs';
import {buildTerrainMesh,overlayMesh,cameraMatrix,projectMesh,terrainHeight} from '../js/data/terrain-mesh.js';
import {heatMarkerInnerRadius} from '../js/views/terrain-webgl.js';
const dir=process.argv[2],t={width:129,height:129,max:120,cells:Array.from({length:129*129},(_,i)=>({x:i%129,y:Math.floor(i/129),elevation:120,flags:0}))},width=340,height=300;
const mesh=buildTerrainMesh(t,()=> '#666666'),heat=overlayMesh(t,[{x:64,y:64,colour:[255,0,0],alpha:.75,category:'heat'}]),z=terrainHeight(120,t)+.08;
const marker=new Float32Array([64.5,z,64.5,0,0,1,1,0,0,0]);
for(const [name,data] of [['land',mesh.land],['heat',heat],['marker',marker]])writeFileSync(dir+'/'+name+'.bin',new Uint8Array(data.buffer,data.byteOffset,data.byteLength));
const source=readFileSync(new URL('../js/views/terrain-webgl.js',import.meta.url),'utf8'),shaders={};for(const m of source.matchAll(/shader\(gl\.(VERTEX_SHADER|FRAGMENT_SHADER),'([^']+)'\)/g))shaders[m[1]]=m[2];
const frames=[0,45,90,145].map(yaw=>{const matrix=cameraMatrix({yaw,pitch:55},t,width/height),p=projectMesh(matrix,64.5,terrainHeight(120,t),64.5,width,height);return {matrix:[...matrix],x:Math.floor(p.x),y:height-1-Math.floor(p.y),yaw};});
writeFileSync(dir+'/scene.json',JSON.stringify({shaders,width,height,frames,innerRadius:heatMarkerInnerRadius([{category:'heat'}]),offInnerRadius:heatMarkerInnerRadius([])}));
