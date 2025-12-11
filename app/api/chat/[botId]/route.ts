import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: headers });
}

export async function POST(req: NextRequest) {
    try {
        const { history, newMessage } = await req.json();

        const url = new URL(req.url);
        const pathSegments = url.pathname.split('/');
        const botId = pathSegments.pop();

        if (!botId) {
            return NextResponse.json({ error: "Could not find botId in URL." }, { status: 400, headers });
        }

        // 1. Find User
        const usersRef = adminDb.collection("users");
        const q = usersRef.where("config.botId", "==", botId);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            return NextResponse.json({ error: "Bot not found" }, { status: 404, headers });
        }

        const userData = querySnapshot.docs[0].data();
        const config = userData.config;
        const profile = userData.profile;

        // 2. Check Configuration
        const apiKey = config.geminiApiKey;
        if (!apiKey) {
            return NextResponse.json({ error: "Bot is not configured by its owner." }, { status: 500, headers });
        }

        // 3. UPDATED SYSTEM PROMPT
        // - Now identifies as an ASSISTANT, not the person.
        // - Explicitly handles CV/Resume links.
        const systemPrompt = `
      IDENTITY:
      You are the AI Assistant for ${userData.displayName}.
      You are NOT ${userData.displayName} himself. Do not pretend to be a human.
      Your role is to answer questions about ${userData.displayName}'s professional life, skills, and experience on their behalf.

      YOUR PERSONALITY (TONE):
      ${profile.tone || 'Professional, concise, and helpful.'}

      YOUR KNOWLEDGE BASE:
      - About ${userData.displayName}: ${profile.bio}
      - Skills: ${profile.skills}
      - Expertise: ${profile.expertise || 'General topics'}
      - CV/Resume Link: ${profile.resume || profile.cv || "Not provided"} 
      
      MY OPINIONS & BELIEFS:
      ${profile.opinions || 'No specific opinions provided.'}

      MY SOCIALS:
      - LinkedIn: ${profile.linkedin || 'Not provided.'}
      - GitHub: ${profile.github || 'Not provided.'}
      - Twitter: ${profile.twitter || 'Not provided.'}

      STRICT RULES FOR ANSWERS:
      1. **BE CONCISE.** Users want exact answers, not essays. Keep responses short.
      2. If asked for a CV, Resume, or Portfolio, PROVIDE THE LINK from your knowledge base if available.
      3. Always refer to ${userData.displayName} in the third person (e.g., "Niranga specializes in..." or "He has experience with...").
      4. Never claim to be the human user. You are an AI tool helping them.
      5. Use bullet points for lists to make them readable.
      6. If asked about personal private details (address, phone) that are not in the knowledge base, decline politely.
    `;

        // 4. Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);

        // FIXED MODEL VERSION
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // Changed from 2.5 (doesn't exist) to 1.5-flash
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(newMessage);
        const response = result.response.text();

        return NextResponse.json({ response: response }, { headers: headers });

    } catch (error) {
        console.error("API Error:", error);
        let errorMessage = "Internal Server Error";
        const message = error instanceof Error ? error.message : String(error);

        if (message.includes("quota")) errorMessage = "This bot has exceeded its API quota.";
        else if (message.includes("API key not valid")) errorMessage = "The bot's API key is invalid.";
        else if (message.includes("404")) errorMessage = "Model not found. Please check API settings.";

        return NextResponse.json({ error: errorMessage }, { status: 500, headers: headers });
    }
}