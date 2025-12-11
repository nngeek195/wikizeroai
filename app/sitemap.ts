import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // ⚠️ CHANGE THIS to your production domain
    const baseUrl = 'https://wikizeroai.vercel.app';

    // 1. Fetch all bots from Firebase
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.get();

    // 2. Create the list of dynamic bot URLs
    const botUrls: MetadataRoute.Sitemap = snapshot.docs
        .map((doc) => {
            const data = doc.data();
            const botId = data.config?.botId;

            if (!botId) return null;

            return {
                url: `${baseUrl}/chat/${botId}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.8,
            };
        })
        .filter((item): item is any => item !== null);

    // 3. Add your static pages
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        // Add other static pages here (e.g., /about, /login)
    ];

    // 4. Return the combined list
    return [...staticRoutes, ...botUrls];
}