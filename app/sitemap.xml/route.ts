import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin'; // Your existing firebase import

// Update this to your actual website URL
const BASE_URL = 'https://wikizeroai.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Fetch all users/bots from Firebase
  // Note: This runs on the server when Google requests your sitemap
  const usersRef = adminDb.collection("users");
  const snapshot = await usersRef.get();

  // 2. Map the data to the sitemap format
  const botUrls = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const botId = data.config?.botId;

      // If the user hasn't set up a botId, skip them
      if (!botId) return null;

      return {
        url: `${BASE_URL}/chat/${botId}`,
        lastModified: new Date(), // Or use a field from firebase like 'updatedAt'
        changeFrequency: 'daily' as const,
        priority: 0.8,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // 3. Add your static pages (Home, About, etc.)
  const routes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    // Add other static pages here if you have them
  ];

  return [...routes, ...botUrls];
}