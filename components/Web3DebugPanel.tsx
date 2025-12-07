import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useChainId, usePublicClient } from 'wagmi';
import { Bug, X, RefreshCw, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Web3DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { address, isConnected, connector, chain, status } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const publicClient = usePublicClient();

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      if (publicClient) {
        const block = await publicClient.getBlockNumber();
        setBlockNumber(block);
      }
    } catch (error) {
      console.error('Failed to fetch block:', error);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isOpen && publicClient) {
      refreshData();
    }
  }, [isOpen, publicClient]);

  const getStatusColor = (isGood: boolean) => isGood ? 'text-green-400' : 'text-red-400';
  const getStatusIcon = (isGood: boolean) => isGood ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;

  return (
    <>
      {/* Floating Debug Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg transition-all hover:scale-110"
        title="Open Debug Panel"
      >
        <Bug className="w-6 h-6 text-white" />
      </button>

      {/* Debug Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-purple-500/20 rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Bug className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-white">Web3 Debug Panel</h2>
                    <p className="text-xs text-gray-400">Wagmi & Wallet State Inspector</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  {getStatusIcon(isConnected)}
                  <h3 className={`font-semibold ${getStatusColor(isConnected)}`}>
                    Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
                  </h3>
                </div>
                <div className="text-sm text-gray-400">
                  Status: <span className="text-white">{status}</span>
                </div>
              </div>

              {/* Account Info */}
              <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Account Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Address:</span>
                    <span className={`${getStatusColor(!!address)} font-mono`}>
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Balance:</span>
                    <span className={`${getStatusColor(!!balance)} font-mono`}>
                      {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connector:</span>
                    <span className="text-white">
                      {connector?.name || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chain Info - CRITICAL SECTION */}
              <div className="mb-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Chain Information (Debug Focus)
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-gray-400 mb-1">useAccount().chain:</div>
                    <pre className="text-xs text-white overflow-x-auto">
                      {chain ? JSON.stringify({
                        id: chain.id,
                        name: chain.name,
                        network: chain.id,
                        nativeCurrency: chain.nativeCurrency,
                        rpcUrls: chain.rpcUrls
                      }, null, 2) : 'undefined ⚠️'}
                    </pre>
                  </div>

                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-gray-400 mb-1">useChainId():</div>
                    <pre className="text-xs text-white">
                      {chainId !== undefined ? chainId : 'undefined ⚠️'}
                    </pre>
                  </div>

                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-gray-400 mb-1">publicClient exists:</div>
                    <pre className="text-xs text-white">
                      {publicClient ? '✅ Yes' : '❌ No'}
                    </pre>
                  </div>

                  {blockNumber && (
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="text-green-400 mb-1">Latest Block:</div>
                      <pre className="text-xs text-white">
                        {blockNumber.toString()} ✅
                      </pre>
                      <div className="text-xs text-gray-400 mt-1">
                        (Successfully fetched from RPC)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                <h3 className="font-semibold text-purple-400 mb-3">Automated Diagnosis</h3>
                <div className="space-y-2 text-sm">
                  {!isConnected && (
                    <div className="flex items-start gap-2 text-yellow-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Wallet is not connected. Connect wallet to proceed.</span>
                    </div>
                  )}
                  
                  {isConnected && !chain && (
                    <div className="flex items-start gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Chain object is undefined!</div>
                        <div className="text-xs mt-1">Possible causes:</div>
                        <ul className="list-disc ml-4 mt-1 space-y-1">
                          <li>Wagmi not fully initialized</li>
                          <li>Chain not in wagmi config</li>
                          <li>RPC connection issue</li>
                          <li>Wallet on unsupported network</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {isConnected && chain && chainId !== 11155111 && (
                    <div className="flex items-start gap-2 text-yellow-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Wrong network! Switch to Sepolia (Chain ID: 11155111)</span>
                    </div>
                  )}

                  {isConnected && chain && chainId === 11155111 && (
                    <div className="flex items-start gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>All systems operational! Connected to Sepolia.</span>
                    </div>
                  )}

                  {isConnected && !publicClient && (
                    <div className="flex items-start gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>PublicClient is not available. Check RPC configuration.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <h3 className="font-semibold text-blue-400 mb-3">Recommended Actions</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  {!isConnected && (
                    <div>1. Connect your wallet using the Connect button</div>
                  )}
                  {isConnected && !chain && (
                    <>
                      <div>1. Disconnect and reconnect wallet</div>
                      <div>2. Check browser console for errors</div>
                      <div>3. Verify Web3Provider.tsx configuration</div>
                      <div>4. Ensure wagmi is properly installed</div>
                    </>
                  )}
                  {isConnected && chain && chainId !== 11155111 && (
                    <div>1. Switch to Sepolia testnet in MetaMask</div>
                  )}
                  {isConnected && chain && chainId === 11155111 && (
                    <div>✅ Ready to swap! Open the swap interface.</div>
                  )}
                </div>
              </div>

              {/* Raw Data Dump */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded">
                  Show Raw Wagmi Data (Advanced)
                </summary>
                <div className="mt-2 p-4 bg-black/50 rounded-lg">
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify({
                      account: {
                        address,
                        isConnected,
                        status,
                        connector: connector?.name
                      },
                      chain: chain ? {
                        id: chain.id,
                        name: chain.name,
                        testnet: chain.testnet,
                        network: chain.id
                      } : 'undefined',
                      chainId,
                      balance: balance ? {
                        value: balance.value.toString(),
                        formatted: balance.formatted,
                        symbol: balance.symbol
                      } : 'N/A',
                      publicClient: publicClient ? 'exists' : 'null',
                      blockNumber: blockNumber?.toString() || 'not fetched'
                    }, null, 2)}
                  </pre>
                </div>
              </details>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}