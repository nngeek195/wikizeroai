import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    const baseUrl = 'https://wikizero-ai.vercel.app'; // REPLACE with your domain

    // 1. Static Pages
    const staticRoutes = [
        { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
        // Add other public pages like /pricing or /about if you have them
    ];

    // 2. Dynamic Bot Pages (Only list PUBLIC bots)
    // You should ideally have an 'isPublic' flag in your user config
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.get();

    const botRoutes = snapshot.docs
        .filter(doc => doc.data().config?.botId) // Ensure botId exists
        .map(doc => ({
            url: `${baseUrl}/chat/${doc.data().config.botId}`,
            lastModified: new Date().toISOString(), // Or use doc.updateTime if available
        }));

    const allRoutes = [...staticRoutes, ...botRoutes];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allRoutes.map(route => `
      <url>
        <loc>${route.url}</loc>
        <lastmod>${route.lastModified}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `).join('')}
    </urlset>`;

    return new Response(sitemap, {
        headers: { 'Content-Type': 'application/xml' },
    });
}