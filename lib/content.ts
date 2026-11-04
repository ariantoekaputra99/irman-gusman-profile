/**
 * Sumber konten tunggal situs (CMS berbasis file).
 *
 * Semua teks, berita, galeri, dan dokumen diedit di sini; halaman di `app/`
 * hanya membaca data ini. Panduan mengedit ada di CMS.md.
 *
 * Aturan umum:
 * - Tanggal memakai format ISO `YYYY-MM-DD`.
 * - Setiap berita/dokumen wajib punya sumber yang bisa diverifikasi publik.
 * - Gambar lokal diletakkan di `public/gallery/` dan ditulis sebagai
 *   `/gallery/nama-file.jpg`; gambar eksternal memakai URL https penuh.
 * - Berita disimpan di `data/news.json` (lihat CMS.md, bagian "Berita otomatis").
 */

import newsData from "@/data/news.json";

/* ------------------------------------------------------------------ */
/* Tipe                                                                */
/* ------------------------------------------------------------------ */

export type Profile = {
  name: string;
  title: string;
  region: string;
  period: string;
  birth: string;
  place: string;
};

export type Fact = { label: string; value: string };

export type TimelineItem = { year: string; title: string; text: string };

export type FocusItem = { title: string; text: string };

export type BiographySection = { heading: string; paragraphs: string[] };

export type News = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO `YYYY-MM-DD` */
  date: string;
  category: string;
  source: string;
  url: string;
  featured?: boolean;
};

export type GalleryItem = {
  id: string;
  /** `/gallery/x.jpg` (file lokal di public/) atau URL https penuh */
  src: string;
  alt: string;
  caption: string;
  /** Pemilik/pencipta foto, wajib diisi */
  credit: string;
  /** Halaman asal foto (untuk verifikasi atribusi/lisensi) */
  creditUrl?: string;
  /** Lisensi, hanya isi jika sudah dipastikan dari sumbernya */
  license?: string;
  /** ISO `YYYY-MM-DD`, jika diketahui */
  date?: string;
  /** Rasio tampil; default "portrait" */
  orientation?: "portrait" | "landscape";
};

export type DocumentCategory = "Profil resmi" | "Kegiatan" | "Dokumentasi";

export type DocumentItem = {
  id: string;
  category: DocumentCategory;
  publisher: string;
  title: string;
  description: string;
  url: string;
  format: "PDF" | "Web";
};

/* ------------------------------------------------------------------ */
/* Situs                                                               */
/* ------------------------------------------------------------------ */

export const site = {
  name: "Irman Gusman",
  tagline: "Profil Publik",
  description:
    "Profil, perjalanan kelembagaan, kegiatan dan sumber informasi Irman Gusman.",
  url: "https://ariantoekaputra99.github.io/irman-gusman-profile/",
  disclaimer:
    "Situs ini merupakan profil publik nonresmi. Informasi jabatan, kegiatan, dan berita dapat berubah. Gunakan sumber resmi yang ditautkan untuk verifikasi terbaru.",
  /** Wajib tampil di halaman yang memuat berita agar kurasi tidak tampak sebagai arsip lengkap. */
  newsNote:
    "Daftar ini adalah sorotan kegiatan yang dipilih secara editorial dari sumber publik, bukan arsip lengkap pemberitaan. Untuk seluruh pemberitaan, gunakan pencarian berita independen.",
  newsSearchUrl: "https://news.google.com/search?q=%22Irman%20Gusman%22&hl=id&gl=ID&ceid=ID:id",
};

export const nav = [
  { label: "Tentang", href: "/#about" },
  { label: "Perjalanan", href: "/#career" },
  { label: "Fokus", href: "/#focus" },
  { label: "Kegiatan", href: "/news" },
  { label: "Biografi", href: "/biography" },
  { label: "Galeri", href: "/gallery" },
  { label: "Dokumen", href: "/documents" },
];

/* ------------------------------------------------------------------ */
/* Profil & biografi                                                   */
/* ------------------------------------------------------------------ */

