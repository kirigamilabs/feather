import { useState } from 'react';

export const useTransactionSafety = () => {
  const [isPending, setIsPending] = useState(false);

  const validateTransaction = async (tx: any) => {
    // Check balance
    if (parseFloat(tx.value) > parseFloat(tx.balance)) {
      throw new Error('Insufficient balance');
    }

    // Check gas
    if (!tx.gasLimit || tx.gasLimit < 21000) {
      throw new Error('Invalid gas limit');
    }

    // Check address
    if (!isValidAddress(tx.to)) {
      throw new Error('Invalid recipient address');
    }

    return true;
  };

  const executeWithSafety = async (
    executeFn: () => Promise<any>,
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    if (isPending) {
      throw new Error('Transaction already pending');
    }

    setIsPending(true);
    try {
      const result = await executeFn();
      onSuccess?.(result);
      return result;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { validateTransaction, executeWithSafety, isPending };
};

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}