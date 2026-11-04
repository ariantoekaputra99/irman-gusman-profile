# CMS / Struktur Konten

Seluruh konten situs ada di satu file: `lib/content.ts`. Halaman di `app/`
hanya membaca data dari sana, jadi mengubah teks, berita, foto, atau dokumen
tidak memerlukan perubahan komponen.

## Isi `lib/content.ts`

| Ekspor | Dipakai di | Keterangan |
|---|---|---|
| `site`, `nav` | header, footer, metadata | nama situs, disclaimer, menu |
| `profile`, `facts`, `introText`, `aboutParagraphs` | Beranda | identitas & ringkasan |
| `biography` | `/biography` | paragraf per bagian |
| `timeline` | Beranda | `{year, title, text}` |
| `focus` | Beranda | tiga isu utama |
| `news` | Beranda, `/news` | dibaca dari `data/news.json` (lihat "Berita otomatis") |
| `gallery` | Beranda (potret), `/gallery` | foto + atribusi wajib |
| `documents` | Beranda, `/documents` | dokumen/sumber per kategori |

## Menambah konten

**Berita**: tambahkan objek ke `data/news.json` (tanggal `YYYY-MM-DD`, `url` ke
sumber asli) atau gunakan alur "Berita otomatis" di bawah. Urutan tampil
otomatis terbaru dulu.

**Foto**: tambahkan objek ke `gallery`. `credit` wajib; isi `creditUrl` dan
`license` hanya bila sudah dipastikan dari halaman sumber foto. Untuk file
sendiri, simpan di `public/gallery/` dan tulis `src: "/gallery/nama.jpg"`
(awalan `basePath` ditambahkan otomatis). Jangan memasukkan foto yang izin
pakainya belum jelas.

**Dokumen**: tambahkan objek ke `documents` dengan `category` salah satu dari
`Profil resmi`, `Kegiatan`, `Dokumentasi`, serta `format` `PDF` atau `Web`.

## Berita otomatis (kandidat -> tinjau -> tayang)

Berita terbaru diambil dari RSS Google Berita oleh `scripts/fetch-news.mjs`.
Alurnya sengaja **tidak otomatis tayang**:

1. **Ambil**: `npm run news:fetch` (atau workflow `news-candidates.yml` tiap
   Senin, yang membuka PR). Hanya judul, tautan, tanggal, dan nama sumber yang
   disimpan; isi artikel tidak diunduh.
2. **Saring**: judul harus menyebut "Irman Gusman", tidak memuat kata
   bermasalah (daftar `NEGATIVE` di `scripts/news-filter.mjs`: perkara hukum,
   sidang, sengketa, kritik, dsb.), dan memuat kata kegiatan positif (daftar
   `POSITIVE`). Hasilnya masuk `data/news-candidates.json`.
3. **Tinjau**: `npm run news:list`, baca artikel aslinya, lalu
   - setujui: `npm run news:approve -- <slug> --category Daerah --excerpt "ringkasan sendiri"`
   - tolak: `npm run news:reject -- <slug>` (tidak diusulkan lagi).

Penyaring kata kunci hanya saringan awal: ia tidak memahami nada kalimat,
jadi manusia yang memutuskan. Utamakan sumber resmi/kredibel, dan tulis
ringkasan sendiri.

**Kurasi harus transparan.** Karena yang tayang hanya berita pilihan, halaman
`/news` dan Beranda wajib menampilkan `site.newsNote` ("sorotan yang dipilih
secara editorial, bukan arsip lengkap") beserta tautan ke pencarian berita
independen. Jangan menghapus catatan itu.

Menambah sumber RSS lain: edit `FEEDS` di `scripts/fetch-news.mjs`. Menguji
penyaring: `npm test`. Workflow terjadwal memerlukan pengaturan Settings ->
Actions -> General -> "Allow GitHub Actions to create and approve pull requests".

## Build & deploy

Situs adalah Next.js dengan static export (`output: "export"`).

```bash
npm install
npm run dev          # pengembangan lokal
npm run typecheck    # cek tipe
BASE_PATH=/irman-gusman-profile npm run build   # hasil di out/
```

Push ke `main` menjalankan `.github/workflows/pages.yml`: `npm ci`, typecheck,
build dengan `BASE_PATH=/irman-gusman-profile`, lalu deploy folder `out/` ke
GitHub Pages. Di Settings → Pages, sumber deploy harus **GitHub Actions**
(bukan "Deploy from a branch").

## Evolusi

Bila perlu editor non-teknis, `lib/content.ts` bisa diganti pembaca data dari
headless CMS (Sanity/Strapi/Directus) selama tipe yang diekspor tetap sama.
