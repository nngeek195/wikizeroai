"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Image from "next/image";
import { generateBotHtml } from "@/lib/bot-templates/default";

// --- Types ---
type UserProfile = {
    bio: string;
    skills: string;
    linkedin: string;
    github: string;
    facebook: string;
    cvLink: string;
    whatsapp: string;
    aiTone: string;
    aiExpertise: string;
    aiOpinions: string;
};

// --- Icons (Inline SVGs for no-dependency implementation) ---
const Icons = {
    Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    LogOut: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Key: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.464l-2.828 2.829-1.415-1.414 2.829-2.828-1.415-1.414 4.242-4.242a6 6 0 018.486 8.486z" /></svg>,
    Bot: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    Copy: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    ExternalLink: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile>({
        bio: "", skills: "", linkedin: "", github: "", facebook: "",
        cvLink: "", whatsapp: "", aiTone: "", aiExpertise: "", aiOpinions: "",
    });

    const [botId, setBotId] = useState("");
    const [apiKeyStatus, setApiKeyStatus] = useState("Not Set");
    const [apiKey, setApiKey] = useState("");
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingKey, setLoadingKey] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [keyMessage, setKeyMessage] = useState("");
    const [pageLoading, setPageLoading] = useState(true);

    // Bot Integration State
    const [appUrl, setAppUrl] = useState("");
    const [botHtml, setBotHtml] = useState("");
    const [copyButtonText, setCopyButtonText] = useState("Copy HTML Code");

    useEffect(() => {
        setAppUrl(window.location.origin);
    }, []);

    useEffect(() => {
        if (botId && appUrl) {
            setBotHtml(generateBotHtml(botId, appUrl));
        }
    }, [botId, appUrl]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile((prev) => ({ ...prev, ...data.profile }));

                    const id = data.config.botId || `bot-${currentUser.uid.substring(0, 8)}`;
                    setBotId(id);

                    if (data.config.geminiApiKey) {
                        setApiKeyStatus("Active");
                        setApiKey("****************");
                    } else {
                        setApiKeyStatus("Missing");
                    }
                } else {
                    router.push("/");
                }
            } else {
                router.push("/");
            }
            setPageLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoadingProfile(true);
        setProfileMessage("Saving...");
        try {
            await updateDoc(doc(db, "users", user.uid), { profile: profile });
            setProfileMessage("Saved!");
        } catch (error) {
            setProfileMessage("Error saving.");
        }
        setLoadingProfile(false);
        setTimeout(() => setProfileMessage(""), 3000);
    };

    const handleSaveKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoadingKey(true);
        setKeyMessage("Validating...");
        try {
            const token = await user.getIdToken();
            const response = await fetch("/api/user/saveKey", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ apiKey: apiKey }),
            });
            if (!response.ok) throw new Error("Failed");

            setKeyMessage("Success!");
            setApiKey("****************");
            setApiKeyStatus("Active");
        } catch (error) {
            setKeyMessage("Invalid Key");
            setApiKeyStatus("Invalid");
        }
        setLoadingKey(false);
        setTimeout(() => setKeyMessage(""), 5000);
    };

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/");
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(botHtml);
        setCopyButtonText("Copied!");
        setTimeout(() => setCopyButtonText("Copy HTML Code"), 2000);
    };

    const handleOpenBot = () => {
        const botWindow = window.open("", "_blank");
        if (botWindow) {
            botWindow.document.write(botHtml);
            botWindow.document.close();
        }
    };

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col">
                <div className="p-6 flex items-center space-x-2 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        W
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">WikiZero</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-pink-50 text-pink-700 rounded-xl font-medium transition-colors">
                        <Icons.Home />
                        <span>Dashboard</span>
                    </a>
                    <div className="px-4 py-3 text-slate-400 flex items-center space-x-3 cursor-not-allowed hover:bg-slate-50 rounded-xl transition-colors">
                        <Icons.Bot />
                        <span>Analytics (Soon)</span>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    {user && (
                        <div className="flex items-center space-x-3 mb-4 px-2">
                            {user.photoURL ? (
                                <Image src={user.photoURL} alt="User" width={36} height={36} className="rounded-full ring-2 ring-pink-100" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                                    {user.displayName?.[0]}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-700 truncate">{user.displayName}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <Icons.LogOut />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 overflow-y-auto">

                {/* Header (Mobile Only Logo) */}
                <div className="md:hidden mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-pink-600">WikiZero</h1>
                    <button onClick={handleSignOut} className="p-2 text-slate-600"><Icons.LogOut /></button>
                </div>

                <div className="max-w-6xl mx-auto space-y-8">

                    {/* 1. STATUS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-1">System Status</h3>
                                <div className="flex items-center space-x-2">
                                    <span className={`w-3 h-3 rounded-full ${apiKeyStatus === 'Active' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                                    <span className={`text-xl font-bold ${apiKeyStatus === 'Active' ? 'text-slate-800' : 'text-red-500'}`}>
                                        {apiKeyStatus === 'Active' ? 'Bot is Live' : 'Bot Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-full ${apiKeyStatus === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <Icons.Key />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-1">Public Bot ID</h3>
                                <code className="text-lg font-mono font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded">{botId}</code>
                            </div>
                            <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                                <Icons.Bot />
                            </div>
                        </div>
                    </div>

                    {/* 2. MAIN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN: Settings */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Persona Section */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                                <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
                                    <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                                        <Icons.User />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">AI Persona</h2>
                                        <p className="text-sm text-slate-500">Teach the bot who you are.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Bio / Introduction</span>
                                            <textarea name="bio" rows={3} value={profile.bio} onChange={handleChange}
                                                className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-pink-500 focus:ring-pink-500 shadow-sm sm:text-sm p-3"
                                                placeholder="I am a software engineer passionate about..."
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Skills</span>
                                            <input type="text" name="skills" value={profile.skills} onChange={handleChange}
                                                className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-pink-500 focus:ring-pink-500 shadow-sm sm:text-sm p-3"
                                                placeholder="React, Next.js, Python..."
                                            />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">LinkedIn</span>
                                            <input type="url" name="linkedin" value={profile.linkedin} onChange={handleChange}
                                                className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-pink-500 focus:ring-pink-500 shadow-sm sm:text-sm p-3"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">GitHub</span>
                                            <input type="url" name="github" value={profile.github} onChange={handleChange}
                                                className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-pink-500 focus:ring-pink-500 shadow-sm sm:text-sm p-3"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">WhatsApp</span>
                                            <input type="tel" name="whatsapp" value={profile.whatsapp} onChange={handleChange}
                                                className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-pink-500 focus:ring-pink-500 shadow-sm sm:text-sm p-3"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">CV Link</span>
                                            <input type="url" name="cvLink" value={profile.cvLink} onChange={handleChange}
                                                className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-pink-500 focus:ring-pink-500 shadow-sm sm:text-sm p-3"
                                            />
                                        </label>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">AI Behavior</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <label className="block">
                                                <span className="text-sm font-medium text-slate-700">Tone</span>
                                                <input type="text" name="aiTone" value={profile.aiTone} onChange={handleChange}
                                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-pink-500 focus:ring-pink-500 shadow-sm sm:text-sm p-3"
                                                    placeholder="Professional, Friendly, Witty..."
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-sm font-medium text-slate-700">Specific Opinions</span>
                                                <textarea name="aiOpinions" rows={2} value={profile.aiOpinions} onChange={handleChange}
                                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-pink-500 focus:ring-pink-500 shadow-sm sm:text-sm p-3"
                                                    placeholder="I believe AI will augment humans, not replace them..."
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <button type="submit" disabled={loadingProfile}
                                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loadingProfile ? <span className="animate-spin mr-2">⟳</span> : <Icons.Check />}
                                            <span>{loadingProfile ? 'Saving...' : 'Save Persona'}</span>
                                        </button>
                                        {profileMessage && <span className="text-sm font-medium text-green-600 animate-fade-in">{profileMessage}</span>}
                                    </div>
                                </form>
                            </section>

                            {/* API Key Section */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                                <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Icons.Key />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Connection</h2>
                                        <p className="text-sm text-slate-500">Connect to Google Gemini API.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveKey} className="space-y-4">
                                    <div className="relative">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Gemini API Key</label>
                                        <input type="password" value={apiKey}
                                            onChange={(e) => {
                                                setApiKey(e.target.value);
                                                if (keyMessage) setKeyMessage("");
                                                if (apiKeyStatus !== "Active") setApiKeyStatus("Editing...");
                                            }}
                                            className="block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 font-mono text-sm"
                                            placeholder="AIzaSy..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex space-x-3">
                                            <button type="submit" disabled={loadingKey}
                                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-all shadow-sm disabled:opacity-50"
                                            >
                                                {loadingKey ? "Verifying..." : "Save & Validate"}
                                            </button>
                                            <a href="https://aistudio.google.com/api-keys" target="_blank"
                                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 rounded-xl font-medium transition-all flex items-center space-x-2"
                                            >
                                                <span>Get Key</span>
                                                <Icons.ExternalLink />
                                            </a>
                                        </div>
                                        {keyMessage && (
                                            <span className={`text-sm font-medium ${keyMessage.includes("Success") ? "text-green-600" : "text-red-500"}`}>
                                                {keyMessage}
                                            </span>
                                        )}
                                    </div>
                                </form>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Preview & Actions */}
                        <div className="space-y-8">

                            {/* Bot Preview - Phone Mockup Style */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
                                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-400">Preview</span>
                                    <div className="flex space-x-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                </div>
                                <div className="flex-1 bg-slate-100 relative">
                                    {apiKeyStatus === 'Active' ? (
                                        <iframe
                                            srcDoc={botHtml}
                                            className="w-full h-full border-0"
                                            title="Bot Preview"
                                            sandbox="allow-scripts allow-same-origin allow-forms"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                                <Icons.Key />
                                            </div>
                                            <h3 className="text-slate-800 font-bold mb-2">Bot Offline</h3>
                                            <p className="text-slate-500 text-sm">Add your API key settings to start the simulation.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Integration Actions */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
                                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                                    <Icons.Bot /> <span>Deploy</span>
                                </h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleCopyCode}
                                        disabled={!botId || !appUrl}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all font-medium"
                                    >
                                        <Icons.Copy />
                                        <span>{copyButtonText}</span>
                                    </button>
                                    <button
                                        onClick={handleOpenBot}
                                        disabled={!botId || !appUrl}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-pink-600 hover:bg-pink-500 rounded-xl transition-all font-medium shadow-lg shadow-pink-900/20"
                                    >
                                        <Icons.ExternalLink />
                                        <span>Open Full Page</span>
                                    </button>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/10">
                                    <p className="text-xs text-slate-400 mb-1">API Endpoint</p>
                                    <code className="block bg-black/30 p-2 rounded text-xs font-mono text-pink-300 break-all select-all">
                                        {appUrl}/api/chat/{botId}
                                    </code>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}