#!/usr/bin/env node
// Persetujuan berita lewat Telegram.
//
//   node scripts/telegram-news.mjs send      kirim kandidat baru (dengan tombol Setujui/Tolak)
//   node scripts/telegram-news.mjs process   proses tombol yang sudah ditekan
//
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (jika kosong, perintah dilewati).
//
// Tanpa server: `process` membaca tombol yang tertunda lewat getUpdates (polling
// oleh workflow terjadwal). Tidak ada state tambahan; pemrosesan idempoten
// karena kandidat yang sudah disetujui/ditolak hilang dari daftar.
//
// Keamanan: hanya callback dari chat pemilik (TELEGRAM_CHAT_ID) yang diproses.
// Judul berita berasal dari sumber luar, jadi dikirim sebagai teks biasa
// (tanpa parse_mode) dan data tombol dibatasi pola ketat.

import dns from "node:dns";
import { pathToFileURL } from "node:url";
import { candidateId, createStore } from "./news-store.mjs";

// Runner GitHub tidak punya IPv6 yang andal; bila IPv6 dicoba dulu, tiap sambungan
// baru ke api.telegram.org bisa tertahan puluhan detik sebelum jatuh ke IPv4.
dns.setDefaultResultOrder("ipv4first");

const clean = (s, max) =>
  String(s ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

class ApiError extends Error {}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Kode error jaringan yang aman dicetak (tanpa pesan/URL/token). */
const safeCode = (e) => {
  const c = e?.cause?.code ?? e?.code ?? e?.name ?? "UNKNOWN";
  return /^[A-Za-z0-9_]{1,40}$/.test(String(c)) ? String(c) : "UNKNOWN";
};

export function createBot({
  token,
  chatId,
  fetchImpl = fetch,
  attempts = 3,
  timeoutMs = 15_000,
  sleep = wait,
}) {
  async function call(method, body) {
    let code = "UNKNOWN";
    for (let i = 1; i <= attempts; i++) {
      let res;
      try {
        res = await fetchImpl(`https://api.telegram.org/bot${token}/${method}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (e) {
        // Hanya kode error yang dicetak, supaya token/URL tidak bocor ke log.
        code = safeCode(e);
        if (i < attempts) await sleep(1000 * i);
        continue;
      }
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) return json.result;

      const retryable = res.status === 429 || res.status >= 500;
      if (!retryable || i === attempts) {
        throw new ApiError(`Telegram ${method}: ${clean(json.description, 120) || res.status}`);
      }
      const retryAfter = Number(json?.parameters?.retry_after);
      await sleep(Math.min(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 2 ** i, 30) * 1000);
    }
    throw new Error(`Telegram ${method}: permintaan gagal (${code}, ${attempts}x percobaan)`);
  }
  return { chatId: String(chatId), call };
}

export function formatMessage(c) {
  return [
    "📰 Kandidat berita",
    "",
    clean(c.title, 300),
    `${clean(c.source, 80)} · ${clean(c.date, 10)}`,
    "",
    "Setujui = tayang di situs. Baca artikelnya dulu.",
  ].join("\n");
}

/** Kirim kandidat yang belum pernah dikirim. Menyimpan penanda `notified` per kandidat. */
export async function sendCandidates(bot, store, { limit = 10, log = () => {} } = {}) {
  const list = await store.readCandidates();
  let sent = 0;
  for (const c of list) {
    if (c.notified) continue;
    if (sent >= limit) break;
    const id = candidateId(c);
    const keyboard = [];
    if (/^https?:\/\//.test(c.url)) keyboard.push([{ text: "🔗 Buka artikel", url: c.url }]);
    keyboard.push([
      { text: "✅ Setujui", callback_data: `a:${id}` },
      { text: "❌ Tolak", callback_data: `r:${id}` },
    ]);
    await bot.call("sendMessage", {
      chat_id: bot.chatId,
      text: formatMessage(c),
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: keyboard },
    });
    c.notified = true;
    sent++;
    log(`  terkirim ${sent}: ${clean(c.title, 70)}`);
    // Simpan setelah tiap pengiriman agar tidak terkirim ganda bila ada kegagalan di tengah.
    await store.writeCandidates(list);
  }
  return { sent, pending: list.filter((c) => !c.notified).length };
}

const bestEffort = (p) => p.catch(() => {});

/** Proses tombol yang ditekan sejak pemrosesan terakhir. */
export async function processUpdates(bot, store) {
  const base = { allowed_updates: ["callback_query"], timeout: 0 };
  const updates = await bot.call("getUpdates", { ...base, limit: 100 });
  const summary = { approved: 0, rejected: 0, missing: 0, ignored: 0 };
  let maxId = -1;

  for (const u of updates) {
    maxId = Math.max(maxId, u.update_id);
    const cb = u.callback_query;
    if (!cb) continue;

    const fromOwner =
      String(cb.from?.id) === bot.chatId && String(cb.message?.chat?.id) === bot.chatId;
    if (!fromOwner) {
      summary.ignored++;
      await bestEffort(bot.call("answerCallbackQuery", { callback_query_id: cb.id, text: "Tidak diizinkan." }));
      continue;
    }

    const m = /^([ar]):([0-9a-f]{10})$/.exec(cb.data ?? "");
    if (!m) {
      summary.ignored++;
      continue;
    }

    const [, action, id] = m;
    let label;
    if (action === "a") {
      const entry = await store.approve(id);
      if (entry) { summary.approved++; label = "✅ DISETUJUI (tayang setelah deploy)"; }
      else { summary.missing++; label = "ℹ️ Sudah diproses sebelumnya"; }
    } else {
      const c = await store.reject(id);
      if (c) { summary.rejected++; label = "❌ DITOLAK"; }
      else { summary.missing++; label = "ℹ️ Sudah diproses sebelumnya"; }
    }

    // Jawaban callback kedaluwarsa dalam hitungan menit, jadi hanya upaya terbaik.
    await bestEffort(bot.call("answerCallbackQuery", { callback_query_id: cb.id, text: label.slice(0, 190) }));
    // Mengganti teks pesan sekaligus menghapus tombol: ini konfirmasi yang sebenarnya.
    if (cb.message?.message_id) {
      await bestEffort(
        bot.call("editMessageText", {
          chat_id: bot.chatId,
          message_id: cb.message.message_id,
          text: `${label}\n\n${clean(cb.message.text, 3500)}`,
          disable_web_page_preview: true,
        }),
      );
    }
  }

  // Konfirmasi update yang sudah diproses agar tidak dikirim ulang.
  if (maxId >= 0) await bot.call("getUpdates", { ...base, offset: maxId + 1, limit: 1 });
  return summary;
}

/* ------------------------------- CLI ------------------------------- */

async function main() {
  const cmd = process.argv[2];
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diatur; dilewati.");
    return;
  }
  if (!/^-?\d+$/.test(chatId)) {
    console.error("TELEGRAM_CHAT_ID harus berupa angka.");
    process.exitCode = 1;
    return;
  }

  const bot = createBot({ token, chatId });
  const store = createStore();

  if (cmd === "send") {
    const r = await sendCandidates(bot, store, { log: console.log });
    console.log(`Terkirim ${r.sent} kandidat; ${r.pending} masih antre.`);
  } else if (cmd === "process") {
    const r = await processUpdates(bot, store);
    console.log(
      `Disetujui ${r.approved}, ditolak ${r.rejected}, sudah diproses ${r.missing}, diabaikan ${r.ignored}.`,
    );
  } else {
    console.error("Perintah: send | process");
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
}
