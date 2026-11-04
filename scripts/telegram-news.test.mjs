import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { applyOutbox, createBot, processUpdates, sendCandidates } from "./telegram-news.mjs";
import { candidateId, createStore } from "./news-store.mjs";

const OWNER = "111";

const cand = (n) => ({
  slug: `2026-10-0${n}-berita-${n}`,
  title: `Irman Gusman Dorong Program ${n}`,
  excerpt: "",
  date: `2026-10-0${n}`,
  category: "Kegiatan",
  source: "Sumber Uji",
  url: `https://example.test/${n}`,
  matched: ["dorong"],
  status: "pending",
});

async function setup(candidates) {
  const dir = await mkdtemp(path.join(tmpdir(), "news-"));
  await writeFile(path.join(dir, "news.json"), "[]\n");
  await writeFile(path.join(dir, "news-candidates.json"), JSON.stringify(candidates));
  return { dir, store: createStore(dir) };
}

/** Telegram palsu: mencatat panggilan dan menyajikan update yang sudah diantrikan. */
function fakeTelegram(queue = []) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const method = url.split("/").pop();
    const body = JSON.parse(init.body);
    calls.push({ method, body });
    if (method === "getUpdates") {
      const result = body.offset ? [] : queue;
      return { ok: true, json: async () => ({ ok: true, result }) };
    }
    return { ok: true, json: async () => ({ ok: true, result: true }) };
  };
  return { calls, fetchImpl };
}

const tap = (updateId, data, { from = OWNER, chat = OWNER, messageId = 7 } = {}) => ({
  update_id: updateId,
  callback_query: {
    id: `cb${updateId}`,
    from: { id: Number(from) },
    data,
    message: { message_id: messageId, chat: { id: Number(chat) }, text: "📰 Kandidat berita" },
  },
});

test("send: mengirim dengan tombol, menandai notified, menghormati batas", async () => {
  const { store } = await setup([cand(1), cand(2), cand(3)]);
  const tg = fakeTelegram();
  const bot = createBot({ token: "T", chatId: OWNER, fetchImpl: tg.fetchImpl });

  const r = await sendCandidates(bot, store, { limit: 2 });
  assert.deepEqual(r, { sent: 2, pending: 1 });

  const msgs = tg.calls.filter((c) => c.method === "sendMessage");
  assert.equal(msgs.length, 2);
  assert.equal(msgs[0].body.chat_id, OWNER);
  assert.equal(msgs[0].body.parse_mode, undefined, "teks biasa, tanpa parse_mode");
  const [urlRow, actionRow] = msgs[0].body.reply_markup.inline_keyboard;
  assert.equal(urlRow[0].url, "https://example.test/1");
  const id1 = candidateId(cand(1));
  assert.deepEqual(actionRow.map((b) => b.callback_data), [`a:${id1}`, `r:${id1}`]);
  assert.ok(actionRow.every((b) => b.callback_data.length <= 64));

  // Pengiriman kedua hanya mengirim sisa, bukan mengulang.
  const r2 = await sendCandidates(bot, store, { limit: 10 });
  assert.deepEqual(r2, { sent: 1, pending: 0 });
});

const writeCalls = (tg) => tg.calls.filter((c) => c.method !== "getUpdates");

test("process: setujui memindahkan ke news.json, TANPA menyentuh Telegram (tulis)", async () => {
  const { dir, store } = await setup([cand(1), cand(2)]);
  const id1 = candidateId(cand(1));
  const tg = fakeTelegram([tap(10, `a:${id1}`)]);
  const bot = createBot({ token: "T", chatId: OWNER, fetchImpl: tg.fetchImpl });

  const { summary, outbox } = await processUpdates(bot, store);
  assert.deepEqual(summary, { approved: 1, rejected: 0, missing: 0, ignored: 0 });

  const news = JSON.parse(await readFile(path.join(dir, "news.json"), "utf8"));
  assert.equal(news.length, 1);
  assert.equal(news[0].url, "https://example.test/1");
  for (const k of ["matched", "status", "id", "notified"]) assert.equal(k in news[0], false, k);
  assert.equal((await store.readCandidates()).length, 1);

  // Belum ada edit pesan / konfirmasi offset: itu menunggu applyOutbox.
  assert.equal(writeCalls(tg).length, 0);
  assert.equal(tg.calls.some((c) => c.body.offset), false);
  assert.equal(outbox.maxId, 10);

  await applyOutbox(bot, outbox);
  assert.ok(tg.calls.some((c) => c.method === "editMessageText" && c.body.text.startsWith("✅ DISETUJUI")));
  assert.ok(tg.calls.some((c) => c.method === "getUpdates" && c.body.offset === 11));
});

