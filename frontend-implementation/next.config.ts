import type { NextConfig } from "next";
import { getServerBackendUrl, IMAGE_CONFIG } from "./lib/config";

/**
 * Next.js Configuration for Southern Apparels IOT
 *
 * Features:
 * - Standalone output for Docker deployment
 * - API masking via URL rewrites
 * - CORS headers for API routes
 * - Image optimization configuration
 */

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  productionBrowserSourceMaps: false,

  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {
    // Turbopack handles Node.js module fallbacks automatically
    // No additional configuration needed for basic usage
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      ...IMAGE_CONFIG.ALLOWED_HOSTNAMES.map((hostname) => ({
        protocol: "http" as const,
        hostname,
      })),
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Webpack configuration (used for production builds)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false, // Use Web Crypto API instead
      };
    }
    return config;
  },

  // URL rewrites for API masking and legacy URL support
  async rewrites() {
    const apiUrl = getServerBackendUrl();
    console.log(`[NextConfig] Backend Proxy Target: ${apiUrl}`);

    return {
      // Process before checking filesystem (highest priority)
      beforeFiles: [
        // Note: /api/proxy is handled by API route handler, not rewrites
        {
          source: "/external-api/:path*",
          destination: `${apiUrl}/api/v1/:path*`,
        },
      ],

      // Process after checking filesystem
      afterFiles: [
        // Legacy URL support
        { source: "/index", destination: "/" },
        { source: "/index.html", destination: "/" },
        { source: "/index.php", destination: "/" },
      ],

      // Fallback rewrites (when no file matches)
      fallback: [],
    };
  },

  // Security and CORS headers
  async headers() {
    return [
      {
        // API routes CORS configuration
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type, X-Requested-With",
          },
        ],
      },
      {
        // External API routes CORS configuration
        source: "/external-api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type, X-Requested-With",
          },
        ],
      },
      {
        // Security headers for all routes
        source: "/:path*",
        headers: [
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
        ],
      },
    ];
  },
};

export default nextConfig;
