import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fuel, TrendingUp, TrendingDown, Minus, RefreshCw, X, Zap } from 'lucide-react';

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
    slow: 0,
    standard: 0,
    fast: 0,
    instant: 0,
    baseFee: 0,
    trend: 'stable'
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchGasData = async () => {
    setIsRefreshing(true);
    
    try {
      const res = await fetch('/api/gas');
      const data = await res.json();
      setGasData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Gas fetch error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGasData();
      const interval = setInterval(fetchGasData, 12000); // Update every 12s
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const calculateCost = (gasPrice: number, gasUnits: number = 21000) => {
    const ethCost = (gasPrice * gasUnits) / 1e9;
    const usdCost = ethCost * 3000; // Mock ETH price
    return { eth: ethCost.toFixed(6), usd: usdCost.toFixed(2) };
  };

  const getTrendIcon = () => {
    switch (gasData.trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (gasData.trend) {
      case 'up': return 'text-red-400';
      case 'down': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatGwei = (value: number) => {
    return value < 1 ? value.toFixed(3) : value.toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-orange-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-white">Gas Tracker</h2>
              <p className="text-xs text-gray-400">Ethereum Mainnet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchGasData}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Current Base Fee */}
        <div className="mb-6 p-5 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Base Fee</span>
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-sm font-semibold ${getTrendColor()}`}>
                {gasData.trend === 'up' ? 'Rising' : gasData.trend === 'down' ? 'Falling' : 'Stable'}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {formatGwei(gasData.baseFee)}
            </span>
            <span className="text-lg text-gray-400">Gwei</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Updated {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* Gas Speed Options */}
        <div className="space-y-3 mb-6">
          {[
            { key: 'slow', label: '🐌 Slow', time: '~5 min', color: 'green' },
            { key: 'standard', label: '⚡ Standard', time: '~2 min', color: 'blue' },
            { key: 'fast', label: '🚀 Fast', time: '~30 sec', color: 'orange' },
            { key: 'instant', label: '⚡️ Instant', time: '~15 sec', color: 'red' }
          ].map(({ key, label, time, color }) => {
            const speed = key as keyof Omit<GasData, 'baseFee' | 'trend'>;
            const gasPrice = gasData[speed];
            const cost = calculateCost(gasPrice);
            
            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02, x: 4 }}
                className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-white/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{label}</span>
                      <span className="text-xs text-gray-500">{time}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-white">
                        {formatGwei(gasPrice)}
                      </span>
                      <span className="text-sm text-gray-400">Gwei</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${cost.usd}</p>
                    <p className="text-xs text-gray-400">{cost.eth} ETH</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
          <p className="text-xs text-blue-400 text-center flex items-center justify-center gap-2">
            <Zap className="w-3 h-3" />
            Gas prices are typically lower during off-peak hours (midnight-6am UTC)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}