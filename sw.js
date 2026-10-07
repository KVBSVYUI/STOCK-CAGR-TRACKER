const CACHE='booked-profit-tracker-final-v27';
const ASSETS=['./','./index.html','./manifest.webmanifest','./app-config.js','./stock-catalog.json','./admin.js'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const local=url.origin===self.location.origin;
  const appFile=local && ['/','/index.html','/app-config.js','/stock-catalog.json','/admin.js','/manifest.webmanifest'].includes(url.pathname);
  if(appFile){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(event.request,{cache:'no-store'});
        const cache=await caches.open(CACHE);
        await cache.put(event.request,fresh.clone());
        return fresh;
      }catch(e){
        return caches.match(event.request)||caches.match('./');
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try{return await fetch(event.request)}catch(e){return caches.match('./')}
  })());
});
