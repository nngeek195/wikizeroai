"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Image from "next/image"; // Import Next.js Image for optimization

// Define a type for our profile data
type UserProfile = {
    bio: string;
    skills: string;
    linkedin: string;
    github: string;
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile>({
        bio: "",
        skills: "",
        linkedin: "",
        github: "",
    });

    // --- NEW STATE FOR OVERVIEW ---
    const [botId, setBotId] = useState("");
    const [apiKeyStatus, setApiKeyStatus] = useState("Not Set");

    const [apiKey, setApiKey] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingKey, setLoadingKey] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [keyMessage, setKeyMessage] = useState("");
    const [pageLoading, setPageLoading] = useState(true);

    // 1. Check for logged-in user and fetch their data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser); // <-- Save the whole user object
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile(data.profile as UserProfile);

                    // --- SET DATA FOR OVERVIEW ---
                    setBotId(data.config.botId || `bot-${currentUser.uid.substring(0, 8)}`);

                    if (data.config.geminiApiKey) {
                        setApiKeyStatus("Active");
                        setApiKey("****************"); // Mask the key in the form
                    } else {
                        setApiKeyStatus("Missing - Bot is Inactive");
                    }
                } else {
                    console.error("No profile document found for user!");
                }
            } else {
                router.push("/");
            }
            setPageLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    // 2. Handle PROFILE form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    // 3. Save the updated PROFILE to Firestore
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoadingProfile(true);
        setProfileMessage("Saving...");
        const userDocRef = doc(db, "users", user.uid);

        try {
            await updateDoc(userDocRef, {
                profile: profile,
            });
            setProfileMessage("Profile saved successfully!");
        } catch (error) {
            setProfileMessage("Error saving profile.");
        }

        setLoadingProfile(false);
        setTimeout(() => setProfileMessage(""), 3000);
    };

    // 4. Save the API KEY
    const handleSaveKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoadingKey(true);
        setKeyMessage('Saving & Validating...'); // Updated message

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/user/saveKey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ apiKey: apiKey }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save API key.');
            }

            const data = await response.json();
            setKeyMessage(data.message || 'API key saved successfully!');
            setApiKey("****************"); // Mask key on success
            setApiKeyStatus("Active"); // <-- UPDATE STATUS

        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : String(error);
            setKeyMessage(`Error: ${msg}`);
            setApiKeyStatus("Invalid Key"); // <-- UPDATE STATUS
        }

        setLoadingKey(false);
        setTimeout(() => setKeyMessage(''), 5000);
    };

    // 5. Handle Sign Out
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    if (pageLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <div className="w-64 p-4 bg-gray-800 flex-shrink-0">
                <h2 className="text-xl font-bold mb-4">WikiZero AI</h2>
                <nav>
                    <a href="/dashboard" className="block p-2 text-white bg-gray-700 rounded">Dashboard</a>
                </nav>
                <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 mt-10 text-left text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                    Sign Out
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-10 overflow-y-auto">

                {/* --- NEW: OVERVIEW SECTION --- */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    {user && (
                        <div className="flex items-center p-4 mt-4 bg-gray-800 rounded-lg">
                            {user.photoURL && (
                                <Image
                                    src={user.photoURL}
                                    alt="Profile Picture"
                                    width={64}
                                    height={64}
                                    className="rounded-full"
                                />
                            )}
                            <div className="ml-4">
                                <h2 className="text-xl font-semibold">{user.displayName}</h2>
                                <p className="text-gray-400">{user.email}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-400">API Key Status</h3>
                            <p className={`text-lg font-semibold ${apiKeyStatus === 'Active' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {apiKeyStatus}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-400">Your Public Bot ID</h3>
                            <p className="text-lg font-semibold text-gray-300">{botId}</p>
                            <p className="text-xs text-gray-500">
                                (This is the ID for your API endpoint)
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- DIVIDER --- */}
                <hr className="border-gray-700 my-12" />

                {/* --- SECTION 1: AI PERSONA --- */}
                <div className="max-w-2xl mb-12">
                    <h2 className="text-2xl font-bold mb-2">Your AI Persona</h2>
                    <p className="mb-8 text-gray-400">
                        This data will be used by your AI bot to answer questions as you.
                    </p>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        {/* (Your existing persona form fields: Bio, Skills, LinkedIn, GitHub) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Your Bio</label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded"
                                rows={4}
                                placeholder="I am a developer and cybersecurity enthusiast..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Your Skills</label>
                            <input
                                name="skills"
                                value={profile.skills}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded"
                                placeholder="Python, Next.js, Firebase, Ballerina"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">LinkedIn URL</label>
                            <input
                                name="linkedin"
                                type="url"
                                value={profile.linkedin}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">GitHub URL</label>
                            <input
                                name="github"
                                type="url"
                                value={profile.github}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded"
                                placeholder="https://github.com/..."
                            />
                        </div>

                        <div className="flex items-center">
                            <button
                                type="submit"
                                disabled={loadingProfile}
                                className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-500"
                            >
                                {loadingProfile ? 'Saving...' : 'Save Persona'}
                            </button>
                            {profileMessage && <p className="ml-4 text-green-400">{profileMessage}</p>}
                        </div>
                    </form>
                </div>

                {/* --- DIVIDER --- */}
                <hr className="border-gray-700 my-12" />

                {/* --- SECTION 2: SETTINGS / API KEY --- */}
                <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold mb-2">API Key Settings</h2>
                    <p className="mb-8 text-gray-400">
                        Provide your Gemini API key to power your bot.
                    </p>

                    <form onSubmit={handleSaveKey} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Your Gemini API Key
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    if (keyMessage) setKeyMessage('');
                                    if (apiKeyStatus !== 'Active') setApiKeyStatus('Editing...')
                                }}
                                className="w-full p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded"
                                placeholder="AIzaSy..."
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Your key is validated and stored securely on the server.
                            </p>
                        </div>

                        <div className="flex items-center">
                            <button
                                type="submit"
                                disabled={loadingKey}
                                className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500"
                            >
                                {loadingKey ? 'Saving...' : 'Save & Validate API Key'}
                            </button>
                            {keyMessage && <p className={`ml-4 ${keyMessage.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{keyMessage}</p>}
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}