'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/Button'

interface HeroSectionProps {
  onStart: () => void;
}
// The first conversation between human and AI
// What would that look like?

export default function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <div className="relative min-h-[90vh] w-full flex items-center">
      <div className="container relative z-10 mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="mt-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl sm:text-6xl">
            Kirigami
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl bg-transparent">
            AI x Crypto management, automation, and investment services.
          </p>
          
          <div className="mt-10 flex gap-4 sm:flex-row justify-center">
            <Button 
              onClick={onStart} 
              size="lg" 
              withAnimation
              motionProps={{
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 }
              }}
              className="group font-semibold"
              >
              welcome
              <motion.span
                className="ml-2 inline-block"
                whileHover={{ x: 7 }}
              >
              </motion.span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}