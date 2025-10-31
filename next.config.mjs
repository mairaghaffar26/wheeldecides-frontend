/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled for Adsterra ad loading
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig