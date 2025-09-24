import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, CheckCircle, X, Loader } from 'lucide-react';
import { Button } from '@/components/Button';
import { useWallet } from '@/hooks/useWallet';
import { isAddress } from 'viem';

interface SendTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  recipientAddress?: string;
  amount?: string;
}

export const SendTransaction: React.FC<SendTransactionProps> = ({
  isOpen,
  onClose,
  recipientAddress = '',
  amount = ''
}) => {
  const [recipient, setRecipient] = useState(recipientAddress);
  const [value, setValue] = useState(amount);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const { 
    walletState, 
    sendETH, 
    isSending,
    getTransactionStatus 
  } = useWallet();

  const { hash, isPending, isConfirming: txConfirming, isConfirmed, error } = getTransactionStatus();

  const isValidRecipient = recipient && isAddress(recipient);
  const isValidAmount = value && parseFloat(value) > 0;
  const hasInsufficientFunds = walletState.balance && parseFloat(value) > parseFloat(walletState.balance);

  const handleSend = async () => {
    if (!isValidRecipient || !isValidAmount || hasInsufficientFunds) return;

    try {
      setIsConfirming(true);
      await sendETH({
        to: recipient,
        value: value
      });
    } catch (err) {
      console.error('Transaction failed:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setRecipient('');
    setValue('');
    setIsConfirming(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
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
            <h2 className="text-xl font-semibold">Send ETH</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Transaction Status */}
          {hash && (
            <div className="mb-6">
              {isPending && (
                <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-500">Transaction Sent</p>
                    <p className="text-xs text-muted-foreground">Waiting for confirmation...</p>
                  </div>
                </div>
              )}
              
              {txConfirming && (
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <Loader className="w-5 h-5 text-yellow-500 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-yellow-500">Confirming</p>
                    <p className="text-xs text-muted-foreground">Transaction is being confirmed...</p>
                  </div>
                </div>
              )}

              {isConfirmed && (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-500">Transaction Confirmed!</p>
                    <p className="text-xs text-muted-foreground">Your ETH has been sent successfully.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-500">Transaction Failed</p>
                    <p className="text-xs text-muted-foreground">{error.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {/* Recipient */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className={`w-full p-3 rounded-lg border bg-background transition-colors ${
                  recipient && !isValidRecipient 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-border focus:border-primary'
                }`}
                disabled={isPending || txConfirming}
              />
              {recipient && !isValidRecipient && (
                <p className="text-xs text-red-500">Invalid Ethereum address</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (ETH)</label>
              <input
                type="number"
                step="0.001"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.0"
                className={`w-full p-3 rounded-lg border bg-background transition-colors ${
                  hasInsufficientFunds 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-border focus:border-primary'
                }`}
                disabled={isPending || txConfirming}
              />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Available: {walletState.balance ? `${parseFloat(walletState.balance).toFixed(4)} ETH` : '0 ETH'}
                </span>
                {hasInsufficientFunds && (
                  <span className="text-red-500">Insufficient funds</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
                disabled={isPending || txConfirming}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSend}
                className="flex-1"
                disabled={
                  !isValidRecipient || 
                  !isValidAmount || 
                  hasInsufficientFunds || 
                  isPending || 
                  txConfirming ||
                  isConfirming
                }
              >
                {isConfirming || isPending || txConfirming ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send ETH
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};