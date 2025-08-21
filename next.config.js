
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle pdf-parse and other Node.js modules
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        jsdom: false,
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        assert: false,
        url: false,
        zlib: false,
      };
    }

    // Optimize pdf-parse bundle
    config.module = config.module || {};
    config.module.rules = config.module || [];
    config.module.rules.push({
      test: /pdf-parse/,
      use: {
        loader: "string-replace-loader",
        options: {
          search: /require\(['"]\.\/test\/.*?['"]\)/g,
          replace: "null",
        },
      },
    });

    return config;
  },
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
