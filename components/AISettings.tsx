import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  Brain,
  Loader2,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/Button';

interface Prompt {
  id: string;
  name: string;
  content: string;
  model: string;
  maxTokens: number;
  createdAt: number;
  isPublic?: boolean;
  category?: string;
  tags?: string[];
}

export const AISettings = () => {
  const [selectedTab, setSelectedTab] = useState('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form states
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editModel, setEditModel] = useState('claude-sonnet-4-5-20250929');
  const [editMaxTokens, setEditMaxTokens] = useState(1000);
  const [editCategory, setEditCategory] = useState('general');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/ai/web3-chat?action=list');
      
      if (!res.ok) throw new Error('Failed to load prompts');
      
      const data = await res.json();
      setPrompts(data.prompts || []);
      
      if (data.prompts?.length > 0 && !selectedPrompt) {
        setSelectedPrompt(data.prompts[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!editName.trim() || !editContent.trim()) {
      setError('Name and content are required');
      return;
    }

    try {
      setError(null);
      const newId = isCreating ? `prompt_${Date.now()}` : selectedPrompt?.id;
      
      const res = await fetch('/api/ai/web3-chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          name: editName,
          content: editContent,
          model: editModel,
          maxTokens: editMaxTokens,
          category: editCategory,
          tags: editTags,
          isPublic
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      
      const { prompt } = await res.json();
      
      setPrompts(prev => {
        const exists = prev.find(p => p.id === prompt.id);
        return exists 
          ? prev.map(p => p.id === prompt.id ? prompt : p)
          : [...prev, prompt];
      });
      
      setSelectedPrompt(prompt);
      setIsEditing(false);
      setIsCreating(false);
      setSuccessMessage('Prompt saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (id === 'default') {
      setError('Cannot delete default prompt');
      return;
    }

    if (!confirm('Delete this prompt? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/ai/web3-chat?action=delete&id=${id}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      setPrompts(prev => prev.filter(p => p.id !== id));
      
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(prompts[0] || null);
      }
      
      setSuccessMessage('Prompt deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    }
  };

  const handleEditClick = () => {
    if (selectedPrompt) {
      setEditName(selectedPrompt.name);
      setEditContent(selectedPrompt.content);
      setEditModel(selectedPrompt.model);
      setEditMaxTokens(selectedPrompt.maxTokens);
      setEditCategory(selectedPrompt.category || 'general');
      setEditTags(selectedPrompt.tags || []);
      setIsPublic(selectedPrompt.isPublic || false);
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleNewPrompt = () => {
    setEditName('');
    setEditContent('');
    setEditModel('claude-sonnet-4-5-20250929');
    setEditMaxTokens(1000);
    setEditCategory('general');
    setEditTags([]);
    setIsPublic(false);
    setIsEditing(true);
    setIsCreating(true);
    setSelectedPrompt(null);
  };

  const handleAIGenerate = async () => {
    if (!editName.trim()) {
      setError('Please enter a prompt name first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editName, 
          description: editName,
          category: editCategory 
        })
      });

      console.log(response)

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      setEditContent(data.content);
      setSuccessMessage('Prompt generated successfully!');
    } catch (err) {
      setError('Failed to generate prompt. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setError(null);
  };

  const handleDuplicate = () => {
    if (selectedPrompt) {
      setEditName(`${selectedPrompt.name} (Copy)`);
      setEditContent(selectedPrompt.content);
      setEditModel(selectedPrompt.model);
      setEditMaxTokens(selectedPrompt.maxTokens);
      setEditCategory(selectedPrompt.category || 'general');
      setEditTags(selectedPrompt.tags || []);
      setIsPublic(false);
      setIsEditing(true);
      setIsCreating(true);
    }
  };

  const handleExport = () => {
    if (!selectedPrompt) return;
    
    const dataStr = JSON.stringify(selectedPrompt, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPrompt.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setEditName(imported.name);
        setEditContent(imported.content);
        setEditModel(imported.model || 'claude-sonnet-4-5-20250929');
        setEditMaxTokens(imported.maxTokens || 2000);
        setEditCategory(imported.category || 'general');
        setEditTags(imported.tags || []);
        setIsEditing(true);
        setIsCreating(true);
        setSuccessMessage('Prompt imported successfully!');
      } catch (err) {
        setError('Invalid prompt file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="p-3 rounded-full bg-primary/10 inline-block mb-2">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">AI Configuration</h1>
        <p className="text-muted-foreground">Customize your AI assistant&apos;s behavior and personality</p>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/50 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-destructive hover:text-destructive/80">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-500">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-500 hover:text-green-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setSelectedTab('prompts')}
          className={`px-4 py-2 rounded-t-lg transition-colors border-b-2 ${
            selectedTab === 'prompts'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent hover:bg-primary/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>Prompts</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompts List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your Prompts ({prompts.length})</h2>
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="p-2 hover:bg-primary/10 rounded-lg transition-colors" title="Import">
                  <Upload className="w-4 h-4" />
                </div>
              </label>
              <Button
                onClick={handleNewPrompt}
                size="sm"
                className="p-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No prompts found</p>
                <p className="text-xs">Create your first prompt to get started</p>
              </div>
            ) : (
              prompts.map(prompt => (
                <motion.button
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-4 rounded-lg transition-all border ${
                    selectedPrompt?.id === prompt.id
                      ? 'bg-primary/10 border-primary shadow-lg'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{prompt.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {prompt.content.slice(0, 80)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {prompt.model.includes('opus') ? 'Opus 4.5' : 
                           prompt.model.includes('sonnet') ? 'Sonnet 4.5' : 'Haiku 4.5'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {prompt.maxTokens} tokens
                        </span>
                        {prompt.isPublic && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Editor/Viewer */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {isCreating ? 'Create New Prompt' : 'Edit Prompt'}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium block mb-2">Prompt Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g., DeFi Strategist, Risk Analyzer..."
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {/* Category & Tags */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="general">General</option>
                        <option value="trading">Trading</option>
                        <option value="analysis">Analysis</option>
                        <option value="education">Education</option>
                        <option value="risk">Risk Management</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">Visibility</label>
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`w-full px-4 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                          isPublic
                            ? 'bg-green-500/10 border-green-500/50 text-green-500'
                            : 'bg-background border-border'
                        }`}
                      >
                        {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {isPublic ? 'Public' : 'Private'}
                      </button>
                    </div>
                  </div>

                  {/* AI Generate Button */}
                  <Button
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !editName.trim()}
                    className="w-full"
                    variant="gradient"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>

                  {/* Content */}
                  <div>
                    <label className="text-sm font-medium block mb-2">System Prompt *</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Describe the AI's personality, capabilities, and behavior..."
                      rows={12}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {editContent.length} characters
                    </p>
                  </div>

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Model</label>
                      <select
                        value={editModel}
                        onChange={(e) => setEditModel(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="claude-sonnet-4-5-20250929">Sonnet 4.5 (Recommended)</option>
                        <option value="claude-opus-4-5-20251101">Opus 4.5 (Advanced)</option>
                        <option value="claude-haiku-4-5-20251001">Haiku 4.5 (Hello)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">Max Tokens</label>
                      <input
                        type="number"
                        value={editMaxTokens}
                        onChange={(e) => setEditMaxTokens(Number(e.target.value))}
                        min="500"
                        max="8000"
                        step="100"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleCancel} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSavePrompt}
                      disabled={!editName.trim() || !editContent.trim()}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isCreating ? 'Create Prompt' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : selectedPrompt ? (
              <motion.div
                key="viewer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedPrompt.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(selectedPrompt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleDuplicate} size="sm" variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleExport} size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-card border border-border space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Model:</span>
                      <span className="ml-2 font-medium">
                        {selectedPrompt.model.includes('opus') ? 'Opus 4.5' : 
                         selectedPrompt.model.includes('sonnet') ? 'Sonnet 4.5' : 'Haiku 4'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Tokens:</span>
                      <span className="ml-2 font-medium">{selectedPrompt.maxTokens}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="ml-2 font-medium capitalize">{selectedPrompt.category || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Visibility:</span>
                      <span className="ml-2 font-medium">{selectedPrompt.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">System Prompt</span>
                      <Button
                        onClick={() => setShowPreview(!showPreview)}
                        size="sm"
                        variant="ghost"
                      >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {showPreview && (
                      <div className="p-4 rounded bg-background/50 border border-border/50 max-h-80 overflow-y-auto">
                        <p className="text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                          {selectedPrompt.content}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    {selectedPrompt.id !== 'default' && (
                      <>
                        <Button onClick={handleEditClick} className="flex-1">
                          Edit Prompt
                        </Button>
                        <Button
                          onClick={() => handleDeletePrompt(selectedPrompt.id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                    {selectedPrompt.id === 'default' && (
                      <Button onClick={handleDuplicate} className="w-full">
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate & Edit
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
                className="flex flex-col items-center justify-center h-96 text-muted-foreground"
              >
                <Brain className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No prompt selected</p>
                <p className="text-sm">Select a prompt from the list or create a new one</p>
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
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">About AI Prompts</h3>
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              <li>• Prompts define your AI assistant&apos;s personality, knowledge, and behavior</li>
              <li>• Use the AI generator to create prompts based on your description</li>
              <li>• Public prompts can be shared with the community (coming soon: on-chain storage)</li>
              <li>• Default prompt cannot be deleted but can be duplicated and customized</li>
              <li>• Export prompts as JSON files for backup or sharing</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};