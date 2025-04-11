
import React from 'react';
import { useMusicContext } from '@/context/MusicContext';
import AlbumCover from './AlbumCover';
import PlayerControls from './PlayerControls';
import { cn } from '@/lib/utils';
import { Maximize2 } from 'lucide-react';

interface MiniPlayerProps {
  onExpandPlayer: () => void;
  className?: string;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ 
  onExpandPlayer,
  className
}) => {
  const { 
    playerState, 
    togglePlay, 
    nextSong, 
    previousSong,
    toggleShuffle,
    toggleRepeat,
    setVolume
  } = useMusicContext();

  const { currentSong, isPlaying, volume, repeatMode, shuffle } = playerState;

  if (!currentSong) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 p-2 glass-effect border-t border-gray-800 z-50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div onClick={onExpandPlayer} className="cursor-pointer">
            <AlbumCover 
              src={currentSong.cover} 
              alt={currentSong.title} 
              size="sm" 
            />
          </div>
          
          <div className="flex flex-col min-w-0 flex-1" onClick={onExpandPlayer}>
            <h3 className="text-sm font-medium text-white truncate">{currentSong.title}</h3>
            <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
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
            size="sm"
          />
          
          <button 
            className="p-1 text-gray-400 hover:text-white"
            onClick={onExpandPlayer}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-0.5">
        <div 
          className="progress-bar h-full"
          style={{ 
            width: `${(playerState.progress / (currentSong.duration || 1)) * 100}%` 
          }} 
        />
      </div>
    </div>
  );
};

export default MiniPlayer;
