/**
 * Awalan basePath untuk aset lokal. Next.js hanya menambahkan basePath pada
 * <Link>, bukan pada <img src="/...">, sehingga di GitHub Pages
 * (/irman-gusman-profile/) gambar lokal harus diprefiks manual.
 */
export function asset(path: string): string {
  if (/^(https?:)?\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
