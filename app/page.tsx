import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  aboutParagraphs,
  documents,
  facts,
  focus,
  formatDate,
  gallery,
  introText,
  newsSorted,
  timeline,
} from "@/lib/content";
import { asset } from "@/lib/asset";

export default function Home() {
  const portrait = gallery[0];
  const latest = newsSorted.slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="min-h-screen pt-36 pb-20 bg-linear-to-br from-[#f5f1e8] to-[#e3d7c4]">
          <div className="wrap grid md:grid-cols-2 gap-16 items-center min-h-[78vh]">
            <div>
              <p className="eyebrow">SENATOR REPUBLIK INDONESIA · SUMATERA BARAT</p>
              <h1 className="serif text-7xl md:text-9xl leading-[.9] tracking-[-.06em]">
                Irman
                <br />
                <i className="gold">Gusman</i>
              </h1>
              <p className="text-lg text-neutral-600 max-w-xl my-8">
                Situs profil publik yang merangkum biografi, pengalaman
                kelembagaan, kegiatan, dan informasi dari dokumen serta kanal
                publik.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/biography"
                  className="bg-[#0b1320] text-white px-5 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Jelajahi profil →
                </Link>
                <Link
                  href="/news"
                  className="border border-black/15 px-5 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Kegiatan terbaru
                </Link>
              </div>
              <div className="flex gap-2 flex-wrap mt-7 text-[10px] uppercase tracking-wider">
                <span className="border border-black/15 px-3 py-2">DPD RI 2024–2029</span>
                <span className="border border-black/15 px-3 py-2">
                  Daerah Pemilihan Sumatera Barat
                </span>
              </div>
            </div>

            {portrait && (
              <figure className="max-w-md mx-auto">
                <div className="bg-white p-3 shadow-2xl">
                  <img
                    src={asset(portrait.src)}
                    alt={portrait.alt}
                    className="w-full aspect-[3/4] object-cover object-top"
                  />
                </div>
                <figcaption className="text-[10px] text-neutral-500 mt-3">
                  Foto: {portrait.credit}
                </figcaption>
              </figure>
            )}
          </div>
        </section>

        <section className="py-20 bg-[#ebe3d5]">
          <div className="wrap grid md:grid-cols-2 gap-10 md:gap-24">
            <div>
              <p className="eyebrow">PROFIL SINGKAT</p>
              <h2 className="serif text-4xl md:text-5xl leading-tight">
                Pengalaman publik dengan akar Sumatera Barat.
              </h2>
            </div>
            <div>
              <p className="text-neutral-600">{introText}</p>
              <Link href="/biography" className="gold text-xs font-bold">
                Baca biografi →
              </Link>
            </div>
          </div>
        </section>

        <section id="about" className="py-28">
          <div className="wrap">
            <p className="eyebrow">01 · TENTANG</p>
            <h2 className="serif text-5xl md:text-7xl leading-none">
              Biografi &amp; identitas publik
            </h2>
            <div className="grid md:grid-cols-[.8fr_1.2fr] gap-16 mt-16">
              <div className="text-neutral-600 space-y-4 max-w-xl">
                {aboutParagraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-black/10">
                {facts.map((f) => (
                  <div className="py-5 px-1 border-b border-black/10" key={f.label}>
                    <small className="block text-xs text-neutral-500 uppercase">
                      {f.label}
                    </small>
                    <b className="serif text-xl">{f.value}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="career" className="dark py-28">
          <div className="wrap">
            <p className="eyebrow">02 · PERJALANAN</p>
            <h2 className="serif text-5xl md:text-7xl leading-none">
              Jejak karier dan kelembagaan.
            </h2>
            <div className="max-w-4xl mt-16 border-l border-white/20">
              {timeline.map((t) => (
                <div
                  className="grid md:grid-cols-[150px_1fr] gap-5 p-7 border-b border-white/10"
                  key={t.year}
                >
                  <b className="gold">{t.year}</b>
                  <div>
                    <h3 className="serif text-2xl">{t.title}</h3>
                    <p className="m-0 mt-1 text-white/70 text-sm">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="focus" className="py-28">
          <div className="wrap">
            <p className="eyebrow">03 · FOKUS &amp; PEMIKIRAN</p>
            <h2 className="serif text-5xl md:text-7xl leading-none max-w-4xl">
              Isu yang muncul dalam kegiatan publik terbaru.
            </h2>
            <div className="grid md:grid-cols-3 gap-5 mt-14">
              {focus.map((f, i) => (
                <article className="card p-7 min-h-72" key={f.title}>
                  <span className="gold text-[10px] font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="serif text-2xl mt-16 mb-3">{f.title}</h3>
                  <p className="text-sm text-neutral-500">{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="news" className="py-28 bg-[#e7dfd1]">
          <div className="wrap">
            <div className="flex justify-between items-end gap-4">
              <div>
                <p className="eyebrow">04 · KEGIATAN</p>
                <h2 className="serif text-5xl md:text-7xl leading-none">
                  Berita &amp; dokumentasi.
                </h2>
              </div>
              <Link href="/news" className="gold text-xs font-bold whitespace-nowrap">
                LIHAT SEMUA →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-5 mt-14">
              {latest.map((n) => (
                <article className="card p-7 min-h-72" key={n.slug}>
                  <small className="gold uppercase tracking-widest">
                    {formatDate(n.date)} · {n.category}
                  </small>
                  <h3 className="serif text-2xl mt-12">{n.title}</h3>
                  <p className="text-sm text-neutral-500">{n.excerpt}</p>
                  <a
                    className="text-xs font-bold gold"
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sumber: {n.source} →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sources" className="py-28">
          <div className="wrap">
            <div className="flex justify-between items-end gap-4">
              <div>
                <p className="eyebrow">05 · SUMBER</p>
                <h2 className="serif text-5xl md:text-7xl leading-none">
                  Transparansi informasi.
                </h2>
              </div>
              <Link href="/documents" className="gold text-xs font-bold whitespace-nowrap">
                SEMUA DOKUMEN →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-x-12 mt-14 border-t border-black/10">
              {documents.map((d) => (
                <a
                  key={d.id}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link grid grid-cols-[1fr_auto] py-5 border-b border-black/10 text-sm"
                >
                  <span>
                    <b>{d.publisher}</b>
                    <span className="block text-neutral-500">{d.title}</span>
                  </span>
                  <span aria-hidden>↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
