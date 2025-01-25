import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from 'use-sound';
import { useAIStore } from '@/state/aiState';
import type { Feedback } from '@/types/interactions';

export const FeedbackSystem = () => {
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
  const { feedback: feedbackSettings } = useAIStore();

  const addFeedback = useCallback((feedback: Feedback) => {
    const id = Date.now();
    setFeedbacks(prev => [...prev, { ...feedback, id }]);
    
    if (feedbackSettings.haptic) {
      navigator.vibrate?.(feedback.type === 'success' ? 50 : [50, 30, 50]);
    }

    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, feedback.duration || 2000);
  }, [feedbackSettings.haptic]);

  return (
    <AnimatePresence>
      {feedbacks.map((feedback) => (
        <motion.div
          key={feedback.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed ${getPositionClasses(feedback)} pointer-events-none`}
          style={feedback.position ? {
            left: feedback.position.x,
            top: feedback.position.y
          } : undefined}
        >
          <div className={`rounded-lg p-3 shadow-lg ${getFeedbackStyles(feedback.type)}`}>
            {feedback.message}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

const getPositionClasses = (feedback: Feedback) => {
  if (feedback.position) return '';
  return 'top-4 right-4';
};

const getFeedbackStyles = (type: Feedback['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/20 text-green-500 backdrop-blur-sm';
    case 'error':
      return 'bg-red-500/20 text-red-500 backdrop-blur-sm';
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-500 backdrop-blur-sm';
    case 'info':
      return 'bg-blue-500/20 text-blue-500 backdrop-blur-sm';
  }
};