import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Brain, History, Thermometer, Sparkles, Save, Database, Lock } from 'lucide-react';

export const AISettings = () => {
  const [selectedTab, setSelectedTab] = React.useState('general');

  const SettingCard = ({ icon: Icon, title, description, comingSoon = true }: { 
    icon: any; 
    title: string; 
    description: string;
    comingSoon?: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-2 break-words">{description}</p>
        </div>
      </div>
    </motion.div>
  );

  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => setSelectedTab(id)}
      className={`px-4 py-2 rounded-lg transition-colors ${
        selectedTab === id
          ? 'bg-primary text-white'
          : 'bg-card hover:bg-primary/10'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header with Coming Soon Badge */}
      <div className="text-center space-y-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block"
        >
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Settings className="w-12 h-12 text-primary" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          AI Settings
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
        >
          <span className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
            🚀 Coming Soon
          </span>
        </motion.div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Customize your KIRIGAMI AI experience with advanced settings for personality, performance, and data management
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <TabButton id="general" label="General" />
        <TabButton id="performance" label="Performance" />
        <TabButton id="data" label="Data & Privacy" />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedTab === 'general' && (
          <>
            <SettingCard
              icon={Brain}
              title="AI Personality"
              description="Customize Claude's personality traits, communication style, and expertise focus for your crypto management needs"
            />
            <SettingCard
              icon={Sparkles}
              title="Response Style"
              description="Configure response length, detail level, and formatting preferences for optimal interaction"
            />
            <SettingCard
              icon={Save}
              title="Prompt Templates"
              description="Save and manage custom prompt templates for recurring analysis tasks and portfolio operations"
            />
            <SettingCard
              icon={History}
              title="Conversation Memory"
              description="Control how long AI remembers context, with options for session-based or persistent memory"
            />
          </>
        )}

        {selectedTab === 'performance' && (
          <>
            <SettingCard
              icon={Thermometer}
              title="Temperature Control"
              description="Adjust AI creativity vs. precision (0.0-1.0). Lower for consistent analysis, higher for creative strategies"
            />
            <SettingCard
              icon={Brain}
              title="Model Selection"
              description="Choose between Claude Sonnet for speed or Opus for maximum intelligence on complex tasks"
            />
            <SettingCard
              icon={Sparkles}
              title="Token Limits"
              description="Set maximum response lengths and context windows for optimal performance and cost management"
            />
            <SettingCard
              icon={Settings}
              title="Auto-Actions"
              description="Configure automated responses to market conditions and portfolio thresholds"
            />
          </>
        )}

        {selectedTab === 'data' && (
          <>
            <SettingCard
              icon={History}
              title="Conversation History"
              description="Export, import, or clear your chat history. Control data retention and archival policies"
            />
            <SettingCard
              icon={Database}
              title="Data Storage"
              description="Manage local vs. cloud storage preferences for conversations, analysis results, and portfolio data"
            />
            <SettingCard
              icon={Lock}
              title="Privacy Settings"
              description="Configure what data is shared with AI, encryption options, and compliance preferences"
            />
            <SettingCard
              icon={Save}
              title="Backup & Restore"
              description="Automated backup schedules and one-click restore options for all your AI configurations"
            />
          </>
        )}
      </div>

      {/* Feature Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20"
      >
        <h3 className="text-lg font-semibold mb-3">What's Coming</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Fine-tune AI personality traits for different crypto strategies</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Advanced temperature controls for risk vs. reward optimization</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Export conversation histories and analysis reports</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Custom prompt templates library with community sharing</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};