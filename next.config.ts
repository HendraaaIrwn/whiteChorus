import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // Sharp is a native (server-only) dependency that ships platform-specific
  // optional binaries (`@img/sharp-linux-x64` + `@img/sharp-libvips-linux-x64`
  // on Vercel). Externalizing it keeps these native modules out of the
  // Turbopack JS bundle and lets Next.js's @vercel/nft file-tracing copy the
  // full libvips shared-library tree (libvips-cpp.so.8.18.3 and its deps)
  // into the serverless function. Without this, the runtime fails with
  // `ERR_DLOPEN_FAILED: libvips-cpp.so ... cannot open shared object file`
  // even though pnpm installed the package correctly.
  serverExternalPackages: ["sharp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/api/outfits": [
      "./public/dress-up/**/*",
      "./public/brand/**/*",
      // Sharp's native libvips shared library is dlopen'd at runtime (not
      // require'd), so @vercel/nft cannot statically discover it. Trace the
      // linux-x64/glibc binaries explicitly so libvips-cpp.so.8.x ships with
      // the serverless function. pnpm stores these under .pnpm/@img+...
      "./node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*",
      "./node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-linux-x64/**/*",
    ],
    "/api/outfits/**/*": [
      "./public/dress-up/previews/default-look-share.png",
      "./public/brand/shareables-frame.png",
      "./node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*",
      "./node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-linux-x64/**/*",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "media-src 'self' https://*.supabase.co",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"} https://challenges.cloudflare.com`,
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com",
              "frame-src https://challenges.cloudflare.com",
            ].join("; "),
          },
        ],
      },
      {
        source: "/dress-up/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
