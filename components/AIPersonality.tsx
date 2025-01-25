import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';
import { useAIStore } from '@/state/aiState';

export const AIPersonalityIndicator = () => {
  const { personality, mode } = useAIStore();
  
  const traits = [
    { name: 'Adaptability', value: personality.adaptability, icon: Sparkles },
    { name: 'Creativity', value: personality.creativity, icon: Brain },
    { name: 'Precision', value: personality.precision, icon: Zap }
  ];

  return (
    <motion.div 
      className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm rounded-xl p-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="space-y-3">
        {traits.map(({ name, value, icon: Icon }) => (
          <div key={name} className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <div className="h-1 bg-background rounded-full">
                <motion.div 
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <span className="text-xs">{(value * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};