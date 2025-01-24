import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, LineChart, Wallet } from 'lucide-react';

const FeatherChat = () => {
  const { theme } = useTheme();
  const [manifesto, setManifesto] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeView, setActiveView] = useState('chat');

  const handleMessage = async (message) => {
    const response = await fetch('/api/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Manifesto-ID': manifesto?.id
      },
      body: JSON.stringify({ message })
    });

    const reader = response.body.getReader();
    let assistantMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      if (chunk.includes('<action>')) {
        handleAction(extractAction(chunk));
      }
      assistantMessage += chunk;
      
      // Update UI in real-time
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: assistantMessage }
      ]);
    }
  };

  const handleAction = async (action) => {
    switch (action.type) {
      case 'CREATE_WALLET':
        const newWallet = await createWallet();
        setManifesto(prev => ({ ...prev, wallets: [...prev.wallets, newWallet] }));
        break;
      case 'EXECUTE_TRADE':
        await executeTrade(action.params);
        break;
      // Add more actions
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar */}
      <motion.div 
        className="w-20 border-r border-gray-200 dark:border-gray-800"
        initial={false}
        animate={{ width: activeView === 'chat' ? 20 : 96 }}
      >
        <NavigationMenu activeView={activeView} setActiveView={setActiveView} />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeView === 'chat' ? (
            <ChatView messages={messages} onSendMessage={handleMessage} />
          ) : (
            <PortfolioView manifesto={manifesto} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ChatView = ({ messages, onSendMessage }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="h-full flex flex-col"
  >
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message, i) => (
        <ChatMessage key={i} {...message} />
      ))}
    </div>
    <ChatInput onSend={onSendMessage} />
  </motion.div>
);

const ChatMessage = ({ role, content, actions }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
      role === 'user' 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
        : 'bg-white dark:bg-gray-800 shadow-lg'
    }`}>
      {content}
      {actions && <ActionButtons actions={actions} />}
    </div>
  </div>
);

export default FeatherChat;