/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Cloudflare Pages에서는 headers() 대신 public/_headers 파일을 사용합니다.
};

export default nextConfig;
