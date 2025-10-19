/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/discord',        // the path on your site
        destination: 'https://discord.gg/DgavuHSaWA',  // your Discord link
        permanent: true,          // false = temporary redirect (307), true = permanent (308)
      },
         ];
  },
}

export default nextConfig
