import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Code, Shield, Zap, X, ArrowRight } from 'lucide-react';

export default function ContractBuilder({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = () => {
    if (email) {
      // Store email for waitlist
      console.log('Waitlist signup:', email);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setEmail('');
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-black border border-purple-500/30 rounded-2xl p-8 w-full max-w-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-3">
              AI Contract Builder
            </h2>
            <p className="text-gray-300 text-lg mb-2">
              Generate, audit, and deploy smart contracts with AI
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <Rocket className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">Coming Soon</span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <Code className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Natural Language</h3>
              <p className="text-sm text-gray-400">
                Describe your contract in plain English, AI generates the code
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Auto-Audit</h3>
              <p className="text-sm text-gray-400">
                Built-in security analysis and vulnerability detection
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">One-Click Deploy</h3>
              <p className="text-sm text-gray-400">
                Deploy to any EVM chain instantly with gas optimization
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Template Library</h3>
              <p className="text-sm text-gray-400">
                Start from battle-tested templates: ERC-20, NFTs, DAOs, and more
              </p>
            </motion.div>
          </div>

          {/* Example Use Cases */}
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
            <h3 className="text-white font-semibold mb-3 text-center">What You&apos;ll Be Able To Build:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Custom ERC-20 Tokens
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                NFT Collections
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Staking Contracts
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                DAO Governance
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Vesting Schedules
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Payment Splitters
              </div>
            </div>
          </div>

          {/* Waitlist Form */}
          {!submitted ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Get notified when we launch
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <button
                onClick={handleNotify}
                disabled={!email}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Join Waitlist
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">You&apos;re on the list!</h3>
              <p className="text-gray-400">We&apos;ll notify you when the Contract Builder launches.</p>
            </motion.div>
          )}

          {/* Footer Note */}
          <p className="text-xs text-center text-gray-500 mt-6">
            Expected launch: Q2 2025 • Early access for waitlist members
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}