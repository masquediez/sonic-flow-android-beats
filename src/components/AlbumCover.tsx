
import React from 'react';
import { cn } from '@/lib/utils';

interface AlbumCoverProps {
  src: string | undefined;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  spinning?: boolean;
}

const AlbumCover: React.FC<AlbumCoverProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  className,
  spinning = false 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-48 h-48 md:w-64 md:h-64',
    xl: 'w-64 h-64 md:w-80 md:h-80'
  };

  return (
    <div 
      className={cn(
        'relative rounded-md overflow-hidden album-shadow',
        sizeClasses[size],
        spinning && 'animate-spin-slow',
        className
      )}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover" 
        />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <svg 
            className="w-1/2 h-1/2 text-gray-500" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AlbumCover;
