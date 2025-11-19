import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronDown, Zap, Shield, Brain, Menu, X, Check, Users, TrendingUp, Code } from 'lucide-react';

const Navigation = ({ onEnter }: { onEnter: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/40 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xl font-light tracking-tight text-white">
              KIRI/GAMI
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#solutions" className="text-sm text-gray-400 hover:text-white transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a 
              href="https://github.com/kirigamilabs/feather" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Docs
            </a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              onClick={onEnter}
              className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span className="relative z-10 flex items-center gap-2">
                Enter
                <ArrowRight className="w-4 h-4" />
              </span>
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/5"
          >
            <div className="px-6 py-6 space-y-4">
              <a href="#features" className="block text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#security" className="block text-gray-400 hover:text-white transition-colors">
                Security
              </a>
              <a href="#about" className="block text-gray-400 hover:text-white transition-colors">
                About
              </a>
              <button
                onClick={onEnter}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium"
              >
                Enter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const Hero = ({ onWelcome }: { onWelcome: () => void }) => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <motion.section
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          animation: 'grid-flow 20s linear infinite'
        }} />
      </div>

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-8"
        >
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400 font-medium">Alpha Version</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white mb-6"
        >
          Where{' '}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Thoughts
            </span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 blur-2xl opacity-50"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </span>
          <br />
          Become Reality
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-sm md:text-xl text-gray-400 font-light mb-12 max-w-2xl mx-auto"
        >
          The first AI that doesn&apos;t just advise—it executes.
          <br />
          <span className="text-gray-500">Speak your strategy. Watch it happen.</span>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <motion.button
            onClick={onWelcome}
            className="group relative px-12 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-medium overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: '200% 200%' }}
            />
            <span className="relative z-10 flex items-center gap-3">
              Welcome
              <motion.span
                className="inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </span>
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 text-sm text-gray-500"
          >
            No signup. No friction. Just power.
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-gray-600" />
        </motion.div>
      </motion.div>

      {/* Gradient Fade to Next Section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </motion.section>
  );
};


const Features = () => {
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
        {/* Section Header */}
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
          <p className="text-xl text-gray-400 font-light">
            insert demo video here
          </p>
        </motion.div>

        {/* Feature Grid */}
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
              {/* Glow Effect */}
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

const Solutions = () => {
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
            Whether you're just starting or scaling operations, we have a solution for you.
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

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 10 transactions/month',
        'Basic AI insights',
        'Standard execution speed',
        'Community support',
        'Educational resources'
      ],
      cta: 'Start Free',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For serious traders',
      features: [
        'Unlimited transactions',
        'Advanced AI strategies',
        'Priority execution',
        'Priority support',
        'Custom analytics',
        'API access',
        'Gas optimization'
      ],
      cta: 'Start Pro Trial',
      popular: true,
      color: 'blue'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For institutions and teams',
      features: [
        'Everything in Pro',
        'Dedicated infrastructure',
        'Custom integrations',
        'White-label options',
        'SLA guarantees',
        'Compliance tools',
        'Account manager'
      ],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
    }
  ];

  return (
    <section id="pricing" className="relative py-32 px-6 lg:px-12 bg-gradient-to-b from-black via-purple-950/10 to-black">
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
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade, downgrade, or cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ y: -10, scale: plan.popular ? 1.05 : 1.02 }}
              className={`relative p-8 rounded-2xl border transition-all duration-500 ${
                plan.popular
                  ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-blue-500/50 shadow-2xl shadow-blue-500/20'
                  : 'bg-gradient-to-b from-white/5 to-white/0 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {plan.description}
                </p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {plan.period}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3 text-gray-300">
                    <div className={`w-5 h-5 rounded-full ${
                      plan.popular ? 'bg-blue-500' : 'bg-white/10'
                    } flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">
            All plans include end-to-end encryption and security features
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-purple-500" />
              <span>Reliable</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default function HeroSection({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'landing' | 'transition'>('landing');

  const handleWelcome = () => {
    setPhase('transition');
    setTimeout(() => {
        onComplete();
    }, 2000);
    };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <style jsx global>{`
        @keyframes grid-flow {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
        
        body {
          background: #000;
          overflow-x: hidden;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {phase === 'landing' && (
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8 }}
          >
            <Navigation onEnter={handleWelcome} />
            <Hero onWelcome={handleWelcome} />
            <Features />
            <Solutions />
            <Pricing />

          </motion.div>
        )}

        {phase === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-light text-white"
              >
                Welcome home
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}