test("process: tolak mencatat URL dan tidak menayangkan", async () => {
  const { dir, store } = await setup([cand(1)]);
  const tg = fakeTelegram([tap(20, `r:${candidateId(cand(1))}`)]);
  const bot = createBot({ token: "T", chatId: OWNER, fetchImpl: tg.fetchImpl });

  const { summary, outbox } = await processUpdates(bot, store);
  assert.equal(summary.rejected, 1);
  assert.deepEqual(JSON.parse(await readFile(path.join(dir, "news-rejected.json"), "utf8")), ["https://example.test/1"]);
  assert.deepEqual(JSON.parse(await readFile(path.join(dir, "news.json"), "utf8")), []);
  assert.equal((await store.readCandidates()).length, 0);
  assert.equal(outbox.items[0].state, "rejected");
});

test("process: tombol dari pihak lain diabaikan dan tidak mengubah data", async () => {
  const { store } = await setup([cand(1)]);
  const id = candidateId(cand(1));
  const tg = fakeTelegram([
    tap(30, `a:${id}`, { from: "999" }),
    tap(31, `a:${id}`, { chat: "999" }),
  ]);
  const bot = createBot({ token: "T", chatId: OWNER, fetchImpl: tg.fetchImpl });

  const { summary, outbox } = await processUpdates(bot, store);
  assert.deepEqual(summary, { approved: 0, rejected: 0, missing: 0, ignored: 2 });
  assert.equal((await store.readCandidates()).length, 1);

  await applyOutbox(bot, outbox);
  assert.equal(tg.calls.some((c) => c.method === "editMessageText"), false, "pesan pemilik tidak diedit");
  assert.equal(tg.calls.filter((c) => c.method === "answerCallbackQuery").length, 2);
});

test("process: data tak valid diabaikan; ketukan ganda tetap berlabel DISETUJUI", async () => {
  const { store } = await setup([cand(1)]);
  const id = candidateId(cand(1));
  const tg = fakeTelegram([
    tap(40, "a:../../etc/passwd"),
    tap(41, `a:${id}`, { messageId: 7 }),
    tap(42, `a:${id}`, { messageId: 7 }),
    tap(43, `r:${id}`, { messageId: 7 }),
  ]);
  const bot = createBot({ token: "T", chatId: OWNER, fetchImpl: tg.fetchImpl });

  const { summary, outbox } = await processUpdates(bot, store);
  assert.deepEqual(summary, { approved: 1, rejected: 0, missing: 2, ignored: 1 });

  await applyOutbox(bot, outbox);
  const edits = tg.calls.filter((c) => c.method === "editMessageText");
  assert.equal(edits.length, 3);
  assert.ok(edits.every((e) => e.body.text.startsWith("✅ DISETUJUI")), "label tidak tertimpa 'sudah diproses'");
});

test("jika penyimpanan gagal (outbox tak diterapkan), ketukan diproses ulang dan tombol utuh", async () => {
  const { dir } = await setup([cand(1)]);
  const id = candidateId(cand(1));
  const tg = fakeTelegram([tap(60, `a:${id}`)]);
  const bot = createBot({ token: "T", chatId: OWNER, fetchImpl: tg.fetchImpl });

  // Run 1: diproses di salinan, tetapi "push gagal" -> applyOutbox tidak dipanggil.
  await processUpdates(bot, createStore(dir));
  assert.equal(writeCalls(tg).length, 0, "tidak ada efek ke Telegram");

  // Run 2 di checkout baru (data asli): update yang sama masih dikirim ulang oleh Telegram.
  const fresh = await setup([cand(1)]);
  const { summary } = await processUpdates(bot, fresh.store);
  assert.equal(summary.approved, 1);
});

