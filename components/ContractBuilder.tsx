import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Rocket, Code, Shield, Zap, X, ArrowRight, Loader2, CheckCircle, Copy } from 'lucide-react';

interface ContractBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContractBuilder({ isOpen, onClose }: ContractBuilderProps) {
  const [email, setEmail] = useState('');
  const [contractName, setContractName] = useState('');
  const [contractDescription, setContractDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');

  const templates = [
    {
      id: 'erc20',
      name: 'ERC-20 Token',
      description: 'Standard fungible token with transfer, mint, and burn capabilities',
      icon: '🪙',
      difficulty: 'Beginner',
      features: ['Transfer', 'Mint', 'Burn', 'Allowance']
    },
    {
      id: 'erc721',
      name: 'NFT Collection',
      description: 'Non-fungible token standard for unique digital assets',
      icon: '🖼️',
      difficulty: 'Intermediate',
      features: ['Minting', 'Metadata', 'Royalties', 'Enumerable']
    },
    {
      id: 'staking',
      name: 'Staking Contract',
      description: 'Lock tokens and earn rewards over time',
      icon: '💰',
      difficulty: 'Intermediate',
      features: ['Stake', 'Unstake', 'Rewards', 'Timelock']
    },
    {
      id: 'dao',
      name: 'DAO Governance',
      description: 'Decentralized voting and proposal execution',
      icon: '🏛️',
      difficulty: 'Advanced',
      features: ['Proposals', 'Voting', 'Execution', 'Timelock']
    },
    {
      id: 'vesting',
      name: 'Token Vesting',
      description: 'Release tokens gradually over a schedule',
      icon: '⏰',
      difficulty: 'Intermediate',
      features: ['Linear Vesting', 'Cliff', 'Revocable', 'Multiple Beneficiaries']
    },
    {
      id: 'multisig',
      name: 'Multi-Signature Wallet',
      description: 'Require multiple approvals for transactions',
      icon: '🔐',
      difficulty: 'Advanced',
      features: ['Multi-Approval', 'Owner Management', 'Transaction Queue', 'Revocable']
    }
  ];

  const handleNotify = () => {
    if (email) {
      console.log('Waitlist signup:', email);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setEmail('');
      }, 2000);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedCode(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${contractName || 'MyToken'}
 * @dev ${contractDescription || 'AI-Generated Smart Contract'}
 */
contract ${contractName.replace(/\s+/g, '') || 'MyToken'} is ERC20, Ownable {
    constructor() ERC20("${contractName || 'MyToken'}", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-black border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Contract Builder</h2>
                <p className="text-sm text-gray-400">Generate, audit, and deploy smart contracts with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">Coming Soon</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="relative flex gap-2 px-6 pt-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 rounded-t-xl font-medium transition-all relative ${
                activeTab === 'templates'
                  ? 'text-white bg-white/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Templates
              {activeTab === 'templates' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-6 py-3 rounded-t-xl font-medium transition-all relative ${
                activeTab === 'custom'
                  ? 'text-white bg-white/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Custom Build
              {activeTab === 'custom' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="relative flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'templates' ? (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {templates.map((template, idx) => (
                      <motion.button
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-5 rounded-xl border transition-all text-left ${
                          selectedTemplate === template.id
                            ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                            : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{template.icon}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                            template.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {template.difficulty}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* What You'll Be Able To Build */}
                  <div className="p-5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      What You'll Be Able To Build
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        'Custom ERC-20 Tokens',
                        'NFT Collections',
                        'Staking Contracts',
                        'DAO Governance',
                        'Vesting Schedules',
                        'Payment Splitters',
                        'Multisig Wallets',
                        'DeFi Protocols'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="custom"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {!generatedCode ? (
                    <>
                      {/* Custom Contract Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contract Name
                          </label>
                          <input
                            type="text"
                            value={contractName}
                            onChange={(e) => setContractName(e.target.value)}
                            placeholder="e.g., MyAwesomeToken"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={contractDescription}
                            onChange={(e) => setContractDescription(e.target.value)}
                            placeholder="Describe what your contract should do... (e.g., A token that gives holders voting rights and staking rewards)"
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                          />
                        </div>

                        <button
                          onClick={handleGenerate}
                          disabled={!contractName || !contractDescription || isGenerating}
                          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generating with AI...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Smart Contract
                            </>
                          )}
                        </button>
                      </div>

                      {/* Features Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: <Code className="w-5 h-5" />, title: 'Natural Language', desc: 'Describe in plain English' },
                          { icon: <Shield className="w-5 h-5" />, title: 'Auto-Audit', desc: 'Built-in security checks' },
                          { icon: <Zap className="w-5 h-5" />, title: 'One-Click Deploy', desc: 'Deploy to any EVM chain' },
                          { icon: <Sparkles className="w-5 h-5" />, title: 'Battle-Tested', desc: 'Based on OpenZeppelin' }
                        ].map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-purple-400">{feature.icon}</div>
                              <h3 className="text-white font-semibold">{feature.title}</h3>
                            </div>
                            <p className="text-sm text-gray-400">{feature.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      {/* Success Message */}
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="font-medium text-green-400">Contract Generated!</p>
                          <p className="text-sm text-green-400/80">Review and deploy to any EVM chain</p>
                        </div>
                      </div>

                      {/* Code Display */}
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-300">Generated Contract</h3>
                          <button
                            onClick={copyToClipboard}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 flex items-center gap-2 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                        </div>
                        <pre className="p-4 bg-black/50 border border-white/10 rounded-xl overflow-x-auto text-sm text-gray-300 font-mono max-h-96">
                          {generatedCode}
                        </pre>
                      </div>

                      <button
                        onClick={() => setGeneratedCode('')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                      >
                        Generate Another
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="relative p-6 border-t border-white/10 bg-black/50">
            {!submitted ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Get notified when we launch
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <button
                      onClick={handleNotify}
                      disabled={!email}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all shadow-lg flex items-center gap-2"
                    >
                      Join Waitlist
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-500">
                  Expected launch: Q2 2025 • Early access for waitlist members
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
                <p className="text-gray-400">We'll notify you when the Contract Builder launches.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}