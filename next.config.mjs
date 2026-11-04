// Situs di-export statis untuk GitHub Pages. BASE_PATH diisi oleh workflow
// (/irman-gusman-profile); kosong saat development lokal.
const basePath = process.env.BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
