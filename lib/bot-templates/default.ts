export const generateBotHtml = (botId: string, appUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat with AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #111827; }
        
        /* Custom Scrollbar */
        #chat-window::-webkit-scrollbar { width: 6px; }
        #chat-window::-webkit-scrollbar-track { background: #1f2937; }
        #chat-window::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
        
        /* Message Bubbles */
        .msg-user {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border-bottom-right-radius: 0;
        }
        .msg-bot {
            background-color: #374151;
            color: #e5e7eb;
            border-bottom-left-radius: 0;
        }

        /* Link Preview Card Style */
        .link-card {
            display: flex;
            align-items: center;
            background: rgba(0,0,0,0.2);
            border: 1px solid #4b5563;
            border-radius: 8px;
            padding: 10px;
            margin-top: 8px;
            text-decoration: none;
            color: white;
            transition: background 0.2s;
        }
        .link-card:hover { background: rgba(0,0,0,0.4); }
        .link-icon {
            background: #1f2937;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            margin-right: 12px;
            flex-shrink: 0;
        }
        .link-info { overflow: hidden; }
        .link-title { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .link-domain { font-size: 0.75rem; color: #9ca3af; }

        /* Loader */
        .dot-flashing {
            position: relative;
            width: 6px; height: 6px;
            border-radius: 5px;
            background-color: #9ca3af;
            animation: dot-flashing 1s infinite linear alternate;
            animation-delay: 0.5s;
        }
        .dot-flashing::before, .dot-flashing::after {
            content: ''; display: inline-block; position: absolute; top: 0;
            width: 6px; height: 6px; border-radius: 5px; background-color: #9ca3af;
            animation: dot-flashing 1s infinite alternate;
        }
        .dot-flashing::before { left: -10px; animation-delay: 0s; }
        .dot-flashing::after { left: 10px; animation-delay: 1s; }
        @keyframes dot-flashing {
            0% { background-color: #9ca3af; }
            50%, 100% { background-color: #4b5563; }
        }
    </style>
</head>
<body class="flex items-center justify-center h-screen w-full">

    <div class="w-full h-full max-w-md bg-gray-900 flex flex-col shadow-2xl overflow-hidden relative sm:rounded-xl sm:h-[90vh]">
        
        <div class="bg-gray-800 p-4 border-b border-gray-700 flex items-center shadow-md z-10">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow">AI</div>
            <div class="ml-3">
                <h1 class="text-white font-semibold text-lg leading-tight">Digital Twin</h1>
                <p class="text-green-400 text-xs flex items-center"><span class="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Online</p>
            </div>
        </div>

        <div id="chat-window" class="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
            <div class="flex flex-col space-y-1 items-start">
                <div class="msg-bot px-4 py-3 rounded-2xl rounded-bl-none max-w-[85%] shadow-sm">
                    Hello! Ask me anything about my professional background.
                </div>
            </div>
        </div>

        <div class="absolute bottom-0 w-full bg-gray-800 p-3 border-t border-gray-700">
            <form id="chat-form" class="flex items-center gap-2 relative">
                <input 
                    type="text" 
                    id="message-input"
                    placeholder="Type a message..."
                    class="w-full bg-gray-700 text-white px-4 py-3 rounded-full border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 transition-all pr-12 shadow-inner"
                    autocomplete="off"
                >
                <button 
                    type="submit"
                    class="absolute right-2 bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:scale-105"
                >
                    <i class="fas fa-paper-plane text-sm ml-[-2px] mt-[1px]"></i>
                </button>
            </form>
        </div>
    </div>

    <script>
        const botId = "${botId}";
        const appUrl = "${appUrl}";
        const apiUrl = \`\${appUrl}/api/chat/\${botId}\`;

        const chatWindow = document.getElementById('chat-window');
        const chatForm = document.getElementById('chat-form');
        const messageInput = document.getElementById('message-input');
        let chatHistory = [];

        // --- LINK PARSER & CARD GENERATOR ---
        function parseLinks(text) {
            // Regex to find URLs
            const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
            const links = text.match(urlRegex) || [];
            
            // Text without links (optional: keep links in text or remove them)
            // Here we wrap links in <a> tags in the text AND create cards
            let formattedText = text.replace(urlRegex, (url) => {
                return \`<a href="\${url}" target="_blank" class="text-blue-400 hover:underline break-all">\${url}</a>\`;
            });

            let linkCards = '';
            links.forEach(url => {
                try {
                    const domain = new URL(url).hostname;
                    linkCards += \`
                        <a href="\${url}" target="_blank" class="link-card">
                            <div class="link-icon">
                                <i class="fas fa-link text-gray-400"></i>
                            </div>
                            <div class="link-info">
                                <div class="link-title">\${domain}</div>
                                <div class="link-domain">Tap to view link</div>
                            </div>
                        </a>
                    \`;
                } catch (e) {}
            });

            return { html: formattedText, cards: linkCards };
        }

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (!message) return;

            // User Message
            appendMessage(message, 'user');
            chatHistory.push({ role: 'user', parts: [{ text: message }] });
            messageInput.value = '';

            // Loading State
            const loadingId = appendLoading();

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        history: chatHistory,
                        newMessage: message 
                    })
                });

                removeLoading(loadingId);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Connection failed.");
                }

                const data = await response.json();
                const botResponse = data.response;

                // Bot Message (with Link Parsing)
                appendMessage(botResponse, 'bot');
                chatHistory.push({ role: 'model', parts: [{ text: botResponse }] });

            } catch (error) {
                removeLoading(loadingId);
                appendMessage(\`Error: \${error.message}\`, 'bot', true);
            }
        });

        function appendMessage(text, sender, isError = false) {
            const wrapper = document.createElement('div');
            wrapper.className = \`flex flex-col space-y-1 \${sender === 'user' ? 'items-end' : 'items-start'}\`;
            
            const bubble = document.createElement('div');
            
            let contentHtml = '';
            if (sender === 'bot' && !isError) {
                // Parse markdown-style links if needed, or simple raw URLs
                const parsed = parseLinks(text);
                contentHtml = parsed.html + parsed.cards;
            } else {
                contentHtml = text;
            }

            bubble.innerHTML = contentHtml;
            
            // Styles
            if (sender === 'user') {
                bubble.className = "msg-user px-4 py-3 rounded-2xl rounded-br-none max-w-[85%] shadow-sm text-sm break-words";
            } else if (isError) {
                bubble.className = "bg-red-900/50 text-red-200 px-4 py-3 rounded-2xl rounded-bl-none max-w-[85%] text-sm border border-red-700";
            } else {
                bubble.className = "msg-bot px-4 py-3 rounded-2xl rounded-bl-none max-w-[85%] shadow-sm text-sm break-words leading-relaxed";
            }

            wrapper.appendChild(bubble);
            chatWindow.appendChild(wrapper);
            scrollToBottom();
        }

        function appendLoading() {
            const id = 'loading-' + Date.now();
            const wrapper = document.createElement('div');
            wrapper.id = id;
            wrapper.className = "flex flex-col space-y-1 items-start";
            wrapper.innerHTML = \`
                <div class="msg-bot px-4 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center">
                    <div class="dot-flashing mx-2"></div>
                </div>
            \`;
            chatWindow.appendChild(wrapper);
            scrollToBottom();
            return id;
        }

        function removeLoading(id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        }

        function scrollToBottom() {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    </script>
</body>
</html>
`;