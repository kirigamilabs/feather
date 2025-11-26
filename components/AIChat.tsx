// components/AIChat.tsx - Enhanced with all integrations
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Send, Loader2, AlertCircle
} from 'lucide-react';
import DisclaimerBanner from '@/components/Disclaimer';
import { usePrompts } from '@/components/PromptProvider';
import { WalletConnect } from '@/components/WalletConnect';
import MasterToolbar from '@/components/MasterToolbar';
import SwapInterface from '@/components/SwapInterface';
import ContractInteraction from '@/components/ContractInteraction';
import ContractBuilder from '@/components/ContractBuilder';
import GasTracker from '@/components/GasTracker';
import { LegalFooter } from '@/components/LegalDocuments';
import { AISettings } from '@/components/AISettings';
import { useWallet } from '@/hooks/useWallet';
import { useTransactionManager } from '@/hooks/useTransactionManager';

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

const ChatInterface = ({ selectedMode }: { selectedMode: string | null }) => {
  const { selectedPrompt } = usePrompts();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // UI States
  const [showWallet, setShowWallet] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showGas, setShowGas] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Wallet & Transaction Management
  const { walletState, isCorrectNetwork, ensureCorrectNetwork } = useWallet();
  const { executeTransaction } = useTransactionManager();

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    
    const modeContext = selectedMode && selectedMode !== 'skip' 
      ? `\n\n**${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Mode** activated.`
      : '';

    setTimeout(() => {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `${greeting}. I'm Suguru.${modeContext}\n\nI can help you:\n- Execute token swaps\n- Monitor gas prices\n- Interact with smart contracts\n- Analyze market conditions\n\nWhat would you like to do?`,
      }]);
    }, 500);
  }, [selectedMode]);

  // Handle action execution from AI
  const handleAction = async (action: Action) => {
    try {
      switch (action.type) {
        case 'connect_wallet':
          setShowWallet(true);
          break;
          
        case 'execute_trade':
          // First ensure wallet is connected
          if (!walletState.isConnected) {
            setShowWallet(true);
            return;
          }
          
          // Then show swap interface with pre-filled data
          setShowSwap(true);
          break;
          
        case 'check_gas':
          setShowGas(true);
          break;
          
        case 'analyze_market':
          // AI will provide analysis in the chat
          break;
          
        default:
          console.warn('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('Action execution error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      }]);
    }
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
      // Build comprehensive context
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
          mode: selectedMode || 'oracle',
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
                
                // Detect action intents in the AI's response
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

      // Auto-execute actions if appropriate
      if (detectedActions.length > 0) {
        const autoExecutableActions = detectedActions.filter(a => 
          a.type === 'check_gas' // Only auto-execute safe actions
        );
        
        for (const action of autoExecutableActions) {
          await handleAction(action);
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

  // Detect action intents from AI response
  const detectActions = (content: string, walletContext: any): Action[] => {
    const actions: Action[] = [];
    const lowerContent = content.toLowerCase();

    // Detect wallet connection intent
    if (!walletContext.connected && 
        (lowerContent.includes('connect') && lowerContent.includes('wallet'))) {
      actions.push({ type: 'connect_wallet' });
    }

    // Detect swap/trade intent
    if ((lowerContent.includes('swap') || lowerContent.includes('trade') || 
         lowerContent.includes('exchange')) && walletContext.connected) {
      actions.push({ type: 'execute_trade' });
    }

    // Detect gas check intent
    if (lowerContent.includes('gas') && 
        (lowerContent.includes('price') || lowerContent.includes('fee'))) {
      actions.push({ type: 'check_gas' });
    }

    return actions;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      {/* Header with Master Toolbar */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl p-4 sm:p-6">
        <div className="flex items-center justify-between w-full">
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
                {selectedMode && selectedMode !== 'skip' ? `${selectedMode} Mode` : 'AI Assistant'}
              </p>
            </div>
          </div>

          {/* Master Toolbar */}
          <MasterToolbar
            onSwapClick={() => setShowSwap(true)}
            onContractClick={() => setShowContract(true)}
            onBuilderClick={() => setShowBuilder(true)}
            onGasClick={() => setShowGas(true)}
            onWalletClick={() => setShowWallet(true)}
            onSettingsClick={() => setShowSettings(true)}
            isWalletConnected={walletState.isConnected}
          />
        </div>
      </div>

      {/* Network Warning (if wrong network) */}
      {walletState.isConnected && !isCorrectNetwork && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/50 px-6 py-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-500 font-medium">
                Wrong Network Detected
              </p>
              <p className="text-xs text-yellow-500/80">
                Please switch to Sepolia testnet for testing
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

                  {/* Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex gap-2 flex-wrap">
                      {message.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAction(action)}
                          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                          {action.type === 'connect_wallet' && '🔗 Connect Wallet'}
                          {action.type === 'execute_trade' && '💱 Open Swap'}
                          {action.type === 'check_gas' && '⛽ Check Gas'}
                          {action.type === 'analyze_market' && '📊 View Analysis'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  {message.metadata && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs opacity-75">
                      {message.metadata.confidence && (
                        <div className="flex items-center gap-2 mb-2">
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
                      {message.metadata.marketSentiment && (
                        <span className="mr-3">
                          Sentiment: <strong>{message.metadata.marketSentiment}</strong>
                        </span>
                      )}
                      {message.metadata.riskLevel && (
                        <span>
                          Risk: <strong>{message.metadata.riskLevel}</strong>
                        </span>
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
            placeholder="Ask me anything about crypto..."
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
      
      <LegalFooter />
      
      {/* Modals */}
      <WalletConnect 
        isOpen={showWallet} 
        onClose={() => setShowWallet(false)}
        onConnected={() => {
          setShowWallet(false);
          // Add success message to chat
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: '✅ Wallet connected successfully! You can now execute swaps and interact with smart contracts.'
          }]);
        }}
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
    </motion.div>
  );
};

export default function AIChat() {
  return <ChatInterface selectedMode={null} />;
}