import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/Button'

export function DisclaimerBanner() {
  const [accepted, setAccepted] = useState(false);
  
  useEffect(() => {
    setAccepted(localStorage.getItem('terms-accepted-v1') === 'true');
  }, []);
  
  if (accepted) return null;
  
  return (
    <motion.div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-6 max-w-lg">
        <h2 className="text-xl font-bold mb-4">⚠️ Important Notice</h2>
        <div className="space-y-2 text-sm mb-6">
          <p>• This is experimental software. Use at your own risk.</p>
          <p>• AI can make mistakes. Always verify transactions.</p>
          <p>• We never ask for private keys or seed phrases.</p>
          <p>• You are responsible for all blockchain transactions.</p>
          <p>• Not financial advice. Do your own research.</p>
        </div>
        <Button 
          onClick={() => {
            localStorage.setItem('terms-accepted-v1', 'true');
            setAccepted(true);
          }}
          className="w-full"
        >
          I Understand the Risks
        </Button>
      </div>
    </motion.div>
  );
}