"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import dynamic from "next/dynamic";

// Dynamically import the player
const DotLottiePlayer = dynamic(
  () => import("@dotlottie/react-player").then((mod) => mod.DotLottiePlayer),
  { ssr: false }
);

export default function LoginPage() {
  const router = useRouter();

  // State to track which animation is playing
  const [currentLottieIndex, setCurrentLottieIndex] = useState(0);

  // State to handle the smooth transition effect
  // true = currently hiding old animation/showing glow
  // false = showing the animation normally
  const [isTransitioning, setIsTransitioning] = useState(false);

  const lottieAnimations = [
    "https://lottie.host/c9877449-9190-4014-a050-714f5beace23/562NsD23n9.lottie",
    "https://lottie.host/b555dc61-86f1-4905-ad59-1c1ac99ca3f5/9p1xeRkdZG.lottie",
    "https://lottie.host/4b86a763-dcbc-4fa9-a567-2de31ad59f13/7XMgwlJf0l.lottie"
  ];

  // 1. Handle the "Complete" event
  const handleAnimationComplete = () => {
    // Start the transition (Fade out / Glow up)
    setIsTransitioning(true);

    // Wait 600ms (matches CSS duration), then swap the source
    setTimeout(() => {
      setCurrentLottieIndex((prev) => (prev + 1) % lottieAnimations.length);

      // Wait a tiny bit more to let the new player load, then Fade In
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 600);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          profile: {
            bio: "I'm new to WikiZero! Please update my bio.",
            skills: "Edit my skills in the dashboard.",
            linkedin: "",
            github: "",
          },
          config: {
            botId: `bot-${user.uid.substring(0, 8)}`,
            geminiApiKey: null,
          },
        });
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Error during Google sign-in: ", error);
    }
  };

  return (
    <>
      <style jsx global>{`
        /* 1. The Global Background (Applied to both sides now) */
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient {
          background: linear-gradient(-45deg, #fff0f5, #e6f7ff, #f0f4ff, #fff);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }

        /* 2. Logo Float */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .float-animation { animation: float 6s ease-in-out infinite; }

        /* 3. Transition Classes for the Lottie Player */
        .lottie-container {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 1;
          transform: scale(1);
          filter: blur(0px);
        }
        
        /* When transitioning: fade out, shrink slightly, and blur */
        .lottie-hidden {
          opacity: 0;
          transform: scale(0.9);
          filter: blur(10px);
        }

        /* 4. The Magic Glow Behind the Animation */
        .magic-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255,0,128,0.2) 0%, rgba(0,212,255,0.2) 50%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          transition: all 0.6s ease;
          opacity: 0;
          transform: scale(0.5);
          z-index: 0; 
        }

        /* When transitioning: The glow explodes outward */
        .glow-active {
          opacity: 1;
          transform: scale(1.5);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .magic-glow {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>

      <main className="flex min-h-screen animated-gradient relative overflow-hidden">

        {/* LEFT: Branding + Auth */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-20">
          <div className="relative z-10 text-center w-full max-w-md">
            {/* Logo Container with Lightning - Made responsive */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 mx-auto mb-6 rounded-full shadow-2xl flex items-center justify-center float-animation bg-white/80 backdrop-blur-sm border border-white/50 overflow-hidden">

              {/* 1. Lightning Animation (Background Layer) */}
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-90 pointer-events-none">
                <DotLottiePlayer
                  src="https://lottie.host/e524613e-2636-4596-bad9-4bb6ef7ac511/T7EHHzxbmG.lottie"
                  autoplay
                  loop
                  style={{ width: '100%', height: '100%', transform: 'scale(1.2)' }}
                />
              </div>

              {/* 2. The Logo Image (Foreground Layer) - Made responsive */}
              <div className="relative z-10">
                <Image
                  src="/logo.png"
                  alt="WikiZero-AI Logo"
                  width={200}
                  height={200}
                  className="rounded-full object-cover w-3/4 h-3/4"
                />
              </div>

            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Create your personal AI chatbot.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium mb-6 sm:mb-8 md:mb-10">
              {/* You can add a subtitle here if needed */}
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center mx-auto w-full px-4 sm:px-6 py-3 font-medium text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-300 transform hover:scale-105"
              aria-label="Sign in with Google"
            >
              {/* Official Google Colors SVG */}
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>

        {/* RIGHT: Sequential Lottie Animations with Magic Transition - Made responsive */}
        <aside className="hidden lg:flex w-1/2 h-screen items-center justify-center relative">

          {/* This div acts as the center point for our animations - Made responsive */}
          <div className="w-80 h-80 md:w-96 md:h-96 xl:w-[500px] xl:h-[500px] relative flex items-center justify-center">

            {/* The Magic Glow Blob (Behind everything) */}
            <div className={`magic-glow ${isTransitioning ? 'glow-active' : ''}`} />

            {/* The Lottie Player Container */}
            <div className={`w-full h-full relative z-10 lottie-container ${isTransitioning ? 'lottie-hidden' : ''}`}>
              <DotLottiePlayer
                key={currentLottieIndex} // Forces re-render on change
                src={lottieAnimations[currentLottieIndex]}
                autoplay
                loop={false}
                onEvent={(event) => {
                  if (event === 'complete') {
                    handleAnimationComplete();
                  }
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>

        </aside>

        {/* FOOTER - Made responsive */}
        <footer className="absolute bottom-4 left-0 right-0 flex justify-center z-20 px-4">
          <div className="text-center">
            <a href="https://www.linkedin.com/in/niranga-nayanajith" className="text-xs sm:text-sm text-gray-700" target="_blank" rel="noopener noreferrer">
              Powered by WikiZero - Niranga Nayanajith.
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}