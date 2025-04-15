import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, Song } from '../types/music';
import { toast } from 'sonner';
import { formatPathForAndroid } from '../utils/fileUtils';

export const useMusicPlayer = (
  playerState: PlayerState,
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
) => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioErrorRef = useRef<number>(0);

  useEffect(() => {
    const audio = new Audio();
    
    audio.addEventListener('ended', handleSongEnd);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      const error = audio.error;
      if (error) {
        console.error('Audio error code:', error.code, 'message:', error.message);
        
        if (audioErrorRef.current < 2) {
          toast.error(`Error al reproducir audio: ${error.message || 'Error desconocido'}`);
          audioErrorRef.current++;
        }
      }
    });
    
    audio.addEventListener('playing', () => {
      console.log('Audio started playing');
      toast.success('Reproduciendo audio');
    });
    
    audio.addEventListener('loadeddata', () => {
      console.log('Audio data loaded, ready to play');
    });
    
    setAudioElement(audio);
    
    return () => {
      console.log('Cleaning up audio element');
      audio.pause();
      audio.removeEventListener('ended', handleSongEnd);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', () => {});
      audio.removeEventListener('playing', () => {});
      audio.removeEventListener('loadeddata', () => {});
    };
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioElement) {
      setPlayerState(prev => ({
        ...prev,
        progress: audioElement.currentTime
      }));
    }
  }, [audioElement, setPlayerState]);

  const handleSongEnd = useCallback(() => {
    if (playerState.repeatMode === 'one') {
      seekTo(0);
      audioElement?.play().catch(err => {
        console.error("Error repeating song:", err);
      });
    } else {
      nextSong();
    }
  }, [playerState.repeatMode, audioElement]);

  const seekTo = useCallback((time: number) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setPlayerState({
        ...playerState,
        progress: time
      });
    }
  }, [audioElement, playerState, setPlayerState]);

  const setVolume = useCallback((volume: number) => {
    if (audioElement) {
      audioElement.volume = volume;
    }
    setPlayerState({
      ...playerState,
      volume
    });
  }, [audioElement, playerState, setPlayerState]);

  const togglePlay = useCallback(() => {
    if (!playerState.currentSong) return;

    console.log('Toggle play called, current state:', playerState.isPlaying);
    
    if (playerState.isPlaying) {
      audioElement?.pause();
      console.log('Pausing audio');
    } else {
      if (audioElement) {
        const audioPath = formatPathForAndroid(playerState.currentSong.path);
        audioElement.src = audioPath;
        console.log('Playing audio from path:', audioElement.src);
        
        audioElement.play().catch(err => {
          console.error("Error playing audio:", err);
          toast.error(`No se pudo reproducir: ${err.message}`);
        });
      }
    }

    setPlayerState({
      ...playerState,
      isPlaying: !playerState.isPlaying
    });
  }, [audioElement, playerState, setPlayerState]);

  const playSongWithPath = useCallback((song: Song) => {
    if (!audioElement) return;
    
    audioErrorRef.current = 0;
    
    const audioPath = formatPathForAndroid(song.path);
    console.log('Loading audio from path:', audioPath);
    
    audioElement.src = audioPath;
    audioElement.load();
    
    audioElement.play().catch(err => {
      console.error("Error playing song:", err);
      toast.error(`No se pudo reproducir "${song.title}": ${err.message}`);
    });
  }, [audioElement]);

  const nextSong = useCallback(() => {
    if (playerState.queue.length === 0) return;

    console.log('Next song called');
    
    let nextIndex;
    if (playerState.shuffle) {
      nextIndex = Math.floor(Math.random() * (playerState.queue.length - 1));
      if (nextIndex >= playerState.currentIndex) nextIndex++;
    } else {
      nextIndex = (playerState.currentIndex + 1) % playerState.queue.length;
      if (playerState.repeatMode === 'off' && nextIndex === 0) {
        audioElement?.pause();
        setPlayerState({
          ...playerState,
          isPlaying: false
        });
        return;
      }
    }

    const nextSong = playerState.queue[nextIndex];
    if (audioElement && nextSong) {
      playSongWithPath(nextSong);
    }

    setPlayerState({
      ...playerState,
      currentSong: nextSong,
      currentIndex: nextIndex,
      isPlaying: true,
      progress: 0
    });
  }, [audioElement, playerState, setPlayerState, playSongWithPath]);

  const previousSong = useCallback(() => {
    if (playerState.queue.length === 0) return;

    console.log('Previous song called');
    
    if (playerState.progress > 3) {
      seekTo(0);
      return;
    }

    let prevIndex;
    if (playerState.shuffle) {
      prevIndex = Math.floor(Math.random() * (playerState.queue.length - 1));
      if (prevIndex >= playerState.currentIndex) prevIndex++;
    } else {
      prevIndex = playerState.currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = playerState.repeatMode === 'off' ? 0 : playerState.queue.length - 1;
      }
    }

    const prevSong = playerState.queue[prevIndex];
    if (audioElement && prevSong) {
      playSongWithPath(prevSong);
    }

    setPlayerState({
      ...playerState,
      currentSong: prevSong,
      currentIndex: prevIndex,
      isPlaying: true,
      progress: 0
    });
  }, [audioElement, playerState, setPlayerState, seekTo, playSongWithPath]);

  return {
    audioElement,
    handleTimeUpdate,
    handleSongEnd,
    seekTo,
    setVolume,
    togglePlay,
    nextSong,
    previousSong
  };
};
