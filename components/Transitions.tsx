import { motion } from 'framer-motion';

export const transitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 }
  }
};

export const TransitionWrapper = ({ 
  children, 
  type = 'fadeIn',
  className = '' 
}: {
  children: React.ReactNode;
  type?: keyof typeof transitions;
  className?: string;
}) => (
  <motion.div
    {...transitions[type]}
    className={className}
  >
    {children}
  </motion.div>
);

export const MessageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    {children}
  </motion.div>
);

export const ThinkingTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }}
    exit={{ opacity: 0, scale: 0.8 }}
  >
    {children}
  </motion.div>
);