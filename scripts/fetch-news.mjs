#!/usr/bin/env node
// Mengambil berita terbaru dari RSS Google Berita, menyaringnya, dan menulis
// KANDIDAT ke data/news-candidates.json. Tidak mengubah data/news.json: berita
// baru tayang hanya setelah disetujui manual (scripts/approve-news.mjs).
//
// Pakai:
//   node scripts/fetch-news.mjs [--days 45] [--dry] [--verbose]
//
// Hanya menyimpan judul, tautan, tanggal, dan nama sumber. Isi artikel tidak
// diunduh atau disalin.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { classify, parseRss, slugify, titleKey } from "./news-filter.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = (name) => path.join(root, "data", name);

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const DAYS = Number(opt("days", 45));
const DRY = flag("dry");
const VERBOSE = flag("verbose");

// Tambahkan sumber RSS lain di sini bila perlu.
const FEEDS = [
  { name: "Google Berita", q: '"Irman Gusman"' },
  { name: "Google Berita (DPD)", q: '"Irman Gusman" DPD' },
].map((f) => ({
  ...f,
  url: `https://news.google.com/rss/search?q=${encodeURIComponent(f.q)}&hl=id&gl=ID&ceid=ID:id`,
}));

async function readJson(name, fallback) {
  try {
    return JSON.parse(await readFile(file(name), "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return fallback;
    throw e;
  }
}

async function fetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { "user-agent": "irman-gusman-profile-news-curation/1.0" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`${feed.name}: HTTP ${res.status}`);
  return parseRss(await res.text());
}

const [published, candidates, rejected] = await Promise.all([
  readJson("news.json", []),
  readJson("news-candidates.json", []),
  readJson("news-rejected.json", []),
]);

const known = new Set([
  ...published.map((n) => n.url),
  ...candidates.map((n) => n.url),
  ...rejected,
]);
const knownTitles = new Set(
  [...published, ...candidates].map((n) => titleKey(n.title)),
);

const cutoff = new Date(Date.now() - DAYS * 86_400_000).toISOString().slice(0, 10);

const stats = { fetched: 0, old: 0, duplicate: 0, "tidak-relevan": 0, negatif: 0, "tidak-positif": 0, lolos: 0 };
const added = [];

for (const feed of FEEDS) {
  let items;
  try {
    items = await fetchFeed(feed);
  } catch (e) {
    console.error(`Gagal mengambil ${feed.name}: ${e.message}`);
    process.exitCode = 1;
    continue;
  }
  for (const item of items) {
    stats.fetched++;
    if (item.date < cutoff) { stats.old++; continue; }
    if (known.has(item.url) || knownTitles.has(titleKey(item.title))) { stats.duplicate++; continue; }

    const verdict = classify(item.title);
    stats[verdict.reason]++;
    if (VERBOSE) console.log(`[${verdict.reason}] ${item.date} ${item.title}${verdict.negatives.length ? `  (${verdict.negatives.join(", ")})` : ""}`);
    if (!verdict.ok) continue;

    known.add(item.url);
    knownTitles.add(titleKey(item.title));
    added.push({
      slug: slugify(item.title, item.date),
      title: item.title,
      excerpt: "",
      date: item.date,
      category: "Kegiatan",
      source: item.source,
      url: item.url,
      matched: verdict.positives,
      status: "pending",
    });
  }
}

console.log(
  `Diambil ${stats.fetched} | terlalu lama ${stats.old} | duplikat ${stats.duplicate} | ` +
    `tidak relevan ${stats["tidak-relevan"]} | ditolak negatif ${stats.negatif} | ` +
    `tidak positif ${stats["tidak-positif"]} | kandidat baru ${stats.lolos}`,
);

if (added.length === 0) {
  console.log("Tidak ada kandidat baru.");
} else {
  for (const a of added) console.log(`+ ${a.date}  ${a.title}  [${a.source}]`);
  if (!DRY) {
    const next = [...added, ...candidates].sort((a, b) => b.date.localeCompare(a.date));
    await writeFile(file("news-candidates.json"), JSON.stringify(next, null, 2) + "\n");
    console.log(`Ditulis ke data/news-candidates.json (${next.length} kandidat menunggu).`);
  }
}
