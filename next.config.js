/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        'pg-native': false,
        dns: false,
        net: false,
        tls: false,
        assert: false,
        util: false,
        url: false,
        os: false,
        http: false,
        https: false,
        stream: false,
        buffer: false
      };
    }
    return config;
  },
  onDemandEntries: {
    // Configure page lifetime
    maxInactiveAge: 25 * 1000,
    // Configure number of pages to be kept in memory
    pagesBufferLength: 2,
  },
};

export default nextConfig;






