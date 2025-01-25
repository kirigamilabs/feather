'use client'

import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Bot, ArrowRight } from 'lucide-react'
import { Button } from '@/components/Button'

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const { theme } = useTheme()
  const isDark = true

  return (
    <div className="relative min-h-[90vh] w-full flex items-center">
      {/* Theme-specific backgrounds */}
      {isDark ? (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-background/50" />
          <div className="absolute inset-0">
            {/* Circuit lines */}
            <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 10 10 L 10 0" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                <circle cx="10" cy="10" r="1" fill="currentColor"/>
              </pattern>
              <rect x="0" y="0" width="100" height="100" fill="url(#circuit)"/>
            </svg>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-5" />
      )}

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/50 px-4 py-2 backdrop-blur">
            <Bot className="h-5 w-5 text-primary" />
            <span>Powered by Advanced AI</span>
          </div>
          
          <h1 className="mt-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent sm:text-6xl">
            AI-Powered Crypto Management
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Revolutionary decentralized platform integrating advanced AI capabilities for comprehensive crypto management, automation, and investment services.
          </p>
          
          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
          <Button 
              onClick={onStart} 
              size="lg" 
              variant="gradient"
              withAnimation
              motionProps={{
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 }
              }}
              className="group font-semibold"
              >
              Get Started
              <motion.span
                className="ml-2 inline-block"
                whileHover={{ x: 4 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Ambient particles */}
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"
          />
        </div>
      )}
    </div>
  )
}