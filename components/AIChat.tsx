import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Wallet, Brain, RefreshCcw, LineChart } from 'lucide-react'
import { Button } from '@/components/Button'

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

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! I'm Feather AI. I can help manage your crypto assets, execute trades, and provide market insights. Would you like to connect a wallet to get started?",
    action: {
      type: 'connect_wallet'
    }
  }])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [activeView, setActiveView] = useState<'chat' | 'portfolio'>('chat')
  const [manifesto, setManifesto] = useState<{
    id?: string;
    wallets: { address: string; balance: number; }[];
  } | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isThinking) return
    await handleSend()
  }

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
    if (!input.trim() || isThinking) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

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
      setIsThinking(false)
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
                  <span className="font-medium text-card-foreground">Feather AI Assistant</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message, i) => (
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
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="border-t border-border/50 bg-card/80 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message Feather AI..."
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-3 
                             focus:outline-none focus:ring-2 focus:ring-primary dark:bg-card"
                    disabled={isThinking}
                  />
                  <Button 
                    type="submit"
                    disabled={isThinking}
                    size="icon"
                    className="rounded-full bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>

              {isThinking && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
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