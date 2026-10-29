/* Offline release: 0.36.4-41ae881a143c8e8e. Inventory and app files are committed together. */
importScripts('./offline-assets.js','./js/offline/worker-runtime.js?v=0.36.0');
const offline=self.ArmoksOffline.create({scope:self.registration.scope,...self.ARMOK_OFFLINE});
self.addEventListener('install',event=>event.waitUntil(offline.install()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{await offline.activateCache();await self.clients.claim();})()));
self.addEventListener('fetch',event=>{if(offline.handles(event.request))event.respondWith(offline.handle(event.request));});
self.addEventListener('message',event=>{const port=event.ports?.[0];if(!port)return;const source=event.source;if(!source?.url||!source.url.startsWith(self.registration.scope))return;event.waitUntil((async()=>{try{if(event.data?.type==='STATUS')port.postMessage(await offline.status());else if(event.data?.type==='REPAIR'){await offline.install();port.postMessage(await offline.status());}else if(event.data?.type==='ACTIVATE')port.postMessage(await offline.requestActivation(source));}catch(error){port.postMessage({error:error.message});}})());});
