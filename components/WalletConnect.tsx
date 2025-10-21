import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  ChevronDown, 
  AlertCircle,
  CheckCircle,
  X,
  Send,
  Signature
} from 'lucide-react';
import { Button } from '@/components/Button';
import { useWallet } from '@/hooks/useWallet';

interface WalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ 
  isOpen, 
  onClose, 
  onConnected 
}) => {
  const { 
    walletState, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    connectors 
  } = useWallet();

  const [showConnectors, setShowConnectors] = useState(false);
  const prevConnectedRef = useRef(false);
  const hasCalledOnConnected = useRef(false);

  // Watch for wallet connection state changes
  useEffect(() => {
    // Only trigger onConnected when transitioning from disconnected to connected
    if (walletState.isConnected && !prevConnectedRef.current && !hasCalledOnConnected.current) {
      hasCalledOnConnected.current = true;
      onConnected?.();
      setTimeout(onClose, 1000); // Auto-close after success
    }
    prevConnectedRef.current = walletState.isConnected;
  }, [walletState.isConnected, onConnected, onClose]);

  // Reset the flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasCalledOnConnected.current = false;
    }
  }, [isOpen]);

  const handleConnect = async (connectorType?: 'metamask' | 'walletconnect') => {
    await connectWallet(connectorType);
    // Don't call onConnected here - let the useEffect handle it
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (address: string, chainId?: number) => {
    const baseUrl = chainId === 8453 ? 'https://basescan.org' : 'https://etherscan.io';
    return `${baseUrl}/address/${address}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl p-6 w-full max-w-md border border-border/50"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Wallet Connection</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Connected State */}
          {walletState.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-500">Connected</p>
                  <p className="text-xs text-muted-foreground">Wallet successfully connected</p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                  <code className="flex-1 text-sm">
                    {formatAddress(walletState.address!)}
                  </code>
                  <Button size="sm" variant="ghost" onClick={copyAddress}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => window.open(
                      getExplorerUrl(walletState.address!, walletState.chainId), 
                      '_blank'
                    )}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Balance */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Balance</label>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-lg font-semibold">
                    {walletState.balance ? `${parseFloat(walletState.balance).toFixed(4)} ETH` : '0 ETH'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chain ID: {walletState.chainId}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={disconnectWallet}
                  className="flex-1"
                >
                  Disconnect
                </Button>
                <Button 
                  onClick={onClose}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            // Connection State
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to access DeFi features and manage your crypto assets.
              </p>

              {/* Available Connectors */}
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <Button
                    key={connector.uid}
                    variant="outline"
                    className="w-full justify-between p-4 h-auto"
                    onClick={() => handleConnect(
                      connector.name.toLowerCase().includes('metamask') ? 'metamask' : 
                      connector.name.toLowerCase().includes('walletconnect') ? 'walletconnect' : 
                      undefined
                    )}
                    disabled={isConnecting}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-medium">{connector.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {connector.name.includes('MetaMask') && 'Browser extension wallet'}
                          {connector.name.includes('WalletConnect') && 'Mobile wallet support'}
                          {connector.name.includes('Injected') && 'Browser wallet'}
                        </p>
                      </div>
                    </div>
                    {isConnecting && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                      />
                    )}
                  </Button>
                ))}
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                <div className="text-xs text-blue-500">
                  <p className="font-medium">Secure Connection</p>
                  <p className="opacity-80">
                    Your wallet keys never leave your device. We only request read access to your address and balances.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};