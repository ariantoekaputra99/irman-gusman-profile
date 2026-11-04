import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { asset } from "@/lib/asset";
import { formatDate, gallery } from "@/lib/content";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Dokumentasi foto Irman Gusman beserta atribusi sumbernya.",
};

export default function GalleryPage() {
  return (
    <PageShell
      wide
      eyebrow="DOKUMENTASI"
      title="Galeri"
      intro="Setiap foto mencantumkan pemilik atau sumbernya."
    >
      {gallery.length === 0 ? (
        <p className="note mt-14">Belum ada foto yang ditampilkan.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mt-14">
          {gallery.map((g) => (
            <figure className="card p-3" key={g.id}>
              <a href={asset(g.src)} target="_blank" rel="noopener noreferrer">
                <img
                  src={asset(g.src)}
                  alt={g.alt}
                  loading="lazy"
                  className={`w-full object-cover object-top ${
                    g.orientation === "landscape" ? "aspect-[4/3]" : "aspect-[3/4]"
                  }`}
                />
              </a>
              <figcaption className="px-1 pt-3 pb-1 text-xs text-neutral-600">
                <b className="block text-sm text-[color:var(--ink)]">{g.caption}</b>
                <span className="block mt-1">
                  Foto:{" "}
                  {g.creditUrl ? (
                    <a
                      href={g.creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gold"
                    >
                      {g.credit}
                    </a>
                  ) : (
                    g.credit
                  )}
                  {g.license ? ` · ${g.license}` : ""}
                  {g.date ? ` · ${formatDate(g.date)}` : ""}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </PageShell>
  );
}
