
import React, { useRef } from 'react';
import { formatTime } from '@/utils/timeUtils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentTime, 
  duration, 
  onSeek 
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const bounds = progressRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = x / bounds.width;
    const seekTime = percentage * duration;
    
    onSeek(seekTime);
  };

  const progressPercentage = (currentTime / duration) * 100 || 0;

  return (
    <div className="w-full space-y-1">
      <div
        ref={progressRef}
        className="h-1 bg-gray-700 rounded-full cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="progress-bar h-full rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
