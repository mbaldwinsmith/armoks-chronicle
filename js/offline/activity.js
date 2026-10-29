const activities=new Set();let writes=0;
export function setActivity(name,active){const before=activities.has(name);if(active)activities.add(name);else activities.delete(name);if(before!==!!active&&typeof window!=='undefined')window.dispatchEvent(new Event('chronicle-activity'));}
export const reloadBlockers=()=>[...activities];
export const canReload=()=>activities.size===0;
export function trackTransaction(tx){if(typeof window==='undefined'||!tx.addEventListener)return;writes++;setActivity('Saving Local Data',true);let finished=false;const done=()=>{if(finished)return;finished=true;writes--;setActivity('Saving Local Data',writes>0);};tx.addEventListener('complete',done,{once:true});tx.addEventListener('abort',done,{once:true});}
