'use client'

import { useState } from 'react'
import HeroSection from '@/components/HeroSection';
import AIChat from '@/components/AIChat';

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return showChat ? (
    <AIChat />
  ) : (
    <HeroSection onComplete={() => setShowChat(true)} />
  );
}