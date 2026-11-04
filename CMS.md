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
| `news` | Beranda, `/news` | judul, ringkasan, tanggal ISO, kategori, sumber, URL |
| `gallery` | Beranda (potret), `/gallery` | foto + atribusi wajib |
| `documents` | Beranda, `/documents` | dokumen/sumber per kategori |

## Menambah konten

**Berita**: tambahkan objek ke `news` (tanggal `YYYY-MM-DD`, `url` ke sumber
asli). Urutan tampil otomatis terbaru dulu.

**Foto**: tambahkan objek ke `gallery`. `credit` wajib; isi `creditUrl` dan
`license` hanya bila sudah dipastikan dari halaman sumber foto. Untuk file
sendiri, simpan di `public/gallery/` dan tulis `src: "/gallery/nama.jpg"`
(awalan `basePath` ditambahkan otomatis). Jangan memasukkan foto yang izin
pakainya belum jelas.

**Dokumen**: tambahkan objek ke `documents` dengan `category` salah satu dari
`Profil resmi`, `Kegiatan`, `Dokumentasi`, serta `format` `PDF` atau `Web`.

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
