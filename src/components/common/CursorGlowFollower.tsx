import React, { useEffect, useState } from 'react';

export const CursorGlowFollower: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Check if hovering over clickable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = !!target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');
        setIsPointer(isClickable);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {/* Primary Glowing Gradient Spotlight following cursor */}
      <div
        className="absolute rounded-full transition-transform duration-75 ease-out blur-3xl opacity-35"
        style={{
          width: isPointer ? '380px' : '280px',
          height: isPointer ? '380px' : '280px',
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: 'translate(-50%, -50%)',
          background: isPointer
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(124, 58, 237, 0.35) 50%, rgba(16, 185, 129, 0) 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(2, 132, 199, 0.3) 50%, rgba(225, 29, 72, 0) 70%)',
        }}
      />

      {/* Subtle Precision Cursor Ring */}
      <div
        className="absolute rounded-full border border-emerald-400/40 transition-all duration-150 ease-out hidden sm:block"
        style={{
          width: isPointer ? '48px' : '24px',
          height: isPointer ? '48px' : '24px',
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: isPointer ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.08)',
          borderColor: isPointer ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.4)',
        }}
      />
    </div>
  );
};
