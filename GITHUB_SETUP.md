# Langkah-langkah Membuat Repository GitHub dan Push Kode

Berikut adalah langkah-langkah untuk membuat repository baru di GitHub dan mengunggah kode NMS Frontend yang sudah kita persiapkan:

## 1. Membuat Repository Baru di GitHub

1. Buka [GitHub](https://github.com/) dan login ke akun Anda
2. Klik tombol "+" di kanan atas, lalu pilih "New repository"
3. Isi informasi repository:
   - Repository name: `nms-frontend` (atau nama lain yang Anda inginkan)
   - Description: Network Monitoring System Frontend Application
   - Visibility: Public (atau Private jika Anda ingin menjaga privasi)
   - Pilih "Initialize this repository with a README" jika Anda ingin GitHub membuat README dasar
   - Klik "Create repository"

## 2. Menghubungkan Repository Lokal dengan GitHub

Setelah repository GitHub dibuat, Anda akan melihat halaman dengan instruksi. Gunakan perintah berikut di terminal untuk menghubungkan repository lokal dengan GitHub:

```bash
# Menambahkan remote repository
git remote add origin https://github.com/gugahnugraha/nms-frontend.git

# Push kode ke repository GitHub
git push -u origin main
```

Pastikan untuk mengganti `gugahnugraha/nms-frontend.git` dengan nama pengguna GitHub dan nama repository Anda.

## 3. Verifikasi

1. Setelah proses push selesai, refresh halaman GitHub repository Anda
2. Anda akan melihat semua file proyek sudah tersedia di GitHub
3. README.md dan INTEGRATION.md akan ditampilkan di halaman utama repository

## 4. Langkah Selanjutnya

- Aktifkan GitHub Pages jika Anda ingin membuat demo online (Settings > Pages)
- Tambahkan kolaborator jika Anda bekerja dalam tim
- Buat issues untuk melacak fitur yang perlu dikembangkan
- Buat branch development terpisah untuk pengembangan berkelanjutan

Selamat! Repository NMS Frontend Anda sudah tersedia di GitHub dan siap untuk digunakan atau dikembangkan lebih lanjut.
