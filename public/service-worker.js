const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/index.js",
  "./js/idb.js",
  "icons/icon-192x192.png",
];


const APP_PREFIX = "BudgetApp-";
const VERSION = "version_1";
const CACHE_NAME = APP_PREFIX + VERSION;

// install
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("installed cache " + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE)
    })
  )
});
// activate
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheFiles = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheFiles.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheFiles.indexOf(key) === -1) {
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

// fetch
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        return request
      } else {
        console.log("file not cached" + e.request.url);
        return fetch(e.request);
      }
    })
  )
});