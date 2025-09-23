import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketData {
  timestamp: number;
  price: number;
  volume: number;
  sentiment: number;
}

interface Signal {
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
}

export const MarketAnalysis = () => {
  const [selectedTimeframe, setTimeframe] = React.useState('1d');
  const [signals, setSignals] = React.useState<Signal[]>([]);

  const MarketChart = ({ data }: { data: MarketData[] }) => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#3b82f6" 
          dot={false}
          strokeWidth={2} 
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const SentimentIndicator = ({ value }: { value: number }) => (
    <div className="flex items-center space-x-2">
      {value > 0 ? (
        <TrendingUp className="text-green-500" />
      ) : (
        <TrendingDown className="text-red-500" />
      )}
      <div className="h-2 w-24 bg-gray-200 rounded-full">
        <motion.div
          className={`h-full rounded-full ${
            value > 0 ? 'bg-green-500' : 'bg-red-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.abs(value * 100)}%` }}
        />
      </div>
    </div>
  );

  const SignalCard = ({ signal }: { signal: Signal }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg ${
        signal.type === 'buy' 
          ? 'bg-green-500/10' 
          : signal.type === 'sell'
          ? 'bg-red-500/10'
          : 'bg-yellow-500/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">{signal.type} Signal</span>
        <span>{(signal.confidence * 100).toFixed(0)}% Confidence</span>
      </div>
      <p className="text-sm mt-2">{signal.reason}</p>
    </motion.div>
  );

  const TimeframeSelector = () => (
    <div className="flex space-x-2">
      {['1h', '1d', '1w', '1m'].map(tf => (
        <button
          key={tf}
          onClick={() => setTimeframe(tf)}
          className={`px-3 py-1 rounded ${
            selectedTimeframe === tf
              ? 'bg-primary text-white'
              : 'bg-card hover:bg-primary/10'
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Market Analysis</h2>
        <TimeframeSelector />
      </div>

      <MarketChart data={[]} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="font-medium">Market Signals</h3>
          {signals.map((signal, i) => (
            <SignalCard key={i} signal={signal} />
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Risk Analysis</h3>
          {/* Risk metrics visualization */}
        </div>
      </div>
    </div>
  );
};