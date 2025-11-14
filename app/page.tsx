"use client"; // This is required for using hooks like useRouter

import { useRouter } from "next/navigation";
import { auth, googleProvider, db } from "@/lib/firebase"; // Import from our lib file
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      // 1. Trigger the Google sign-in popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Check if this user already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // 3. If they are a NEW user, create their profile
      if (!userDoc.exists()) {
        console.log("New user, creating profile...");
        await setDoc(userDocRef, {
          // Auth data
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,

          // Our app's data (the "persona")
          profile: {
            bio: "I'm new to WikiZero! Please update my bio.",
            skills: "Edit my skills in the dashboard.",
            linkedin: "",
            github: "",
          },

          // Bot configuration
          config: {
            botId: `bot-${user.uid.substring(0, 8)}`, // A simple, unique, public ID
            geminiApiKey: null, // User will add this later
          },
        });
      }

      // 4. Redirect to the dashboard (we'll create this page next)
      router.push("/dashboard");

    } catch (error) {
      console.error("Error during Google sign-in: ", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      {/* Your Logo Here */}
      <h1 className="text-4xl font-bold mb-4">Welcome to WikiZero AI</h1>
      <p className="text-lg mb-8">Create your personal AI twin.</p>

      <button
        onClick={handleGoogleSignIn}
        className="flex items-center px-6 py-3 font-semibold text-gray-900 bg-white rounded-lg shadow-md hover:bg-gray-200 transition-colors"
      >
        {/* You can add a Google Icon SVG here */}
        Sign in with Google
      </button>
    </div>
  );
}