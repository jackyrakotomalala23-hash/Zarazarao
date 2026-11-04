import React from 'react';

interface BarcodeSvgProps {
  code: string;
  className?: string;
  height?: number;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  code,
  className = '',
  height = 56
}) => {
  // Deterministic line widths based on code characters
  const bars: { width: number; isSpace: boolean }[] = [];
  
  // Guard bars at start
  bars.push({ width: 2, isSpace: false });
  bars.push({ width: 2, isSpace: true });
  bars.push({ width: 2, isSpace: false });

  // Generate pattern from the 8-digit code
  for (let i = 0; i < code.length; i++) {
    const digit = parseInt(code[i], 10) || 5;
    const w1 = (digit % 3) + 1;
    const w2 = ((digit + 1) % 2) + 1;
    const w3 = ((digit * 2) % 3) + 1;
    const w4 = 2;

    bars.push({ width: w1, isSpace: false });
    bars.push({ width: w2, isSpace: true });
    bars.push({ width: w3, isSpace: false });
    bars.push({ width: w4, isSpace: true });
  }

  // Guard bars at end
  bars.push({ width: 2, isSpace: false });
  bars.push({ width: 2, isSpace: true });
  bars.push({ width: 2, isSpace: false });

  const totalWidth = bars.reduce((acc, bar) => acc + bar.width, 0);

  let currentX = 0;

  return (
    <div className={`flex flex-col items-center select-none bg-white p-2 rounded border border-gray-200 ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[260px] h-12"
        preserveAspectRatio="none"
      >
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width;
          if (bar.isSpace) return null;
          return (
            <rect
              key={index}
              x={x}
              y={0}
              width={bar.width}
              height={height}
              fill="#111827"
            />
          );
        })}
      </svg>
      <div className="font-mono text-xs font-bold tracking-widest text-gray-800 mt-1">
        {code.slice(0, 4)} - {code.slice(4)}
      </div>
    </div>
  );
};
