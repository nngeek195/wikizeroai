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

        const { profile } = await req.json();
        if (!profile) {
            return NextResponse.json({ error: 'No profile data provided.' }, { status: 400 });
        }

        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.update({ profile });

        return NextResponse.json({ message: 'Profile saved successfully.' });
    } catch (error) {
        console.error('Error in saveProfile route:', error);
        return NextResponse.json({ error: 'Authentication failed or server error.' }, { status: 401 });
    }
}
