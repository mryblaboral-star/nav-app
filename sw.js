const CACHE='avante-nav-v15';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./data.enc'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Abrir siempre al instante desde la copia guardada; actualizar en segundo plano (stale-while-revalidate)
function keyOf(req){const u=new URL(req.url);if(req.mode==='navigate')return './index.html';if(u.pathname.endsWith('data.enc'))return './data.enc';return req}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  const key=keyOf(e.request);
  e.respondWith(caches.open(CACHE).then(async c=>{
    const cached=await c.match(key,{ignoreSearch:true});
    const net=fetch(e.request,{cache:'no-store'}).then(res=>{if(res&&res.ok)c.put(key,res.clone());return res}).catch(()=>null);
    if(cached){e.waitUntil(net);return cached}
    const r=await net;return r||new Response('Sin conexión y sin copia guardada',{status:503})}))});
