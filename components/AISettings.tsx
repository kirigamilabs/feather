import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, Trash2, Copy, Save, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';

interface Prompt {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

export const AISettings = () => {
  const [selectedTab, setSelectedTab] = useState('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/web3-chat?action=list');
      const data = await res.json();
      setPrompts(data.prompts);
      if (data.prompts.length > 0 && !selectedPrompt) {
        setSelectedPrompt(data.prompts[0]);
      }
    } catch (err) {
      setError('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!editName.trim() || !editContent.trim()) {
      setError('Name and content required');
      return;
    }

    try {
      const newId = isCreating ? `prompt_${Date.now()}` : selectedPrompt?.id;
      
      const res = await fetch('/api/ai/web3-chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          name: editName,
          content: editContent
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      
      const { prompt } = await res.json();
      
      if (isCreating) {
        setPrompts([...prompts, prompt]);
      } else {
        setPrompts(prompts.map(p => p.id === prompt.id ? prompt : p));
      }
      
      setSelectedPrompt(prompt);
      setIsEditing(false);
      setIsCreating(false);
      setError(null);
    } catch (err) {
      setError('Failed to save prompt');
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (id === 'default') {
      setError('Cannot delete default prompt');
      return;
    }

    try {
      const res = await fetch(`/api/ai/web3-chat?action=delete&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      setPrompts(prompts.filter(p => p.id !== id));
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(prompts[0] || null);
      }
    } catch (err) {
      setError('Failed to delete prompt');
    }
  };

  const handleEditClick = () => {
    if (selectedPrompt) {
      setEditName(selectedPrompt.name);
      setEditContent(selectedPrompt.content);
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleNewPrompt = () => {
    setEditName('');
    setEditContent('');
    setIsEditing(true);
    setIsCreating(true);
    setSelectedPrompt(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setError(null);
  };

  const PromptListItem = ({ prompt }: { prompt: Prompt }) => (
    <motion.button
      onClick={() => setSelectedPrompt(prompt)}
      className={`w-full text-left p-3 rounded-lg transition-colors border ${
        selectedPrompt?.id === prompt.id
          ? 'bg-primary/10 border-primary'
          : 'bg-card border-border hover:border-primary/50'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <p className="font-semibold text-sm">{prompt?.name || 'Untitled'}</p>
      <p className="text-xs text-muted-foreground mt-1 truncate">{prompt?.content?.slice(0, 50) || ''}...</p>
    </motion.button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="p-3 rounded-full bg-primary/10 inline-block mb-2">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">AI Settings</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedTab('prompts')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedTab === 'prompts'
              ? 'bg-primary text-white'
              : 'bg-card hover:bg-primary/10'
          }`}
        >
          Prompts
        </button>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/50 flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Prompts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your Prompts</h2>
            <Button
              onClick={handleNewPrompt}
              size="sm"
              variant="outline"
              className="p-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : prompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prompts found</p>
            ) : (
              prompts.map(prompt => (
                <PromptListItem key={prompt.id} prompt={prompt} />
              ))
            )}
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-semibold">Prompt Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g., Aggressive Trader"
                    className="w-full mt-2 p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Prompt Content</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Enter your system prompt here..."
                    rows={12}
                    className="w-full mt-2 p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSavePrompt} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : selectedPrompt ? (
              <motion.div
                key="viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-card border border-border space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedPrompt.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(selectedPrompt.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="p-3 rounded bg-background/50 border border-border/50 max-h-[280px] overflow-y-auto">
                    <p className="text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                      {selectedPrompt.content}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {selectedPrompt.id !== 'default' && (
                      <Button
                        onClick={handleEditClick}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                    )}
                    {selectedPrompt.id !== 'default' && (
                      <Button
                        onClick={() => handleDeletePrompt(selectedPrompt.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                    {selectedPrompt.id === 'default' && (
                      <Button
                        onClick={handleEditClick}
                        className="flex-1"
                      >
                        Edit Copy
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-64 text-muted-foreground"
              >
                <p>Select or create a prompt to begin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2"
      >
        <h3 className="font-semibold text-sm">About Prompts</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Create custom prompts to define AI&apos;s personality and behavior</li>
          <li>• Each prompt becomes a separate AI configuration you can switch between</li>
          <li>• Default prompt cannot be deleted but can be edited as a copy</li>
          <li>• Prompts are used when selected during chat interactions</li>
        </ul>
      </motion.div>
    </div>
  );
};