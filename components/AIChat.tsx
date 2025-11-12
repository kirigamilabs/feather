import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Zap, Brain, TrendingUp, Send, Loader2
} from 'lucide-react';
import { DisclaimerBanner } from '@/components/Disclaimer';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  actions?: Action[];
  metadata?: {
    confidence?: number;
    marketSentiment?: 'bullish' | 'bearish' | 'neutral';
    riskLevel?: 'low' | 'moderate' | 'high';
  };
  isStreaming?: boolean;
}

interface Action {
  type: 'connect_wallet' | 'execute_trade' | 'analyze_market' | 'show_wallet';
  params?: any;
}

interface ModeOption {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subtitle: string;
  color: string;
  glow: string;
  description: string;
}

const ModeSelection = ({ onModeSelect }: { onModeSelect: (mode: ModeOption) => void }) => {
  const modes: ModeOption[] = [
    {
      id: 'chaos',
      icon: Zap,
      label: 'Chaos Mode',
      subtitle: 'Give me $50. I\'ll surprise you.',
      color: 'from-orange-500 to-red-500',
      glow: 'group-hover:shadow-orange-500/50',
      description: 'Bold, action-first. Present options, execute fast. Perfect for those who trust their instincts.'
    },
    {
      id: 'sensei',
      icon: Brain,
      label: 'Sensei Mode',
      subtitle: 'Teach me. Explain everything.',
      color: 'from-blue-500 to-indigo-500',
      glow: 'group-hover:shadow-blue-500/50',
      description: 'Patient educator. Learn as you go. Every action becomes a lesson in DeFi mastery.'
    },
    {
      id: 'oracle',
      icon: TrendingUp,
      label: 'Oracle Mode',
      subtitle: 'Show me patterns I\'m missing.',
      color: 'from-purple-500 to-pink-500',
      glow: 'group-hover:shadow-purple-500/50',
      description: 'Proactive intelligence. I surface insights before you ask. Data-driven, always watching.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-black to-black" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Choose Your Path
          </h2>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
            How you want this conversation to go shapes everything. Choose wisely.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {modes.map((mode, idx) => (
            <motion.button
              key={mode.id}
              onClick={() => onModeSelect(mode)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`
                group relative p-8 rounded-2xl border border-white/10 
                bg-gradient-to-br ${mode.color} bg-opacity-5
                hover:border-white/20 transition-all duration-300
                ${mode.glow} shadow-lg text-left
              `}
            >
              <div className={`
                w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color}
                flex items-center justify-center mb-6
              `}>
                <mode.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-semibold text-white mb-2">
                {mode.label}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {mode.subtitle}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {mode.description}
              </p>

              <motion.div
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <button
            onClick={() => onModeSelect({ id: 'skip', icon: Sparkles, label: 'Skip', subtitle: '', color: '', glow: '', description: '' })}
            className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            Or just start talking →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ChatInterface = ({ selectedMode }: { selectedMode: string | null }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    
    const modeContext = selectedMode && selectedMode !== 'skip' 
      ? `\n\n**${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Mode** activated. ${getModeDescription(selectedMode)}`
      : '';

    setTimeout(() => {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `${greeting}. I'm Suguru.${modeContext}\n\nWhat's on your mind?`,
      }]);
    }, 500);
  }, [selectedMode]);

  const getModeDescription = (mode: string) => {
    const descriptions = {
      chaos: "Let's make this interesting. Give me a play, I'll surprise you.",
      sensei: "I'll walk you through everything step by step.",
      oracle: "I'll surface insights and patterns as we go."
    };
    return descriptions[mode as keyof typeof descriptions] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/first-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          mode: selectedMode || 'oracle',
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          walletContext: {
            connected: false, // Replace with actual wallet state
            address: null,
            balance: null,
            chainId: null
          }
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      const streamingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        isStreaming: true
      };

      setMessages(prev => [...prev, streamingMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'content') {
                streamedContent += data.content;
                setMessages(prev => prev.map((msg, idx) => 
                  idx === prev.length - 1 ? {
                    ...msg,
                    content: streamedContent,
                    isStreaming: !data.isComplete
                  } : msg
                ));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setIsTyping(false);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 ? {
          ...msg,
          content: 'Sorry, I encountered an error. Please try again.',
          isStreaming: false
        } : msg
      ));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl p-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0.3)',
                '0 0 40px rgba(59, 130, 246, 0.5)',
                '0 0 20px rgba(59, 130, 246, 0.3)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-light text-white">Suguru</h1>
            <p className="text-sm text-gray-500">
              {selectedMode && selectedMode !== 'skip' ? `${selectedMode} Mode` : 'Ready'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                <div className={`
                  rounded-2xl px-6 py-4
                  ${message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                    : 'bg-white/5 border border-white/10 text-white'
                  }
                `}>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>

                  {message.metadata && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs opacity-75">
                      {message.metadata.confidence && (
                        <div className="flex items-center gap-2">
                          <span>Confidence:</span>
                          <div className="flex-1 h-1 bg-white/10 rounded-full">
                            <motion.div
                              className="h-full bg-green-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${message.metadata.confidence * 100}%` }}
                            />
                          </div>
                          <span>{(message.metadata.confidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-gray-500"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Suguru is thinking...</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-black/50 backdrop-blur-xl p-6"
      >
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type anything..."
            disabled={isTyping}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      <DisclaimerBanner/>
    </motion.div>
  );
};

export default function AIChat() {
  const [phase, setPhase] = useState<'transition' | 'mode' | 'chat'>('mode');
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleModeSelect = (mode: ModeOption) => {
    setSelectedMode(mode.id);
    setPhase('transition');
    setTimeout(() => {
      setPhase('chat');
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <style>{`
        @keyframes grid-flow {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
        
        body {
          background: #000;
          overflow-x: hidden;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 3px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>

      <AnimatePresence mode="wait">
        {phase === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-light text-white"
              >
                {phase === 'transition' && selectedMode ? 'Preparing your experience...' : 'Welcome home'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {phase === 'mode' && (
          <ModeSelection onModeSelect={handleModeSelect} />
        )}

        {phase === 'chat' && (
          <ChatInterface selectedMode={selectedMode} />
        )}
      </AnimatePresence>
    </div>
  );
}