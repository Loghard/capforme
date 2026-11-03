const CACHE='cap-forme-v22';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&x!=='cap-forme-tiles').map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(/\.mp3$/.test(u.pathname))return;
  if(u.hostname==='tile.openstreetmap.org'){
    e.respondWith(caches.open('cap-forme-tiles').then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res&&res.ok){c.put(r,res.clone());c.keys().then(k=>{if(k.length>1500)c.delete(k[0])})}return res}))));
    return;
  }
  const ok=u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!ok)return;
  e.respondWith(
    fetch(r).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):Response.error())))
  );
});
