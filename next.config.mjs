/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Cloudflare Pages에서는 headers() 대신 public/_headers 파일을 사용합니다.
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    // We don't actually want to load .node files in browser build, so we can ignore them
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  }
};

export default nextConfig;
