import {mapPointers} from './map-pointers.js?v=0.36.0';
// Shared by WebGL input and CPU gesture checks; camera pan is in CSS pixels.
export function terrainNavigation({position,view,mode=()=> 'pan',paint,commit,zoom,select}){
 const contacts=new Set();let motion='pan',maySelect=true;
 const normalise=e=>({pointerId:e.pointerId,pointerType:e.pointerType,button:0,point:position(e)});
 const normaliseYaw=()=>{view.yaw=((view.yaw+180)%360+360)%360-180;view.pitch=Math.min(85,Math.max(15,view.pitch));};
 const panBy=(x,y)=>{view.panX+=x;view.panY+=y;paint();commit({...view});};
 const pointers=mapPointers({position:e=>e.point,panPosition:()=>motion==='rotate'?{panX:view.yaw*4,panY:view.pitch*4}:{panX:view.panX,panY:view.panY},pan:(x,y)=>{if(motion==='rotate'){view.yaw=x/4;view.pitch=y/4;normaliseYaw();}else{view.panX=x;view.panY=y;}paint();},zoom,select:p=>{if(maySelect)select(p);},hover:()=>{}});
 return {panBy,
 down(e){if(e.pointerType==='mouse'&&![0,1,2].includes(e.button))return false;if(!contacts.size){motion=mode()==='rotate'&&!e.shiftKey&&(e.pointerType!=='mouse'||e.button===0)?'rotate':'pan';maySelect=e.pointerType!=='mouse'||e.button===0;}else motion='pan';contacts.add(e.pointerId);pointers.down(normalise(e));return true;},
 move:e=>pointers.move(normalise(e)),
 up(e){pointers.up(normalise(e));contacts.delete(e.pointerId);commit({...view});},
 cancel(){contacts.clear();pointers.cancel();},
 key(e){if(e.altKey||e.ctrlKey||e.metaKey)return;const delta={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,-35],ArrowDown:[0,35]}[e.key];if(delta){e.preventDefault();if(e.shiftKey){view.yaw+=delta[0]/3.5;view.pitch-=delta[1]/7;normaliseYaw();paint();commit({...view});}else panBy(...delta);}else if(['+','=','-'].includes(e.key)){e.preventDefault();zoom(e.key==='-'?1/1.2:1.2);}}
 };
}
