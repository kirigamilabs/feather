import { AlertCircle, Clock } from 'lucide-react';

export const RateLimitWarning = ({ 
  remainingRequests, 
  resetTime 
}: { 
  remainingRequests: number; 
  resetTime: Date;
}) => {
  if (remainingRequests > 10) return null;

  return (
    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/50 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-yellow-500">
          API Rate Limit Warning
        </p>
        <p className="text-xs text-yellow-500/80 mt-1">
          {remainingRequests} requests remaining. Resets at{' '}
          {resetTime.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};