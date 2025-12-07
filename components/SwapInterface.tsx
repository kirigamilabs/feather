import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Settings, Info, AlertTriangle, CheckCircle, Loader2, X, ExternalLink, Zap, ChevronDown } from 'lucide-react';
import { parseUnits, formatUnits, isAddress, erc20Abi } from 'viem';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';

// Sepolia testnet addresses
const TOKENS = [
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    address: '0x0000000000000000000000000000000000000000', 
    decimals: 18, 
    logo: '⟠'
  },
  { 
    symbol: 'WETH', 
    name: 'Wrapped Ether', 
    address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', 
    decimals: 18, 
    logo: '🔷' 
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', 
    decimals: 6, 
    logo: '💵' 
  },
];

// Uniswap V3 Router on Sepolia
const UNISWAP_ROUTER = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';
const WETH_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';

// WETH ABI for wrap/unwrap
const WETH_ABI = [
  {
    constant: false,
    inputs: [],
    name: 'deposit',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'wad', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Uniswap V3 Router ABI (simplified)
const ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;

export default function SwapInterface({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);

  // Get ETH balance
  const { data: ethBalance } = useBalance({ address });

  // Get ERC20 balance for from token
  const { data: fromTokenBalance, refetch: refetchFromBalance } = useReadContract({
    address: fromToken.address !== '0x0000000000000000000000000000000000000000' 
      ? fromToken.address as `0x${string}` 
      : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Get ERC20 balance for to token
  const { data: toTokenBalance } = useReadContract({
    address: toToken.address !== '0x0000000000000000000000000000000000000000' 
      ? toToken.address as `0x${string}` 
      : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Check allowance for from token
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: fromToken.address !== '0x0000000000000000000000000000000000000000' 
      ? fromToken.address as `0x${string}` 
      : undefined,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, UNISWAP_ROUTER as `0x${string}`] : undefined,
  });

  const { writeContract, data: contractHash, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: contractHash });

  const fromBalanceFormatted = useMemo(() => {
    if (fromToken.address === '0x0000000000000000000000000000000000000000') {
      return ethBalance ? formatUnits(ethBalance.value, 18) : '0';
    }
    return fromTokenBalance ? formatUnits(fromTokenBalance as bigint, fromToken.decimals) : '0';
  }, [fromToken, ethBalance, fromTokenBalance]);

  const toBalanceFormatted = useMemo(() => {
    if (toToken.address === '0x0000000000000000000000000000000000000000') {
      return ethBalance ? formatUnits(ethBalance.value, 18) : '0';
    }
    return toTokenBalance ? formatUnits(toTokenBalance as bigint, toToken.decimals) : '0';
  }, [toToken, ethBalance, toTokenBalance]);

  // Estimate output amount (simplified - real implementation would use Uniswap quoter)
  const estimateOutput = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      return;
    }

    setIsLoadingQuote(true);
    setError(undefined);

    try {
      // Simple estimation - in production, use Uniswap Quoter contract
      let rate = 1;
      
      if (fromToken.symbol === 'ETH' && toToken.symbol === 'WETH') {
        rate = 1; // 1:1 for wrapping
      } else if (fromToken.symbol === 'WETH' && toToken.symbol === 'ETH') {
        rate = 1; // 1:1 for unwrapping
      } else if (fromToken.symbol === 'WETH' && toToken.symbol === 'USDC') {
        rate = 3000; // Mock: 1 ETH = 3000 USDC
      } else if (fromToken.symbol === 'USDC' && toToken.symbol === 'WETH') {
        rate = 1 / 3000; // Mock: 1 USDC = 0.000333 ETH
      } else if (fromToken.symbol === 'ETH' && toToken.symbol === 'USDC') {
        rate = 3000; // Mock: 1 ETH = 3000 USDC
      } else if (fromToken.symbol === 'USDC' && toToken.symbol === 'ETH') {
        rate = 1 / 3000;
      }

      const estimated = parseFloat(fromAmount) * rate;
      setToAmount(estimated.toFixed(6));
    } catch (err) {
      console.error('Quote error:', err);
      setError('Failed to get quote');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount && fromToken && toToken) {
        estimateOutput();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const needsApproval = useMemo(() => {
    if (fromToken.address === '0x0000000000000000000000000000000000000000') return false;
    if (!fromAmount || !allowance) return false;
    
    const amountBigInt = parseUnits(fromAmount, fromToken.decimals);
    return (allowance as bigint) < amountBigInt;
  }, [fromToken, fromAmount, allowance]);

  const handleApprove = async () => {
    if (!address) return;
    
    try {
      setError(undefined);
      const amountToApprove = parseUnits(fromAmount, fromToken.decimals);
      
      writeContract({
        address: fromToken.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [UNISWAP_ROUTER as `0x${string}`, amountToApprove * BigInt(2)], // Approve 2x for future txs
      });
    } catch (err: any) {
      setError(err.message || 'Approval failed');
    }
  };

  const handleSwap = async () => {
    if (!address || !fromAmount || !toAmount) return;

    try {
      setError(undefined);
      const amountIn = parseUnits(fromAmount, fromToken.decimals);
      const amountOutMin = parseUnits(
        (parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6),
        toToken.decimals
      );

      // ETH -> WETH (Wrap)
      if (fromToken.symbol === 'ETH' && toToken.symbol === 'WETH') {
        writeContract({
          address: WETH_ADDRESS as `0x${string}`,
          abi: WETH_ABI,
          functionName: 'deposit',
          value: amountIn,
        });
        return;
      }

      // WETH -> ETH (Unwrap)
      if (fromToken.symbol === 'WETH' && toToken.symbol === 'ETH') {
        writeContract({
          address: WETH_ADDRESS as `0x${string}`,
          abi: WETH_ABI,
          functionName: 'withdraw',
          args: [amountIn],
        });
        return;
      }

      // Uniswap swap
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 min deadline
      
      writeContract({
        address: UNISWAP_ROUTER as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
          tokenIn: fromToken.address === '0x0000000000000000000000000000000000000000' 
            ? WETH_ADDRESS as `0x${string}`
            : fromToken.address as `0x${string}`,
          tokenOut: toToken.address === '0x0000000000000000000000000000000000000000'
            ? WETH_ADDRESS as `0x${string}`
            : toToken.address as `0x${string}`,
          fee: 3000, // 0.3% pool
          recipient: address,
          deadline,
          amountIn,
          amountOutMinimum: amountOutMin,
          sqrtPriceLimitX96: BigInt(0)
        }],
        value: fromToken.address === '0x0000000000000000000000000000000000000000' ? amountIn : BigInt(0)
      });
    } catch (err: any) {
      setError(err.message || 'Swap failed');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setShowConfirm(false);
      setFromAmount('');
      setToAmount('');
      refetchFromBalance();
      refetchAllowance();
      // Show success message
      setTimeout(() => {
        setTxHash(contractHash);
      }, 500);
    }
  }, [isSuccess]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFromTokens(false);
      setShowToTokens(false);
    };
    
    if (showFromTokens || showToTokens) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showFromTokens, showToTokens]);

  if (!isOpen) return null;

  const getSwapType = () => {
    if (fromToken.symbol === 'ETH' && toToken.symbol === 'WETH') return 'Wrap ETH';
    if (fromToken.symbol === 'WETH' && toToken.symbol === 'ETH') return 'Unwrap WETH';
    return 'Swap';
  };

  return (
    <AnimatePresence>
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
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-blue-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-light text-white">Swap</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className={`w-5 h-5 text-gray-400 ${showSettings ? 'rotate-90' : ''} transition-transform`} />
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
                className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10 overflow-hidden"
              >
                <label className="block text-sm font-medium text-gray-300 mb-3">Slippage Tolerance</label>
                <div className="flex gap-2">
                  {['0.1', '0.5', '1.0'].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        slippage === value
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
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
                    step="0.1"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {txHash && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-400 font-medium">Transaction Successful!</p>
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View on Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          )}

          {/* From Token */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-4 mb-2 border border-white/10 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">From</span>
              <span className="text-xs text-gray-400">
                Balance: {parseFloat(fromBalanceFormatted).toFixed(6)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-3xl font-light text-white outline-none"
                step="any"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFromTokens(!showFromTokens);
                }}
                className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl text-white font-medium outline-none cursor-pointer hover:bg-white/20 transition-colors border border-white/10 flex items-center gap-2 min-w-[120px] justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{fromToken.logo}</span>
                  <span>{fromToken.symbol}</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFromTokens ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {fromAmount && (
              <button
                onClick={() => setFromAmount(fromBalanceFormatted)}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                MAX
              </button>
            )}
            
            {/* From Token Dropdown */}
            <AnimatePresence>
              {showFromTokens && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-4 top-full mt-2 bg-gray-800 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {TOKENS.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFromToken(token);
                        setShowFromTokens(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 text-left"
                    >
                      <span className="text-2xl">{token.logo}</span>
                      <div>
                        <div className="text-white font-medium">{token.symbol}</div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-3 z-10 relative">
            <button
              onClick={handleSwapTokens}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border-2 border-gray-700 hover:border-blue-500/50 transition-all shadow-lg"
            >
              <ArrowDownUp className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-4 mb-4 border border-white/10 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">To</span>
              <span className="text-xs text-gray-400">
                Balance: {parseFloat(toBalanceFormatted).toFixed(6)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={toAmount}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-3xl font-light text-white outline-none"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowToTokens(!showToTokens);
                }}
                className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl text-white font-medium outline-none cursor-pointer hover:bg-white/20 transition-colors border border-white/10 flex items-center gap-2 min-w-[120px] justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{toToken.logo}</span>
                  <span>{toToken.symbol}</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showToTokens ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* To Token Dropdown */}
            <AnimatePresence>
              {showToTokens && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-4 top-full mt-2 bg-gray-800 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {TOKENS.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={(e) => {
                        e.stopPropagation();
                        setToToken(token);
                        setShowToTokens(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 text-left"
                    >
                      <span className="text-2xl">{token.logo}</span>
                      <div>
                        <div className="text-white font-medium">{token.symbol}</div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quote Information */}
          {toAmount && !isLoadingQuote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20"
            >
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-white font-medium">
                    1 {fromToken.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Minimum Received</span>
                  <span className="text-white font-medium">
                    {(parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {toToken.symbol}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoadingQuote && (
            <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm text-gray-400">Getting best rate...</span>
            </div>
          )}

          {/* Action Buttons */}
          {!address ? (
            <button
              disabled
              className="w-full py-4 bg-gray-600 rounded-xl text-white font-medium cursor-not-allowed"
            >
              Connect Wallet First
            </button>
          ) : needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={isWriting || isConfirming}
              className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isWriting || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isConfirming ? 'Confirming...' : 'Approving...'}
                </>
              ) : (
                `Approve ${fromToken.symbol}`
              )}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={!toAmount || !fromAmount || isWriting || isConfirming || isLoadingQuote}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isWriting || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isConfirming ? 'Confirming...' : 'Swapping...'}
                </>
              ) : !fromAmount ? (
                'Enter Amount'
              ) : isLoadingQuote ? (
                'Loading...'
              ) : (
                getSwapType()
              )}
            </button>
          )}

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-400 text-center flex items-center justify-center gap-2">
              <Info className="w-3 h-3" />
              Powered by Uniswap V3 on Sepolia Testnet
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}