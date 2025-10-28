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

// File inti aplikasi lokal Anda
const APP_SHELL_FILES = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
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
            // Buat request baru untuk menghindari masalah CORS saat caching
            const request = new Request(fileUrl, { mode: 'no-cors' });
            return fetch(request)
                .then(response => cache.put(fileUrl, response))
                .catch(err => {
                    console.warn(`Service Worker: Gagal cache ${fileUrl} - ${err.message}`);
                });
        });
        
        // Caching file app shell dengan cara standar
        const appShellPromises = APP_SHELL_FILES.map(fileUrl => {
            return fetch(fileUrl)
                .then(response => {
                    if (!response.ok) throw new Error(`Gagal fetch: ${fileUrl}`);
                    return cache.put(fileUrl, response);
                })
                .catch(err => {
                     console.warn(`Service Worker: Gagal cache file app shell ${fileUrl} - ${err.message}`);
                });
        });
        
        return Promise.all([...promises, ...appShellPromises]);
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
    return; // Abaikan POST, PUT, dll. (termasuk API Firestore)
  }

  const url = new URL(event.request.url);
  
  // Cek apakah ini file app shell (berdasarkan path relatif)
  // Perbaiki logika pengecekan path
  const requestPath = url.pathname;
  let isAppShell = false;
  
  if (requestPath === '/' || requestPath.endsWith('/index.html')) {
    isAppShell = true;
  } else if (APP_SHELL_FILES.some(file => requestPath.endsWith(file.substring(1)))) {
    isAppShell = true;
  }

  // Strategi: Cache First (hanya untuk file inti aplikasi)
  if (isAppShell) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse; // Sajikan dari cache
          }
          // Jika tidak ada di cache, ambil dari jaringan
          return fetch(event.request)
            .then(networkResponse => {
              // Simpan ke cache untuk lain kali
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
              return networkResponse;
            });
        })
    );
    return;
  }

  // Strategi: Network First (untuk semua resource lain, misal Font, CDN, Firebase SDK)
  // Ini memastikan kita selalu mendapatkan versi terbaru dari resource eksternal.
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Berhasil dari jaringan, simpan ke cache
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      })
      .catch(() => {
        // Jaringan gagal, coba ambil dari cache sebagai fallback
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse; // Sajikan dari cache jika jaringan gagal
            }
            // Jika tidak ada di cache sama sekali, gagal
            console.error('Service Worker: Gagal mengambil dari jaringan & cache:', event.request.url);
            // Anda bisa return halaman offline di sini
          });
      })
  );
});


// Event: Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('Notifikasi diklik:', event.notification.tag);
  event.notification.close();
  
  // Fokus ke aplikasi jika sudah terbuka
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Cek apakah ada window yang sudah terbuka
      for (const client of clientList) {
        // Sesuaikan URL ini jika app Anda di-host di sub-path
        if (client.url.includes('index.html') || client.url.endsWith('/')) {
          return client.focus();
        }
      }
      // Jika tidak ada window terbuka, buka baru
      if (clients.openWindow) {
        return clients.openWindow('./'); // Buka halaman utama
      }
    })
  );
});

