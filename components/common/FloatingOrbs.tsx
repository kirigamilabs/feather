import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from 'next-themes';

const FloatingOrbs = () => {
  const orbs = useRef([]);
  const controls = useAnimation();
  const { theme } = useTheme();

  const createOrb = (index) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useTransform(y, [-100, 0, 100], [0.8, 1, 0.8]);
    const opacity = useTransform(y, [-100, 0, 100], [0.3, 0.8, 0.3]);

    return (
      <motion.div
        key={index}
        style={{
          x,
          y,
          scale,
          opacity,
          background: theme === 'dark' 
            ? 'radial-gradient(circle at 30% 30%, rgba(147, 51, 234, 0.7), rgba(79, 70, 229, 0.3))'
            : 'radial-gradient(circle at 30% 30%, rgba(219, 39, 119, 0.3), rgba(124, 58, 237, 0.1))',
        }}
        className="absolute w-32 h-32 rounded-full blur-xl"
        animate={{
          x: [0, Math.random() * 100 - 50, 0],
          y: [0, Math.random() * 100 - 50, 0],
          rotate: [0, Math.random() * 360, 0],
        }}
        transition={{
          duration: 10 + Math.random() * 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {Array.from({ length: 5 }).map((_, i) => createOrb(i))}
    </div>
  );
};

const NotificationSystem = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-lg p-4 shadow-xl"
        >
          <div className="flex items-center gap-2">
            {notification.icon}
            <div>
              <h4 className="font-medium">{notification.title}</h4>
              <p className="text-sm opacity-80">{notification.message}</p>
            </div>
          </div>
          <motion.div
            className="h-1 bg-blue-500 rounded-full mt-2"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: notification.duration || 5 }}
          />
        </motion.div>
      ))}
    </div>
  );
};

const InteractiveBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };

    const createParticle = (x, y) => ({
      x,
      y,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      size: Math.random() * 3 + 1,
      color: theme === 'dark' ? 
        `hsla(${Math.random() * 60 + 240}, 70%, 50%, 0.3)` :
        `hsla(${Math.random() * 60 + 180}, 70%, 50%, 0.2)`
    });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 100 }, () => 
        createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        )
      );
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary check
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Mouse interaction
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const angle = Math.atan2(dy, dx);
          particle.vx -= Math.cos(angle) * 0.2;
          particle.vy -= Math.sin(angle) * 0.2;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
    />
  );
};

export { FloatingOrbs, NotificationSystem, InteractiveBackground };