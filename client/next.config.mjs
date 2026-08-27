/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enables minimal Docker image (copies only runtime files)
};

export default nextConfig;
