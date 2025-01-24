const ActionButton: React.FC<{
    action: Action;
    onClick: () => void;
  }> = ({ action, onClick }) => {
    const { type, params } = action;
    
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 rounded-lg bg-blue-500 text-white"
        onClick={onClick}
      >
        {getActionLabel(type, params)}
      </motion.button>
    );
  };