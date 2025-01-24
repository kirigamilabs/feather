import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSound } from 'use-sound';

const InteractionFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [playPositive] = useSound('/sounds/positive.mp3');
  const [playNegative] = useSound('/sounds/negative.mp3');

  const addFeedback = (type, position) => {
    const id = Date.now();
    setFeedback(prev => [...prev, { id, type, position }]);
    
    if (type === 'success') {
      navigator.vibrate?.(50);
      playPositive();
    } else {
      navigator.vibrate?.([50, 30, 50]);
      playNegative();
    }

    setTimeout(() => {
      setFeedback(prev => prev.filter(f => f.id !== id));
    }, 1000);
  };

  return (
    <>
      {feedback.map(({ id, type, position }) => (
        <motion.div
          key={id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          style={{ 
            position: 'fixed',
            left: position.x,
            top: position.y,
            pointerEvents: 'none'
          }}
        >
          <div className={`p-2 rounded-full ${
            type === 'success' 
              ? 'bg-green-500/20'
              : 'bg-red-500/20'
          }`}>
            {type === 'success' ? '✓' : '×'}
          </div>
        </motion.div>
      ))}
    </>
  );
};

const HapticButton = ({ onClick, children }) => {
  const handleClick = () => {
    navigator.vibrate?.(50);
    onClick?.();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white"
    >
      {children}
    </motion.button>
  );
};

const ProgressRing = ({ progress }) => {
  const radius = 20;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className="transform -rotate-90" width="50" height="50">
      <circle
        className="text-gray-300"
        strokeWidth="4"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="25"
        cy="25"
      />
      <circle
        className="text-blue-600"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="25"
        cy="25"
      />
    </svg>
  );
};

export { InteractionFeedback, HapticButton, ProgressRing };