import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Brain, Mic, Eye, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/Button';
import { useAIStore } from '@/state/aiState';

// Theme Toggle Component
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

// Enhanced AI Status Display
export const AIStatusDisplay = () => {
  const { mode, confidence, personality } = useAIStore();
  
  const getModeConfig = (currentMode: string) => {
    switch (currentMode) {
      case 'thinking':
        return {
          icon: Brain,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
          label: 'Analyzing...',
          animation: { rotate: [0, 360], scale: [1, 1.1, 1] }
        };
      case 'listening':
        return {
          icon: Mic,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Listening',
          animation: { scale: [1, 1.2, 1] }
        };
      case 'speaking':
        return {
          icon: MessageSquare,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          label: 'Responding',
          animation: { x: [-2, 2, -2] }
        };
      default:
        return {
          icon: Eye,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          label: 'Observing',
          animation: { opacity: [0.5, 1, 0.5] }
        };
    }
  };

  const modeConfig = getModeConfig(mode);
  const Icon = modeConfig.icon;

  return (
    <motion.div 
      className="flex items-center gap-3 px-3 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50"
      layout
    >
      {/* Animated Icon */}
      <motion.div
        animate={modeConfig.animation}
        transition={{ 
          duration: mode === 'thinking' ? 2 : 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`p-2 rounded-full ${modeConfig.bgColor}`}
      >
        <Icon className={`w-4 h-4 ${modeConfig.color}`} />
      </motion.div>

      {/* Status Info */}
      <div className="flex flex-col">
        <span className="text-sm font-medium">{modeConfig.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {(confidence * 100).toFixed(0)}% confident
          </span>
          
          {/* Confidence Bar */}
          <div className="w-12 h-1 bg-background rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Personality Indicator (subtle) */}
      <div className="flex gap-1">
        {Object.entries(personality).map(([trait, value]) => (
          <div 
            key={trait}
            className="w-1 h-4 bg-background rounded-full overflow-hidden"
            title={`${trait}: ${(value * 100).toFixed(0)}%`}
          >
            <motion.div
              className="w-full bg-gradient-to-t from-primary to-secondary rounded-full"
              initial={{ height: 0 }}
              animate={{ height: `${value * 100}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Neural Background Component (for chat)
export const NeuralBackground = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { mode } = useAIStore();
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      connections: number[];
    }> = [];

    // Initialize particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        connections: []
      });
    }

    // Create connections
    particles.forEach((particle, i) => {
      for (let j = i + 1; j < particles.length; j++) {
        if (Math.random() > 0.85) {
          particle.connections.push(j);
        }
      }
    });

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Draw connections
        particle.connections.forEach(j => {
          const other = particles[j];
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = (120 - distance) / 120;
            const intensity = mode === 'thinking' ? opacity * 0.8 : opacity * 0.3;
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${intensity})`;
            ctx.lineWidth = mode === 'thinking' ? 1.5 : 0.8;
            ctx.stroke();
          }
        });
        
        // Draw particle
        const size = mode === 'thinking' ? 3 : 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = mode === 'thinking' ? 
          'rgba(59, 130, 246, 0.8)' : 
          'rgba(148, 163, 184, 0.6)';
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mode]);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30 z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};