const CACHE='strong-mind-v2-release-1';
const ASSETS=['/','/index.html','/src/app.js','/src/model.js','/src/programme.js','/src/foods.js','/src/style.css','/src/quotes-data.js','/src/wisdom.js','/src/stories.js','/src/nutrition.js','/src/units.js','/src/food-api.js','/src/storage.js','/src/recipe-examples.js','/data/afcd.json','/data/branded.json','/data-sources.html','/stone.svg','/landscape.svg','/topography.svg','/manifest.webmanifest','/icon.svg','/icon-192.png','/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('strong-mind-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 // Only cache the public app shell. Never cache proxy calls, private exports or external queries.
 if(!ASSETS.includes(url.pathname)||url.search)return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const cached=await cache.match(event.request);
  if(cached)return cached; // Keep all modules/data on the same installed release while offline.
  const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;
 }));
});
