import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai'; // <-- IMPORT THIS

export async function POST(req: NextRequest) {
    try {
        // 1. Get token and new API key
        const authorization = req.headers.get('authorization');
        if (!authorization) {
            return NextResponse.json({ error: 'No authorization token provided.' }, { status: 401 });
        }
        const token = authorization.split('Bearer ')[1];

        const { apiKey } = await req.json();
        if (!apiKey) {
            return NextResponse.json({ error: 'No API key provided.' }, { status: 400 });
        }

        // --- 2. NEW: VALIDATE THE API KEY ---
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // We test with a common, lightweight model
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            // countTokens is a fast, cheap way to test a key
            await model.countTokens("test");
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn("Gemini API key validation failed:", message);

            // Send a specific error message back to the user
            if (message.includes("API key not valid")) {
                return NextResponse.json({ error: 'This API key is not valid. Please check it and try again.' }, { status: 400 });
            }
            if (message.includes("quota") || message.includes("limit")) {
                return NextResponse.json({ error: 'This API key has exceeded its quota or rate limit.' }, { status: 400 });
            }
            // For any other error
            return NextResponse.json({ error: 'API key validation failed. The key may be incorrect or disabled.' }, { status: 500 });
        }

        // --- 3. VERIFY USER (Existing code) ---
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        // --- 4. SAVE THE VALID KEY (Existing code) ---
        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.update({
            'config.geminiApiKey': apiKey,
        });

        return NextResponse.json({ message: 'API key saved and validated successfully!' });

    } catch (error) {
        console.error('Error in saveKey route:', error);
        // This will catch auth failures
        return NextResponse.json({ error: 'Authentication failed or server error.' }, { status: 401 });
    }
}