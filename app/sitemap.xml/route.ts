import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  // ⚠️ Replace with your actual production URL
  const baseUrl = 'https://wikizeroai.com';

  try {
    // 1. Fetch all users/bots from Firebase
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.get();

    // 2. Generate the XML string manually
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>

      ${snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const botId = data.config?.botId;

          // Skip if no botId exists
          if (!botId) return null;

          return `
      <url>
        <loc>${baseUrl}/chat/${botId}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>`;
        })
        .filter((item) => item !== null) // Remove failed entries
        .join('')}
    </urlset>`;

    // 3. Return the response with the correct XML headers
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}