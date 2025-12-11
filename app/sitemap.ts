import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';

// 1. CACHING (Crucial)
// This tells Next.js: "Build this once every hour."
// It prevents timeouts when Google crawls you.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // ⚠️ Replace with your actual domain (no trailing slash)
    const baseUrl = 'https://wikizeroai.com';

    // 2. STATIC ROUTES (Always exist)
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];

    try {
        // 3. DYNAMIC ROUTES (Fetch from Firebase)
        const usersRef = adminDb.collection("users");
        // Limit query if you have thousands of users to prevent timeouts
        // e.g., .limit(1000) or order by updated_at
        const snapshot = await usersRef.get();

        const botUrls = snapshot.docs
            .map((doc) => {
                const data = doc.data();
                const botId = data.config?.botId;

                if (!botId) return null;

                return {
                    url: `${baseUrl}/chat/${encodeURIComponent(botId)}`, // Encodes spaces/special chars
                    lastModified: new Date(), // Ideally use data.updatedAt if available
                    changeFrequency: 'daily' as const,
                    priority: 0.8,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        return [...routes, ...botUrls];

    } catch (error) {
        console.error("Failed to generate full sitemap:", error);
        // If Firebase fails, at least return the static homepage so Google doesn't see a 500 error
        return routes;
    }
}