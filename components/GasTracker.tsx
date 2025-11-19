import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fuel, TrendingUp, TrendingDown, Activity, RefreshCw, X, Clock } from 'lucide-react';

interface GasData {
  slow: number;
  standard: number;
  fast: number;
  instant: number;
  baseFee: number;
  trend: 'up' | 'down' | 'stable';
}

export default function GasTracker({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [gasData, setGasData] = useState<GasData>({
    slow: 12,
    standard: 18,
    fast: 25,
    instant: 35,
    baseFee: 15,
    trend: 'stable'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<number[]>([15, 18, 20, 17, 16, 15, 18, 22, 19, 18]);
  const [selectedSpeed, setSelectedSpeed] = useState<'slow' | 'standard' | 'fast' | 'instant'>('standard');

  // Simulate gas price updates
  const fetchGasData = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      const baseVariation = (Math.random() - 0.5) * 5;
      const newBaseFee = Math.max(10, gasData.baseFee + baseVariation);
      
      setGasData({
        slow: Math.round(newBaseFee * 0.8),
        standard: Math.round(newBaseFee * 1.2),
        fast: Math.round(newBaseFee * 1.7),
        instant: Math.round(newBaseFee * 2.3),
        baseFee: Math.round(newBaseFee),
        trend: baseVariation > 1 ? 'up' : baseVariation < -1 ? 'down' : 'stable'
      });
      
      setHistory(prev => [...prev.slice(-9), Math.round(newBaseFee)]);
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(fetchGasData, 15000); // Update every 15s
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const calculateCost = (gasPrice: number, gasUnits: number = 21000) => {
    // ETH price mock: $3000
    const ethCost = (gasPrice * gasUnits) / 1e9;
    const usdCost = ethCost * 3000;
    return { eth: ethCost.toFixed(6), usd: usdCost.toFixed(2) };
  };

  const getTimeEstimate = (speed: string) => {
    switch (speed) {
      case 'slow': return '5-10 min';
      case 'standard': return '2-5 min';
      case 'fast': return '< 2 min';
      case 'instant': return '< 30 sec';
      default: return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white">Gas Tracker</h2>
              <p className="text-sm text-gray-400">Ethereum Mainnet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchGasData}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Base Fee</span>
            <div className="flex items-center gap-2">
              {gasData.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
              {gasData.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-400" />}
              {gasData.trend === 'stable' && <Activity className="w-4 h-4 text-gray-400" />}
              <span className={`text-sm font-semibold ${
                gasData.trend === 'up' ? 'text-red-400' : 
                gasData.trend === 'down' ? 'text-green-400' : 
                'text-gray-400'
              }`}>
                {gasData.trend === 'up' ? 'Rising' : gasData.trend === 'down' ? 'Falling' : 'Stable'}
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            {gasData.baseFee} <span className="text-lg text-gray-400">Gwei</span>
          </div>
        </div>

        {/* Gas Price Options */}
        <div className="space-y-3 mb-6">
          {[
            { key: 'slow', label: 'Slow', icon: '🐌', color: 'green' },
            { key: 'standard', label: 'Standard', icon: '⚡', color: 'blue' },
            { key: 'fast', label: 'Fast', icon: '🚀', color: 'orange' },
            { key: 'instant', label: 'Instant', icon: '⚡️', color: 'red' }
          ].map(({ key, label, icon, color }) => {
            const speed = key as keyof typeof gasData;
            const cost = calculateCost(gasData[speed]);
            const isSelected = selectedSpeed === speed;
            
            return (
              <motion.button
                key={key}
                onClick={() => setSelectedSpeed(speed)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl border transition-all ${
                  isSelected
                    ? `bg-${color}-500/20 border-${color}-500/50`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{label}</h3>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeEstimate(speed)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{gasData[speed]} Gwei</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${cost.usd}</p>
                    <p className="text-xs text-gray-400">{cost.eth} ETH</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Historical Chart (Simple) */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Last 10 Updates</h3>
          <div className="flex items-end justify-between h-24 gap-1">
            {history.map((value, idx) => {
              const maxValue = Math.max(...history);
              const height = (value / maxValue) * 100;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-t"
                  title={`${value} Gwei`}
                />
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-blue-400 text-center">
            💡 Gas prices are lower during off-peak hours (typically midnight-6am UTC)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}