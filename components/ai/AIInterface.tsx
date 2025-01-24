import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';

const AIInterface = () => {
  const { theme } = useTheme();
  const [activeMode, setActiveMode] = useState('chat');
  const [isThinking, setIsThinking] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 
                    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Floating Action Menu */}
      <motion.div 
        className="fixed right-8 bottom-8 z-50"
        whileHover={{ scale: 1.05 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl p-4">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setActiveMode('ai')}
              className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              <Brain className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setActiveMode('discover')}
              className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Interface */}
      <div className="max-w-7xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-20"
          >
            <ChatInterface isThinking={isThinking} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Thinking Animation */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center text-white">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className="w-16 h-16" />
              </motion.div>
              <p className="mt-4 text-xl font-light">Thinking...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Discovery */}
      <AnimatePresence>
        {activeMode === 'discover' && (
          <FeatureDiscovery onClose={() => setActiveMode('chat')} />
        )}
      </AnimatePresence>
    </div>
  );
};

const FeatureDiscovery = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center"
  >
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl">
      <div className="grid grid-cols-2 gap-6">
        <FeatureCard
          icon={<Zap className="w-8 h-8 text-yellow-500" />}
          title="Instant Trading"
          description="Just tell the AI what you want to trade - it handles everything"
        />
        <FeatureCard
          icon={<Brain className="w-8 h-8 text-purple-500" />}
          title="Smart Portfolio"
          description="AI automatically balances your portfolio based on market conditions"
        />
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
      >
        Got it
      </button>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
  >
    {icon}
    <h3 className="text-lg font-semibold mt-4">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{description}</p>
  </motion.div>
);

export default AIInterface;