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
   hari, yang juga mengirim hasilnya ke Telegram). Hanya judul, tautan, tanggal, dan nama sumber yang
   disimpan; isi artikel tidak diunduh.
2. **Saring**: judul harus menyebut "Irman Gusman", tidak memuat kata
   bermasalah (daftar `NEGATIVE` di `scripts/news-filter.mjs`: perkara hukum,
   sidang, sengketa, kritik, dsb.), dan memuat kata kegiatan positif (daftar
   `POSITIVE`). Hasilnya masuk `data/news-candidates.json`.
3. **Tinjau lewat Telegram** (utama): tiap kandidat dikirim ke chat kamu
   dengan tombol **Setujui** / **Tolak** dan tombol buka artikel. Setujui =
   masuk `data/news.json` lalu situs di-deploy otomatis; Tolak = dibuang dan
   tidak diusulkan lagi. Pesan diedit menjadi "DISETUJUI"/"DITOLAK" sebagai
   konfirmasi, **hanya setelah** perubahan berhasil tersimpan ke repo. Tanpa Telegram, tinjau dari terminal:
   - `npm run news:list`
   - `npm run news:approve -- <slug|id> --category Daerah --excerpt "ringkasan sendiri"`
   - `npm run news:reject -- <slug|id>`

Penyaring kata kunci hanya saringan awal: ia tidak memahami nada kalimat,
jadi manusia yang memutuskan. Satu ketukan langsung menayangkan, jadi baca
artikel aslinya lebih dulu. Utamakan sumber resmi/kredibel, dan tulis
ringkasan sendiri.

**Kurasi harus transparan.** Karena yang tayang hanya berita pilihan, halaman
`/news` dan Beranda wajib menampilkan `site.newsNote` ("sorotan yang dipilih
secara editorial, bukan arsip lengkap") beserta tautan ke pencarian berita
independen. Jangan menghapus catatan itu.

### Setup bot Telegram (sekali saja)

1. Di Telegram buka @BotFather, kirim `/newbot`, simpan token. Pakai bot
   **khusus** untuk fitur ini (satu bot hanya boleh punya satu pembaca
   `getUpdates`, dan tidak boleh ada webhook aktif).
2. Kirim satu pesan apa saja ke bot barumu, lalu buka
   `https://api.telegram.org/bot<TOKEN>/getUpdates` di browser dan catat
   `chat.id`. Lakukan ini **sebelum** langkah 3.
3. Di GitHub: Settings -> Secrets and variables -> Actions, tambahkan
   `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID`. Jangan membagikan token di chat
   atau issue; jika bocor, buat ulang lewat BotFather (`/revoke`).
4. Jalankan workflow **Fetch news candidates** secara manual (Actions ->
   Run workflow) untuk menguji.

Cara kerja: `news-candidates.yml` mengirim kandidat tiap hari (maks. 10 per
run); `news-approval.yml` membaca tombol yang ditekan tiap 10 menit, jadi
konfirmasi bisa tertunda beberapa menit (jadwal GitHub tidak presisi). Hanya
tekanan tombol dari `TELEGRAM_CHAT_ID` yang diproses. Berita yang disetujui
dari Telegram memakai kategori "Kegiatan" dan tanpa ringkasan; ubah di
`data/news.json` bila perlu.

Urutan di `news-approval.yml`: terapkan tombol -> commit & push ke `main` ->
baru ubah pesan di Telegram. Jadi pesan "DISETUJUI" berarti sudah tersimpan di
`main` (situs tayang setelah deploy selesai, ~1-2 menit). Jika push gagal,
tombol tetap utuh dan diproses ulang di run berikutnya.

Tombol lama hilang/terlewat? Jalankan **Fetch news candidates** manual
(Run workflow) dengan opsi **resend** dicentang: semua kandidat yang masih
menunggu dikirim ulang dengan tombol baru.

Jika langkah Telegram gagal, baca pesan di log:
- `permintaan gagal (KODE, 3x percobaan)`: masalah jaringan runner ke Telegram
  (mis. `ETIMEDOUT`, `UND_ERR_CONNECT_TIMEOUT`); coba jalankan ulang.
- `Unauthorized`: token salah. `chat not found`: chat ID salah.
- `Conflict`: bot yang sama dibaca program lain atau punya webhook; pakai bot khusus.
- `bot can't initiate conversation`: tekan Start pada bot.

Menambah sumber RSS lain: edit `FEEDS` di `scripts/fetch-news.mjs`. Menguji
penyaring: `npm test`. Workflow commit langsung ke `main` memakai `GITHUB_TOKEN`; jika `main`
dilindungi aturan branch, beri pengecualian untuk Actions.

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
