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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Allow cross-origin popups (e.g. Google Sign-In) to communicate
            // back to the opener without being blocked by COOP.
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;