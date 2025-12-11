'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { PaperAirplaneIcon, LinkIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';

// Define the types for our data
type Message = {
    role: 'user' | 'bot';
    text: string;
    isError?: boolean;
};

type Props = {
    botId: string;
    botName: string;
    botImage?: string; // Optional because some users might not have a photo
    initialMessage: string;
};

export default function ChatClient({ botId, botName, botImage, initialMessage }: Props) {
    // 1. STATE: Manage messages, input text, and loading status
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: initialMessage }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // History specifically for the API (Google Gemini needs context)
    const [history, setHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);

    // Reference for auto-scrolling
    const scrollRef = useRef<HTMLDivElement>(null);

    // 2. EFFECT: Auto-scroll to the bottom whenever messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // 3. HELPER: Find URLs in text to create "Link Cards"
    const parseContent = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const links = text.match(urlRegex) || [];
        return { text, links };
    };

    // 4. HANDLER: Send message to API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');

        // Add User Message immediately for UI responsiveness
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        const newHistory = [...history, { role: 'user', parts: [{ text: userMsg }] }];
        setHistory(newHistory);
        setIsLoading(true);

        try {
            // Call your API route
            const res = await fetch(`/api/chat/${botId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: newHistory,
                    newMessage: userMsg
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to fetch response");
            }

            const data = await res.json();
            const botResponse = data.response;

            // Add Bot Response
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: botResponse }] }]);

        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'bot', text: `Error: ${error.message}`, isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-0 sm:p-4">

            <div className="w-full h-[100vh] sm:h-[90vh] max-w-lg bg-gray-800 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-gray-700">

                {/* --- HEADER --- */}
                <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center shadow-md z-10">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-green-500 shadow-lg flex-shrink-0">
                        {botImage ? (
                            <Image src={botImage} alt={botName} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center font-bold text-white">AI</div>
                        )}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <h1 className="text-white font-semibold text-lg leading-tight truncate">{botName}</h1>
                        <p className="text-green-400 text-xs flex items-center font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                            Online Assistant
                        </p>
                    </div>
                </div>

                {/* --- CHAT WINDOW --- */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 scroll-smooth">
                    {messages.map((msg, idx) => {
                        const { text, links } = parseContent(msg.text);
                        const isBot = msg.role === 'bot';

                        return (
                            <div key={idx} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300`}>

                                {/* Message Bubble */}
                                <div className={`
                  px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm break-words
                  ${isBot
                                        ? msg.isError
                                            ? 'bg-red-900/20 text-red-200 border border-red-800 rounded-bl-none'
                                            : 'bg-gray-700 text-gray-100 rounded-bl-none'
                                        : 'bg-blue-600 text-white rounded-br-none'
                                    }
                `}>
                                    {/* Markdown Renderer for clean text */}
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                a: ({ node, ...props }) => <a {...props} className="text-blue-300 hover:underline break-all" target="_blank" rel="noopener noreferrer" />
                                            }}
                                        >
                                            {text}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {/* --- LINK CARDS (Visual Preview for Bot Links) --- */}
                                {isBot && links.length > 0 && (
                                    <div className="flex flex-col space-y-2 w-[85%] mt-1">
                                        {links.map((link, i) => {
                                            let domain = "Link";
                                            try { domain = new URL(link).hostname; } catch (e) { }

                                            return (
                                                <a
                                                    key={i}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 transition-all hover:scale-[1.02] group no-underline"
                                                >
                                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors flex-shrink-0">
                                                        <LinkIcon className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <div className="overflow-hidden min-w-0">
                                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Link Preview</p>
                                                        <p className="text-sm font-semibold text-blue-300 truncate">{domain}</p>
                                                    </div>
                                                </a>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Loading Indicator Dots */}
                    {isLoading && (
                        <div className="flex flex-col space-y-1 items-start animate-pulse">
                            <div className="bg-gray-700 px-4 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- INPUT AREA --- */}
                <div className="absolute bottom-0 w-full bg-gray-800/95 backdrop-blur-md p-3 border-t border-gray-700">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 relative max-w-full">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-gray-900 text-white px-5 py-3.5 rounded-full border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 transition-all pr-12 shadow-inner text-sm sm:text-base"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95"
                        >
                            <PaperAirplaneIcon className="w-5 h-5 ml-[-2px] mt-[1px]" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}