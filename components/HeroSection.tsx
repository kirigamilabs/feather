'use client'

import { motion } from 'framer-motion'
import { Bot, ArrowRight } from 'lucide-react'
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
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/50 px-4 py-2 backdrop-blur">
            <span>Powered by Kirigami Labs</span>
          </div>
          
          <h1 className="mt-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl sm:text-6xl">
            S0 AI
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl bg-transparent">
            Revolutionary AI for crypto management, automation, and investment services.
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
              className="group font-semibold bg-gray-800"
              >
              Let's Go
              <motion.span
                className="ml-2 inline-block"
                whileHover={{ x: 4 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}