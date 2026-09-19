const CACHE="stocksync-v18-11-continuous-stock-register-reconciliation";
const CORE=["./","./index.html","./manifest.json","./firebase-config.js","./icon-192.svg","./icon-512.svg"];
const EXTERNAL=[
  "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js",
  "https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js",
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js",
  "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js",
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js",
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js",
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js",
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-functions.js",
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
];
const STATIC_HOSTS=new Set(["www.gstatic.com","cdn.jsdelivr.net","fonts.googleapis.com","fonts.gstatic.com"]);
async function cacheExternal(){
  const cache=await caches.open(CACHE);
  await Promise.allSettled(EXTERNAL.map(async url=>{
    const r=await fetch(url,{cache:"no-cache"});
    if(r&&r.ok)await cache.put(url,r);
  }));
}
self.addEventListener("install",e=>e.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(CORE);
  await cacheExternal();
  await self.skipWaiting();
})()));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put("./index.html",copy))}return r}).catch(()=>caches.match("./index.html")));
    return;
  }
  if(url.origin===self.location.origin||STATIC_HOSTS.has(url.hostname)){
    e.respondWith(caches.match(e.request).then(cached=>{
      const fresh=fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>cached);
      return cached||fresh;
    }));
  }
});
