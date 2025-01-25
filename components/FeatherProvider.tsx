import { createContext, useContext, useEffect, useState, ComponentType } from 'react';

interface ShortcutMap {
  [key: string]: {
    action: () => void;
    description: string;
    context?: string[];
  };
}

interface ContextSuggestion {
    id: string;
    text: string;
    action: () => void;
    priority: number;
    icon?: ComponentType;
  }

interface FeatherContextState {
  shortcuts: ShortcutMap;
  suggestions: ContextSuggestion[];
  registerShortcut: (key: string, config: {
    action: () => void;
    description: string;
    context?: string[];
  }) => void;
  addSuggestion: (suggestion: ContextSuggestion) => void;
  removeSuggestion: (id: string) => void;
  currentContext: string[];
}

const FeatherContext = createContext<FeatherContextState | null>(null);

export const useFeather = () => {
  const context = useContext(FeatherContext);
  if (!context) throw new Error('useFeather must be used within FeatherProvider');
  return context;
};

export const FeatherProvider = ({ children }: { children: React.ReactNode }) => {
  const [shortcuts, setShortcuts] = useState<ShortcutMap>({});
  const [suggestions, setSuggestions] = useState<ContextSuggestion[]>([]);
  const [currentContext, setCurrentContext] = useState<string[]>(['global']);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'Ctrl',
        e.shiftKey && 'Shift',
        e.key.toUpperCase()
      ].filter(Boolean).join('+');

      const shortcut = shortcuts[key];
      if (shortcut && (!shortcut.context || shortcut.context.some(ctx => currentContext.includes(ctx)))) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, currentContext]);

  const value = {
    shortcuts,
    suggestions: suggestions.sort((a, b) => b.priority - a.priority),
    currentContext,
    registerShortcut: (key: string, config: ShortcutMap[string]) => {
        setShortcuts(prev => ({ ...prev, [key]: config }));
    },
    addSuggestion: (suggestion: ContextSuggestion) => {
      setSuggestions(prev => [...prev, suggestion]);
    },
    removeSuggestion: (id: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
      }
  };

  return (
    <FeatherContext.Provider value={value}>
      {children}
      <ShortcutDisplay />
      <ContextSuggestions />
    </FeatherContext.Provider>
  );
};

const ShortcutDisplay = () => {
  const { shortcuts } = useFeather();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMeta = (e: KeyboardEvent) => {
      if (e.key === '?') setIsVisible(true);
    };
    window.addEventListener('keydown', handleMeta);
    return () => window.removeEventListener('keydown', handleMeta);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setIsVisible(false)}>
      <div className="bg-card rounded-lg p-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Keyboard Shortcuts</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(shortcuts).map(([key, { description }]) => (
            <div key={key} className="flex justify-between">
              <kbd className="px-2 py-1 bg-background rounded">{key}</kbd>
              <span>{description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContextSuggestions = () => {
  const { suggestions } = useFeather();

  return suggestions.length > 0 ? (
    <div className="fixed bottom-4 right-4 max-w-sm space-y-2">
      {suggestions.map(({ id, text, action, icon: Icon }) => (
        <button
          key={id}
          onClick={action}
          className="flex items-center gap-2 w-full p-2 bg-card/80 backdrop-blur rounded-lg hover:bg-card"
        >
          {Icon && <Icon />}
          <span>{text}</span>
        </button>
      ))}
    </div>
  ) : null;
};

// Usage example:
export const useFeatureShortcuts = () => {
  const feather = useFeather();

  useEffect(() => {
    feather.registerShortcut('Ctrl+M', {
      action: () => {/* toggle market panel */},
      description: 'Toggle Market Analysis'
    });

    feather.registerShortcut('Ctrl+P', {
      action: () => {/* toggle portfolio */},
      description: 'Toggle Portfolio',
      context: ['trading']
    });
  }, [feather]);
};