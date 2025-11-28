import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export const SuccessAnimation = ({ 
  message, 
  onComplete 
}: { 
  message: string; 
  onComplete?: () => void;
}) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{ 
      type: 'spring', 
      stiffness: 200, 
      damping: 15 
    }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    onClick={onComplete}
  >
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-8 text-center max-w-sm"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      </motion.div>
      <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
      <p className="text-gray-300">{message}</p>
    </motion.div>
  </motion.div>
);