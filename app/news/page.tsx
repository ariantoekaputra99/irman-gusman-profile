import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { formatDate, newsSorted, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sorotan Kegiatan",
  description: "Sorotan kegiatan dan pernyataan publik Irman Gusman dari sumber publik.",
};

export default function NewsPage() {
  return (
    <PageShell
      wide
      eyebrow="SOROTAN KEGIATAN"
      title="Sorotan Kegiatan"
      intro="Setiap entri menautkan ke sumber aslinya agar dapat diverifikasi."
    >
      <p className="note mt-10">
        {site.newsNote}{" "}
        <a
          href={site.newsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gold font-bold"
        >
          Cari semua pemberitaan →
        </a>
      </p>
      <div className="grid md:grid-cols-3 gap-5 mt-14">
        {newsSorted.map((n) => (
          <article className="card p-7 min-h-72" key={n.slug}>
            <small className="gold uppercase tracking-widest">
              <time dateTime={n.date}>{formatDate(n.date)}</time> · {n.category}
            </small>
            <h2 className="serif text-2xl mt-12">{n.title}</h2>
            {n.excerpt && <p className="text-sm text-neutral-500">{n.excerpt}</p>}
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gold text-xs font-bold"
            >
              Baca sumber: {n.source} →
            </a>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
