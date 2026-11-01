# PANDUAN DEPLOY PUSMENJAR CBT KE GOOGLE APPS SCRIPT & GOOGLE SITES

Aplikasi ini telah berhasil di-bundle menjadi 1 file mandiri (Single-File) tanpa memerlukan hosting tambahan!

## CARA MEMASANG DI GOOGLE SPREADSHEET (WEB APP):

1. Buka Google Spreadsheet baru di browser: https://sheets.new
2. Beri nama spreadsheet, contoh: "Rekap Nilai CBT ANBK 2026/2027"
3. Klik menu **Extensions (Ekstensi)** > **Apps Script**.
4. Di editor Apps Script:
   - Buka file **Code.gs** bawaan, hapus semua kodenya, lalu salin seluruh isi dari file **Code.gs**.
   - Klik tombol **+** di sebelah 'Files' > pilih **HTML**.
   - Beri nama file: **Index** (akan otomatis menjadi `Index.html`).
   - Hapus kode bawaan di `Index.html`, lalu salin seluruh isi dari file **Index.html** (yang telah di-bundle).
5. Klik tombol Simpan (ikon disket).

## CARA DEPLOY:
1. Klik tombol biru **Deploy** di pojok kanan atas > pilih **New deployment**.
2. Klik ikon gerigi (Select type) > pilih **Web app**.
3. Atur konfigurasi:
   - **Description**: CBT ANBK Pusmenjar
   - **Execute as**: **Me (email Anda)**
   - **Who has access**: **Anyone (Siapa saja)**  *(PENTING agar siswa dapat membuka tanpa kendala login)*
4. Klik **Deploy**.
5. Salin URL Web App yang dihasilkan:
   Formatnya: `https://script.google.com/macros/s/.../exec`

## CARA MENEMPELKAN DI GOOGLE SITES (OPSIONAL):
1. Buka Google Sites Anda (sites.google.com).
2. Klik menu **Sisipkan (Insert)** > pilih **Sematkan (Embed)**.
3. Masukkan URL Web App Google Apps Script di atas.
4. Perbesar tampilan canvas agar sesuai dengan layar ujian CBT.

Selesai! Seluruh nilai, verifikasi selfie, jawaban siswa, dan log anti-kecurangan akan otomatis tercatat di Google Spreadsheet Anda.
