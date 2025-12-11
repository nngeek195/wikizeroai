Markdown

# WikizeroAI 🤖

WikizeroAI is a dynamic AI chatbot platform that allows users to create personalized AI assistants. Built with **Next.js**, **Firebase**, and **Google Gemini**, it generates unique, SEO-friendly chat pages for every user bot.

WikizeroAI web: https://wikizeroai.vercel.app
## 🚀 Features

-   **Dynamic AI Personas:** Users can configure bots with specific tones, skills, and knowledge bases.
-   **Powered by Gemini 1.5 Flash:** Fast and cost-effective AI responses using Google's latest models.
-   **SEO Optimized:** Every bot gets a unique URL (`/chat/[botId]`) with dynamic Open Graph tags and metadata.
-   **Auto-Generated Sitemaps:** Automatically submits new bots to Google Search Console via `sitemap.ts`.
-   **Real-time Chat Interface:** Clean, responsive UI built with Tailwind CSS.
-   **Firebase Backend:** Stores user profiles, bot configurations, and chat logs.

## 🛠️ Tech Stack

-   **Framework:** Next.js 15 (App Router)
-   **Language:** TypeScript
-   **AI Model:** Google Gemini API (`gemini-2.5-flash`)
-   **Database:** Firebase Admin SDK / Firestore
-   **Styling:** Tailwind CSS
-   **Deployment:** Vercel

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/nngeek195/wikizeroai.git]
cd wikizeroai
```
2. Install dependencies
```bash

npm install
# or
yarn install
```
3. Configure Environment Variables
Create a .env.local file in the root directory and add your Firebase and Gemini credentials:
```bash
# Google Gemini AI
GOOGLE_API_KEY=your_gemini_api_key

# Firebase Admin SDK (Service Account)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Public URL (For SEO/Sitemaps)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
4. Run the development server
```bash

npm run dev
```
Open http://localhost:3000 with your browser to see the result.

📂 Project Structure
```bash

├── app/
│   ├── api/chat/[botId]/    # API Route (The "Brain" handling Gemini logic)
│   ├── chat/[botId]/        # UI Page (The "Face" handling SEO & visuals)
│   ├── sitemap.ts           # Auto-generates XML sitemap for Google
│   └── robots.ts            # Robots.txt configuration
├── lib/
│   └── firebase-admin.ts    # Firebase Admin initialization
└── public/

```
🔍 SEO & Indexing
This project uses a split architecture to ensure bots are indexed by search engines:

Server Components (page.tsx): Fetch bot data server-side to generate <title> and <meta> descriptions.

Sitemap (sitemap.ts): Dynamically reads from Firebase to list all active bots at /sitemap.xml.

🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

```bash
### Next Step
Would you like me to generate a `LICENSE` file text (like MIT) to go with this, so your project is
```
