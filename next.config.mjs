/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Cloudflare Pages에서는 headers() 대신 public/_headers 파일을 사용합니다.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });
    return config;
  }
};

export default nextConfig;
