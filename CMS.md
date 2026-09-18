# CMS / Content Structure

Konten situs dipusatkan di `lib/content.ts`. Admin dapat memperbarui profil, timeline, dan daftar berita tanpa mengubah struktur halaman.

## Model konten
- profile: identitas utama
- timeline: perjalanan
- news: judul, slug, ringkasan, tanggal, kategori, sumber, URL, featured
- gallery: dirancang sebagai koleksi dokumentasi
- documents: sumber/dokumen publik

## Evolusi CMS
Tahap berikutnya dapat mengganti `lib/content.ts` dengan headless CMS (Sanity/Strapi/Directus) tanpa mengubah kontrak komponen utama.