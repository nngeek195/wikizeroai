import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {

  const baseUrl = 'https://wikizeroai.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/chat/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}