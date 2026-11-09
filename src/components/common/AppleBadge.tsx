import React from 'react';

interface AppleBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AppleBadge: React.FC<AppleBadgeProps> = ({
  count,
  size = 'md',
  showLabel = false,
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-semibold'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center rounded-full bg-amber-50 text-emerald-900 border border-amber-200/80 shadow-xs hover:border-amber-300 transition-all ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${sizeClasses[size]} ${className}`}
      title="Points Fihavanana Zarazarao (Points de solidarité et d'engagement)"
    >
      <span className={`${iconSizes[size]} select-none`} role="img" aria-label="Points Fihavanana">
        ⭐
      </span>
      <span className="font-bold tracking-tight text-emerald-950">
        {count.toLocaleString('fr-FR')}
      </span>
      {showLabel && (
        <span className="hidden sm:inline text-emerald-700 font-medium text-xs">
          {count > 1 ? 'pts Fihavanana' : 'pt Fihavanana'}
        </span>
      )}
    </div>
  );
};
