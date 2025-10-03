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
          About Us
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Kirigami is a new age solutions provider founded on the premise that AI x Crypto are the Future.
        </p>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-3xl mx-auto"
      >
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
          <p className="text-card-foreground leading-relaxed">
            <span className="font-bold">Kirigami</span>, founded in 2020, is a pioneering organization 
            focused on the integration of AI and Crypto into society. The impetus behind its creation 
            stemmed from the disparate impact of the pandemic, which laid bare the systemic inefficiencies 
            and disparities within our society.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
          <p className="text-card-foreground leading-relaxed">
            Like the Japanese art of cutting paper that Kirigami credits its name to, our mission is to 
            cut through the layers of society that limit the potential in everything around us. Kirigami 
            seeks to empower individuals and businesses, regardless of their level of expertise, to harness 
            the transformative potential of AI and Crypto.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
          <p className="text-card-foreground leading-relaxed">
            In a world where the powerful few wield capital and technology for their own gain, Kirigami 
            envisions a future where these revolutionary technologies serve the collective good, fostering 
            innovation, equality, and societal progress.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
          <p className="text-card-foreground leading-relaxed">
            Kirigami has grown through the years by focusing on providing the very best of what technology 
            can offer. In the spirit of God, we strive to make all of our partnerships as harmonious as 
            possible, integrating with the upmost care and importance. We believe that if you succeed, we 
            all succeed and for that reason, we will always treat your business as if it were our very own.
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20 text-center">
          <p className="text-lg font-semibold text-card-foreground">
            Our pledge is to do the very best for all.
          </p>
        </div>
      </motion.div>

      {/* Core Values */}
      <div className="mt-12 pt-8 border-t border-border/50">
        <h2 className="text-2xl font-bold text-center mb-8">Our Core Values</h2>
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
              Cutting through limitations to unlock transformative potential in AI and Crypto
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
              Empowering everyone, regardless of expertise, to access revolutionary technology
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
              Fostering societal advancement through harmonious partnerships and integration
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};