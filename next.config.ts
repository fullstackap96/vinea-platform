import type { NextConfig } from "next";

export const productionSecurityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
] as const;

export const sensitiveNoStoreHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, max-age=0",
  },
  {
    key: "Pragma",
    value: "no-cache",
  },
  {
    key: "Expires",
    value: "0",
  },
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive",
  },
] as const;

export const apiNoStoreHeaders = sensitiveNoStoreHeaders;

export const familyPortalPrivacyHeaders = [
  ...sensitiveNoStoreHeaders,
  {
    key: "Referrer-Policy",
    value: "no-referrer",
  },
] as const;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...productionSecurityHeaders],
      },
      {
        source: "/api/:path*",
        headers: [...sensitiveNoStoreHeaders],
      },
      {
        source: "/dashboard/:path*",
        headers: [...sensitiveNoStoreHeaders],
      },
      {
        source: "/family/request/:path*",
        headers: [...familyPortalPrivacyHeaders],
      },
    ];
  },
};

export default nextConfig;
