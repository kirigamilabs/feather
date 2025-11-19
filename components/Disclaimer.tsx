import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, FileText, ExternalLink } from 'lucide-react';

export default function DisclaimerBanner() {
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  useEffect(() => {
    const stored = localStorage.getItem('terms-accepted-v2');
    setAccepted(stored === 'true');
  }, []);
  
  if (accepted) return null;
  
  const handleAccept = () => {
    if (!agreedToTerms) {
      alert('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }
    
    localStorage.setItem('terms-accepted-v2', 'true');
    setAccepted(true);
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Warning Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              ⚠️ Important Notice
            </h2>
            <p className="text-gray-400">
              Please read carefully before proceeding
            </p>
          </div>

          {/* Risk Disclosures */}
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Critical Warnings
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Experimental Software:</strong> This platform is in alpha. Use at your own risk.</li>
                <li>• <strong>AI Can Make Mistakes:</strong> Always verify AI suggestions before executing transactions.</li>
                <li>• <strong>Irreversible Transactions:</strong> Blockchain transactions cannot be undone.</li>
                <li>• <strong>Financial Risk:</strong> You may lose all funds. Never invest more than you can afford to lose.</li>
                <li>• <strong>Not Financial Advice:</strong> All information is for educational purposes only.</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h3 className="text-yellow-400 font-semibold mb-2">Security Best Practices</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Never share your private keys or seed phrases with anyone</li>
                <li>• We will NEVER ask for your private keys</li>
                <li>• Always verify contract addresses before approving transactions</li>
                <li>• Use hardware wallets for large amounts</li>
                <li>• Enable all available security features in your wallet</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">Your Responsibilities</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• You are solely responsible for all transactions</li>
                <li>• You must verify all transaction details before confirming</li>
                <li>• You are responsible for securing your wallet and keys</li>
                <li>• You must comply with all applicable laws and regulations</li>
                <li>• You acknowledge that crypto markets are highly volatile</li>
              </ul>
            </div>
          </div>

          {/* Legal Agreement */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold mb-3">Legal Agreement</h3>
            <p className="text-sm text-gray-300 mb-4">
              By using KIRIGAMI, you acknowledge that you have read, understood, and agree to our:
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowTerms(true)}
                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-white">
                  <FileText className="w-4 h-4" />
                  Terms of Service
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setShowPrivacy(true)}
                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-white">
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Checkbox Agreement */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              I have read and agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>. 
              I understand the risks involved in cryptocurrency trading and smart contract interactions. 
              I acknowledge that I am solely responsible for my actions and any resulting losses.
            </span>
          </label>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={!agreedToTerms}
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              agreedToTerms
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {agreedToTerms ? 'I Accept & Understand the Risks' : 'Please Accept Terms to Continue'}
          </button>

          {/* Additional Warning */}
          <div className="mt-6 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400 text-center">
              ⚠️ By clicking "I Accept", you confirm that you are 18+ years old and legally permitted to use cryptocurrency services in your jurisdiction.
            </p>
          </div>
        </motion.div>

        {/* Terms Modal (simplified - full version should be in separate component) */}
        {showTerms && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4">
            <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Terms of Service</h3>
                <button
                  onClick={() => setShowTerms(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="text-gray-300 space-y-4 text-sm">
                <p>Full terms of service content would go here...</p>
                <p className="text-red-400 font-semibold">
                  This is a placeholder. Actual terms would be comprehensive legal documentation.
                </p>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Privacy Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4">
            <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Privacy Policy</h3>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="text-gray-300 space-y-4 text-sm">
                <p>Full privacy policy content would go here...</p>
                <p className="text-green-400 font-semibold">
                  This is a placeholder. Actual policy would detail data collection and usage.
                </p>
              </div>
              <button
                onClick={() => setShowPrivacy(false)}
                className="mt-6 w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}