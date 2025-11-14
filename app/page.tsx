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
    <>
      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animated-gradient {
          background: linear-gradient(-45deg, #ffffff, #fce7f3, #dbeafe, #ffffff);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <main className="flex flex-col items-center justify-center min-h-screen animated-gradient text-gray-800 px-4">
        {/* Logo and Branding Section */}
        <div className="text-center mb-8">
          {/* Logo Container */}
          <div className="w-60 h-60 mx-auto mb-6 bg-gradient-to-br from-pink-300 to-blue-400 rounded-full shadow-xl flex items-center justify-center float-animation">
            <img
              src="/logo.png"
              alt="WikiZero-AI Logo"
              className="w-48 h-48 rounded-full object-cover"
            />
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            WikiZero-AI
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Create your personal AI chatbot.
          </p>
        </div>

        {/* Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full max-w-xs px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#FFFFFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FFFFFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#FFFFFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        {/* Optional Footer Tagline */}
        <p className="absolute bottom-4 text-sm text-gray-400">
          Powered by WikiZero - Niranga Nayanajith.
        </p>
      </main>
    </>
  );
}