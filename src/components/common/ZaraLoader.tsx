import React from 'react';
import { motion } from 'framer-motion';

interface ZaraLoaderProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const ZaraLoader: React.FC<ZaraLoaderProps> = ({ 
  fullScreen = false, 
  size = 'md',
  text = 'Chargement Zarazarao...'
}) => {
  const sizePixels = size === 'sm' ? 48 : size === 'lg' ? 96 : 72;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer ambient glow */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 to-amber-400/30 blur-xl animate-pulse"
          style={{ width: sizePixels + 20, height: sizePixels + 20 }}
        />

        {/* SVG Z Snake path animation */}
        <svg
          width={sizePixels}
          height={sizePixels}
          viewBox="0 0 100 100"
          className="relative z-10 overflow-visible"
        >
          <defs>
            <linearGradient id="zGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background trace path for Z */}
          <path
            d="M 20,25 L 80,25 L 20,75 L 80,75"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />

          {/* Serpent / Snake Animated Z Path */}
          <motion.path
            d="M 20,25 L 80,25 L 20,75 L 80,75"
            fill="none"
            stroke="url(#zGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{
              pathLength: [0.15, 0.6, 0.15],
              pathOffset: [0, 1, 2],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Pulsing head circle following the snake */}
          <motion.circle
            r="6"
            fill="#f59e0b"
            filter="url(#glow)"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      </div>

      {text && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-600 bg-clip-text text-transparent animate-pulse"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
