import Link from "next/link";
import { site } from "@/lib/content";

export default function SiteFooter() {
  return (
    <footer className="dark py-10">
      <div className="wrap">
        <p className="note-dark">{site.disclaimer}</p>
        <div className="flex flex-col md:flex-row justify-between gap-4 text-xs mt-8">
          <b>
            {site.name.toUpperCase()} · {site.tagline.toUpperCase()}
          </b>
          <span>Informasi · Dokumentasi · Sumber</span>
          <Link href="/documents" className="gold">
            Daftar sumber →
          </Link>
        </div>
      </div>
    </footer>
  );
}
