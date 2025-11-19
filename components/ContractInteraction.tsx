import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, FileText, AlertTriangle, CheckCircle, Loader2, X, Play, Eye } from 'lucide-react';

// Allowlisted contracts with ABIs
const CONTRACTS = {
  'Uniswap V2 Router': {
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    chain: 'ethereum',
    abi: [
      'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
      'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
    ],
    description: 'Decentralized token swaps'
  },
  'ERC20 Token': {
    address: 'custom',
    chain: 'ethereum',
    abi: [
      'function transfer(address to, uint256 amount) public returns (bool)',
      'function approve(address spender, uint256 amount) public returns (bool)',
      'function balanceOf(address account) public view returns (uint256)',
      'function allowance(address owner, address spender) public view returns (uint256)'
    ],
    description: 'Standard token operations'
  },
  'Aave Lending Pool': {
    address: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    chain: 'ethereum',
    abi: [
      'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
      'function withdraw(address asset, uint256 amount, address to) external returns (uint256)',
      'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external'
    ],
    description: 'Lending and borrowing'
  }
};

interface SimulationResult {
  success: boolean;
  gasEstimate: string;
  changes: Array<{
    type: 'balance' | 'approval' | 'state';
    description: string;
  }>;
  warnings: string[];
}

export default function ContractInteraction({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedContract, setSelectedContract] = useState('Uniswap V2 Router');
  const [customAddress, setCustomAddress] = useState('');
  const [selectedFunction, setSelectedFunction] = useState('');
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const contract = CONTRACTS[selectedContract as keyof typeof CONTRACTS];
  const functions = contract ? contract.abi.map(fn => {
    const match = fn.match(/function (\w+)\((.*?)\)/);
    return match ? { name: match[1], signature: fn } : null;
  }).filter(Boolean) : [];

  const handleSimulate = async () => {
    setIsSimulating(true);
    
    // Simulate transaction
    setTimeout(() => {
      setSimulation({
        success: true,
        gasEstimate: '0.0045',
        changes: [
          { type: 'balance', description: 'Your ETH balance will decrease by 0.1 ETH' },
          { type: 'balance', description: 'You will receive ~150 USDC' },
          { type: 'approval', description: 'Approval granted to Uniswap Router' }
        ],
        warnings: [
          'Price impact: 0.02%',
          'Slippage tolerance: 0.5%'
        ]
      });
      setIsSimulating(false);
    }, 2000);
  };

  const handleExecute = () => {
    setShowConfirm(true);
  };

  const executeTransaction = async () => {
    console.log('Executing transaction with:', {
      contract: contract?.address,
      function: selectedFunction,
      inputs: functionInputs
    });
    // Integrate with actual wallet and contract interaction
    setShowConfirm(false);
    onClose();
  };

  const parseInputs = (signature: string) => {
    const match = signature.match(/\((.*?)\)/);
    if (!match) return [];
    
    return match[1].split(',').map(param => {
      const [type, name] = param.trim().split(' ');
      return { type, name: name || 'value' };
    }).filter(p => p.type);
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
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-light text-white">Contract Interaction</h2>
                <p className="text-sm text-gray-400">Execute verified contract functions</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Contract Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Contract</label>
            <select
              value={selectedContract}
              onChange={(e) => {
                setSelectedContract(e.target.value);
                setSelectedFunction('');
                setFunctionInputs({});
                setSimulation(null);
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {Object.entries(CONTRACTS).map(([name, contract]) => (
                <option key={name} value={name}>
                  {name} - {contract.description}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Address (for ERC20) */}
          {selectedContract === 'ERC20 Token' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}

          {/* Function Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Function</label>
            <select
              value={selectedFunction}
              onChange={(e) => {
                setSelectedFunction(e.target.value);
                setFunctionInputs({});
                setSimulation(null);
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Select a function...</option>
              {functions.map((fn) => fn && (
                <option key={fn.name} value={fn.signature}>
                  {fn.name}
                </option>
              ))}
            </select>
          </div>

          {/* Function Inputs */}
          {selectedFunction && (
            <div className="mb-6 space-y-4">
              <label className="block text-sm font-medium text-gray-300">Parameters</label>
              {parseInputs(selectedFunction).map((param, idx) => (
                <div key={idx}>
                  <label className="block text-xs text-gray-400 mb-1">
                    {param.name} ({param.type})
                  </label>
                  <input
                    type="text"
                    value={functionInputs[param.name] || ''}
                    onChange={(e) => setFunctionInputs({
                      ...functionInputs,
                      [param.name]: e.target.value
                    })}
                    placeholder={`Enter ${param.type}`}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Simulation Button */}
          {selectedFunction && (
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full mb-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Simulate Transaction
                </>
              )}
            </button>
          )}

          {/* Simulation Results */}
          {simulation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-sm font-semibold text-white">Simulation Successful</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Gas</span>
                  <span className="text-white">{simulation.gasEstimate} ETH</span>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs font-semibold text-gray-300 mb-2">Expected Changes:</p>
                  <div className="space-y-2">
                    {simulation.changes.map((change, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                        <span className="text-gray-300">{change.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {simulation.warnings.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs font-semibold text-yellow-400 mb-2">⚠️ Warnings:</p>
                    <div className="space-y-1">
                      {simulation.warnings.map((warning, idx) => (
                        <p key={idx} className="text-xs text-yellow-400/80">{warning}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Execute Button */}
          {simulation && (
            <button
              onClick={handleExecute}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-white font-medium transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Execute Transaction
            </button>
          )}

          {/* Confirmation Modal */}
          <AnimatePresence>
            {showConfirm && simulation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6"
              >
                <div className="w-full max-w-md">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Confirm Transaction</h3>
                    <p className="text-sm text-gray-400">This action will execute on the blockchain</p>
                  </div>

                  <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Contract</span>
                      <span className="text-white font-mono text-xs">{contract?.address.slice(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Function</span>
                      <span className="text-white">{selectedFunction.match(/function (\w+)/)?.[1]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Network Fee</span>
                      <span className="text-white">{simulation.gasEstimate} ETH</span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400 text-center">
                      ⚠️ This transaction cannot be reversed. Please verify all details.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeTransaction}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-white font-medium transition-all"
                    >
                      Confirm & Execute
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