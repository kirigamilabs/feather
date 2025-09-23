import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Wallet, Brain, RefreshCcw, LineChart, Mic, TrendingUp, Award,
  X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAI } from '@/components/AIProvider';
import { useAICore } from '@/hooks/useAICore';
import { FeedbackSystem } from '@/components/InteractionFeedback'
import { MessageTransition, ThinkingTransition } from '@/components/Transitions';
import { MarketAnalysis } from '@/components/MarketAnalysis';
import { AccountPortfolio } from '@/components/AccountPortfolio';
import { RewardsSystem } from '@/components/RewardsSystem';
import { ThemeToggle, AIStatusDisplay, NeuralBackground } from '@/components/ThemeAIStatus';

interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: string;
  amount: number;
  token: string;
}

interface MessageMetadata {
  actions?: Action[];
  transactions?: Transaction[];
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  action?: {
    type: 'connect_wallet' | 'execute_trade'
    data?: any
  }
  metadata?: MessageMetadata;
}

interface Action {
  type: 'connect_wallet' | 'execute_trade'
  params: any
}

// Clean panel system with proper layout
interface PanelComponent {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const PANELS: Record<string, PanelComponent> = {
  market: {
    title: 'Market Analysis',
    icon: LineChart,
    component: MarketAnalysis,
  },
  portfolio: {
    title: 'Portfolio',
    icon: TrendingUp,
    component: AccountPortfolio,
  },
  rewards: {
    title: 'Rewards',
    icon: Award,
    component: RewardsSystem,
  }
};

type PanelType = keyof typeof PANELS;

// Proper responsive sidebar
const Sidebar = ({ 
  activePanel, 
  setActivePanel,
  isCollapsed,
  setIsCollapsed 
}: { 
  activePanel: PanelType | null; 
  setActivePanel: (panel: PanelType | null) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}) => {
  return (
    <motion.div 
      className="relative bg-card/50 backdrop-blur-sm border-r border-border/50 flex flex-col"
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Collapse Toggle */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-semibold text-sm"
          >
            AI x Crypto
          </motion.span>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Panel Buttons */}
      <div className="flex-1 p-2 space-y-2">
        {Object.entries(PANELS).map(([key, { icon: Icon, title }]) => (
          <Button
            key={key}
            variant={activePanel === key ? "default" : "ghost"}
            onClick={() => setActivePanel(activePanel === key ? null : key as PanelType)}
            className={`w-full justify-start ${isCollapsed ? 'px-3' : 'px-4'}`}
            size={isCollapsed ? "icon" : "default"}
          >
            <Icon className="w-4 h-4" />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-2"
              >
                {title}
              </motion.span>
            )}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

// Clean panel content with proper responsive behavior
const PanelContent = ({ 
  activePanel, 
  onClose 
}: { 
  activePanel: PanelType | null;
  onClose: () => void;
}) => {
  if (!activePanel) return null;

  const { title, icon: Icon, component: Component } = PANELS[activePanel];

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 400, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-background border-r border-border/50 flex flex-col overflow-hidden"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">{title}</h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="p-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Component />
      </div>
    </motion.div>
  );
};

// Improved chat interface with proper message handling
const ChatInterface = ({ 
  messages, 
  input, 
  setInput, 
  onSubmit, 
  mode,
  isListening,
  onVoiceToggle 
}: {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  mode: string;
  isListening: boolean;
  onVoiceToggle: () => void;
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                scale: mode === 'thinking' ? [1, 1.1, 1] : 1,
                rotate: mode === 'thinking' ? [0, 180, 360] : 0
              }}
              transition={{ 
                duration: mode === 'thinking' ? 2 : 0.3,
                repeat: mode === 'thinking' ? Infinity : 0
              }}
            >
              <Bot className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <span className="font-medium text-card-foreground">S0 AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AIStatusDisplay />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, i) => (
            <MessageTransition key={i}>
              <motion.div
                layout
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-card text-card-foreground shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Action Buttons */}
                  {message.action && (
                    <div className="mt-3 pt-2 border-t border-white/20">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 border-white/30"
                      >
                        {message.action.type === 'connect_wallet' ? (
                          <>
                            <Wallet className="h-4 w-4 mr-2" />
                            Connect Wallet
                          </>
                        ) : (
                          <>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Execute Trade
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Transaction Cards */}
                  {message.metadata?.transactions?.map((tx, index) => (
                    <div key={index} className="mt-3 bg-black/20 backdrop-blur rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{tx.type}</div>
                          <div className="text-xs opacity-80">
                            {tx.amount} {tx.token}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          tx.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                          tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </MessageTransition>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={onSubmit} className="border-t border-border/50 bg-card/30 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onVoiceToggle}
            size="icon"
            variant={isListening ? 'destructive' : 'outline'}
            className="rounded-full"
            disabled={mode === 'thinking'}
          >
            <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
          </Button>
          
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message S0 AI..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
              disabled={mode === 'thinking'}
            />
            {mode === 'thinking' && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl 
                            flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="h-5 w-5 text-primary" />
                </motion.div>
              </div>
            )}
          </div>
          
          <Button 
            type="submit"
            disabled={mode === 'thinking' || !input.trim()}
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

// Main component with clean layout
export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! I'm S0. I can help manage your crypto assets, execute trades, and provide market insights. Would you like to connect a wallet to get started?",
    action: {
      type: 'connect_wallet'
    }
  }]);
  
  const [input, setInput] = useState('');
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const { mode, processInput } = useAICore();
  const { startListening, stopListening, neuralRef } = useAI();

  const handleVoiceToggle = async () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      await startListening();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || mode === 'thinking') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await processInput(input);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Background Effects */}
      <NeuralBackground />
      
      {/* Layout Container */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <Sidebar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Panel Content */}
        <AnimatePresence>
          <PanelContent
            activePanel={activePanel}
            onClose={() => setActivePanel(null)}
          />
        </AnimatePresence>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            messages={messages}
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            mode={mode}
            isListening={isListening}
            onVoiceToggle={handleVoiceToggle}
          />
        </div>
      </div>

      {/* Overlay Components */}
      <FeedbackSystem />
    </div>
  );
}