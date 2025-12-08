import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, X, ExternalLink } from 'lucide-react';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '@/components/LegalContent';

// Reusable formatter for legal content
const LegalContentDisplay = ({ content }: { content: string }) => {
  return (
    <div className="space-y-4">
      {content.split('\n\n').map((section, idx) => {
        const trimmed = section.trim();
        if (!trimmed) return null;
        
        // Detect different heading levels
        const isMainHeading = /^[A-Z\s]{10,}$/.test(trimmed) && trimmed.length < 150;
        const isNumberedSection = /^\d+\.\s+[A-Z]/.test(trimmed);
        const isSubSection = /^\d+\.\d+\s+/.test(trimmed);
        
        if (isMainHeading) {
          return (
            <h3 key={idx} className="text-xl font-bold text-white mt-8 mb-4 first:mt-0">
              {trimmed}
            </h3>
          );
        }
        
        if (isNumberedSection) {
          return (
            <h4 key={idx} className="text-lg font-semibold text-white mt-6 mb-3">
              {trimmed}
            </h4>
          );
        }
        
        if (isSubSection) {
          return (
            <h5 key={idx} className="text-base font-semibold text-gray-200 mt-4 mb-2">
              {trimmed}
            </h5>
          );
        }
        
        return (
          <p key={idx} className="text-gray-300 leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};

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
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Terms of Service</h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <LegalContentDisplay content={TERMS_OF_SERVICE} />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-gray-900/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-500/20"
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
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Privacy Policy</h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <LegalContentDisplay content={PRIVACY_POLICY} />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-gray-900/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors shadow-lg shadow-green-500/20"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function LegalFooter() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 py-3 border-t border-white/5">
        <button
          onClick={() => setShowTerms(true)}
          className="hover:text-gray-300 transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-3 h-3" />
          Terms
        </button>
        <span className="text-gray-700">•</span>
        <button
          onClick={() => setShowPrivacy(true)}
          className="hover:text-gray-300 transition-colors flex items-center gap-1.5"
        >
          <Shield className="w-3 h-3" />
          Privacy
        </button>
        <span className="text-gray-700">•</span>
        <a
          href="https://github.com/kirigamilabs"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors flex items-center gap-1.5"
        >
          GitHub
          <ExternalLink className="w-3 h-3" />
        </a>
        <span className="text-gray-700">•</span>
        <a
          className="hover:text-gray-300 transition-colors flex items-center gap-1.5"
        >
          © Kirigami 2025
        </a>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </>
  );
}