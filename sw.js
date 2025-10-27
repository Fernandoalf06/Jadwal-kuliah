const CACHE_NAME = 'jadwal-kelas-v1';

// Daftar file yang akan disimpan di cache
// Pastikan path ini sesuai dengan struktur file Anda
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  // Font dan ikon yang digunakan
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
  // Ikon placeholder dari manifest (Anda bisa ganti dengan ikon lokal nanti)
  'https://placehold.co/192x192/A91D3A/white?text=SK',
  'https://placehold.co/512x512/A91D3A/white?text=SK',
  'https://placehold.co/512x512/A91D3A/white?text=SK&maskable=1'
];

// Event 'install': Menyimpan file ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event 'fetch': Menyajikan file dari cache (strategi Cache First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika file ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak, ambil dari jaringan
        return fetch(event.request);
      }
    )
  );
});

// Event 'activate': Membersihkan cache lama
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Hapus cache lama yang tidak ada di whitelist
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Event 'notificationclick': Apa yang terjadi saat notifikasi diklik
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Buka aplikasi (URL root) saat notifikasi diklik
  event.waitUntil(
    clients.openWindow('./')
  );
});

