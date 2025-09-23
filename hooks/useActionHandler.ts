import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface Action {
  type: keyof typeof actionHandlers;
  params: any;
}

interface ActionHandler {
  execute: (params: any) => Promise<any>;
  validate?: (params: any) => boolean;
}

const actionHandlers: Record<string, ActionHandler> = {
  TRADE: {
    execute: async (params) => {
      const response = await fetch('/api/trade', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response.json();
    },
    validate: (params) => {
      return params.amount > 0 && params.fromToken && params.toToken;
    }
  },
  ANALYZE: {
    execute: async (params) => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response.json();
    }
  },
  PORTFOLIO: {
    execute: async (params) => {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response.json();
    }
  }
};

export const useActionHandler = () => {
  const handleAction = useCallback(async (action: Action) => {
    const handler = actionHandlers[action.type];
    if (!handler) {
      toast.error(`Unknown action type: ${action.type}`);
      return;
    }

    if (handler.validate && !handler.validate(action.params)) {
      toast.error('Invalid action parameters');
      return;
    }

    try {
      const result = await handler.execute(action.params);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Action failed: ${error.message}`);
      } else {
        toast.error('An unknown error occurred');
      }
      throw error;
    }
  }, []);

  return { handleAction };
};