import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, X, ExternalLink } from 'lucide-react';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '@/components//LegalContent';

export function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-light text-white">Terms of Service</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300">
            <div>
              <p className="text-sm text-gray-400 mb-4">Last Updated: November 19, 2025</p>
              <p className="mb-4">
                Welcome to KIRIGAMI AI Platform (&quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;). By accessing or using our services, you agree to be bound by these Terms of Service.
              </p>
            </div>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h3>
              <p className="mb-2">
                By using KIRIGAMI, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, you may not use our services.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">2. Service Description</h3>
              <p className="mb-2">
                KIRIGAMI provides AI-powered tools for cryptocurrency management, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Natural language crypto trading interfaces</li>
                <li>Portfolio optimization suggestions</li>
                <li>Market analysis and insights</li>
                <li>Smart contract interactions</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">3. User Responsibilities</h3>
              <p className="mb-2">You agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide accurate information</li>
                <li>Maintain the security of your wallet and private keys</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the service for illegal activities</li>
                <li>Verify all transactions before execution</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">4. Risks and Disclaimers</h3>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
                <p className="font-semibold text-red-400 mb-2">⚠️ IMPORTANT DISCLAIMERS:</p>
                <ul className="space-y-2 text-sm">
                  <li>• Cryptocurrency trading involves substantial risk of loss</li>
                  <li>• AI suggestions are not financial advice</li>
                  <li>• Past performance does not guarantee future results</li>
                  <li>• You are solely responsible for all transactions</li>
                  <li>• Smart contract interactions are irreversible</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">5. No Financial Advice</h3>
              <p>
                KIRIGAMI does not provide financial, investment, tax, or legal advice. All information is for educational purposes only. Consult with qualified professionals before making financial decisions.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">6. Limitation of Liability</h3>
              <p className="mb-2">
                To the maximum extent permitted by law, KIRIGAMI and its operators shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Any losses from trading or investment decisions</li>
                <li>Smart contract failures or exploits</li>
                <li>Network outages or technical issues</li>
                <li>Loss of funds due to user error</li>
                <li>Third-party service failures</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">7. Privacy & Data</h3>
              <p>
                We collect minimal data necessary for service operation. We never access your private keys or seed phrases. See our Privacy Policy for details.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">8. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. Continued use of the service constitutes acceptance of modified Terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">9. Governing Law</h3>
              <p>
                These Terms are governed by applicable international laws. Disputes shall be resolved through arbitration.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">10. Contact</h3>
              <p>
                For questions about these Terms, contact us through our support channels.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function PrivacyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-light text-white">Privacy Policy</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300">
            <div>
              <p className="text-sm text-gray-400 mb-4">Last Updated: November 19, 2025</p>
              <p className="mb-4">
                KIRIGAMI Labs (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.
              </p>
            </div>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h3>
              
              <h4 className="font-semibold text-white mt-4 mb-2">Information You Provide:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Wallet addresses (public only)</li>
                <li>Communication preferences</li>
                <li>User settings and preferences</li>
              </ul>

              <h4 className="font-semibold text-white mt-4 mb-2">Automatically Collected:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Usage data and analytics</li>
                <li>Device information</li>
                <li>IP addresses (anonymized)</li>
                <li>Transaction metadata (not content)</li>
              </ul>

              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="font-semibold text-green-400 mb-2">🔒 What We DON&apos;T Collect:</p>
                <ul className="space-y-1 text-sm">
                  <li>• Private keys or seed phrases</li>
                  <li>• Password information</li>
                  <li>• Personal identification documents</li>
                  <li>• Financial account details</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">2. How We Use Information</h3>
              <p className="mb-2">We use collected information to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide and improve our services</li>
                <li>Personalize your experience</li>
                <li>Analyze usage patterns and trends</li>
                <li>Communicate service updates</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">3. Data Sharing</h3>
              <p className="mb-2">We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Service providers (analytics, hosting)</li>
                <li>Legal authorities when required by law</li>
                <li>Blockchain networks (public wallet addresses only)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">4. Data Security</h3>
              <p>
                We implement industry-standard security measures including encryption, secure connections, and regular security audits. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">5. Blockchain Transparency</h3>
              <p>
                All blockchain transactions are permanently recorded on public ledgers. While wallet addresses are pseudonymous, transaction history is publicly visible and cannot be deleted.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">6. Cookies and Tracking</h3>
              <p className="mb-2">
                We use cookies and similar technologies for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Essential service functionality</li>
                <li>Analytics and performance monitoring</li>
                <li>User preference storage</li>
              </ul>
              <p className="mt-2 text-sm">
                You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">7. Your Rights</h3>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Opt-out of non-essential data collection</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">8. Children&apos;s Privacy</h3>
              <p>
                Our services are not intended for users under 18 years of age. We do not knowingly collect information from children.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">9. International Users</h3>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">10. Changes to Policy</h3>
              <p>
                We may update this Privacy Policy periodically. Material changes will be notified through the platform.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">11. Contact Us</h3>
              <p>
                For privacy-related questions or to exercise your rights, contact our privacy team through the support channels.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Footer component to add to chat interface
export function LegalFooter() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 py-3 border-t border-white/10">
        <button
          onClick={() => setShowTerms(true)}
          className="hover:text-gray-300 transition-colors flex items-center gap-1"
        >
          <FileText className="w-3 h-3" />
          Terms
        </button>
        <span>•</span>
        <button
          onClick={() => setShowPrivacy(true)}
          className="hover:text-gray-300 transition-colors flex items-center gap-1"
        >
          <Shield className="w-3 h-3" />
          Privacy
        </button>
        <span>•</span>
        <a
          href="https://github.com/kirigamilabs/feather"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors flex items-center gap-1"
        >
          Docs
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  );
}