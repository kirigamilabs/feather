import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Wallet, Brain, RefreshCcw, LineChart, Mic, TrendingUp, Award,
  X, ChevronLeft, ChevronRight, StopCircle } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAI } from '@/components/AIProvider';
import { useAICore } from '@/hooks/useAICore';
import { FeedbackSystem } from '@/components/InteractionFeedback'
import { MessageTransition, ThinkingTransition } from '@/components/Transitions';
import { MarketAnalysis } from '@/components/MarketAnalysis';
import { AccountPortfolio } from '@/components/AccountPortfolio';
import { RewardsSystem } from '@/components/RewardsSystem';
import { ThemeToggle, AIStatusDisplay, NeuralBackground } from '@/components/ThemeAIStatus';
import { WalletConnect } from '@/components/WalletConnect';
import { SendTransaction } from '@/components/SendTransaction';
import { WalletPortfolio } from '@/components/WalletPortfolio';
import { useWallet } from '@/hooks/useWallet';
import { Web3StatusBar } from '@/components/Web3StatusBar';
import { AIWeb3Integration } from '@/components/AIWeb3Integration';
//<AIWeb3Integration
//        onWalletConnected={(address) => {
          // Auto-add message when wallet connects
//          setMessages(prev => [...prev, {
//            role: 'assistant',
//            content: `Wallet connected: ${address.slice(0,6)}...${address.slice(-4)}`,
//            actions: [{ type: 'show_portfolio' }]
//          }]);
//        }}
//      />

interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: string;
  amount: number;
  token: string;
}

interface Action {
  type: 'connect_wallet' | 'execute_trade' | 'analyze_market' | 'show_portfolio';
  params?: any;
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  actions?: Action[];
  metadata?: {
    confidence?: number;
    marketSentiment?: 'bullish' | 'bearish' | 'neutral';
    riskLevel?: 'low' | 'moderate' | 'high';
  };
  isStreaming?: boolean;
  transactions?: Transaction[];
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
    component: WalletPortfolio,
  },
  portfolio2: {
    title: 'Portfolio2',
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
  onVoiceToggle,
  onCancelProcessing,
  onActionClick
}: {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  mode: string;
  isListening: boolean;
  onVoiceToggle: () => void;
  onCancelProcessing: () => void;
  onActionClick: (action: Action) => void;
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'connect_wallet': return Wallet;
      case 'execute_trade': return RefreshCcw;
      case 'analyze_market': return LineChart;
      case 'show_portfolio': return TrendingUp;
      default: return Brain;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'connect_wallet': return 'Connect Wallet';
      case 'execute_trade': return 'Execute Trade';
      case 'analyze_market': return 'Analyze Market';
      case 'show_portfolio': return 'View Portfolio';
      default: return actionType;
    }
  };

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
              <p className="text-xs text-muted-foreground">
                {mode === 'thinking' && 'Analyzing your request...'}
                {mode === 'speaking' && 'Responding...'}
                {mode === 'listening' && 'Listening...'}
                {mode === 'observing' && 'Ready to help'}
              </p>
            </div>
            <AIStatusDisplay />
            <Web3StatusBar />
          </div>

          <div className="flex items-center gap-3">
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
                    : 'bg-card text-card-foreground shadow-sm border border-border/50'
                }`}>
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="ml-1"
                      >
                        ▊
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Metadata Display */}
                  {message.metadata && !message.isStreaming && (
                    <div className="mt-2 pt-2 border-t border-border/20 text-xs opacity-75">
                      {message.metadata.confidence && (
                        <div className="flex items-center gap-2">
                          <span>Confidence:</span>
                          <div className="flex-1 h-1 bg-background/30 rounded-full">
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
                        <div className="mt-1">
                          Market: {message.metadata.marketSentiment} | Risk: {message.metadata.riskLevel}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {message.actions && !message.isStreaming && (
                    <div className="mt-3 pt-2 border-t border-border/20 flex flex-wrap gap-2">
                      {message.actions.map((action, actionIndex) => {
                        const Icon = getActionIcon(action.type);
                        return (
                          <Button
                            key={actionIndex}
                            size="sm"
                            variant="outline"
                            onClick={() => onActionClick(action)}
                            className={`${
                              message.role === 'user' 
                                ? 'bg-white/10 hover:bg-white/20 border-white/30' 
                                : 'border-border hover:bg-accent'
                            }`}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {getActionLabel(action.type)}
                          </Button>
                        );
                      })}
                    </div>
                  )}
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
              placeholder={
                mode === 'thinking' ? 'Processing...' : 
                isListening ? 'Listening...' : 
                'Message S0 AI...'
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-3 
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
              disabled={mode === 'thinking' || isListening}
            />
          </div>
          
          {mode === 'thinking' ? (
            <Button 
              type="button"
              onClick={onCancelProcessing}
              size="icon"
              variant="destructive"
              className="rounded-full"
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              type="submit"
              disabled={mode === 'thinking' || !input.trim() || isListening}
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
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
    actions: [{ type: 'connect_wallet' }]
  }]);
  
  const [input, setInput] = useState('');
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [showSendTransaction, setShowSendTransaction] = useState(false);
  const { walletState } = useWallet();

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
    if (!input.trim() || mode === 'thinking' || isListening) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Add streaming message placeholder
    const streamingMessageId = Date.now();
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      isStreaming: true
    }]);
    
    setInput('');

    try {
      let streamingContent = '';
      
      await processInput(
        input,
        // Stream callback
        (content: string, isComplete: boolean) => {
          streamingContent += content;
          setMessages(prev => prev.map((msg, idx) => 
            idx === prev.length - 1 ? {
              ...msg,
              content: streamingContent,
              isStreaming: !isComplete
            } : msg
          ));
        },
        // Actions callback
        (actions: Action[]) => {
          setMessages(prev => prev.map((msg, idx) => 
            idx === prev.length - 1 ? {
              ...msg,
              actions
            } : msg
          ));
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.slice(0, -1).concat([{
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isStreaming: false
      }]));
    }
  };

  const handleCancelProcessing = () => {
    // Optional: set some state or handle cancel logic if needed
    console.log("Processing canceled");
  };

  const handleActionClick = (action: Action) => {
    switch (action.type) {
      case 'show_portfolio':
        setActivePanel(activePanel === 'portfolio' ? null : 'portfolio');
        break;
      case 'analyze_market':
        setActivePanel(activePanel === 'market' ? null : 'market');
        break;
      case 'connect_wallet':
        setShowWalletConnect(true);
        break;
      case 'execute_trade':
        if (walletState.isConnected) {
          setShowSendTransaction(true);
        } else {
          setShowWalletConnect(true);
        }
        break;
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
            onCancelProcessing={handleCancelProcessing}
            onActionClick={handleActionClick}
          />
        </div>
      </div>

      {/* Overlay Components */}
      <FeedbackSystem />

      {/* Wallet Modals */}
      <WalletConnect
        isOpen={showWalletConnect}
        onClose={() => setShowWalletConnect(false)}
        onConnected={() => {
          // Update AI context with wallet connection
          const newMessage: Message = {
            role: 'assistant',
            content: `Great! Your wallet is now connected. I can see your address ${walletState.address ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}` : ''} and balance. What would you like to do next?`,
            actions: [
              { type: 'show_portfolio' },
              { type: 'analyze_market' },
              { type: 'execute_trade' }
            ]
          };
          setMessages(prev => [...prev, newMessage]);
        }}
      />
      <SendTransaction
        isOpen={showSendTransaction}
        onClose={() => setShowSendTransaction(false)}
      />
      
    </div>
  );
}