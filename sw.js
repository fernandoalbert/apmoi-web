/* Service worker APMOI — offline fallback untuk aset inti */
const CACHE = "apmoi-v1";
const CORE = [
  "./", "./index.html", "./css/style.css", "./js/main.js", "./js/pages.js",
  "./js/media.js", "./js/articles.js", "./assets/apmoi-logo-transparent.png",
  "./assets/icon-192.png", "./assets/icon-512.png", "./manifest.webmanifest",
  "./daftar-media.html", "./persyaratan.html", "./pendaftaran.html",
  "./berita.html", "./tentang.html", "./program.html", "./kontak.html"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
  );
});
