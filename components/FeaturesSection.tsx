import React, { FC } from 'react';
import { LucideIcon, Bot, ChartLine, Brain, Wallet } from 'lucide-react';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const FeatureCard: FC<FeatureCardProps> = ({ title, description, icon: Icon }) => (
  <div className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="absolute -top-6 left-6">
      <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      title: "Intelligent Portfolio Management",
      description: "AI-driven portfolio optimization and rebalancing with personalized investment recommendations.",
      icon: Brain,
    },
    {
      title: "Automated Trading Strategies",
      description: "Deploy customizable AI trading bots for market-making, arbitrage, and alpha-seeking.",
      icon: Bot,
    },
    {
      title: "Market Insights",
      description: "AI-generated analysis, alerts, and predictive modeling of market conditions.",
      icon: ChartLine,
    },
    {
      title: "DeFi Integration",
      description: "Seamless access to lending, borrowing, and staking with AI-optimized strategies.",
      icon: Wallet,
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Circuit Pattern Background */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Revolutionary Features
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Harness the power of AI for your crypto investments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;