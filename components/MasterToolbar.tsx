import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowDownUp, 
  Code, 
  Fuel, 
  Sparkles, 
  Wallet,
  Menu,
  X,
  Settings,
  HelpCircle
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

  const tools = [
    {
      id: 'swap',
      icon: ArrowDownUp,
      label: 'Swap Tokens',
      color: 'blue',
      onClick: onSwapClick,
      description: 'Exchange tokens instantly'
    },
    {
      id: 'contract',
      icon: Code,
      label: 'Smart Contracts',
      color: 'purple',
      onClick: onContractClick,
      description: 'Interact with verified contracts'
    },
    {
      id: 'builder',
      icon: Sparkles,
      label: 'Contract Builder',
      color: 'orange',
      onClick: onBuilderClick,
      description: 'AI contract generation (Soon)'
    },
    {
      id: 'gas',
      icon: Fuel,
      label: 'Gas Tracker',
      color: 'red',
      onClick: onGasClick,
      description: 'Monitor network fees'
    }
  ];

  return (
    <>
      {/* Desktop Toolbar */}
      <div className="hidden md:flex items-center gap-2">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            onClick={tool.onClick}
            onMouseEnter={() => setActiveTooltip(tool.id)}
            onMouseLeave={() => setActiveTooltip(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-2 rounded-lg bg-${tool.color}-500/10 hover:bg-${tool.color}-500/20 border border-${tool.color}-500/20 hover:border-${tool.color}-500/40 transition-all`}
          >
            <tool.icon className={`w-5 h-5 text-${tool.color}-400`} />
            
            {/* Tooltip */}
            {activeTooltip === tool.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-white/10 rounded-lg px-3 py-2 z-50"
              >
                <div className="text-xs font-medium text-white">{tool.label}</div>
                <div className="text-xs text-gray-400">{tool.description}</div>
              </motion.div>
            )}
          </motion.button>
        ))}

        <div className="h-6 w-px bg-white/10 mx-1" />

        {/* Wallet Button */}
        <button
          onClick={onWalletClick}
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
          onClick={onSettingsClick}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden md:hidden"
        >
          {/* Wallet Status */}
          <div className="p-4 border-b border-white/10">
            <button
              onClick={() => {
                onWalletClick();
                setIsOpen(false);
              }}
              className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
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
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  tool.onClick();
                  setIsOpen(false);
                }}
                className="w-full p-3 rounded-lg hover:bg-white/5 flex items-center gap-3 transition-all"
              >
                <div className={`w-10 h-10 rounded-lg bg-${tool.color}-500/10 flex items-center justify-center`}>
                  <tool.icon className={`w-5 h-5 text-${tool.color}-400`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-white">{tool.label}</div>
                  <div className="text-xs text-gray-400">{tool.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={() => {
                onSettingsClick();
                setIsOpen(false);
              }}
              className="w-full p-3 rounded-lg hover:bg-white/5 flex items-center gap-3 transition-all"
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
      )}
    </>
  );
}

// Quick Action FAB (Floating Action Button) for mobile
export function QuickActionFAB({
  onActionClick
}: {
  onActionClick: (action: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { id: 'swap', icon: ArrowDownUp, color: 'blue', label: 'Swap' },
    { id: 'gas', icon: Fuel, color: 'orange', label: 'Gas' },
    { id: 'contract', icon: Code, color: 'purple', label: 'Contract' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      {/* Expanded Actions */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-16 right-0 space-y-3"
        >
          {actions.map((action, idx) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                onActionClick(action.id);
                setIsExpanded(false);
              }}
              className={`flex items-center gap-3 bg-${action.color}-600 hover:bg-${action.color}-500 px-4 py-3 rounded-full shadow-lg`}
            >
              <action.icon className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        animate={{ rotate: isExpanded ? 45 : 0 }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-2xl flex items-center justify-center"
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  );
}