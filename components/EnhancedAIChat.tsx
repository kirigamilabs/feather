import React, { useState, useRef, useEffect } from 'react'
import { FeatherProvider, useFeather, useFeatureShortcuts } from '@/components/FeatherProvider';
import { 
  Wallet, 
  TrendingUp, 
  ArrowRightLeft, 
  ChevronRight 
} from 'lucide-react';
import AIChat from '@/components/AIChat';


const ChatActionManager = ({ messages }) => {
  const feather = useFeather();

  useEffect(() => {
    // Clear previous suggestions
    feather.suggestions.forEach(suggestion => 
      feather.removeSuggestion(suggestion.id)
    );

    // Last message determines context-specific actions
    const lastMessage = messages[messages.length - 1];
    
    // Wallet Connection Context
    if (lastMessage?.content.includes('wallet')) {
      feather.addSuggestion({
        id: 'wallet-connect',
        text: 'Connect Wallet',
        action: () => connectWallet(),
        priority: 100,
        icon: Wallet
      });
    }

    // Trading Context
    if (messageContainsTrading(lastMessage?.content)) {
      feather.addSuggestion({
        id: 'trade-suggest',
        text: 'Execute Trade',
        action: () => initiateTrade(),
        priority: 90,
        icon: ArrowRightLeft
      });

      feather.addSuggestion({
        id: 'market-analysis',
        text: 'Get Market Insights',
        action: () => showMarketAnalysis(),
        priority: 80,
        icon: TrendingUp
      });
    }

    // Portfolio Context
    if (lastMessage?.content.includes('portfolio')) {
      feather.addSuggestion({
        id: 'optimize-portfolio',
        text: 'Optimize Portfolio',
        action: () => optimizePortfolio(),
        priority: 85,
        icon: ChevronRight
      });
    }

    if (lastMessage?.type === 'code') {
        feather.addSuggestion({
          id: 'code-actions',
          text: 'Generate Unit Tests',
          action: () => generateUnitTests(lastMessage.content),
          priority: 90,
          icon: Code
        });
      }
      
      if (lastMessage?.type === 'text') {
        feather.addSuggestion({
          id: 'text-actions',
          text: 'Improve Writing',
          action: () => improveWriting(lastMessage.content),
          priority: 80,
          icon: Edit3
        });
  }, [messages]);

  return null;
};

const messageContainsTrading = (content?: string) => {
  return content?.toLowerCase().includes('trade') || 
         content?.toLowerCase().includes('swap');
};

const connectWallet = () => {
  // Wallet connection logic
  console.log('Connecting wallet...');
};

const initiateTrade = () => {
  // Trade initiation logic
  console.log('Initiating trade...');
};

const showMarketAnalysis = () => {
  // Market analysis display logic
  console.log('Showing market analysis...');
};

const optimizePortfolio = () => {
  // Portfolio optimization logic
  console.log('Optimizing portfolio...');
};

const generateUnitTests = (code) => {
    // Logic to generate unit tests
    console.log('Generating unit tests for:', code);
};

const improveWriting = (text) => {
    // Logic to improve writing
    console.log('Improving writing for:', text);
};

const regenerateLastResponse = () => {
    // Regenerate the last AI response
    console.log('Regenerating last response');
};

const copyLastResponse = () => {
// Copy last AI response to clipboard
console.log('Copying last response');
};

const EnhancedAIChat = () => {
  const [messages, setMessages] = useState([]);

  return (
    <FeatherProvider>
      <ChatActionManager messages={messages} />
        <AIChat />
    </FeatherProvider>
  );
};

export default EnhancedAIChat;