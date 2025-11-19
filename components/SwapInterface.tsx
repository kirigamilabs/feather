import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Settings, Info, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';

// Token list - expandable
const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18, logo: '⟠' },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b', decimals: 6, logo: '💵' },
  { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, logo: '💲' },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, logo: '🪙' },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, logo: '🔷' },
];

interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  rate: string;
  priceImpact: string;
  minimumReceived: string;
  gasEstimate: string;
  route: string[];
}

export default function SwapInterface({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Mock quote fetching - replace with actual DEX aggregator API
  const fetchQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    
    setIsLoadingQuote(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockRate = 1.0002; // Mock exchange rate
      const estimatedOutput = (parseFloat(fromAmount) * mockRate).toFixed(6);
      const minReceived = (parseFloat(estimatedOutput) * (1 - parseFloat(slippage) / 100)).toFixed(6);
      
      setQuote({
        fromAmount,
        toAmount: estimatedOutput,
        rate: mockRate.toString(),
        priceImpact: '0.01',
        minimumReceived: minReceived,
        gasEstimate: '0.003',
        route: [fromToken.symbol, toToken.symbol]
      });
      
      setToAmount(estimatedOutput);
      setIsLoadingQuote(false);
    }, 1000);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (fromAmount) fetchQuote();
    }, 500);
    
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken, slippage]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = () => {
    setShowConfirm(true);
  };

  const executeSwap = async () => {
    // This will integrate with your wallet and DEX router
    console.log('Executing swap:', quote);
    // Add actual swap logic here
    setShowConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light text-white">Swap Tokens</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <label className="block text-sm text-gray-400 mb-2">Slippage Tolerance</label>
                <div className="flex gap-2">
                  {['0.1', '0.5', '1.0'].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        slippage === value
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Custom"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* From Token */}
          <div className="bg-white/5 rounded-xl p-4 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-sm text-gray-400">Balance: 0.0</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl text-white outline-none"
              />
              <select
                value={fromToken.symbol}
                onChange={(e) => setFromToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                className="bg-white/10 px-4 py-2 rounded-lg text-white outline-none cursor-pointer hover:bg-white/20 transition-colors"
              >
                {TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.logo} {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1 z-10 relative">
            <button
              onClick={handleSwapTokens}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-white/10 transition-colors"
            >
              <ArrowDownUp className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">To</span>
              <span className="text-sm text-gray-400">Balance: 0.0</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={toAmount}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl text-white outline-none"
              />
              <select
                value={toToken.symbol}
                onChange={(e) => setToToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[1])}
                className="bg-white/10 px-4 py-2 rounded-lg text-white outline-none cursor-pointer hover:bg-white/20 transition-colors"
              >
                {TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.logo} {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quote Information */}
          {quote && !isLoadingQuote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20"
            >
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-white">1 {fromToken.symbol} = {quote.rate} {toToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Impact</span>
                  <span className={`${parseFloat(quote.priceImpact) > 1 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {quote.priceImpact}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Minimum Received</span>
                  <span className="text-white">{quote.minimumReceived} {toToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Gas</span>
                  <span className="text-white">{quote.gasEstimate} ETH</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoadingQuote && (
            <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm text-gray-400">Fetching best rate...</span>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!quote || !fromAmount || isLoadingQuote}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all shadow-lg"
          >
            {!fromAmount ? 'Enter Amount' : isLoadingQuote ? 'Loading...' : 'Review Swap'}
          </button>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {showConfirm && quote && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6"
              >
                <div className="w-full max-w-sm">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Info className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Confirm Swap</h3>
                    <p className="text-sm text-gray-400">Review your transaction details</p>
                  </div>

                  <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-400">You Pay</span>
                      <span className="text-white font-medium">{quote.fromAmount} {fromToken.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">You Receive</span>
                      <span className="text-white font-medium">{quote.toAmount} {toToken.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Minimum Received</span>
                      <span className="text-white">{quote.minimumReceived} {toToken.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network Fee</span>
                      <span className="text-white">{quote.gasEstimate} ETH</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeSwap}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-white font-medium transition-all"
                    >
                      Confirm Swap
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}