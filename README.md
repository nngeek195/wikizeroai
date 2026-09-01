# WikizeroAI 🤖

WikizeroAI is a dynamic AI chatbot and digital twin platform that allows users to create personalized, interactive AI assistants. Built with **Next.js 16**, **Firebase (Auth & Firestore)**, and **Google Gemini AI**, it generates custom, SEO-optimized chat pages and embeddable widgets for every bot.

🌐 **Live Demo:** [https://wikizeroai.vercel.app](https://wikizeroai.vercel.app)

---

## 🚀 Key Features

- **Dynamic AI Personas:** Configure bot personality, tone of voice, professional biography, skillsets, and domain expertise.
- **BYOK (Bring Your Own Key) Architecture:** Users supply their own Google Gemini API key (`gemini-2.5-flash`), keeping inference decentralized and cost-effective.
- **Fast Key Pre-flight Validation:** Verifies user API keys via zero-inference token counting (`model.countTokens("test")`) prior to storage.
- **Embeddable Standalone Widget:** Generates portable, single-file HTML/JS widgets for sandboxed iframe previews or third-party web integration.
- **Dynamic SEO & Social Share Cards:** Automated server-side generation of Open Graph tags, Twitter Cards, and dynamic XML sitemaps.
- **Rich Markdown & Link Cards:** AI responses render formatted Markdown with automatic URL extraction into interactive preview cards.
- **Secure Multi-Tenant Isolation:** Cryptographic Firebase ID token verification preventing Insecure Direct Object References (IDOR).

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language & Runtime** | [TypeScript 5](https://www.typescriptlang.org/) / Node.js 20+ / React 19 |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS |
| **Database & Auth** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) & [Firebase Auth](https://firebase.google.com/docs/auth) (Admin & Client SDKs) |
| **AI / LLM Engine** | [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (`gemini-2.5-flash`) |
| **Animations & Icons** | [@dotlottie/react-player](https://dotlottie.io/), [@heroicons/react](https://heroicons.com/) |
| **Hosting & Deployment** | [Vercel](https://vercel.com/) |

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/nngeek195/wikizeroai.git
cd wikizeroai
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Google Gemini AI (Optional fallback / development)
GOOGLE_API_KEY=your_gemini_api_key

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Service Account)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Public URL Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
wikizeroai/
├── app/
│   ├── api/
│   │   ├── chat/[botId]/route.ts     # LLM orchestration gateway with Gemini API
│   │   └── user/
│   │       ├── init/route.ts         # User record auto-provisioning & seeding
│   │       ├── saveKey/route.ts      # Gemini API key validation & storage
│   │       └── saveProfile/route.ts  # Persona configuration update handler
│   ├── chat/[botId]/
│   │   ├── page.tsx                  # Server component for dynamic SEO & SSR bot lookup
│   │   └── ChatClient.tsx            # Client component for real-time chat UI & link parsing
│   ├── dashboard/
│   │   └── page.tsx                  # Admin portal (persona editor, API key settings, preview)
│   ├── globals.css                   # Tailwind CSS v4 root stylesheet
│   ├── layout.tsx                    # Root layout with font imports & default meta tags
│   ├── page.tsx                      # Landing & authentication page with Lottie transitions
│   ├── robots.ts                     # Dynamic robots.txt configuration
│   └── sitemap.ts                    # Incremental static regeneration (ISR) sitemap generator
├── lib/
│   ├── bot-templates/
│   │   └── default.ts                # Standalone HTML/JS chat widget factory
│   ├── firebase.ts                   # Client-side Firebase SDK initialization (Auth & Firestore)
│   └── firebase-admin.ts             # Server-side Firebase Admin SDK singleton
├── next.config.ts                    # Next.js configuration (remote image patterns, COOP headers)
├── package.json                      # Project dependencies and build scripts
└── tsconfig.json                     # TypeScript compiler configuration
```

---

# 📑 In-Depth Technical Dossier (SWE Interview Guide)

---

### 1. Executive Summary & Architecture
* **Core Functionality:**
  WikizeroAI is a multi-tenant AI assistant SaaS platform. Users build customized digital twins by configuring their personal biography, core competencies, tone of voice, professional stances, and external links. Recruiter and visitor inquiries are processed through a dedicated public chat interface (`/chat/[botId]`), an embeddable standalone widget (`generateBotHtml`), or a CORS-enabled REST endpoint (`/api/chat/[botId]`). The system operates on a Bring-Your-Own-Key (BYOK) model using Google Gemini (`gemini-2.5-flash`), eliminating platform inference costs.

* **Architecture Pattern:**
  * **Next.js App Router (BFF Architecture):** React Server Components (RSC) handle SSR and dynamic metadata injection; Route Handlers serve as a secure API Gateway between client interfaces, Firebase Admin, and Google Generative AI.
  * **Dual-SDK Partitioning:** Strict physical boundary between the unprivileged Client SDK (`lib/firebase.ts`) and privileged Admin SDK (`lib/firebase-admin.ts`).
  * **BYOK Multi-Tenant Isolation:** Tenants maintain isolated configuration state keyed by Firebase Auth `uid` and public vanity slug `botId`.
  * **Headless / Portable Widget Factory:** Decoupled HTML/JS generator allowing the chat runtime to execute independently inside sandboxed iframes or external websites.

```
+----------------------------------------------------------------------------------------------------+
|                                          CLIENT TIER                                               |
|  +------------------------+   +------------------------------+   +------------------------------+  |
|  |  Login / Landing Page  |   |     Dashboard (Admin UI)     |   |   Public Chat & Bot Widget   |  |
|  |     (app/page.tsx)     |   |   (app/dashboard/page.tsx)   |   |   (app/chat/[botId]/page.tsx)|  |
|  +-----------+------------+   +--------------+---------------+   +--------------+---------------+  |
+--------------|-------------------------------|----------------------------------|------------------+
               |                               |                                  |
               | OAuth (Popup)                 | Bearer JWT                       | REST / CORS POST
               v                               v                                  v
+----------------------------------------------------------------------------------------------------+
|                                    NEXT.JS ROUTE HANDLERS (API LAYER)                              |
|  +------------------------+   +------------------------------+   +------------------------------+  |
|  |   POST /api/user/init  |   |    POST /api/user/saveKey    |   |    POST /api/chat/[botId]    |  |
|  |  - Verify Firebase JWT |   |   - Verify Firebase JWT      |   |   - Query user by botId      |  |
|  |  - Seed default doc    |   |   - Validate Key (Gemini SDK)|   |   - Interpolate Persona      |  |
|  +-----------+------------+   +--------------+---------------+   +--------------+---------------+  |
+--------------|-------------------------------|----------------------------------|------------------+
               |                               |                                  |
               | Firebase Admin SDK            | Firebase Admin SDK               | Gemini API Call
               v                               v                                  v
+-------------------------------------------------------------+    +---------------------------------+
|               GOOGLE FIRESTORE (NoSQL DB)                  |    |      GOOGLE GEMINI API          |
|  - Users Collection (doc: uid)                              |    |   - gemini-2.5-flash            |
|  - Sub-documents: profile, geminiApiKey, botId              |    |   - System Instruction Prompt   |
+-------------------------------------------------------------+    +---------------------------------+
```

* **Component Breakdown:**
  1. **Auth & Identity Module (`lib/firebase.ts`, `app/page.tsx`):** Handles Google OAuth 2.0 popup flows, listens for auth state changes via `onAuthStateChanged`, and manages client JWT tokens.
  2. **Admin Gateway & Privilege Verification (`lib/firebase-admin.ts`, `app/api/user/*`):** Performs server-side cryptographic token verification (`adminAuth.verifyIdToken`) and privileged Firestore document mutations.
  3. **LLM Orchestration Route (`app/api/chat/[botId]/route.ts`):** Resolves bot slugs to tenant records, dynamically interpolates system instructions, manages multi-turn history, and executes inference via `@google/generative-ai`.
  4. **Chat Presentation Engine (`app/chat/[botId]/ChatClient.tsx`):** Renders Markdown text, extracts URLs to generate interactive link preview cards, auto-scrolls the conversation, and manages local chat history.
  5. **SEO & Discovery Engine (`app/sitemap.ts`, `app/robots.ts`):** Employs Incremental Static Regeneration (`revalidate = 3600`) to dynamically generate sitemaps from Firestore records.

---

### 2. Deep-Dive Tech Stack & Dependencies
* **Core Languages & Runtimes:**
  * **TypeScript 5.x:** Targeted to `ES2017` with `esnext` module resolution and strict type checking enabled.
  * **Node.js 20+ Runtime:** Optimized for Vercel Serverless Function deployment.
  * **React 19 (`^19.2.1`):** Uses modern React hooks (`useState`, `useEffect`, `useRef`) and dynamic module imports.
* **Frameworks & Core Libraries:**
  * **Next.js 16.0.10:** Full App Router implementation, React Server Components, Route Handlers, and Metadata Route Handlers.
  * **Tailwind CSS v4 (`^4.0.0`):** Modern atomic CSS utilizing `@import "tailwindcss"` and PostCSS processing.
  * **Firebase Client SDK (`^12.5.0`):** Client-side authentication and Firestore reading.
  * **Firebase Admin SDK (`^13.6.0`):** Server-side verification and database mutations.
  * **`@google/generative-ai` (`^0.24.1`):** Official Gemini SDK for conversational inference and zero-generation token validation.
  * **`@dotlottie/react-player` (`^1.6.19`):** Dynamic Lottie vector animation playback.
  * **`react-markdown` (`^10.1.0`):** Markdown parsing for AI responses with link sanitization.
* **External APIs & Integrations:**
  * **Google Gemini API (`gemini-2.5-flash`):** Conversational AI inference and token count pre-flight verification.
  * **Google Identity via Firebase Auth:** OAuth 2.0 identity provider with `GoogleAuthProvider`.
  * **Google Cloud Firestore:** NoSQL persistence for profiles, bot configurations, and BYOK credentials.
  * **Google User Content CDN (`lh3.googleusercontent.com`):** Configured in `next.config.ts` for profile picture optimization.

---

### 3. Object-Oriented Programming (OOP) & Design Patterns
* **OOP Principles in Practice:**
  * **Encapsulation:**
    * *Credential Isolation:* Sensitive Firebase Admin Service Account credentials (`FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`) are encapsulated in `lib/firebase-admin.ts` and restricted to server routes.
    * *Component State Boundaries:* Chat state (`messages`, `input`, `isLoading`, `history`) is fully encapsulated within `ChatClient.tsx` and modified only through explicit handler methods.
  * **Inheritance & Polymorphism:**
    * *Interface Conformance:* Route structures implement Next.js framework interfaces (`MetadataRoute.Robots`, `MetadataRoute.Sitemap`).
    * *Polymorphic UI Discrimination:* `ChatClient.tsx` inspects message properties (`role: 'user' | 'bot'`, `isError?: boolean`) to dynamically switch bubble styles, Markdown renderers, and link card previews.
  * **Abstraction:**
    * *LLM Pipeline Decoupling:* Complex Gemini lifecycle operations (`GoogleGenerativeAI -> getGenerativeModel -> startChat -> sendMessage`) are abstracted away behind a unified REST POST endpoint (`/api/chat/[botId]`).
* **Design Patterns Used:**
  * **Singleton Pattern:** Guards against redundant SDK instantiation across serverless function re-invocations in `lib/firebase-admin.ts` (`!admin.apps.length`) and `lib/firebase.ts` (`!getApps().length`).
  * **Factory Pattern:** `generateBotHtml(botId, appUrl)` in `lib/bot-templates/default.ts` serves as a parametric artifact factory, stamping out standalone single-file chat clients.
  * **BFF (Backend for Frontend) Gateway:** Route handlers aggregate requests, validate JWT tokens, execute business rules, and interface with downstream databases and external AI services.
  * **Observer Pattern:** Implemented via Firebase Auth's `onAuthStateChanged` in `app/page.tsx` and `app/dashboard/page.tsx` for reactive login transitions and session initialization.
  * **Adapter Pattern:** Transforms application message formats (`{ role, text }`) into the Gemini multi-turn message schema (`{ role: 'user' | 'model', parts: [{ text }] }`).
  * **Flyweight / Inline Icon Dictionary:** The `Icons` dictionary in `app/dashboard/page.tsx` provides zero-overhead reusable SVG elements.

---

### 4. Data Layer, Security & Tenant Isolation
* **Database & Storage:**
  * **Database:** Google Cloud Firestore (Document NoSQL).
  * **Schema Design (Collection: `users`):**
    ```typescript
    interface UserDocument {
      uid: string;                 // Primary ID (Firebase Auth UID)
      email: string;               // User email
      displayName: string;         // User full name
      photoURL: string;            // Avatar image URL
      botId: string;               // Unique vanity identifier (e.g., bot-a1b2c3d4)
      geminiApiKey: string;        // Stored BYOK Gemini API key
      profile: {
        bio: string;               // Biography & background summary
        skills: string;            // Skills list
        linkedin: string;          // LinkedIn profile URL
        github: string;            // GitHub repository URL
        facebook: string;          // Facebook URL
        cvLink: string;            // CV / Resume download URL
        whatsapp: string;          // WhatsApp contact info
        twitter: string;           // Twitter / X handle
        aiTone: string;            // AI tone customization
        aiExpertise: string;       // Primary expertise domain
        aiOpinions: string;        // Stances/opinions injected into prompt
      };
    }
    ```
  * **Query Patterns:**
    * Document fetch by UID (`O(1)`): `adminDb.collection('users').doc(uid).get()` for dashboard profile loading.
    * Indexed query by slug (`O(log N)`): `adminDb.collection('users').where("botId", "==", botId).get()` in public chat routes.
    * Full collection scan: `adminDb.collection("users").get()` during periodic sitemap generation.

* **Security & Auth:**
  * **OAuth 2.0 & Token Verification:**
    1. Client triggers popup authentication via `signInWithPopup(auth, googleProvider)`.
    2. Client retrieves a short-lived ID token via `currentUser.getIdToken()`.
    3. Protected routes (`/api/user/*`) extract the `Authorization: Bearer <token>` header and invoke `adminAuth.verifyIdToken(token)` to cryptographically validate signatures, issuer, and expiration.
  * **Tenant Isolation & IDOR Prevention:**
    * Document mutation routes (`/api/user/saveKey`, `/api/user/saveProfile`) derive target document references strictly from the cryptographically verified `decodedToken.uid`, never from client payload parameters.
  * **CORS & COOP Policies:**
    * `/api/chat/[botId]` configures permissive CORS headers (`Access-Control-Allow-Origin: *`) to enable third-party web embeds.
    * `next.config.ts` sets `Cross-Origin-Opener-Policy: same-origin-allow-popups` to support Google OAuth popup post-message channels.
  * **Security Discussion Points & Hardening Areas:**
    * *API Key Encryption:* BYOK Gemini API keys are currently stored in plaintext. In production environments, keys should be protected using envelope encryption (e.g., AES-256-GCM with AWS KMS / GCP KMS).
    * *Public Endpoint Rate Limiting:* `/api/chat/[botId]` has no token-bucket rate limiting (e.g., Upstash Redis), leaving tenant quotas vulnerable to automated scraping.

* **Complete Request Lifecycle (Chat Execution Walkthrough):**
  ```
  1. USER INPUT:
     User submits prompt in ChatClient.tsx or standalone embed widget.
     
  2. HTTP INGRESS:
     POST /api/chat/bot-12345678
     Headers: { Content-Type: application/json }
     Body: { history: [...], newMessage: "What are your core technical skills?" }

  3. ROUTE HANDLER (app/api/chat/[botId]/route.ts):
     - Extracts botId = "bot-12345678" from path segments.
     - Queries Firestore: adminDb.collection("users").where("botId", "==", "bot-12345678").get().
     - Extracts userData.profile and userData.geminiApiKey.

  4. PROMPT COMPILATION:
     Dynamically interpolates Identity, Tone, Bio, Skills, CV links, Opinions,
     and strict boundary rules (Third-person reference, concise output).

  5. GEMINI API INVOCATION:
     - Instantiates genAI = new GoogleGenerativeAI(geminiApiKey).
     - Initializes model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction }).
     - Starts chat = model.startChat({ history }).
     - Executes result = await chat.sendMessage(newMessage).

  6. EGRESS & RENDER:
     - Returns NextResponse.json({ response: responseText }, { headers: CORS }).
     - ChatClient.tsx updates conversation state and renders Markdown + Link Cards.
  ```

---

### 5. Concurrency, Performance & Memory Management
* **Resource Optimization:**
  * **Zero-Inference Token Counting:** `app/api/user/saveKey/route.ts` calls `model.countTokens("test")` to validate API key authenticity and quota availability with negligible latency and zero generation cost.
  * **Dynamic Client-Side Code Splitting:** `@dotlottie/react-player` is loaded dynamically with `{ ssr: false }` in `app/page.tsx`, reducing initial server bundle size and eliminating SSR canvas hydration issues.
  * **ISR Edge Caching:** `app/sitemap.ts` specifies `export const revalidate = 3600`, caching generated sitemaps on edge CDNs for 1 hour to prevent redundant Firestore collection scans.
  * **Iframe Execution Sandboxing:** Dashboard previews run inside `<iframe sandbox="allow-scripts allow-same-origin allow-forms" />`, preventing untrusted widget code from interfering with dashboard state.
* **Concurrency Model:**
  * **Serverless Elasticity:** Next.js Route Handlers run on stateless serverless workers, scaling horizontally to meet concurrent traffic spikes.
  * **Non-blocking Event Loop I/O:** Database lookups, token verifications, and external LLM calls use standard asynchronous `async/await` patterns.
  * **Stateless Memory Model:** The server stores no conversational memory in RAM; multi-turn history is transmitted in each client request and reconstructed on the fly.

---

### 6. Edge Cases, Error Handling & Trade-Offs
* **Resilience & Fault Tolerance:**
  * **Structured LLM Error Interception:** `app/api/chat/[botId]/route.ts` catches raw Google API exceptions and translates them into user-friendly error codes:
    * Quota exhaustion $\rightarrow$ `"This bot has exceeded its API quota."`
    * Invalid credentials $\rightarrow$ `"The bot's API key is invalid."`
    * Model not found $\rightarrow$ `"Model not found. Please check API settings."`
  * **Missing Document Auto-Healing:** `app/page.tsx` and `app/dashboard/page.tsx` catch missing Firestore documents on login and trigger `/api/user/init` to provision default profile records.
  * **Sitemap Fallback Degradation:** If Firestore collection queries fail in `app/sitemap.ts`, the handler catches the error and returns static root routes to avoid returning HTTP 500 to search crawlers.
  * **URL Parsing Safeguards:** Link extraction in `ChatClient.tsx` and `default.ts` uses `try { new URL(link) } catch (e) {}` to prevent malformed URLs from disrupting UI rendering.
* **Technical Trade-Offs & Codebase Notes:**
  1. **Stateless Client History vs. Server Persistence:** Chat history is maintained exclusively on the client. This eliminates server database storage overhead but results in $O(N)$ request payload growth and prevents bot owners from reviewing past conversation analytics.
  2. **Buffered Non-Streaming vs. SSE Streaming:** Responses are returned as complete JSON payloads via `chat.sendMessage` rather than streamed via Server-Sent Events (SSE). This simplifies error handling and CORS embeds but increases Time to First Token (TTFT).
  3. **Robots.txt vs. Sitemap Configuration Note:** `app/robots.ts` disallows `/chat/`, whereas `app/sitemap.ts` lists `/chat/[botId]` for search indexing. In production, `robots.ts` should be updated to permit public bot paths.

---

## 🔍 SEO & Indexing Architecture

- **Server Components (`app/chat/[botId]/page.tsx`):** Fetches bot data on the server during request time to inject dynamic `<title>`, `<meta name="description">`, Open Graph, and Twitter Card tags.
- **Dynamic Sitemap (`app/sitemap.ts`):** Automatically aggregates active bots from Firebase Firestore to serve `/sitemap.xml` with 1-hour ISR edge caching.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
