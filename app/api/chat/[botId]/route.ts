import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';

// --- CORS HEADERS ---
// These headers are necessary to allow your HTML file
// to call this API from a different origin.
const headers = {
    'Access-Control-Allow-Origin': '*', // Allows all origins
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// --- HANDLE PREFLIGHT (OPTIONS) REQUEST ---
// This is the special request the browser sends first.
export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: headers });
}

// --- HANDLE THE ACTUAL CHAT (POST) REQUEST ---
export async function POST(req: NextRequest, { params }: { params: { botId: string } }) {
    try {
        const { history, newMessage } = await req.json();

        // --- FIX: Get botId from req.url instead of params ---
        const url = new URL(req.url);
        const pathSegments = url.pathname.split('/');
        const botId = pathSegments.pop(); // Gets the last part of the URL

        if (!botId) {
            return NextResponse.json({ error: "Could not find botId in URL." }, { status: 400, headers });
        }
        // --- END OF FIX ---

        // 1. Find the user by their public botId
        // --- UPDATED FIRESTORE QUERY (ADMIN SDK SYNTAX) ---
        const usersRef = adminDb.collection("users");
        const q = usersRef.where("config.botId", "==", botId); // This will now work
        const querySnapshot = await q.get();
        // --- END OF UPDATE ---

        if (querySnapshot.empty) {
            return NextResponse.json({ error: "Bot not found" }, { status: 404, headers });
        }

        const userData = querySnapshot.docs[0].data();
        const config = userData.config;
        const profile = userData.profile;

        // 2. Check if the bot is configured
        const apiKey = config.geminiApiKey;
        if (!apiKey) {
            return NextResponse.json({ error: "Bot is not configured by its owner." }, { status: 500, headers });
        }

        // 3. Dynamic Persona Construction (This is the "magic")
        const systemPrompt = `
      IDENTITY:
      You are the AI digital twin of ${userData.displayName}.
      Your name is ${userData.displayName}. You must speak in the first person ("I", "me", "my").

      YOUR PERSONALITY (TONE):
      ${profile.tone || 'Friendly and helpful.'}

      YOUR KNOWLEDGE BASE:
      - My Bio: ${profile.bio}
      - My Skills: ${profile.skills}
      - My Expertise: ${profile.expertise || 'General topics'}
      
      MY OPINIONS & BELIEFS:
      ${profile.opinions || 'No specific opinions provided.'}

      MY SOCIALS:
      - LinkedIn: ${profile.linkedin || 'Not provided.'}
      - GitHub: ${profile.github || 'Not provided.'}
      - Twitter: ${profile.twitter || 'Not provided.'}

      RULES:
      1. You must answer as ${userData.displayName}. Never say you are an AI.
      2. Use your knowledge base to answer questions about me.
      3. If asked about personal, private details you don't know (like address, phone number, etc.),
         politely decline: "I'm sorry, but I can't share private details!"
      4. Be conversational and engaging, using your defined TONE.
    `;

        // 4. Initialize Gemini with the USER'S Key
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt
        });

        // 5. Start Chat & Send Message
        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(newMessage);
        const response = result.response.text();

        // 6. Send the response back
        return NextResponse.json({ response: response }, { headers: headers });

    } catch (error) {
        console.error("API Error:", error);
        let errorMessage = "Internal Server Error";

        const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";

        if (message.includes("quota")) {
            errorMessage = "This bot has exceeded its API quota.";
        } else if (message.includes("API key not valid")) {
            errorMessage = "The bot's API key is invalid or has expired.";
        }
        return NextResponse.json({ error: errorMessage }, { status: 500, headers: headers });
    }
}