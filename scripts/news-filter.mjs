// Logika murni untuk mengurai RSS dan menyaring kandidat berita.
// Tidak ada I/O di sini supaya mudah diuji (lihat news-filter.test.mjs).
//
// PENTING: penyaring berbasis kata kunci hanya saringan awal. Ia tidak bisa
// menilai nada sebuah berita, jadi hasilnya TIDAK tayang otomatis; setiap
// kandidat harus disetujui manual (scripts/approve-news.mjs).

/** Subject yang dicari. Judul harus menyebut nama ini. */
export const SUBJECT = /\birman gusman\b/i;

/**
 * Kata/awalan yang membuat judul DITOLAK. Dicocokkan sebagai awal kata
 * (mis. "korup" menangkap korupsi, koruptor). Sengaja luas: lebih baik
 * menolak berita netral daripada meloloskan berita bermasalah.
 */
export const NEGATIVE = [
  "korup", "suap", "gratifikasi", "tersangka", "terdakwa", "terpidana",
  "napi", "narapidana", "vonis", "penjara", "tahanan", "ditahan", "penahanan",
  "tangkap", "ditangkap", "penangkapan", "ott", "kpk", "duga", "dugaan",
  "diduga", "skandal", "kontrovers", "polemik", "kritik", "dikritik", "kecam",
  "dikecam", "protes", "tolak", "ditolak", "coret", "dicoret", "copot",
  "dicopot", "berhentikan", "diberhentikan", "pemberhentian", "gugat",
  "digugat", "sengketa", "lapor", "dilaporkan", "hoaks", "hoax", "langgar",
  "pelanggaran", "bermasalah", "mundur", "tersandung", "gagal", "ricuh",
  "bentrok", "sidang", "pidana", "hukuman", "bui", "mantan napi", "eks napi",
  "kasus", "gula impor", "cabut", "dicabut", "pencabutan", "diperiksa",
  "pemeriksaan", "saksi", "praperadilan", "banding", "kasasi",
];

/** Kata/awalan yang menandakan nada kegiatan positif/konstruktif. */
export const POSITIVE = [
  "apresiasi", "dukung", "mendukung", "dukungan", "dorong", "mendorong",
  "penghargaan", "bantu", "bantuan", "peduli", "kepedulian", "resmikan",
  "peresmian", "kolaborasi", "sinergi", "penguatan", "perkuat",
  "memperkuat", "pembangunan", "membangun", "sukses", "bangga", "inspirasi",
  "motivasi", "edukasi", "beasiswa", "silaturahmi", "kunjungan", "kuliah umum",
  "studium generale", "investasi", "diaspora", "kemanusiaan", "program",
  "inovasi", "prestasi", "berkontribusi", "kontribusi", "salur", "kebaikan",
  "keteladanan", "ketangguhan", "kebangsaan", "kurban", "pemulihan",
];

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function matchTerms(text, terms) {
  const t = ` ${norm(text)} `;
  return terms.filter((term) => t.includes(` ${norm(term)}`));
}

/**
 * Menilai satu judul.
 * @returns {{ok:boolean, reason:string, positives:string[], negatives:string[]}}
 */
export function classify(title) {
  if (!SUBJECT.test(title)) {
    return { ok: false, reason: "tidak-relevan", positives: [], negatives: [] };
  }
  const negatives = matchTerms(title, NEGATIVE);
  if (negatives.length) {
    return { ok: false, reason: "negatif", positives: [], negatives };
  }
  const positives = matchTerms(title, POSITIVE);
  if (!positives.length) {
    return { ok: false, reason: "tidak-positif", positives: [], negatives: [] };
  }
  return { ok: true, reason: "lolos", positives, negatives: [] };
}

/* ------------------------------ RSS parsing ------------------------------ */

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : "";
};

/** Mengurai RSS 2.0 (format Google Berita) menjadi daftar item. */
export function parseRss(xml) {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const body = m[1];
    const source = body.match(/<source[^>]*url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/);
    const sourceName = source ? decode(source[2]) : "";
    let title = tag(body, "title");
    // Google Berita menambahkan " - Nama Sumber" di akhir judul.
    if (sourceName && title.endsWith(` - ${sourceName}`)) {
      title = title.slice(0, -(sourceName.length + 3)).trim();
    }
    const pub = new Date(tag(body, "pubDate"));
    if (!title || Number.isNaN(pub.getTime())) continue;
    items.push({
      title,
      url: tag(body, "link"),
      date: pub.toISOString().slice(0, 10),
      source: sourceName || "Sumber tidak diketahui",
      sourceUrl: source ? decode(source[1]) : "",
    });
  }
  return items;
}

export function slugify(title, date) {
  const base = norm(title).replace(/\s/g, "-").slice(0, 60).replace(/-+$/g, "");
  return `${date}-${base}`;
}

/** Kunci dedup judul: abaikan huruf besar/tanda baca. */
export const titleKey = (title) => norm(title);
