var CACHE = "ice-route-v1";
var SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(SHELL.map(function(u){ return c.add(u).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method!=="GET") return;
  var url = new URL(req.url);
  // ไฟล์ของแอป: โหลดจากเน็ตก่อน (ได้เวอร์ชันใหม่เสมอ) ถ้าไม่มีเน็ตใช้ของที่เก็บไว้
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(function(r){
      var copy = r.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); return r;
    }).catch(function(){ return caches.match(req).then(function(m){ return m || caches.match("./index.html"); }); }));
    return;
  }
  // ไลบรารี Leaflet: ใช้ของที่เก็บไว้ก่อน
  if(url.hostname==="unpkg.com"){
    e.respondWith(caches.match(req).then(function(m){
      return m || fetch(req).then(function(r){ var copy=r.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); return r; });
    }));
  }
});
