const CACHE_NAME = 'jadwal-kelas-pwa-v1';
// Daftar file inti yang akan di-cache
const CACHE_FILES = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
  'https://cdn.tailwindcss.com?plugins=forms,typography,container-queries',
  'https://placehold.co/192x192/A91D3A/white?text=SK', // Ikon notifikasi kelas
  'https://placehold.co/192x192/f59e0b/white?text=!', // Ikon notifikasi tugas
  // Firebase SDKs
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
];

// Event: Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Menginstal...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching file inti');
        // fetch() mungkin gagal untuk beberapa resource eksternal jika ada masalah jaringan
        // Kita akan coba cache satu per satu dan abaikan jika gagal
        const promises = CACHE_FILES.map(fileUrl => {
            return fetch(fileUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Gagal fetch: ${fileUrl}`);
                    }
                    return cache.put(fileUrl, response);
                })
                .catch(err => {
                    console.warn(`Service Worker: Gagal cache ${fileUrl} - ${err.message}`);
                });
        });
        
        return Promise.all(promises);
      })
      .then(() => {
        self.skipWaiting(); // Aktifkan service worker baru segera
      })
  );
});

// Event: Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Mengaktifkan...');
  
  // Hapus cache lama
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Ambil kontrol halaman segera
  );
});

// Event: Fetch (Menangani permintaan jaringan)
self.addEventListener('fetch', (event) => {
  // Hanya tangani permintaan GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Strategi: Cache first, then network (untuk file inti)
  // Cek apakah permintaan ada di daftar cache kita
  const url = new URL(event.request.url);
  const isCoreFile = CACHE_FILES.includes(url.pathname) || CACHE_FILES.includes(event.request.url);

  if (isCoreFile) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Jika ada di cache, gunakan dari cache
            // console.log('Service Worker: Mengambil dari cache:', event.request.url);
            return cachedResponse;
          }
          
          // Jika tidak ada di cache, ambil dari jaringan
          return fetch(event.request)
            .then((networkResponse) => {
              // (Opsional) Simpan respons baru ke cache
              // caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
              return networkResponse;
            })
            .catch(() => {
              // Jika jaringan gagal, (misalnya offline)
              console.error('Service Worker: Gagal mengambil dari jaringan:', event.request.url);
              // Anda bisa mengembalikan fallback offline di sini jika perlu
            });
        })
    );
  } else {
    // Untuk permintaan lain (misalnya ke API Firebase), selalu gunakan jaringan
    // Biarkan browser menanganinya secara normal
    event.respondWith(fetch(event.request));
  }
});

// Event: Notification Click
// (Saat ini kita tidak menambahkan aksi, tapi ini tempatnya)
self.addEventListener('notificationclick', (event) => {
  console.log('Notifikasi diklik:', event.notification.tag);
  event.notification.close();
  
  // Fokus ke aplikasi jika sudah terbuka
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === './' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

