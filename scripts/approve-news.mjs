#!/usr/bin/env node
// Meninjau kandidat berita.
//
//   node scripts/approve-news.mjs list
//   node scripts/approve-news.mjs approve <slug> [--category Daerah] [--excerpt "Ringkasan sendiri"] [--featured]
//   node scripts/approve-news.mjs reject <slug>
//
// approve: memindahkan kandidat ke data/news.json (tayang di situs).
// reject : menghapus kandidat dan mencatat URL-nya di data/news-rejected.json
//          agar tidak diusulkan lagi.
//
// Tulis ringkasan (--excerpt) dengan kata-kata sendiri; jangan menyalin teks artikel.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = (name) => path.join(root, "data", name);
const readJson = async (name, fallback) => {
  try { return JSON.parse(await readFile(file(name), "utf8")); }
  catch (e) { if (e.code === "ENOENT") return fallback; throw e; }
};
const write = (name, data) => writeFile(file(name), JSON.stringify(data, null, 2) + "\n");

const [cmd, slug, ...rest] = process.argv.slice(2);
const opt = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};

const candidates = await readJson("news-candidates.json", []);

if (cmd === "list" || !cmd) {
  if (!candidates.length) console.log("Tidak ada kandidat menunggu.");
  for (const c of candidates) console.log(`${c.slug}\n  ${c.date} · ${c.source}\n  ${c.title}\n  ${c.url}\n`);
  process.exit(0);
}

const c = candidates.find((x) => x.slug === slug);
if (!c) {
  console.error(`Kandidat "${slug}" tidak ditemukan. Jalankan: node scripts/approve-news.mjs list`);
  process.exit(1);
}
const remaining = candidates.filter((x) => x.slug !== slug);

if (cmd === "approve") {
  const news = await readJson("news.json", []);
  const { matched, status, ...item } = c;
  const entry = {
    ...item,
    category: opt("category") ?? item.category,
    excerpt: opt("excerpt") ?? item.excerpt,
    ...(rest.includes("--featured") ? { featured: true } : {}),
  };
  news.unshift(entry);
  news.sort((a, b) => b.date.localeCompare(a.date));
  await write("news.json", news);
  await write("news-candidates.json", remaining);
  console.log(`Disetujui: ${entry.title}`);
} else if (cmd === "reject") {
  const rejected = await readJson("news-rejected.json", []);
  await write("news-rejected.json", [...new Set([...rejected, c.url])]);
  await write("news-candidates.json", remaining);
  console.log(`Ditolak: ${c.title}`);
} else {
  console.error("Perintah: list | approve <slug> | reject <slug>");
  process.exit(1);
}
