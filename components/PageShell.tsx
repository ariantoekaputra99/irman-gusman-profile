import Link from "next/link";
import type { ReactNode } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  wide?: boolean;
  children: ReactNode;
};

/** Kerangka halaman dalam (Biografi, Berita, Galeri, Dokumen). */
export default function PageShell({ eyebrow, title, intro, wide, children }: Props) {
  return (
    <>
      <SiteHeader />
      <main className={`wrap py-32 ${wide ? "" : "max-w-4xl"}`}>
        <Link href="/" className="gold text-xs">
          ← Beranda
        </Link>
        <p className="eyebrow mt-10">{eyebrow}</p>
        <h1 className="serif text-5xl md:text-6xl">{title}</h1>
        {intro && <p className="text-lg text-neutral-600 mt-6 max-w-2xl">{intro}</p>}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
