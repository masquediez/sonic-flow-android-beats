
import { useState, useEffect, useCallback } from 'react';
import { PlayerState, Song } from '../types/music';

export const useMusicPlayer = (
  playerState: PlayerState,
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>
) => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('ended', handleSongEnd);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleSongEnd);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
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
      audioElement?.play();
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

    if (playerState.isPlaying) {
      audioElement?.pause();
    } else {
      audioElement?.play().catch(err => {
        console.error("Error resuming playback:", err);
      });
    }

    setPlayerState({
      ...playerState,
      isPlaying: !playerState.isPlaying
    });
  }, [audioElement, playerState, setPlayerState]);

  const nextSong = useCallback(() => {
    if (playerState.queue.length === 0) return;

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
    if (audioElement) {
      audioElement.src = nextSong.path;
      audioElement.load();
      audioElement.play().catch(err => {
        console.error("Error playing next song:", err);
      });
    }

    setPlayerState({
      ...playerState,
      currentSong: nextSong,
      currentIndex: nextIndex,
      isPlaying: true,
      progress: 0
    });
  }, [audioElement, playerState, setPlayerState]);

  const previousSong = useCallback(() => {
    if (playerState.queue.length === 0) return;

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
    if (audioElement) {
      audioElement.src = prevSong.path;
      audioElement.load();
      audioElement.play().catch(err => {
        console.error("Error playing previous song:", err);
      });
    }

    setPlayerState({
      ...playerState,
      currentSong: prevSong,
      currentIndex: prevIndex,
      isPlaying: true,
      progress: 0
    });
  }, [audioElement, playerState, setPlayerState, seekTo]);

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