export const profile: Profile = {
  name: "Irman Gusman",
  title: "Anggota Dewan Perwakilan Daerah Republik Indonesia",
  region: "Sumatera Barat",
  period: "2024–2029",
  birth: "11 Februari 1962",
  place: "Padang Panjang, Sumatera Barat",
};

export const facts: Fact[] = [
  { label: "Nama", value: "Irman Gusman" },
  { label: "Lahir", value: "Padang Panjang, 11 Feb 1962" },
  { label: "Lembaga", value: "DPD RI" },
  { label: "Masa jabatan", value: "2024–2029" },
  { label: "Dapil", value: "Sumatera Barat" },
  { label: "Pendidikan", value: "Fakultas Ekonomi UKI" },
];

export const introText =
  "Irman Gusman lahir di Padang Panjang pada 11 Februari 1962. Profil MPR RI mencatatnya sebagai anggota DPD RI dari Sumatera Barat untuk masa jabatan 2024–2029. Ia juga pernah memimpin DPD RI pada 2009–2016.";

export const aboutParagraphs: string[] = [
  "Perjalanan Irman Gusman mencakup pendidikan ekonomi, dunia usaha, organisasi kemasyarakatan, serta pengalaman panjang di lembaga perwakilan daerah.",
  "Daftar riwayat hidup MPR RI mencatat pendidikan Fakultas Ekonomi Universitas Kristen Indonesia pada 1985 serta keterlibatan organisasi di ICMI.",
];

export const biography = {
  lead: "Irman Gusman lahir di Padang Panjang, Sumatera Barat, pada 11 Februari 1962. Riwayat publiknya mencakup pendidikan ekonomi, dunia usaha, organisasi, serta pengalaman di DPD RI.",
  sections: [
    {
      heading: "Pendidikan",
      paragraphs: [
        "Daftar riwayat hidup MPR RI mencatat pendidikan Fakultas Ekonomi Universitas Kristen Indonesia pada 1985.",
      ],
    },
    {
      heading: "Organisasi",
      paragraphs: [
        "Daftar riwayat hidup yang sama mencatat keterlibatan organisasi di ICMI.",
      ],
    },
    {
      heading: "Lembaga perwakilan daerah",
      paragraphs: [
        "Ia tercatat sebagai anggota dan Wakil Ketua DPD RI pada 2004–2009, Ketua DPD RI pada 2009–2016, dan kembali menjadi anggota DPD RI dari Sumatera Barat untuk masa jabatan 2024–2029.",
      ],
    },
  ] as BiographySection[],
};

export const timeline: TimelineItem[] = [
  {
    year: "1962",
    title: "Masa awal",
    text: "Lahir di Padang Panjang, Sumatera Barat.",
  },
  {
    year: "1985",
    title: "Pendidikan ekonomi",
    text: "Lulus Fakultas Ekonomi Universitas Kristen Indonesia, Jakarta, menurut daftar riwayat hidup MPR RI.",
  },
  {
    year: "2004–2009",
    title: "Anggota & Wakil Ketua DPD RI",
    text: "Memasuki periode kepemimpinan di lembaga perwakilan daerah.",
  },
  {
    year: "2009–2016",
    title: "Ketua DPD RI",
    text: "Menjabat sebagai Ketua DPD RI pada periode tersebut.",
  },
  {
    year: "2024–2029",
    title: "Anggota DPD RI",
    text: "Kembali menjadi anggota DPD RI dari daerah pemilihan Sumatera Barat.",
  },
];

export const focus: FocusItem[] = [
  {
    title: "Pembangunan daerah",
    text: "Pada September 2026, Irman menyoroti pemanfaatan jaringan diaspora untuk investasi, pengetahuan, jejaring usaha, dan pembangunan daerah.",
  },
  {
    title: "Kebencanaan & ketangguhan",
    text: "Pada Rakernas MDMC September 2026, ia membahas penguatan jejaring kemanusiaan, kesiapan relawan, logistik, layanan kesehatan, dan ketangguhan masyarakat.",
  },
  {
    title: "Legislasi & tata kelola",
    text: "Dalam pernyataan Juli 2026 yang dimuat Portal DPD, ia membahas RUU Perampasan Aset dengan penekanan pada proses hukum, transparansi, pengawasan, dan partisipasi publik.",
  },
];

