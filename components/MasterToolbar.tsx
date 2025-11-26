import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownUp, 
  Code, 
  Fuel, 
  Sparkles, 
  Wallet,
  Menu,
  X,
  Settings
} from 'lucide-react';

interface ToolbarProps {
  onSwapClick: () => void;
  onContractClick: () => void;
  onBuilderClick: () => void;
  onGasClick: () => void;
  onWalletClick: () => void;
  onSettingsClick: () => void;
  isWalletConnected: boolean;
}

export default function MasterToolbar({
  onSwapClick,
  onContractClick,
  onBuilderClick,
  onGasClick,
  onWalletClick,
  onSettingsClick,
  isWalletConnected
}: ToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const tooltipRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close tooltips after delay
  useEffect(() => {
    if (activeTooltip) {
      const timer = setTimeout(() => setActiveTooltip(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTooltip]);

  const tools = [
    {
      id: 'swap',
      icon: ArrowDownUp,
      label: 'Swap Tokens',
      color: 'blue',
      onClick: () => {
        onSwapClick();
        setIsOpen(false);
      },
      description: 'Exchange tokens instantly'
    },
    {
      id: 'contract',
      icon: Code,
      label: 'Smart Contracts',
      color: 'purple',
      onClick: () => {
        onContractClick();
        setIsOpen(false);
      },
      description: 'Interact with verified contracts'
    },
    {
      id: 'builder',
      icon: Sparkles,
      label: 'Contract Builder',
      color: 'orange',
      onClick: () => {
        onBuilderClick();
        setIsOpen(false);
      },
      description: 'AI contract generation (Soon)'
    },
    {
      id: 'gas',
      icon: Fuel,
      label: 'Gas Tracker',
      color: 'red',
      onClick: () => {
        onGasClick();
        setIsOpen(false);
      },
      description: 'Monitor network fees'
    }
  ];

  return (
    <div className="relative">
      {/* Desktop Toolbar */}
      <div className="hidden md:flex items-center gap-2">
        {tools.map((tool) => (
          <div key={tool.id} className="relative">
            <motion.button
              onClick={tool.onClick}
              onMouseEnter={() => setActiveTooltip(tool.id)}
              onMouseLeave={() => setActiveTooltip(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg transition-all bg-${tool.color}-500/10 hover:bg-${tool.color}-500/20 border border-${tool.color}-500/20 hover:border-${tool.color}-500/40`}
            >
              <tool.icon className={`w-5 h-5 text-${tool.color}-400`} />
            </motion.button>
            
            {/* Tooltip - Fixed positioning */}
            <AnimatePresence>
              {activeTooltip === tool.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100]"
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                    <div className="text-xs font-medium text-white">{tool.label}</div>
                    <div className="text-xs text-gray-400">{tool.description}</div>
                    {/* Arrow */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-t border-l border-white/10 rotate-45" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="h-6 w-px bg-white/10 mx-1" />

        {/* Wallet Button */}
        <button
          onClick={() => {
            onWalletClick();
            setIsOpen(false);
          }}
          className={`px-3 py-2 rounded-lg border transition-all ${
            isWalletConnected
              ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wallet className={`w-4 h-4 ${isWalletConnected ? 'text-green-400' : 'text-gray-400'}`} />
            <span className="text-sm text-white">
              {isWalletConnected ? 'Connected' : 'Connect'}
            </span>
          </div>
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            onSettingsClick();
            setIsOpen(false);
          }}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all relative z-50"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Mobile Menu - Fixed Portal-style Positioning */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-gray-900 border-l border-white/10 shadow-2xl z-50 overflow-y-auto md:hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-white">Tools</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Wallet Status */}
              <div className="p-4 border-b border-white/10">
                <button
                  onClick={() => {
                    onWalletClick();
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all ${
                    isWalletConnected
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <Wallet className={`w-5 h-5 ${isWalletConnected ? 'text-green-400' : 'text-gray-400'}`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">
                      {isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {isWalletConnected ? 'Tap to manage' : 'Required for trading'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Tools */}
              <div className="p-2">
                {tools.map((tool, idx) => (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={tool.onClick}
                    className="w-full p-4 rounded-lg hover:bg-white/5 flex items-center gap-3 transition-all mb-2"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${tool.color}-500/10`}>
                      <tool.icon className={`w-5 h-5 text-${tool.color}-400`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">{tool.label}</div>
                      <div className="text-xs text-gray-400">{tool.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Settings */}
              <div className="p-2 border-t border-white/10">
                <button
                  onClick={() => {
                    onSettingsClick();
                    setIsOpen(false);
                  }}
                  className="w-full p-4 rounded-lg hover:bg-white/5 flex items-center gap-3 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">Settings</div>
                    <div className="text-xs text-gray-400">Preferences & AI prompts</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}