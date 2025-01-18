/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  },
  experimental: {
    fontLoaders: [
      { loader: '@next/font/google', options: { timeout: 30000 } },
    ],
  },
}