/* ------------------------------------------------------------------ */
/* Berita & kegiatan                                                   */
/* ------------------------------------------------------------------ */

export const news: News[] = newsData;

/* ------------------------------------------------------------------ */
/* Galeri                                                              */
/* ------------------------------------------------------------------ */

/**
 * Hanya foto yang atribusi dan izin pakainya sudah jelas yang boleh masuk
 * sini. Tambahkan foto baru dengan `credit` (wajib) dan `creditUrl`/`license`
 * dari halaman sumbernya.
 */
export const gallery: GalleryItem[] = [
  {
    // Potret utama (dipakai di hero Beranda). File dari pengelola situs.
    // TODO: ganti `credit` dengan pemilik/fotografer asli dan isi `license`
    // bila sudah dipastikan.
    id: "potret-utama",
    src: "/gallery/irman-gusman.jpg",
    alt: "Potret Irman Gusman mengenakan jas gelap dan kemeja putih",
    caption: "Potret",
    credit: "Arsip pengelola situs",
    orientation: "portrait",
  },
  {
    id: "kpu-infopemilu",
    src: "https://infopemilu.kpu.go.id/berkas-dpd/13/13_7_IRMAN%20GUSMAN.jpg",
    alt: "Potret Irman Gusman",
    caption: "Potret resmi",
    credit: "KPU RI (Infopemilu)",
    creditUrl: "https://infopemilu.kpu.go.id/",
    orientation: "portrait",
  },
];

/* ------------------------------------------------------------------ */
/* Dokumen & sumber                                                    */
/* ------------------------------------------------------------------ */

export const documents: DocumentItem[] = [
  {
    id: "mpr-riwayat-hidup",
    category: "Profil resmi",
    publisher: "MPR RI",
    title: "Daftar Riwayat Hidup Anggota",
    description:
      "Rujukan untuk pendidikan, organisasi, dan masa jabatan anggota.",
    url: "https://mpr.go.id/detailAnggotaPDF/3845/IRMAN-GUSMAN",
    format: "PDF",
  },
  {
    id: "dpd-data-anggota",
    category: "Profil resmi",
    publisher: "DPD RI",
    title: "Data anggota",
    description: "Direktori resmi anggota DPD RI.",
    url: "https://dpd.go.id/anggota/anggota",
    format: "Web",
  },
  {
    id: "dpd-rakernas-mdmc",
    category: "Kegiatan",
    publisher: "Portal DPD RI",
    title: "Kegiatan publik terbaru",
    description: "Pemberitaan Rakernas MDMC, September 2026.",
    url: "https://orchard.dpd.go.id/daftar-berita/di-rakernas-mdmc-irman-gusman-kepercayaan-publik-jadi-modal-mdmc-perluas-jejaring-kemanusiaan",
    format: "Web",
  },
  {
    id: "wikimedia-foto-2024",
    category: "Dokumentasi",
    publisher: "Wikimedia Commons",
    title: "Dokumentasi foto",
    description:
      "Halaman berkas foto beserta keterangan atribusi dan lisensi dari Wikimedia Commons.",
    url: "https://commons.wikimedia.org/wiki/File:Irman_Gusman,_Anggota_DPD_RI_(2024).jpg",
    format: "Web",
  },
];

export const documentCategories: DocumentCategory[] = [
  "Profil resmi",
  "Kegiatan",
  "Dokumentasi",
];

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */

/** Berita terbaru lebih dulu. */
export const newsSorted = [...news].sort((a, b) => b.date.localeCompare(a.date));

/** Format tanggal Indonesia, misal "14 Sep 2026". Deterministik (UTC). */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
