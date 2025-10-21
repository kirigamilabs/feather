'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import AIChat from '@/components/AIChat'

export default function Home() {
  const [showChat, setShowChat] = useState(false)

  return (
    <main className="h-screen overflow-hidden fixed inset-0">
      <AnimatePresence mode="wait">
        {showChat ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-background"
          >
            <AIChat />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <HeroSection onStart={() => setShowChat(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}