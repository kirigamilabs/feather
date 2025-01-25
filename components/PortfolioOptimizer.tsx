import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Settings, RefreshCw, TrendingUp } from 'lucide-react';

interface Asset {
  symbol: string;
  allocation: number;
  currentValue: number;
  suggested: number;
  risk: number;
}

export const PortfolioOptimizer = () => {
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [optimizationLevel, setOptimizationLevel] = React.useState<'conservative' | 'balanced' | 'aggressive'>('balanced');

  const AllocationChart = ({ data }: { data: Asset[] }) => (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="allocation"
          nameKey="symbol"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={`hsl(${index * 45}, 70%, 50%)`} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );

  const OptimizationSlider = () => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Conservative</span>
        <span>Balanced</span>
        <span>Aggressive</span>
      </div>
      <input
        type="range"
        min={0}
        max={2}
        value={['conservative', 'balanced', 'aggressive'].indexOf(optimizationLevel)}
        onChange={(e) => {
          const levels = ['conservative', 'balanced', 'aggressive'];
          setOptimizationLevel(levels[parseInt(e.target.value)] as typeof optimizationLevel);
        }}
        className="w-full"
      />
    </div>
  );

  const AssetCard = ({ asset }: { asset: Asset }) => {
    const change = asset.suggested - asset.allocation;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-4 rounded-lg"
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">{asset.symbol}</span>
          <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
            {change > 0 ? '+' : ''}{(change * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Current</span>
            <span>{(asset.allocation * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Suggested</span>
            <span>{(asset.suggested * 100).toFixed(1)}%</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const OptimizationActions = () => (
    <div className="flex space-x-4">
      <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg">
        <RefreshCw className="w-4 h-4" />
        <span>Rebalance</span>
      </button>
      <button className="flex items-center space-x-2 px-4 py-2 bg-card hover:bg-card/80 rounded-lg">
        <Settings className="w-4 h-4" />
        <span>Settings</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Portfolio Optimization</h2>
        <OptimizationActions />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-4">Current Allocation</h3>
          <AllocationChart data={assets} />
        </div>
        <div>
          <h3 className="font-medium mb-4">Risk Profile</h3>
          <OptimizationSlider />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Suggested Changes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assets.map((asset, i) => (
            <AssetCard key={i} asset={asset} />
          ))}
        </div>
      </div>
    </div>
  );
};