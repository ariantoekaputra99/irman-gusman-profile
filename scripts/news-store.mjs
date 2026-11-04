// Penyimpanan berita berbasis file JSON, dipakai bersama oleh CLI
// (approve-news.mjs) dan bot Telegram (telegram-news.mjs).

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const DEFAULT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
);

/** ID pendek stabil (10 hex) dari URL; muat di callback_data Telegram (maks 64 byte). */
export const candidateId = (c) =>
  createHash("sha1").update(c.url).digest("hex").slice(0, 10);

export function createStore(dir = DEFAULT_DIR) {
  const file = (name) => path.join(dir, name);

  async function read(name, fallback) {
    try {
      return JSON.parse(await readFile(file(name), "utf8"));
    } catch (e) {
      if (e.code === "ENOENT") return fallback;
      throw e;
    }
  }
  const write = (name, data) =>
    writeFile(file(name), JSON.stringify(data, null, 2) + "\n");

  return {
    readNews: () => read("news.json", []),
    readCandidates: () => read("news-candidates.json", []),
    readRejected: () => read("news-rejected.json", []),
    writeCandidates: (list) => write("news-candidates.json", list),

    /** Status sebenarnya sebuah id: pending | approved | rejected | unknown. */
    async stateOf(id) {
      const cands = await read("news-candidates.json", []);
      if (cands.some((c) => candidateId(c) === id)) return "pending";
      const news = await read("news.json", []);
      if (news.some((n) => n.url && candidateId(n) === id)) return "approved";
      const rejected = await read("news-rejected.json", []);
      if (rejected.some((u) => candidateId({ url: u }) === id)) return "rejected";
      return "unknown";
    },

    /** Cari kandidat berdasarkan slug ATAU id pendek. */
    async find(key) {
      const list = await read("news-candidates.json", []);
      return list.find((c) => c.slug === key || candidateId(c) === key);
    },

    /** Pindahkan kandidat ke news.json (tayang). */
    async approve(key, { category, excerpt, featured } = {}) {
      const list = await read("news-candidates.json", []);
      const c = list.find((x) => x.slug === key || candidateId(x) === key);
      if (!c) return null;
      // Buang field internal kandidat sebelum tayang.
      const { matched, status, id, notified, ...item } = c;
      const entry = {
        ...item,
        category: category ?? item.category,
        excerpt: excerpt ?? item.excerpt,
        ...(featured ? { featured: true } : {}),
      };
      const news = await read("news.json", []);
      news.unshift(entry);
      news.sort((a, b) => b.date.localeCompare(a.date));
      await write("news.json", news);
      await write("news-candidates.json", list.filter((x) => x !== c));
      return entry;
    },

    /** Hapus kandidat dan catat URL-nya agar tidak diusulkan lagi. */
    async reject(key) {
      const list = await read("news-candidates.json", []);
      const c = list.find((x) => x.slug === key || candidateId(x) === key);
      if (!c) return null;
      const rejected = await read("news-rejected.json", []);
      await write("news-rejected.json", [...new Set([...rejected, c.url])]);
      await write("news-candidates.json", list.filter((x) => x !== c));
      return c;
    },
  };
}
