import { adminDb } from '@/lib/firebase-admin'; // Ensure path matches your project
import { Metadata } from 'next';
import ChatClient from './ChatClient';
import { notFound } from 'next/navigation';

type Props = {
    params: { botId: string }
};

// --- 1. DATA FETCHING (Server-Side) ---
async function getBotData(botId: string) {
    try {
        const usersRef = adminDb.collection("users");
        const q = usersRef.where("config.botId", "==", botId).limit(1);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) return null;

        return querySnapshot.docs[0].data();
    } catch (error) {
        console.error("Error fetching bot data:", error);
        return null;
    }
}

// --- 2. DYNAMIC METADATA GENERATION ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const userData = await getBotData(params.botId);

    if (!userData) {
        return { title: "Bot Not Found" };
    }

    const name = userData.displayName || "AI Assistant";
    const bio = userData.profile?.bio || "Chat with my custom AI digital twin.";
    // Use the user's uploaded photo, or a default bot image
    const image = userData.photoURL || "https://wikizero-ai.vercel.app/default-bot.png";

    return {
        title: `Chat with ${name}`,
        description: `Ask ${name}'s AI assistant about their professional experience, skills, and resume.`,

        // Custom Share Card for LinkedIn/Facebook
        openGraph: {
            title: `Talk to ${name}'s Digital Twin`,
            description: bio.substring(0, 150) + "...", // Truncate bio for clean display
            images: [{ url: image }],
            type: "profile",
        },

        // Custom Share Card for Twitter
        twitter: {
            card: "summary_large_image",
            title: `Chat with ${name}'s AI`,
            description: bio.substring(0, 150) + "...",
            images: [image],
        },
    };
}

// --- 3. PAGE COMPONENT ---
export default async function BotChatPage({ params }: Props) {
    const userData = await getBotData(params.botId);

    if (!userData) return notFound();

    // Pass data to the Client Component
    return (
        <ChatClient
            botId={params.botId}
            botName={userData.displayName}
            botImage={userData.photoURL}
            initialMessage={`Hello! I am ${userData.displayName}'s AI Assistant. Ask me anything about their professional background.`}
        />
    );
}