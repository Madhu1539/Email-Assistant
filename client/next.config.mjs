/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use standalone output for Docker container builds; Vercel handles native output
  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' } : {}),
};

export default nextConfig;
