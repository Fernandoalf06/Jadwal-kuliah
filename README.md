# Jadwal Kelas 4IA16 — Web PWA

Deskripsi
- Aplikasi web single-page untuk menampilkan jadwal kelas dan daftar tugas kelas 4IA16.
- Mendukung PWA (manifest + service worker), notifikasi browser, dan penyimpanan lokal untuk catatan & todo.

File penting
- [index.html](index.html) — markup utama dan inisialisasi Tailwind.
- [style.css](style.css) — gaya kustom tambahan.
- [script.js](script.js) — logika aplikasi: render UI, todo, notifikasi, interval pemeriksaan, dsb.
  - Fungsi kunci: [`init`](script.js), [`updateLiveStatusAndReminders`](script.js), [`checkTaskDeadlineReminders`](script.js), [`requestNotificationPermission`](script.js), [`showBrowserNotification`](script.js), [`saveSentNotifications`](script.js), [`clearOldNotifications`](script.js), [`toggleTodo`](script.js), [`deleteTodo`](script.js).
- [sw.js](sw.js) — service worker untuk caching dan strategi fetch.
  - Konstanta kunci: [`CACHE_NAME`](sw.js), [`APP_SHELL_FILES`](sw.js).
- [manifest.json](manifest.json) — konfigurasi PWA (nama, icon, warna tema).

Instalasi & menjalankan lokal
1. Karena PWA/service worker memerlukan HTTP(s), jalankan server lokal di direktori proyek. Contoh cepat:
   - Python 3: `python -m http.server 8000`
   - Node (http-server): `npx http-server -c-1`
2. Buka http://localhost:8000 dan akses [index.html](index.html).

PWA & Service Worker
- Service worker terdaftar di [`sw.js`](sw.js). File inti yang dicache ada di [`APP_SHELL_FILES`](sw.js).
- Untuk pengujian SW: buka DevTools → Application → Service Workers. Hapus cache bila perlu.

Notifikasi & Pengingat
- Notifikasi meminta izin pengguna secara otomatis (tunda 5s) via [`requestNotificationPermission`](script.js).
- Pengiriman notifikasi menggunakan [`showBrowserNotification`](script.js) dan pencatatan notifikasi terkirim disimpan dengan [`saveSentNotifications`](script.js).
- Pengingat kelas dan tugas diperiksa oleh [`updateLiveStatusAndReminders`](script.js) dan [`checkTaskDeadlineReminders`](script.js) setiap menit.

Tips pengembangan
- Untuk mengubah jadwal / data tugas: edit sumber data di bagian database di [`script.js`](script.js).
- Untuk menonaktifkan notifikasi sementara, ubah permission di pengaturan browser atau nonaktifkan pendaftaran SW saat pengembangan.

Troubleshooting singkat
- PWA / SW tidak aktif jika dibuka lewat `file://`. Gunakan server lokal.
- Jika icon manifest tidak muncul, periksa URL di [manifest.json](manifest.json) (ada entri dengan `https.placehold.co` yang tampak keliru).
- Jika notifikasi tidak muncul: pastikan izin granted dan service worker aktif (DevTools → Application → Service Workers).

Kontribusi
- Proyek ini sederhana; tarik permintaan (pull request) untuk perbaikan kecil atau fitur.

Catatan cepat tentang keamanan & privasi
- Semua data (catatan, todos, status notifikasi) disimpan di localStorage pada browser pengguna — tidak ada backend.