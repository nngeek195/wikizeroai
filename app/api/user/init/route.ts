import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const authorization = req.headers.get('authorization');
        if (!authorization) {
            return NextResponse.json({ error: 'No authorization token provided.' }, { status: 401 });
        }
        const token = authorization.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Invalid authorization header format.' }, { status: 401 });
        }

        // Verify the Firebase ID token using Admin SDK
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        const userDocRef = adminDb.collection('users').doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            const body = await req.json().catch(() => ({}));
            await userDocRef.set({
                uid,
                email: body.email ?? decodedToken.email ?? '',
                displayName: body.displayName ?? decodedToken.name ?? '',
                photoURL: body.photoURL ?? decodedToken.picture ?? '',
                botId: `bot-${uid.substring(0, 8)}`,
                geminiApiKey: '',
                profile: {
                    bio: "I'm new to WikiZero! Please update my bio.",
                    skills: 'Edit my skills in the dashboard.',
                    linkedin: '',
                    github: '',
                    facebook: '',
                    cvLink: '',
                    whatsapp: '',
                    twitter: '',
                    aiTone: '',
                    aiExpertise: '',
                    aiOpinions: '',
                },
            });
        }

        return NextResponse.json({ message: 'User initialized.' });
    } catch (error) {
        console.error('Error in user init route:', error);
        return NextResponse.json({ error: 'Authentication failed or server error.' }, { status: 401 });
    }
}
