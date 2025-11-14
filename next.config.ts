/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...any other config you might have...

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // This allows all images from this host
      },
    ],
  },
};

module.exports = nextConfig;