#!/usr/bin/env node
// Meninjau kandidat berita dari terminal (alternatif dari tombol Telegram).
//
//   node scripts/approve-news.mjs list
//   node scripts/approve-news.mjs approve <slug|id> [--category Daerah] [--excerpt "Ringkasan sendiri"] [--featured]
//   node scripts/approve-news.mjs reject <slug|id>
//
// approve: memindahkan kandidat ke data/news.json (tayang di situs).
// reject : menghapus kandidat dan mencatat URL-nya di data/news-rejected.json
//          agar tidak diusulkan lagi.
//
// Tulis ringkasan (--excerpt) dengan kata-kata sendiri; jangan menyalin teks artikel.

import { candidateId, createStore } from "./news-store.mjs";

const [cmd, key, ...rest] = process.argv.slice(2);
const opt = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};

const store = createStore();

if (cmd === "list" || !cmd) {
  const list = await store.readCandidates();
  if (!list.length) console.log("Tidak ada kandidat menunggu.");
  for (const c of list) {
    console.log(`${c.slug}  (id ${candidateId(c)})\n  ${c.date} · ${c.source}\n  ${c.title}\n  ${c.url}\n`);
  }
} else if (cmd === "approve") {
  const entry = await store.approve(key, {
    category: opt("category"),
    excerpt: opt("excerpt"),
    featured: rest.includes("--featured"),
  });
  if (!entry) fail(key);
  console.log(`Disetujui: ${entry.title}`);
} else if (cmd === "reject") {
  const c = await store.reject(key);
  if (!c) fail(key);
  console.log(`Ditolak: ${c.title}`);
} else {
  console.error("Perintah: list | approve <slug|id> | reject <slug|id>");
  process.exit(1);
}

function fail(k) {
  console.error(`Kandidat "${k}" tidak ditemukan. Jalankan: node scripts/approve-news.mjs list`);
  process.exit(1);
}
