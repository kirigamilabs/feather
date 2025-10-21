import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Box, Boxes, Wallet, Brain, RefreshCcw, LineChart, Mic, TrendingUp, Award,
  X, ChevronLeft, ChevronRight, StopCircle, Sparkles, Menu } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAI } from '@/components/AIProvider';
import { useAICore } from '@/hooks/useAICore';
import { FeedbackSystem } from '@/components/InteractionFeedback'
import { MessageTransition, ThinkingTransition } from '@/components/Transitions';
import { ThemeToggle, AIStatusDisplay, NeuralBackground } from '@/components/ThemeAIStatus';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@/hooks/useWallet';
import { SendTransaction } from '@/components/SendTransaction';
import { WalletPortfolio } from '@/components/WalletPortfolio';
import { Web3StatusBar } from '@/components/Web3StatusBar';
import { About } from '@/components/About';
import { AISettings } from '@/components/AISettings';
import { CryptoProducts } from '@/components/CryptoProducts';
import { AccountPortfolio } from '@/components/AccountPortfolio';
import { MarketAnalysis } from '@/components/MarketAnalysis';
import { Contact } from '@/components/Contact';

interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: string;
  amount: number;
  token: string;
}

interface Action {
  type: 'connect_wallet' | 'execute_trade' | 'analyze_market' | 'show_wallet';
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

interface PanelComponent {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const PANELS: Record<string, PanelComponent> = {
  wallet: { title: 'wallet', icon: Wallet, component: WalletPortfolio },
  kiri: { title: 'ai', icon: Box, component: AISettings },
  gami: { title: 'crypto', icon: Boxes, component: CryptoProducts },
  portfolio: { title: 'portfolio', icon: TrendingUp, component: AccountPortfolio },
  market: { title: 'market', icon: LineChart, component: MarketAnalysis },
  about: { title: 'about', icon: Sparkles, component: About },
  contact: { title: 'contact', icon: Award, component: Contact },
};

type PanelType = keyof typeof PANELS;

// Desktop Sidebar
const DesktopSidebar = ({ 
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
      className="hidden lg:flex relative bg-card/50 backdrop-blur-sm border-r border-border/50 flex-col"
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        {!isCollapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-semibold text-sm">
            Kirigami
          </motion.span>
        )}
        <Button size="sm" variant="ghost" onClick={() => setIsCollapsed(!isCollapsed)} className="p-2">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

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
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="ml-2">
                {title}
              </motion.span>
            )}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

// Mobile Bottom Sheet Navigation
const MobileNavSheet = ({ 
  isOpen, 
  onClose, 
  activePanel, 
  setActivePanel 
}: { 
  isOpen: boolean;
  onClose: () => void;
  activePanel: PanelType | null; 
  setActivePanel: (panel: PanelType | null) => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 rounded-t-2xl z-50 lg:hidden max-h-[80vh] overflow-y-auto"
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between sticky top-0 bg-card/95">
              <h2 className="font-semibold">Kirigami</h2>
              <Button size="sm" variant="ghost" onClick={onClose} className="p-2">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 space-y-2">
              {Object.entries(PANELS).map(([key, { icon: Icon, title }]) => (
                <Button
                  key={key}
                  variant={activePanel === key ? "default" : "ghost"}
                  onClick={() => {
                    setActivePanel(activePanel === key ? null : key as PanelType);
                    onClose();
                  }}
                  className="w-full justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {title}
                </Button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Panel Content - Desktop only
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
      animate={{ width: 500, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden lg:flex bg-background border-r border-border/50 flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">{title}</h2>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} className="p-2">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Component />
      </div>
    </motion.div>
  );
};

// Panel Modal - Mobile only
const PanelModal = ({ 
  activePanel, 
  onClose 
}: { 
  activePanel: PanelType | null;
  onClose: () => void;
}) => {
  if (!activePanel) return null;

  const { title, icon: Icon, component: Component } = PANELS[activePanel];

  return (
    <AnimatePresence>
      {activePanel && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 rounded-t-2xl z-40 lg:hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/30">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">{title}</h2>
              </div>
              <Button size="sm" variant="ghost" onClick={onClose} className="p-2">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Component />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Chat Interface
const ChatInterface = ({ 
  messages, 
  input, 
  setInput, 
  onSubmit, 
  mode,
  isListening,
  onVoiceToggle,
  onCancelProcessing,
  onActionClick,
  onMenuToggle
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
  onMenuToggle: () => void;
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
      case 'show_wallet': return TrendingUp;
      default: return Brain;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'connect_wallet': return 'Connect Wallet';
      case 'execute_trade': return 'Execute Trade';
      case 'analyze_market': return 'Analyze Market';
      case 'show_wallet': return 'View Wallet';
      default: return actionType;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background absolute inset-0">
      {/* Chat Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              onClick={onMenuToggle}
              size="icon"
              variant="ghost"
              className="lg:hidden flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <motion.div
              animate={{ 
                scale: mode === 'thinking' ? [1, 1.1, 1] : 1,
                rotate: mode === 'thinking' ? [0, 180, 360] : 0
              }}
              transition={{ 
                duration: mode === 'thinking' ? 2 : 0.3,
                repeat: mode === 'thinking' ? Infinity : 0
              }}
              className="flex-shrink-0"
            >
              <Bot className="h-6 w-6 text-primary" />
            </motion.div>
            <div className="min-w-0">
              <span className="font-medium text-card-foreground text-sm md:text-base">Kirigami AI</span>
              <p className="text-xs text-muted-foreground truncate">
                {mode === 'thinking' && 'Analyzing...'}
                {mode === 'speaking' && 'Responding...'}
                {mode === 'listening' && 'Listening...'}
                {mode === 'observing' && 'Ready to help'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:flex">
              <AIStatusDisplay />
            </div>
            <div className="hidden md:flex">
              <Web3StatusBar />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-scroll touch-action-pan-y p-3 md:p-4 space-y-4 pb-40 md:pb-32">
        <AnimatePresence mode="popLayout">
          {messages.map((message, i) => (
            <MessageTransition key={i}>
              <motion.div
                layout
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-card text-card-foreground shadow-sm border border-border/50'
                }`}>
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="ml-1"
                      >
                        ▮
                      </motion.span>
                    )}
                  </div>
                  
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
                            className={`text-xs ${
                              message.role === 'user' 
                                ? 'bg-white/10 hover:bg-white/20 border-white/30' 
                                : 'border-border hover:bg-accent'
                            }`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
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
      <form onSubmit={onSubmit} className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card/30 backdrop-blur-sm p-3 md:p-4 flex-shrink-0 z-20 lg:relative">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            type="button"
            onClick={onVoiceToggle}
            size="icon"
            variant={isListening ? 'destructive' : 'outline'}
            className="rounded-full flex-shrink-0"
            disabled={mode === 'thinking'}
          >
            <Mic className={`h-4 w-4 md:h-5 md:w-5 ${isListening ? 'animate-pulse' : ''}`} />
          </Button>
          
          <div className="flex-1 relative min-w-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'thinking' ? 'Processing...' : 
                isListening ? 'Listening...' : 
                'Message AI...'
              }
              className="w-full rounded-xl border border-border bg-background px-3 md:px-4 py-2 md:py-3 text-sm md:text-base
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
              className="rounded-full flex-shrink-0"
            >
              <StopCircle className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          ) : (
            <Button 
              type="submit"
              disabled={mode === 'thinking' || !input.trim() || isListening}
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

// Main Component
export default function AIChat() {
  const { walletState } = useWallet();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: walletState.address 
        ? `**Hey!** I'm Kirigami AI with DeFi execution and strategy.\n\n**Wallet Connected:** \`${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}\`\n**Balance:** ${walletState.balance} ETH\n\nI can execute trades, analyze protocols, optimize yields, and help you navigate complex strategies. What's on your mind?`
        : `**Hey!** I'm Kirigami AI with DeFi execution and strategy. Coming Soon. \n\nI will be able to execute trades, analyze protocols, optimize yields, and help you navigate complex strategies.\n\n**Connect your wallet** to unlock portfolio analysis, transaction execution, and personalized recommendations.`,
      actions: walletState.address ? [] : [{ type: 'connect_wallet' }]
    }
  ]);
  
  const [input, setInput] = useState('');
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [showSendTransaction, setShowSendTransaction] = useState(false);

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
    console.log("Processing canceled");
  };

  const handleActionClick = (action: Action) => {
    switch (action.type) {
      case 'show_wallet':
        setActivePanel(activePanel === 'wallet' ? null : 'wallet');
        setMobileNavOpen(false);
        break;
      case 'analyze_market':
        setActivePanel(activePanel === 'market' ? null : 'market');
        setMobileNavOpen(false);
        break;
      case 'connect_wallet':
        setShowWalletConnect(true);
        setMobileNavOpen(false);
        break;
      case 'execute_trade':
        if (walletState.isConnected) {
          setShowSendTransaction(true);
        } else {
          setShowWalletConnect(true);
        }
        setMobileNavOpen(false);
        break;
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden relative w-screen flex-col lg:flex-row">
      <NeuralBackground />
      
      {/* Desktop Layout */}
      <DesktopSidebar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      <AnimatePresence>
        <PanelContent
          activePanel={activePanel}
          onClose={() => setActivePanel(null)}
        />
      </AnimatePresence>

      {/* Main Chat */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
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
          onMenuToggle={() => setMobileNavOpen(!mobileNavOpen)}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNavSheet
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />

      {/* Panel Modal - Mobile Only */}
      <PanelModal
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
      />

      {/* Overlays */}
      <FeedbackSystem />
      <WalletConnect
        isOpen={showWalletConnect}
        onClose={() => setShowWalletConnect(false)}
        onConnected={() => {
          const newMessage: Message = {
            role: 'assistant',
            content: `Great! Your wallet is now connected. I can see your address ${walletState.address ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}` : ''} and balance. What would you like to do next?`,
            actions: [
              { type: 'show_wallet' },
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