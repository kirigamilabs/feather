import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Send, Bot, Wallet, Brain, RefreshCcw, LineChart, Mic, Zap, TrendingUp, Award, ArrowRightLeft, LucideIcon,
  X, Maximize2, Minimize2  } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAI } from '@/components/AIProvider';
import { useAICore } from '@/hooks/useAICore';
import { useAIStore } from '@/state/aiState';
import { FeedbackSystem } from '@/components/InteractionFeedback'
import { AIPersonalityIndicator } from '@/components/AIPersonality'
import { MessageTransition, ThinkingTransition } from '@/components/Transitions';
import { MarketAnalysis } from '@/components/MarketAnalysis';
import { PortfolioOptimizer } from '@/components/PortfolioOptimizer';
import { RewardsSystem } from '@/components/RewardsSystem';

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

const NavigationMenu = ({ activeView, setActiveView }: { 
  activeView: 'chat' | 'portfolio'; 
  setActiveView: (view: 'chat' | 'portfolio') => void 
}) => (
  <div className="flex flex-col items-center py-4 space-y-4">
    <button
      onClick={() => setActiveView('chat')}
      className={`p-2 rounded-lg ${activeView === 'chat' ? 'bg-primary/10 text-primary' : ''}`}
    >
      <Bot className="w-6 h-6" />
    </button>
    <button
      onClick={() => setActiveView('portfolio')}
      className={`p-2 rounded-lg ${activeView === 'portfolio' ? 'bg-primary/10 text-primary' : ''}`}
    >
      <LineChart className="w-6 h-6" />
    </button>
  </div>
);

interface PanelComponent {
  title: string;
  icon: React.ComponentType;
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
    component: PortfolioOptimizer,
  },
  rewards: {
    title: 'Rewards',
    icon: Award,
    component: RewardsSystem,
  }
};

type PanelType = keyof typeof PANELS;

