/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'development' ? undefined : '/',
  basePath: ''
}

export default config
