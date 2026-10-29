// A two-finger gesture must never become an accidental tile selection.
export function mapPointers({position,panPosition,pan,zoom,select,hover}){
 const points=new Map();let drag=null,pinch=null,gestured=false;
 const pair=()=>{const [a,b]=[...points.values()];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))};};
 return {
 down(event){if(event.pointerType==='mouse'&&event.button!==0)return;const p=position(event);points.set(event.pointerId,p);if(points.size===1){gestured=false;drag={...p,...panPosition(),moved:false};}else{gestured=true;drag=null;pinch=pair();}},
 move(event){const p=position(event);if(!points.has(event.pointerId)){if(!points.size)hover(p);return;}points.set(event.pointerId,p);if(points.size>1){const next=pair();if(pinch){zoom(next.distance/pinch.distance,pinch.x,pinch.y);const {panX,panY}=panPosition();pan(panX+next.x-pinch.x,panY+next.y-pinch.y);}pinch=next;}else if(drag&&!gestured){if(Math.hypot(p.x-drag.x,p.y-drag.y)>4)drag.moved=true;pan(drag.panX+p.x-drag.x,drag.panY+p.y-drag.y);}},
 up(event){if(!points.has(event.pointerId))return;points.delete(event.pointerId);if(!gestured&&drag&&!drag.moved)select(position(event),event);if(!points.size){drag=pinch=null;gestured=false;}},
 cancel(){points.clear();drag=pinch=null;gestured=false;}
 };
}
