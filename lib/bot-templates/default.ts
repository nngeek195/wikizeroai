// This function generates the HTML for the bot, injecting the specific botId and appUrl
export const generateBotHtml = (botId: string, appUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WikiZero AI - Test Bot</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        #chat-window::-webkit-scrollbar { width: 4px; }
        #chat-window::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 4px; }
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-800 text-white flex items-center justify-center min-h-screen">
    <div class="w-full max-w-lg bg-gray-800 rounded-lg shadow-xl p-6">
        <h1 class="text-2xl font-bold text-center mb-4">Chat with your AI</h1>
        <div id="chat-window" class="h-96 w-full bg-gray-700 rounded-lg p-4 overflow-y-auto flex flex-col space-y-3">
            <div class="p-3 bg-blue-600 text-white rounded-lg self-start max-w-xs">
                Hello! Send me a message to test the connection.
            </div>
        </div>
        <form id="chat-form" class="mt-4 flex">
            <input 
                type="text" 
                id="message-input"
                placeholder="Type your message..."
                class="flex-1 p-3 bg-gray-600 text-white border border-gray-500 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autocomplete="off"
            >
            <button 
                type="submit"
                class="px-5 py-3 bg-blue-600 text-white font-semibold rounded-r-lg hover:bg-blue-700"
            >
                Send
            </button>
        </form>
    </div>
    <script>
        // --- CONFIGURATION ---
        const botId = "${botId}";
        const appUrl = "${appUrl}";
        const apiUrl = \`\${appUrl}/api/chat/\${botId}\`;

        // --- JAVASCRIPT LOGIC ---
        const chatWindow = document.getElementById('chat-window');
        const chatForm = document.getElementById('chat-form');
        const messageInput = document.getElementById('message-input');
        let chatHistory = [];

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (!message) return;
            appendMessage(message, 'user');
            chatHistory.push({ role: 'user', parts: [{ text: message }] });
            messageInput.value = '';
            appendMessage("Bot is typing...", 'bot', 'loading-indicator');

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        history: chatHistory,
                        newMessage: message 
                    })
                });
                document.getElementById('loading-indicator')?.remove();
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "An error occurred.");
                }
                const data = await response.json();
                const botResponse = data.response;
                appendMessage(botResponse, 'bot');
                chatHistory.push({ role: 'model', parts: [{ text: botResponse }] });
            } catch (error) {
                document.getElementById('loading-indicator')?.remove();
                appendMessage(\`Error: \${error.message}\`, 'bot');
                console.error("Chat Error:", error);
            }
        });

        function appendMessage(text, sender, id = null) {
            const messageEl = document.createElement('div');
            messageEl.textContent = text;
            messageEl.className = "p-3 rounded-lg max-w-xs break-words";
            if (id) { messageEl.id = id; }
            if (sender === 'user') {
                messageEl.classList.add('bg-blue-600', 'text-white', 'self-end');
            } else {
                messageEl.classList.add('bg-gray-600', 'text-white', 'self-start');
                if (id === 'loading-indicator') { messageEl.classList.add('italic'); }
            }
            chatWindow.appendChild(messageEl);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    </script>
</body>
</html>
`;