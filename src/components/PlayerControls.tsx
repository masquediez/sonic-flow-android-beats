
import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Repeat1, 
  Shuffle, 
  Volume, 
  Volume1, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RepeatMode } from '@/types/music';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  repeatMode: RepeatMode;
  shuffle: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  volume,
  onVolumeChange,
  repeatMode,
  shuffle,
  size = 'md'
}) => {
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX />;
    if (volume < 0.33) return <Volume />;
    if (volume < 0.66) return <Volume1 />;
    return <Volume2 />;
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Repeat1 className="text-player-accent" />;
      case 'all':
        return <Repeat className="text-player-accent" />;
      default:
        return <Repeat />;
    }
  };

  const buttonSizes = {
    sm: {
      main: 'h-8 w-8',
      secondary: 'h-6 w-6',
      iconMain: 'h-4 w-4',
      iconSecondary: 'h-3 w-3'
    },
    md: {
      main: 'h-12 w-12',
      secondary: 'h-10 w-10',
      iconMain: 'h-6 w-6',
      iconSecondary: 'h-5 w-5'
    },
    lg: {
      main: 'h-16 w-16',
      secondary: 'h-12 w-12',
      iconMain: 'h-8 w-8',
      iconSecondary: 'h-6 w-6'
    }
  };

  const sizeClass = buttonSizes[size];

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className={cn("text-white hover:bg-white/10", sizeClass.secondary)}
          onClick={onToggleShuffle}
        >
          <Shuffle className={cn(sizeClass.iconSecondary, shuffle && "text-player-accent")} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn("text-white hover:bg-white/10", sizeClass.secondary)}
          onClick={onPrevious}
        >
          <SkipBack className={sizeClass.iconSecondary} />
        </Button>

        <Button
          variant="default"
          size="icon"
          className={cn(
            "bg-white text-black hover:bg-white/90 rounded-full", 
            sizeClass.main
          )}
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <Pause className={sizeClass.iconMain} />
          ) : (
            <Play className={sizeClass.iconMain} />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn("text-white hover:bg-white/10", sizeClass.secondary)}
          onClick={onNext}
        >
          <SkipForward className={sizeClass.iconSecondary} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn("text-white hover:bg-white/10", sizeClass.secondary)}
          onClick={onToggleRepeat}
        >
          {getRepeatIcon()}
        </Button>
      </div>

      {size !== 'sm' && (
        <div className="flex items-center space-x-2 w-full max-w-xs">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 h-8 w-8"
            onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
          >
            {getVolumeIcon()}
          </Button>
          
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="w-24"
            onValueChange={(value) => onVolumeChange(value[0] / 100)}
          />
        </div>
      )}
    </div>
  );
};

export default PlayerControls;
