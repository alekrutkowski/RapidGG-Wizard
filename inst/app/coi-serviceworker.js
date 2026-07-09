(function () {
  var isWindow = typeof window !== "undefined" && typeof document !== "undefined";
  if (isWindow) {
    if (!("serviceWorker" in navigator)) return;
    if (window.crossOriginIsolated) return;
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (location.protocol !== "https:" && !local) return;
    var script = document.currentScript && document.currentScript.src ? document.currentScript.src : new URL("coi-serviceworker.js", location.href).href;
    navigator.serviceWorker.register(script, { scope: "./" }).then(function () {
      if (!navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(function () { location.reload(); });
      }
    }).catch(function () {});
    return;
  }

  self.addEventListener("install", function (event) {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener("activate", function (event) {
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener("fetch", function (event) {
    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
    var requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) {
      event.respondWith(fetch(event.request));
      return;
    }
    event.respondWith(fetch(event.request).then(function (response) {
      var headers = new Headers(response.headers);
      headers.set("Cross-Origin-Opener-Policy", "same-origin");
      headers.set("Cross-Origin-Embedder-Policy", "require-corp");
      headers.set("Cross-Origin-Resource-Policy", "cross-origin");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
    }));
  });
}());
