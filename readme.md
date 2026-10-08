# WRS Gempa — Android Ready / Final

WRS Gempa adalah monitor gempa Indonesia berbasis data BMKG/InaTEWS dengan sumber pembanding USGS. Paket final ini mempertahankan engine data, peta, ShakeMap, riwayat tsunami, audio alert, PWA offline shell, dan Web Push dari PantauGempa V7.1, lalu menambahkan app shell modern, dark/siang mode, pengaturan alert, menu admin, broadcast, dan konfigurasi Android TWA.

## Yang sudah ditingkatkan

- UI mobile-first bergaya aplikasi monitoring modern.
- Dark mode, Siang mode, dan mengikuti tema sistem.
- Tidak menggunakan emoji sebagai ikon UI; ikon menggunakan SVG.
- Drawer menu + bottom navigation mobile.
- Pengaturan minimum magnitudo, getar, suara, voice, refresh, dan reduced motion.
- Refresh data 8 detik saat aplikasi aktif.
- Peta multi-basemap, fault layer, marker magnitudo, ShakeMap, riwayat, dan tsunami tetap dipertahankan.
- Push subscription menyimpan preferensi perangkat.
- Scheduled push server memfilter alert berdasarkan minimum magnitudo dan memprioritaskan tsunami.
- Admin Console untuk pengaturan global, broadcast manual, health check, jumlah subscription, dan sumber data.
- Android wrapper memakai Trusted Web Activity (TWA), bukan WebView kosong. Ini mempertahankan service worker dan Web Push yang sudah menjadi fondasi WRS Gempa.
- GitHub Actions untuk membangun APK melalui Bubblewrap.

## Deploy web

Deploy isi repository ini ke Netlify dengan publish directory `.` dan functions directory `netlify/functions`.

Environment wajib:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `WRS_ADMIN_SECRET`
- `WRS_ADMIN_PASSWORD`

Netlify Blobs harus aktif.

## Android

1. Pastikan domain production sudah live: `https://wrsgempa.netlify.app`.
2. Upload repository ini ke GitHub.
3. Buka Actions → **Build WRS Gempa Android** → Run workflow.
4. Workflow memasang Bubblewrap, membuat project Android dari `twa-manifest.json`, lalu menghasilkan artifact APK.
5. Untuk release production, gunakan signing key milik sendiri dan jangan commit `.jks`/keystore. Atur signing melalui environment/secret GitHub.
6. TWA production membutuhkan Digital Asset Links agar aplikasi dapat tampil tanpa UI browser. Setelah release key dibuat, publish `/.well-known/assetlinks.json` pada domain dengan package id `app.wrsgempa.monitor` dan SHA-256 certificate fingerprint dari signing key tersebut.

## Notifikasi Android

Pengguna mengaktifkan notifikasi sekali saat pertama kali menggunakan aplikasi. Setelah subscription tersimpan di Netlify Blobs, scheduled function `check-quakes-push` memeriksa event baru dan mengirim Web Push. Karena aplikasi Android memakai TWA, service worker dan Web Push tetap menjadi jalur notifikasi background.

Catatan: Android/OS tetap dapat menunda aktivitas background pada kondisi battery saver atau pembatasan sistem. Untuk alert keselamatan, sumber resmi BMKG/InaTEWS tetap menjadi rujukan utama.

## Admin

Buka `/admin.html`. Login menggunakan `WRS_ADMIN_PASSWORD`. Token sesi disimpan hanya pada `sessionStorage` browser. Jangan menaruh password atau secret di frontend.

## Sumber data

- InaTEWS / BMKG gempaQL, lastQL, datagempa
- BMKG open data autogempa, gempaterkini, gempadirasakan
- Riwayat tsunami InaTEWS
- USGS sebagai sumber pembanding

## Catatan keselamatan

WRS Gempa adalah monitor independen, bukan sistem resmi BMKG. Untuk keputusan keselamatan dan evakuasi, ikuti informasi resmi BMKG/InaTEWS serta petugas berwenang.
