// Coalesce bursts of input into one paint, and cancel work when its view closes.
export function frameTask(callback,request=requestAnimationFrame,cancel=cancelAnimationFrame){
 let pending=null;
 return {request(){if(pending===null)pending=request(()=>{pending=null;callback();});},cancel(){if(pending!==null)cancel(pending);pending=null;}};
}
