import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

export const LoadingOverlay = ({ message = 'Processing...' }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 text-center max-w-sm">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
      <p className="text-white font-medium">{message}</p>
    </div>
  </div>
);

export const InlineLoader = () => (
  <Loader2 className="w-4 h-4 animate-spin" />
);