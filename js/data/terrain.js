export const columns=['x','y','biome_type','evilness','savagery','elevation','flags','volcanism','peak','river_dirs'];
export function parseTerrain(text){
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/),header=lines.shift()?.split(',');
 if(header?.[0]!=='DFHACK_WORLD_MAP'||header[1]!=='3')throw Error('Unsupported map format. Expected DFHACK_WORLD_MAP version 3.');
 const width=Number(header[2]),height=Number(header[3]);if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>1025||height>1025)throw Error('Invalid map dimensions (maximum 1025 × 1025).');
 if(lines.shift()!==columns.join(','))throw Error('Unexpected map columns.');
 const cells=new Array(width*height);let min=Infinity,max=-Infinity;
 for(const line of lines){if(!line.trim())continue;const values=line.split(',');if(values.length!==10||values.some(v=>! /^-?\d+$/.test(v)))throw Error('Invalid map row.');const row=Object.fromEntries(columns.map((key,i)=>[key,Number(values[i])]));
 if(row.x<0||row.y<0||row.x>=width||row.y>=height)throw Error('Map coordinate outside dimensions.');const index=row.y*width+row.x;if(cells[index])throw Error('Duplicate map coordinate.');
 if(row.elevation<0||row.elevation>255||row.flags<0||row.flags>7||row.river_dirs<0||row.river_dirs>15||row.peak<0||row.peak>2||['evilness','savagery','volcanism'].some(k=>row[k]<0||row[k]>100))throw Error('Map field outside supported range.');
 cells[index]=row;min=Math.min(min,row.elevation);max=Math.max(max,row.elevation);
 }
 if(cells.filter(Boolean).length!==width*height)throw Error('Map is incomplete: missing cells.');return {width,height,cells,min,max};
}
export function sitePosition(data,width,height){const match=typeof data.coords==='string'&&data.coords.match(/^(\d+),(\d+)$/);if(!match)return null;const x=Number(match[1]),y=Number(match[2]);return x<width&&y<height?{x,y}:null;}
export function elevationColour(cell){if(cell.flags&1)return '#487f9c';const e=cell.elevation;const stops=[[0,[39,67,87]],[99,[70,132,156]],[100,[90,120,75]],[150,[147,145,90]],[200,[157,132,108]],[255,[236,233,221]]];for(let i=1;i<stops.length;i++)if(e<=stops[i][0]){const [a,c]=stops[i-1],[b,d]=stops[i],t=(e-a)/(b-a);return `rgb(${c.map((v,j)=>Math.round(v+(d[j]-v)*t)).join(',')})`;}return '#eee9dd';}
export function reliefPoint(x,y,elevation,width){return {x:(x-y)*4+width*4+8,y:(x+y)*2+110-Math.round(elevation/8)*3};}