const Sidebar = ({ activePanel, setActivePanel }: { 
  activePanel: PanelType | null; 
  setActivePanel: (panel: PanelType | null ) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 64, y: 0 });
  const [panelSize, setPanelSize] = useState({ width: 400, height: 100 });

  const Icon = activePanel && PANELS[activePanel]?.icon;
  const Component = activePanel && PANELS[activePanel]?.component;

  
  return (
    <>
      {/* Quick Access Bar */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-r-lg p-2 space-y-4">
        {Object.entries(PANELS).map(([key, { icon: Icon }]) => (
          <button
            key={key}
            onClick={() => setActivePanel(key as PanelType)}
            className={`p-2 rounded-lg transition-colors ${
              activePanel === key ? 'bg-primary text-white' : 'hover:bg-primary/10'
            }`}
          >
            <Icon />
          </button>
        ))}
      </div>

      {/* Panel Display */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            drag
            dragConstraints={{ left: 0, right: window.innerWidth - panelSize.width, top: 0, bottom: window.innerHeight - panelSize.height }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              setPanelPosition({ x: info.point.x, y: info.point.y });
            }}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            style={{
              position: 'fixed',
              left: panelPosition.x,
              top: panelPosition.y,
              width: panelSize.width,
              height: panelSize.height,
            }}
            className={`bg-background/95 backdrop-blur-lg border-r border-border/50 ${
              isExpanded ? 'w-[800px]' : 'w-[400px]'
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                {Icon && <Icon />}
                <h2 className="font-semibold">{PANELS[activePanel].title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-primary/10 rounded-lg"
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-primary/10 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 h-[calc(100vh-65px)] overflow-y-auto">
              {Component && <Component />}
            </div>

            <div 
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
            >
              <div className="absolute bottom-0 right-0 w-full h-full 
                border-b-2 border-r-2 border-primary/30 
                group-hover:border-primary/50 
                transition-colors duration-200 
                opacity-50 group-hover:opacity-100"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const PortfolioView = ({ manifesto }: { manifesto: any }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="h-full p-4"
  >
    <h2 className="text-xl font-bold mb-4">Portfolio Overview</h2>
    {/* Portfolio content here */}
  </motion.div>
);

const MoodIndicator = () => {
  const { confidence, mode } = useAIStore(); // Add mode
  const confidenceMotion = useMotionValue(confidence);
  const backgroundColor = useTransform(
    confidenceMotion,
    [0, 0.5, 1],
    ['rgba(239, 68, 68, 0.2)', 'rgba(59, 130, 246, 0.2)', 'rgba(16, 185, 129, 0.2)']
  );

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundColor }}
      animate={{ scale: mode === 'thinking' ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
};

const ParticleField = ({ neuralRef }: { neuralRef: React.RefObject<HTMLCanvasElement | null> }) => (
  <motion.canvas
    ref={neuralRef}
    className="absolute inset-0 pointer-events-none opacity-30"
    style={{ mixBlendMode: 'screen' }}
  />
);

const FeatureDiscovery = () => {
  const [showFeatures, setShowFeatures] = useState(false);

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Instant Trading",
      description: "Just tell the AI what you want to trade - it handles everything"
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: "Smart Portfolio",
      description: "AI automatically balances your portfolio based on market conditions"
    }
  ];

  const FeatureCard = React.memo(({ icon, title, description }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-card/80 rounded-xl p-6"
    >
      {icon}
      <h3 className="text-lg font-semibold mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
    </motion.div>
  ));

  return (
    <AnimatePresence>
      {showFeatures && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center"
        >
          <div className="bg-card rounded-2xl p-8 max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index} 
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
            <Button 
              onClick={() => setShowFeatures(false)}
              className="mt-6 w-full"
              variant="gradient"
            >
              Got it
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const messageContainsTrading = (content: string) => {
  return content.toLowerCase().includes('trade') || 
        content.toLowerCase().includes('swap');
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! I'm S0. I can help manage your crypto assets, execute trades, and provide market insights. Would you like to connect a wallet to get started?",
    action: {
      type: 'connect_wallet'
    }
  }])
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [activeView, setActiveView] = useState<'chat' | 'portfolio'>('chat')
  const [manifesto, setManifesto] = useState<{
    id?: string;
    wallets: { address: string; balance: number; }[];
  } | null>(null);

  const { mode, processInput, confidence } = useAICore();
  const { setMode, feedback } = useAIStore();
  const { startListening, stopListening, audioAnalysis, neuralRef } = useAI();
  const [isListening, setIsListening] = useState(false);

  const [activePanel, setActivePanel] = useState<PanelType | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleVoiceInput = async () => {
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

    setMessages(prev => [...prev, {
      role: 'user',
      content: input,
    }])
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

  const handleAction = async (action: Action) => {
    switch (action.type) {
      case 'connect_wallet':
        const newWallet = { address: '0x...', balance: 0 } // Simulate wallet creation
        setManifesto(prev => ({ ...prev, wallets: [...(prev?.wallets || []), newWallet] }))
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Wallet connected successfully! What would you like to do?'
        } as Message])
        break
      case 'execute_trade':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Trade executed successfully!',
          metadata: {
            transactions: [{
              hash: '0x...',
              status: 'confirmed',
              type: 'swap',
              amount: 1.0,
              token: 'ETH'
            }]
          }
        } as Message])
        break
    }
  }

  //'X-Manifesto-ID': manifesto?.id
  const handleSend = async () => {
    if (!input.trim() || mode === 'thinking') return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setMode('thinking')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) throw new Error('Chat request failed')

      const reader = response.body!.getReader()
      let assistantMessage: Message = { role: 'assistant', content: '' }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        const parsed = JSON.parse(text)
        assistantMessage = { 
          ...assistantMessage, 
          content: assistantMessage.content + parsed.content,
          action: parsed.action,
          metadata: parsed.metadata
        }
        
        setMessages(prev => [...prev.slice(0, -1), assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      } as Message])
    } finally {
      setMode('observing')
    }
  }

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <div className="mt-2 bg-white/10 backdrop-blur rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">{transaction.type}</div>
            <div className="text-sm opacity-80">
              {transaction.amount} {transaction.token}
            </div>
          </div>
        </div>
        <div className="text-sm">
          {transaction.status}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-background/50">
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel}/>
      <ParticleField neuralRef={neuralRef} />
      <MoodIndicator />
      <FeatureDiscovery />
      <FeedbackSystem />
      <AIPersonalityIndicator />
      <motion.div 
        className="w-20 border-r border-border/50"
        initial={false}
        animate={{ width: activeView === 'chat' ? 20 : 96 }}
      >
        <NavigationMenu activeView={activeView} setActiveView={setActiveView} />
      </motion.div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeView === 'chat' ? (
            <div className="flex h-full flex-col bg-background">
              <div className="border-b border-border/50 bg-card/80 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  <span className="font-medium text-card-foreground">S0</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message, i) => (
                    <MessageTransition key={i}>
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-primary to-secondary text-white'
                            : 'bg-card text-card-foreground shadow-md dark:shadow-primary/10'
                        }`}>
                          <div>{message.content}</div>
                          {message.action && message.action.type && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction({ type: message.action!.type, params: message.action!.data })}
                                className="flex items-center gap-2"
                              >
                                {message.action.type === 'connect_wallet' ? (
                                  <><Wallet className="h-4 w-4" /> Connect Wallet</>
                                ) : (
                                  <><RefreshCcw className="h-4 w-4" /> Execute Trade</>
                                )}
                              </Button>
                            </div>
                          )}
                          {message.metadata?.transactions?.map((tx, index) => (
                            <TransactionCard key={index} transaction={tx} />
                          ))}
                        </div>
                      </motion.div>
                    </MessageTransition>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="border-t border-border/50 bg-card/80 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleVoiceInput}
                    size="icon"
                    variant={isListening ? 'destructive' : 'outline'}
                    className="rounded-full"
                  >
                    <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message S0 AI..."
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-3 
                             focus:outline-none focus:ring-2 focus:ring-primary dark:bg-card"
                    disabled={mode === 'thinking'}
                  />
                  <Button 
                    type="submit"
                    disabled={mode === 'thinking'}
                    size="icon"
                    className="rounded-full bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>

              {mode === 'thinking' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <ThinkingTransition>
                      <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="rounded-full bg-primary/20 p-4"
                    >
                      <Brain className="h-8 w-8 text-primary" />
                    </motion.div>
                  </ThinkingTransition>
                </div>
              )}
            </div>
          ) : (
            <PortfolioView manifesto={manifesto} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}