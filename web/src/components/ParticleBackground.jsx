import React, { useEffect, useRef } from 'react';

export default function ParticleBackground({ isDark = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse Tracking for Cursor Glow Effect
    const mouse = { x: width / 2, y: height / 2, radius: 180 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particles Array - Soft ambient glow points
    const numParticles = 24;
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.35 + 0.1,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Smooth Mouse Cursor Ambient Glow
      const glowGradient = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        mouse.radius
      );
      if (isDark) {
        glowGradient.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
        glowGradient.addColorStop(0.5, 'rgba(20, 184, 166, 0.03)');
        glowGradient.addColorStop(1, 'transparent');
      } else {
        glowGradient.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
        glowGradient.addColorStop(0.5, 'rgba(20, 184, 166, 0.02)');
        glowGradient.addColorStop(1, 'transparent');
      }
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.fill();

      // Render Soft Floating Glow Shimmers
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(52, 211, 153, ${Math.max(0.05, Math.min(0.35, p.alpha))})`
          : `rgba(16, 185, 129, ${Math.max(0.04, Math.min(0.25, p.alpha))})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = isDark ? 'rgba(52, 211, 153, 0.4)' : 'rgba(16, 185, 129, 0.3)';
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
    />
  );
}
