/* Офлайн-кэш приложения «Трекер формы».
   При обновлении приложения поменяйте номер версии в CACHE. */
var CACHE = "forma-v3";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable.png",
  "./apple-touch-icon.png",
  "./fonts/yeseva-one-cyrillic-400-normal.woff2",
  "./fonts/yeseva-one-latin-400-normal.woff2",
  "./fonts/nunito-cyrillic-400-normal.woff2",
  "./fonts/nunito-cyrillic-600-normal.woff2",
  "./fonts/nunito-cyrillic-700-normal.woff2",
  "./fonts/nunito-latin-400-normal.woff2",
  "./fonts/nunito-latin-600-normal.woff2",
  "./fonts/nunito-latin-700-normal.woff2"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // Навигация: сначала кэш index.html, чтобы приложение открывалось без сети
  if (e.request.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then(function (r) {
        return r || fetch(e.request);
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function (r) {
      if (r) return r;
      return fetch(e.request).then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return resp;
      });
    })
  );
});
