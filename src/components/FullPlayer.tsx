
import React from 'react';
import { useMusicContext } from '@/context/MusicContext';
import AlbumCover from './AlbumCover';
import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullPlayerProps {
  onMinimizePlayer: () => void;
  className?: string;
}

const FullPlayer: React.FC<FullPlayerProps> = ({ 
  onMinimizePlayer,
  className
}) => {
  const { 
    playerState, 
    togglePlay, 
    nextSong, 
    previousSong,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    seekTo
  } = useMusicContext();

  const { 
    currentSong, 
    isPlaying, 
    volume, 
    repeatMode, 
    shuffle,
    progress
  } = playerState;

  if (!currentSong) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-player-background flex flex-col items-center justify-between p-6 animate-scale-up",
        className
      )}
      style={{
        backgroundImage: currentSong.cover 
          ? `linear-gradient(to bottom, rgba(18, 18, 18, 0.8), rgba(18, 18, 18, 1)), url(${currentSong.cover})` 
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'darken'
      }}
    >
      <div className="w-full flex justify-between items-center">
        <button 
          className="p-2 text-white rounded-full hover:bg-white/10"
          onClick={onMinimizePlayer}
        >
          <ChevronDown size={24} />
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md">
        <AlbumCover 
          src={currentSong.cover} 
          alt={currentSong.title} 
          size="xl"
          className="shadow-2xl"
        />
        
        <div className="text-center space-y-1 w-full">
          <h2 className="text-xl font-bold text-white truncate">{currentSong.title}</h2>
          <p className="text-gray-400">{currentSong.artist}</p>
          {currentSong.album && (
            <p className="text-sm text-gray-500">{currentSong.album}</p>
          )}
        </div>
        
        <div className="w-full">
          <ProgressBar 
            currentTime={progress} 
            duration={currentSong.duration} 
            onSeek={seekTo}
          />
        </div>
        
        <PlayerControls 
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onNext={nextSong}
          onPrevious={previousSong}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
          volume={volume}
          onVolumeChange={setVolume}
          repeatMode={repeatMode}
          shuffle={shuffle}
          size="lg"
        />
      </div>
      
      <div className="h-6"></div> {/* Spacer */}
    </div>
  );
};

export default FullPlayer;
