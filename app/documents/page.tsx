import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { documentCategories, documents } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dokumen & Sumber",
  description: "Daftar dokumen dan sumber publik yang menjadi rujukan situs ini.",
};

export default function DocumentsPage() {
  return (
    <PageShell
      eyebrow="DOKUMEN & SUMBER"
      title="Dokumen publik"
      intro="Rujukan utama informasi di situs ini, dikelompokkan menurut jenisnya."
    >
      {documentCategories.map((cat) => {
        const items = documents.filter((d) => d.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mt-14">
            <h2 className="eyebrow">{cat}</h2>
            <div className="mt-4 border-t border-black/10">
              {items.map((d) => (
                <a
                  key={d.id}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link grid grid-cols-[1fr_auto] gap-4 py-6 border-b border-black/10"
                >
                  <span>
                    <b>{d.publisher}</b>
                    <span className="block serif text-xl mt-1">{d.title}</span>
                    <span className="block text-neutral-500 text-sm mt-1">
                      {d.description}
                    </span>
                  </span>
                  <span className="text-xs text-neutral-500 whitespace-nowrap">
                    {d.format} ↗
                  </span>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </PageShell>
  );
}
