const TransactionCard: React.FC<{
    transaction: Transaction;
  }> = ({ transaction }) => {
    const { hash, status, type, amount, token } = transaction;
    
    return (
      <div className="bg-white/10 backdrop-blur rounded-lg p-4 mt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getTransactionIcon(type)}
            <div>
              <div className="font-medium">{type}</div>
              <div className="text-sm opacity-80">
                {amount} {token}
              </div>
            </div>
          </div>
          <TransactionStatus status={status} hash={hash} />
        </div>
      </div>
    );
  };