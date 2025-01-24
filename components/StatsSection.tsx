'use client'
import React from 'react';
import { motion } from 'framer-motion';

export const StatsSection = () => {
  const stats = [
    {
      value: "$300B+",
      label: "Institutional Assets",
      description: "Managed on platform"
    },
    {
      value: "30M+",
      label: "Active Users",
      description: "Globally"
    },
    {
      value: "$1T+",
      label: "Market Opportunity",
      description: "For AI-powered services"
    },
    {
      value: "24/7",
      label: "AI Monitoring",
      description: "Real-time analysis"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-white/90 mb-1">{stat.label}</div>
                <div className="text-sm text-white/70">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};