import Link from "next/link";
import { nav, site } from "@/lib/content";

export default function SiteHeader() {
  return (
    <header className="header">
      <div className="wrap h-[78px] flex items-center justify-between">
        <Link href="/" className="font-bold tracking-widest">
          IG <span className="gold">{site.name.toUpperCase()}</span>
        </Link>

        <nav className="hidden md:flex gap-7 text-xs" aria-label="Navigasi utama">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="link">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Menu mobile tanpa JavaScript: <details> bawaan HTML */}
        <details className="mobile-menu md:hidden">
          <summary aria-label="Buka menu">☰</summary>
          <nav aria-label="Navigasi utama (mobile)">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
