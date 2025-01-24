const ChatInterface: React.FC = () => {
    const { messages, processMessage } = useChatSystem();
    const [input, setInput] = useState('');
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
  
      const message = input;
      setInput('');
      await processMessage(message);
    };
  
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <ChatMessage 
              key={i} 
              message={message} 
              onActionClick={handleAction}
            />
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-2"
              placeholder="Message Feather AI..."
            />
            <button 
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-white"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  const ChatMessage: React.FC<{ 
    message: Message;
    onActionClick: (action: Action) => void;
  }> = ({ message, onActionClick }) => {
    return (
      <div className={`flex ${
        message.type === 'user' ? 'justify-end' : 'justify-start'
      }`}>
        <div className={`max-w-[80%] rounded-lg p-3 ${
          message.type === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          <div className="prose dark:prose-invert">
            {message.content}
          </div>
          
          {message.metadata?.actions && (
            <div className="mt-2 flex gap-2">
              {message.metadata.actions.map((action, i) => (
                <ActionButton 
                  key={i}
                  action={action}
                  onClick={() => onActionClick(action)}
                />
              ))}
            </div>
          )}
          
          {message.metadata?.transactions && (
            <div className="mt-2">
              {message.metadata.transactions.map((tx, i) => (
                <TransactionCard key={i} transaction={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };