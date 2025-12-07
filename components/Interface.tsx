import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Send, Loader2, AlertCircle, HelpCircle, ChevronDown, Zap } from 'lucide-react';
import DisclaimerBanner from '@/components/Disclaimer';
import FeaturesSection from '@/components/FeaturesSection';
import SolutionsSection from '@/components/SolutionsSection';
import PricingSection from '@/components/PricingSection';
import { FAQ } from '@/components/FAQ';
import { usePrompts } from '@/components/PromptProvider';
import MasterToolbar from '@/components/MasterToolbar';
import SwapInterface from '@/components/SwapInterface';
import ContractInteraction from '@/components/ContractInteraction';
import ContractBuilder from '@/components/ContractBuilder';
import GasTracker from '@/components/GasTracker';
import { LegalFooter } from '@/components/LegalDocuments';
import { AISettings } from '@/components/AISettings';
import { useWallet } from '@/hooks/useWallet';
import { useTransactionManager } from '@/hooks/useTransactionManager';
import { WalletConnect } from '@/components/WalletConnect';

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
  type: 'connect_wallet' | 'execute_trade' | 'analyze_market' | 'show_wallet' | 'check_gas';
  params?: any;
}

const Navigation = ({ 
  onHelpClick,
  isWalletConnected,
  onSwapClick,
  onGasClick,
  onWalletClick,
  onSettingsClick,
  scrolled
}: { 
  onHelpClick: () => void;
  isWalletConnected: boolean;
  onSwapClick: () => void;
  onGasClick: () => void;
  onWalletClick: () => void;
  onSettingsClick: () => void;
  scrolled: boolean;
}) => {

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-lg font-light tracking-tight text-white">
              KIRIGAMI
            </span>
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onHelpClick}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Help & FAQ"
            >
              <HelpCircle className="w-5 h-5 text-gray-400" />
            </button>
            
            <MasterToolbar
              onSwapClick={onSwapClick}
              onContractClick={() => {}}
              onBuilderClick={() => {}}
              onGasClick={onGasClick}
              onWalletClick={onWalletClick}
              onSettingsClick={onSettingsClick}
              isWalletConnected={isWalletConnected}
            />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const Hero = ({ isChatActive }: { isChatActive: boolean }) => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <motion.section
      style={{ opacity: isChatActive ? 0 : opacity, scale }}
      className={`relative min-h-[80vh] flex items-center justify-center overflow-hidden transition-all duration-700 ${
        isChatActive ? 'pointer-events-none' : ''
      }`}
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          animation: 'grid-flow 20s linear infinite'
        }} />
      </div>

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-8"
        >
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400 font-medium">Testnet Beta</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-7xl font-light tracking-tight text-white mb-6"
        >
          Where{' '}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Thoughts
            </span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 blur-2xl opacity-50"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </span>
          <br />
          Become Reality
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 font-light mb-8 max-w-2xl mx-auto"
        >
          The first AI that doesn't just advise—it executes.
          <br />
          <span className="text-gray-500">Speak your crypto strategy. Watch it happen.</span>
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-gray-600 mx-auto" />
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </motion.section>
  );
};

