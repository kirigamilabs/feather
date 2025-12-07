import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Brain } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'Conversational Execution',
      description: 'Speak naturally. "Swap 0.1 ETH for USDC with low slippage." Done.',
      demo: 'Real-time transaction building from natural language'
    },
    {
      icon: Zap,
      title: 'One-Click Strategies',
      description: 'Complex multi-step operations bundled into single transactions.',
      demo: 'Batch swaps, LP positions, yield optimization—one signature'
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'Every transaction simulated before execution. No surprises.',
      demo: 'Full transparency, full control, full protection'
    }
  ];

  return (
    <section id="features" className="relative py-32 px-6 lg:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Built Different
          </h2>
          <p className="text-xl text-gray-400 font-light">
            Not just another interface. A paradigm shift.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ y: -5 }}
              className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/0 border border-white/10 hover:border-blue-500/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/5 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-light text-white mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="pt-4 border-t border-white/5">
                  <p className="text-sm text-blue-400 font-mono">
                    → {feature.demo}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;