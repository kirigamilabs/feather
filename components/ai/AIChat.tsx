import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Wallet, ArrowUpRight, RefreshCcw } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi! I\'m Feather AI. I can help you manage your crypto assets, execute trades, and provide market insights. Would you like to connect a wallet or create one to get started?'
  }]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        message.role === 'user' 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
          : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        {message.content}
        {message.action && (
          <div className="mt-2 flex gap-2">
            {message.action === 'connect_wallet' && (
              <button className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
            {message.action === 'execute_trade' && (
              <button className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
                <RefreshCcw className="w-4 h-4" />
                Confirm Trade
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const reader = response.body.getReader();
      let assistantMessage = { role: 'assistant', content: '' };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(5));
            if (data.content) {
              assistantMessage.content += data.content;
              setMessages(prev => [
                ...prev.slice(0, -1),
                assistantMessage
              ]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-500" />
          <span className="font-semibold text-gray-900 dark:text-white">Feather AI Assistant</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Feather AI..."
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;