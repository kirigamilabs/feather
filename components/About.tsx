import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Users, Zap } from 'lucide-react';

export const About = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block"
        >
          <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 mb-4">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          About
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Hello
        </p>
      </div>

      {/* Core Values */}
      <div className="mt-12 pt-8 border-t border-border/50">
        <h2 className="text-2xl font-bold text-center mb-8">Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 rounded-xl p-6 border border-border/50 text-center"
          >
            <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Innovation</h3>
            <p className="text-sm text-muted-foreground">
              Cutting through limitations to unlock potential in AI and Crypto
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 rounded-xl p-6 border border-border/50 text-center"
          >
            <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Equality</h3>
            <p className="text-sm text-muted-foreground">
              Empowering everyone, regardless of expertise, through technology
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 rounded-xl p-6 border border-border/50 text-center"
          >
            <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Progress</h3>
            <p className="text-sm text-muted-foreground">
              Fostering societal advancement through harmonious partnerships
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};