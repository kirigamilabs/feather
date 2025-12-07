'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Brain, ChevronDown, Check, Plus, Sparkles as SparklesIcon, X, Loader2, Trash2 } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface Prompt {
  id: string;
  name: string;
  content: string;
  model?: string;
  maxTokens?: number;
  createdAt: number;
}

interface PromptContextType {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  loadPrompts: () => Promise<void>;
  savePrompt: (prompt: Omit<Prompt, 'createdAt'>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

// ============================================
// CONTEXT
// ============================================

const PromptContext = createContext<PromptContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/ai/web3-chat?action=list');
      if (!res.ok) throw new Error('Failed to load prompts');
      
      const data = await res.json();
      
      const validPrompts = (data.prompts || []).filter((p: Prompt) => 
        p && p.id && p.name && p.content
      );
      
      setPrompts(validPrompts);
      
      if (!selectedPrompt && validPrompts.length > 0) {
        const defaultPrompt = validPrompts.find((p: Prompt) => p.id === 'default') || validPrompts[0];
        setSelectedPrompt(defaultPrompt);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prompts';
      setError(errorMessage);
      console.error('Load prompts error:', err);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPrompt]);

  const savePrompt = useCallback(async (prompt: Omit<Prompt, 'createdAt'>) => {
    try {
      setError(null);
      
      const res = await fetch('/api/ai/web3-chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });
      
      if (!res.ok) throw new Error('Failed to save prompt');
      
      const { prompt: savedPrompt } = await res.json();
      
      setPrompts(prev => {
        const exists = prev.find(p => p.id === savedPrompt.id);
        return exists 
          ? prev.map(p => p.id === savedPrompt.id ? savedPrompt : p)
          : [...prev, savedPrompt];
      });
      
      setSelectedPrompt(savedPrompt);
      return savedPrompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save prompt';
      setError(errorMessage);
      console.error('Save prompt error:', err);
      throw err;
    }
  }, []);

  const deletePrompt = useCallback(async (id: string) => {
    if (id === 'default') {
      setError('Cannot delete default prompt');
      return;
    }
    
    try {
      setError(null);
      
      const res = await fetch(`/api/ai/web3-chat?action=delete&id=${id}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) throw new Error('Failed to delete prompt');
      
      setPrompts(prev => prev.filter(p => p.id !== id));
      
      if (selectedPrompt?.id === id) {
        const defaultPrompt = prompts.find(p => p.id === 'default');
        setSelectedPrompt(defaultPrompt || prompts[0] || null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt';
      setError(errorMessage);
      console.error('Delete prompt error:', err);
      throw err;
    }
  }, [prompts, selectedPrompt]);

  useEffect(() => {
    loadPrompts();
  }, []);

  const value = {
    prompts,
    selectedPrompt,
    setSelectedPrompt,
    loadPrompts,
    savePrompt,
    deletePrompt,
    loading,
    error,
    clearError
  };

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const usePrompts = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompts must be used within PromptProvider');
  }
  return context;
};

// ============================================
// PROMPT CREATOR MODAL
// ============================================

const PromptCreatorModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const { savePrompt } = usePrompts();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-5-20250929');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Portal to body to escape parent positioning
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAIGenerate = async () => {
    if (!name.trim()) {
      setError('Please enter a name first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: name })
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      setError('Failed to generate prompt. Try again.');
      console.error('AI generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      setError('Name and content are required');
      return;
    }

    try {
      await savePrompt({
        id: `prompt_${Date.now()}`,
        name,
        content,
        model,
        maxTokens
      });
      
      setName('');
      setContent('');
      setModel('claude-sonnet-4-5-20250929');
      setMaxTokens(1000);
      setError(null);
      onClose();
    } catch (err) {
      setError('Failed to save prompt');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed' }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[600px] max-h-[90vh] bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-light text-white">Create AI Prompt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prompt Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., DeFi Strategist, Risk Analyzer..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm sm:text-base"
            />
          </div>

          {/* AI Generate Button */}
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating || !name.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all shadow-lg shadow-purple-500/20 text-sm sm:text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Generate with AI
              </>
            )}
          </button>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              System Prompt
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the AI's personality, capabilities, and behavior..."
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-xs sm:text-sm resize-none"
            />
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              >
                <option value="claude-sonnet-4-5-20250929">Sonnet 4.5</option>
                <option value="claude-opus-4-5-20251101">Opus 4.5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                min="500"
                max="8000"
                step="100"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim()}
            className="px-4 sm:px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all shadow-lg shadow-blue-500/20 text-sm sm:text-base"
          >
            Create Prompt
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PROMPT SELECTOR WITH INTEGRATED CREATOR
// ============================================

export const PromptSelector = () => {
  const { prompts, selectedPrompt, setSelectedPrompt, deletePrompt, loading } = usePrompts();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    if (promptId === 'default') return;
    
    if (confirm('Delete this prompt?')) {
      setDeletingId(promptId);
      try {
        await deletePrompt(promptId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading || prompts.length === 0) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-blue-500/30 text-white"
          title="Select AI Prompt"
        >
          <Brain className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-sm font-medium hidden sm:inline truncate max-w-[120px]">
            {selectedPrompt?.name || 'Default'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-80 bg-black/95 border border-white/20 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden backdrop-blur-xl flex flex-col">
              <div className="p-2 border-b border-white/10 bg-white/5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2">
                  AI Prompts
                </p>
              </div>
              
              {/* Scrollable Prompts List */}
              <div className="overflow-y-auto flex-1">
                {prompts.map(prompt => (
                  <div
                    key={prompt.id}
                    className={`group relative ${
                      selectedPrompt?.id === prompt.id ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {selectedPrompt?.id === prompt.id ? (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <p className="font-medium text-sm text-white mb-1">{prompt.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {prompt.content ? prompt.content.slice(0, 80) + '...' : 'No content'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{prompt.model?.includes('opus') ? 'Opus' : prompt.model?.includes('4-5') ? 'Sonnet 4.5' : 'Sonnet 4'}</span>
                          <span>•</span>
                          <span>{prompt.maxTokens || 1000} tokens</span>
                        </div>
                      </div>
                    </button>
                    
                    {prompt.id !== 'default' && (
                      <button
                        onClick={(e) => handleDelete(e, prompt.id)}
                        disabled={deletingId === prompt.id}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                        title="Delete prompt"
                      >
                        {deletingId === prompt.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Create New Button - Always at bottom */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCreator(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-4 border-t border-white/10 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-white transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Create New Prompt</span>
              </button>
            </div>
          </>
        )}
      </div>

      <PromptCreatorModal isOpen={showCreator} onClose={() => setShowCreator(false)} />
    </>
  );
};