export default function UnifiedInterface() {
  const { selectedPrompt } = usePrompts();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // UI States
  const [showWallet, setShowWallet] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showGas, setShowGas] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  
  const { walletState, isCorrectNetwork, ensureCorrectNetwork } = useWallet();
  const { executeTransaction } = useTransactionManager();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat becomes active
  useEffect(() => {
    if (isChatActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatActive]);

  const handleAction = async (action: Action) => {
    try {
      switch (action.type) {
        case 'connect_wallet':
          setShowWallet(true);
          break;
        case 'execute_trade':
          if (!walletState.isConnected) {
            setShowWallet(true);
            return;
          }
          setShowSwap(true);
          break;
        case 'check_gas':
          setShowGas(true);
          break;
        default:
          console.warn('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('Action execution error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    // Activate chat mode on first message
    if (!isChatActive) {
      setIsChatActive(true);
    }

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
      const walletContext = walletState.isConnected ? {
        connected: true,
        address: walletState.address,
        balance: walletState.balance,
        chainId: walletState.chainId,
        isCorrectNetwork
      } : {
        connected: false
      };

      const response = await fetch('/api/ai/first-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          mode: 'oracle',
          promptId: selectedPrompt?.id,
          conversationHistory: messages.map(m => ({ 
            role: m.role, 
            content: m.content 
          })),
          walletContext
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let detectedActions: Action[] = [];

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
                
                if (data.isComplete && streamedContent) {
                  detectedActions = detectActions(streamedContent, walletContext);
                }
                
                setMessages(prev => prev.map((msg, idx) => 
                  idx === prev.length - 1 ? {
                    ...msg,
                    content: streamedContent,
                    isStreaming: !data.isComplete,
                    actions: data.isComplete ? detectedActions : undefined,
                    metadata: data.isComplete ? {
                      confidence: data.confidence,
                      marketSentiment: data.metadata?.marketSentiment,
                      riskLevel: data.metadata?.riskLevel
                    } : undefined
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

  const detectActions = (content: string, walletContext: any): Action[] => {
    const actions: Action[] = [];
    const lowerContent = content.toLowerCase();

    if (!walletContext.connected && 
        (lowerContent.includes('connect') && lowerContent.includes('wallet'))) {
      actions.push({ type: 'connect_wallet' });
    }

    if ((lowerContent.includes('swap') || lowerContent.includes('trade') || 
         lowerContent.includes('exchange')) && walletContext.connected) {
      actions.push({ type: 'execute_trade' });
    }

    if (lowerContent.includes('gas') && 
        (lowerContent.includes('price') || lowerContent.includes('fee'))) {
      actions.push({ type: 'check_gas' });
    }

    return actions;
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <style jsx global>{`
        @keyframes grid-flow {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
      `}</style>

      {/* Navigation */}
      <Navigation 
        onHelpClick={() => setShowFAQ(true)}
        isWalletConnected={walletState.isConnected}
        onSwapClick={() => setShowSwap(true)}
        onGasClick={() => setShowGas(true)}
        onWalletClick={() => setShowWallet(true)}
        onSettingsClick={() => setShowSettings(true)}
        scrolled={scrolled}
      />

      {/* Network Warning */}
      {walletState.isConnected && !isCorrectNetwork && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-500/10 border-b border-yellow-500/50 px-6 py-3">
          <div className="flex items-center gap-3 max-w-7xl mx-auto">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-500 font-medium">
                Wrong Network Detected
              </p>
              <p className="text-xs text-yellow-500/80">
                Please switch to Sepolia testnet
              </p>
            </div>
            <button
              onClick={ensureCorrectNetwork}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-medium transition-colors"
            >
              Switch Network
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero isChatActive={isChatActive} />

      {/* Chat Messages - Slides up when active */}
      <motion.div
        initial={false}
        animate={{
          y: isChatActive ? 0 : '100%',
          opacity: isChatActive ? 1 : 0
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed inset-0 z-30 bg-black pt-16 pb-32 overflow-hidden pointer-events-none"
        style={{ pointerEvents: isChatActive ? 'auto' : 'none' }}
      >
        <div className="h-full overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
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

                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex gap-2 flex-wrap">
                          {message.actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAction(action)}
                              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm transition-colors"
                            >
                              {action.type === 'connect_wallet' && '🔗 Connect Wallet'}
                              {action.type === 'execute_trade' && '💱 Open Swap'}
                              {action.type === 'check_gas' && '⛽ Check Gas'}
                            </button>
                          ))}
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
                  <span className="text-sm">Thinking...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </motion.div>

      {/* Features Section - Hidden when chat is active */}
      {!isChatActive && <FeaturesSection />}
      {!isChatActive && <SolutionsSection />}
      {!isChatActive && <PricingSection />}
      {!isChatActive && <LegalFooter />}

      {/* Fixed Chat Input */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur-2xl"
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about crypto..."
              disabled={isTyping}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 text-lg"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-3">
            Powered by AI • Always verify transactions
          </p>

          <LegalFooter />
        </div>
      </motion.div>

      {/* Modals */}
      <WalletConnect 
        isOpen={showWallet} 
        onClose={() => setShowWallet(false)}
        onConnected={() => setShowWallet(false)}
      />
      <FAQ 
        isOpen={showFAQ}
        onClose={() => setShowFAQ(false)}
      />
      <SwapInterface 
        isOpen={showSwap} 
        onClose={() => setShowSwap(false)} 
      />
      <ContractInteraction 
        isOpen={showContract} 
        onClose={() => setShowContract(false)} 
      />
      <ContractBuilder 
        isOpen={showBuilder} 
        onClose={() => setShowBuilder(false)} 
      />
      <GasTracker 
        isOpen={showGas} 
        onClose={() => setShowGas(false)} 
      />
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto my-8">
            <AISettings />
            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
            >
              Close Settings
            </button>
          </div>
        </div>
      )}

  <DisclaimerBanner/>
  </div>
  );
};