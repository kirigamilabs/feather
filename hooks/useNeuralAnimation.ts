'use client'
import { useCallback, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
}

export const useNeuralAnimation = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(null);
  const activeNodesRef = useRef<number[]>([]);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const particles: Particle[] = [];
    const count = 50;
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
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

    particlesRef.current = particles;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particlesRef.current.forEach((particle, i) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off walls
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

      // Draw connections
      particle.connections.forEach(j => {
        const other = particlesRef.current[j];
        const dx = other.x - particle.x;
        const dy = other.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const isActive = activeNodesRef.current.includes(i) || 
                          activeNodesRef.current.includes(j);
          
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = isActive 
            ? `rgba(59, 130, 246, ${1 - distance / 150})`
            : `rgba(148, 163, 184, ${1 - distance / 150})`;
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.stroke();
        }
      });

      // Draw particle
      const isActive = activeNodesRef.current.includes(i);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, isActive ? 4 : 2, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#3b82f6' : '#94a3b8';
      ctx.fill();
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const activateNodes = useCallback((nodes: number[]) => {
    activeNodesRef.current = nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate, initParticles]);

  return { activateNodes };
};