import React from 'react';
import { motion } from 'framer-motion';
import { Check, Users, TrendingUp, Code } from 'lucide-react';

const SolutionsSection = () => {
  const solutions = [
    {
      icon: Users,
      title: 'For Individuals',
      description: 'Personal crypto management made simple',
      features: [
        'Natural language trading',
        'Portfolio optimization',
        'Risk management tools',
        'Market insights & alerts'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'For Traders',
      description: 'Professional-grade execution tools',
      features: [
        'Advanced order types',
        'Multi-DEX routing',
        'MEV protection',
        'Real-time analytics'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Code,
      title: 'For Developers',
      description: 'Build on our AI infrastructure',
      features: [
        'API access',
        'Custom integrations',
        'Smart contract tools',
        'Developer documentation'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section id="solutions" className="relative py-32 px-6 lg:px-12 bg-gradient-to-b from-black via-blue-950/10 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Built for Everyone
          </h2>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
            Whether you&apos;re just starting or scaling operations, we have a solution for you.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ y: -10 }}
              className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/0 border border-white/10 hover:border-white/20 transition-all duration-500"
            >
              {/* Gradient glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center mb-6`}>
                  <solution.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-light text-white mb-3">
                  {solution.title}
                </h3>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {solution.description}
                </p>
                
                <ul className="space-y-3">
                  {solution.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center gap-2 text-gray-300">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${solution.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;