test("applyOutbox: gagal menjawab/mengedit tidak membatalkan konfirmasi offset", async () => {
  const { store } = await setup([cand(1)]);
  const id = candidateId(cand(1));
  const queue = [tap(50, `a:${id}`)];
  const seen = [];
  const fetchImpl = async (url, init) => {
    const method = url.split("/").pop();
    const body = JSON.parse(init.body);
    seen.push({ method, body });
    if (method === "getUpdates") return { ok: true, json: async () => ({ ok: true, result: body.offset ? [] : queue }) };
    return { ok: false, status: 400, json: async () => ({ ok: false, description: "query is too old" }) };
  };
  const bot = createBot({ token: "T", chatId: OWNER, fetchImpl });
  const { summary, outbox } = await processUpdates(bot, store);
  assert.equal(summary.approved, 1);
  await applyOutbox(bot, outbox);
  assert.ok(seen.some((c) => c.method === "getUpdates" && c.body.offset === 51));
});

test("send --resend: mengirim ulang kandidat yang masih menunggu", async () => {
  const { store } = await setup([{ ...cand(1), notified: true }, { ...cand(2), notified: true }]);
  const tg = fakeTelegram();
  const bot = createBot({ token: "T", chatId: OWNER, fetchImpl: tg.fetchImpl });

  assert.equal((await sendCandidates(bot, store)).sent, 0);
  assert.equal((await sendCandidates(bot, store, { resend: true })).sent, 2);
});

const noSleep = async () => {};

test("error jaringan: dicoba ulang, pesan memuat kode tetapi tidak token/URL", async () => {
  let n = 0;
  const err = Object.assign(new Error("fetch failed https://api.telegram.org/botSECRET-TOKEN/getUpdates"), {
    cause: { code: "ETIMEDOUT" },
  });
  const bot = createBot({
    token: "SECRET-TOKEN",
    chatId: OWNER,
    fetchImpl: async () => { n++; throw err; },
    sleep: noSleep,
  });
  await assert.rejects(bot.call("getUpdates", {}), (e) => {
    assert.match(e.message, /ETIMEDOUT/);
    assert.match(e.message, /3x percobaan/);
    assert.equal(e.message.includes("SECRET-TOKEN"), false);
    assert.equal(e.message.includes("api.telegram.org"), false);
    return true;
  });
  assert.equal(n, 3);
});

test("error jaringan sesaat: berhasil pada percobaan berikutnya", async () => {
  let n = 0;
  const bot = createBot({
    token: "T",
    chatId: OWNER,
    sleep: noSleep,
    fetchImpl: async () => {
      if (++n < 3) throw Object.assign(new Error("x"), { name: "TimeoutError" });
      return { ok: true, json: async () => ({ ok: true, result: "ok" }) };
    },
  });
  assert.equal(await bot.call("sendMessage", {}), "ok");
  assert.equal(n, 3);
});

test("429: menunggu retry_after lalu mencoba lagi", async () => {
  const waits = [];
  let n = 0;
  const bot = createBot({
    token: "T",
    chatId: OWNER,
    sleep: async (ms) => { waits.push(ms); },
    fetchImpl: async () => {
      if (++n === 1) {
        return { ok: false, status: 429, json: async () => ({ ok: false, description: "Too Many Requests", parameters: { retry_after: 7 } }) };
      }
      return { ok: true, json: async () => ({ ok: true, result: 1 }) };
    },
  });
  assert.equal(await bot.call("sendMessage", {}), 1);
  assert.deepEqual(waits, [7000]);
});

test("401/400: tidak dicoba ulang dan pesan API apa adanya", async () => {
  let n = 0;
  const bot = createBot({
    token: "T",
    chatId: OWNER,
    sleep: noSleep,
    fetchImpl: async () => { n++; return { ok: false, status: 401, json: async () => ({ ok: false, description: "Unauthorized" }) }; },
  });
  await assert.rejects(bot.call("getUpdates", {}), /Unauthorized/);
  assert.equal(n, 1);
});
