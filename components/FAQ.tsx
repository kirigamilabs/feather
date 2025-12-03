import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, HelpCircle, ExternalLink } from 'lucide-react';

interface FAQProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FAQ: React.FC<FAQProps> = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is this?",
      answer: "KIRIGAMI is an AI-powered crypto management platform that combines natural language processing with DeFi execution. You can trade, analyze markets, and interact with smart contracts simply by chatting with Suguru, our AI assistant."
    },
    {
      question: "Does KIRIGAMI take any fees?",
      answer: "No platform fees. You only pay standard network gas fees for blockchain transactions. All swaps use decentralized exchanges at their native rates. We currently do not charge additional fees on top of what the underlying protocols charge."
    },
    {
      question: "Is it safe?",
      answer: "Yes. KIRIGAMI never has access to your private keys or funds. All transactions require your explicit approval through your connected wallet (MetaMask, WalletConnect, etc.). We use industry-standard security practices and all smart contract interactions are transparent and verifiable on-chain."
    },
    {
      question: "Why do gas fees in MetaMask not match what I see in the UI?",
      answer: "Gas prices fluctuate constantly based on network congestion. MetaMask shows real-time network fees at the exact moment you confirm the transaction, which may differ from our estimates by a few seconds or minutes. Always verify the final gas amount in MetaMask before confirming any transaction."
    },
    {
      question: "Will I be eligible for aggregator airdrops if I swap through KIRIGAMI?",
      answer: "Airdrop eligibility depends on which DEX router or aggregator processes your specific swap. If your trade routes through protocols like 1inch, Paraswap, or CoW Swap, you may qualify for their respective airdrop programs. Check each protocol's official terms and airdrop requirements for details."
    },
    {
      question: "I swapped ETH on CoW Swap but it just disappeared, what happened?",
      answer: "CoW Swap uses batch auctions to find the best price. Your order may take 2-5 minutes to settle as it waits to be included in an optimal batch. This is normal behavior. You can check your transaction status on Etherscan using your wallet address, or view pending orders in your wallet's transaction history. Your funds are safe and will appear once the batch settles."
    }
  ];

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
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Help & FAQ</h2>
                <p className="text-sm text-gray-400">Frequently asked questions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 group"
                  >
                    <span className="font-medium text-white group-hover:text-blue-400 transition-colors flex-1">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-4 pb-4 text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Additional Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl"
            >
              <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <span>💡</span>
                Need More Help?
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Still have questions? We&apos;re here to help! Reach out through any of these channels:
              </p>
              <div className="space-y-2">
                <a
                  href="https://discord.gg/kirigami"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>💬</span>
                  Join our Discord Community
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://twitter.com/kirigamilabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>🐦</span>
                  Follow us on Twitter
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://docs.kirigami.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>📚</span>
                  Read the Documentation
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>

            {/* Beta Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
            >
              <p className="text-xs text-yellow-400 text-center">
                <strong>⚠️ Beta Software:</strong> KIRIGAMI is currently in alpha testing. 
                Always verify transactions and use at your own risk. Report bugs through Discord.
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/50">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-white font-medium transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};