import test from "node:test";
import assert from "node:assert/strict";
import { classify, parseRss, slugify } from "./news-filter.mjs";

test("menolak berita perkara hukum dan putusan", () => {
  for (const t of [
    "Irman Gusman Divonis 4,5 Tahun dan Pencabutan Hak Politik",
    "Ketua DPD Irman Gusman ditetapkan sebagai tersangka setelah operasi tangkap tangan KPK",
    "KPU Tetapkan Eks Koruptor Irman Gusman Lolos Jadi Anggota DPD RI Setelah PSU Sumbar",
    "Eks Napi Korupsi Irman Gusman Resmi Ikut Pileg DPD Ulang di Sumbar",
    "Alasan KPU Coret Irman Gusman dari Calon DPD RI, Belum 5 Tahun Keluar dari Penjara",
    "Kasus Irman Gusman Jadi Pelajaran Buat Pejabat Publik",
  ]) {
    const r = classify(t);
    assert.equal(r.ok, false, t);
    assert.equal(r.reason, "negatif", t);
  }
});

test("meloloskan kegiatan konstruktif sebagai kandidat", () => {
  for (const t of [
    "Irman Gusman Dorong Kampus Muhammadiyah Kupang Jadi Penggerak UMKM dan Lapangan Kerja",
    "Irman Gusman Apresiasi Pengabdian Abraham Paul Liyanto pada HUT ke-70 di Kupang",
    "Bupati Solok Terima Kunjungan Anggota DPD RI Irman Gusman",
    "Irman Gusman Tunjukkan Kepedulian Nyata untuk Korban Banjir Agam",
  ]) {
    const r = classify(t);
    assert.equal(r.ok, true, t);
    assert.ok(r.positives.length > 0);
  }
});

test("menolak judul netral tanpa nada positif dan judul tak relevan", () => {
  assert.equal(classify("Profil Irman Gusman").reason, "tidak-positif");
  assert.equal(classify("Profil Irman Gusman").ok, false);
  assert.equal(classify("DPD RI Minta Pemkab Solok evaluasi mitigasi").reason, "tidak-relevan");
});

test("kata negatif mengalahkan kata positif", () => {
  const r = classify("Irman Gusman Dorong Penyelesaian Kasus Suap");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "negatif");
});

test("parseRss mengurai item, memangkas akhiran sumber, dan melewati tanggal rusak", () => {
  const xml = `<rss><channel>
    <item><title>Irman Gusman Dorong Sinergi - Kota Contoh</title><link>https://example.test/a</link>
      <pubDate>Fri, 09 Jan 2026 08:00:00 GMT</pubDate>
      <source url="https://contoh.go.id">Kota Contoh</source></item>
    <item><title><![CDATA[Judul &amp; lain]]></title><link>https://example.test/b</link>
      <pubDate>bukan tanggal</pubDate></item>
  </channel></rss>`;
  const items = parseRss(xml);
  assert.equal(items.length, 1);
  assert.deepEqual(items[0], {
    title: "Irman Gusman Dorong Sinergi",
    url: "https://example.test/a",
    date: "2026-01-09",
    source: "Kota Contoh",
    sourceUrl: "https://contoh.go.id",
  });
});

test("slugify stabil dan terpangkas", () => {
  const s = slugify("Irman Gusman Dorong Sinergi Ranah & Rantau!", "2026-10-23");
  assert.equal(s, "2026-10-23-irman-gusman-dorong-sinergi-ranah-rantau");
});
