
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, Playlist, PlayerState, MusicContextType, RepeatMode } from '../types/music';
import { mockSongs, mockPlaylists } from '../data/mockData';
import { toast } from 'sonner';

// Initialize the context with default values
const MusicContext = createContext<MusicContextType | undefined>(undefined);

const initialPlayerState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  queue: [],
  currentIndex: -1,
  volume: 1,
  repeatMode: 'off',
  shuffle: false,
  progress: 0
};

interface MusicProviderProps {
  children: React.ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('ended', handleSongEnd);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    setAudioElement(audio);

    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleSongEnd);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  // Load songs (in a real app, this would fetch from storage)
  const loadSongs = async () => {
    try {
      // In a real app, this would scan the device for music files
      setSongs(mockSongs);
      setPlaylists(mockPlaylists);
      toast.success('Música cargada correctamente');
      console.log('Songs loaded:', mockSongs.length);
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading songs:', error);
      toast.error('Error al cargar música');
      return Promise.reject(error);
    }
  };

  // Load songs on initial mount
  useEffect(() => {
    loadSongs();
  }, []);

  // Handle time updates
  const handleTimeUpdate = () => {
    if (audioElement) {
      setPlayerState(prev => ({
        ...prev,
        progress: audioElement.currentTime
      }));
    }
  };

  // Handle song end
  const handleSongEnd = () => {
    if (playerState.repeatMode === 'one') {
      seekTo(0);
      audioElement?.play();
    } else {
      nextSong();
    }
  };

  // Play a specific song
  const playSong = (songId: string) => {
    const songToPlay = songs.find(song => song.id === songId);
    if (!songToPlay) return;

    const newQueue = [...songs];
    const newIndex = newQueue.findIndex(song => song.id === songId);

    if (audioElement) {
      audioElement.src = songToPlay.path;
      audioElement.load();
      audioElement.play().catch(err => {
        console.error("Error playing audio:", err);
        toast.error("No se pudo reproducir la canción");
      });
    }

    setPlayerState({
      ...playerState,
      currentSong: songToPlay,
      isPlaying: true,
      queue: newQueue,
      currentIndex: newIndex,
      progress: 0
    });

    toast.success(`Reproduciendo: ${songToPlay.title}`);
  };

  // Play a playlist
  const playPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const playlistSongs = playlist.songs
      .map(songId => songs.find(song => song.id === songId))
      .filter(song => song !== undefined) as Song[];

    if (playlistSongs.length === 0) {
      toast.error('La lista de reproducción está vacía');
      return;
    }

    setPlayerState({
      ...playerState,
      queue: playlistSongs,
      currentIndex: 0,
      currentSong: playlistSongs[0],
      isPlaying: true,
      progress: 0
    });

    if (audioElement) {
      audioElement.src = playlistSongs[0].path;
      audioElement.load();
      audioElement.play().catch(err => {
        console.error("Error playing playlist:", err);
        toast.error("No se pudo reproducir la lista");
      });
    }

    toast.success(`Reproduciendo lista: ${playlist.name}`);
  };

  // Toggle play/pause
  const togglePlay = () => {
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
  };

  // Play next song
  const nextSong = () => {
    if (playerState.queue.length === 0) return;

    let nextIndex;
    if (playerState.shuffle) {
      // Random index excluding current
      nextIndex = Math.floor(Math.random() * (playerState.queue.length - 1));
      if (nextIndex >= playerState.currentIndex) nextIndex++;
    } else {
      nextIndex = (playerState.currentIndex + 1) % playerState.queue.length;
      // If repeat is off and we're at the end, stop
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
  };

  // Play previous song
  const previousSong = () => {
    if (playerState.queue.length === 0) return;

    // If we're more than 3 seconds into the song, restart it
    if (playerState.progress > 3) {
      seekTo(0);
      return;
    }

    let prevIndex;
    if (playerState.shuffle) {
      // Random index excluding current
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
  };

  // Seek to a specific time
  const seekTo = (time: number) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setPlayerState({
        ...playerState,
        progress: time
      });
    }
  };

  // Set volume
  const setVolume = (volume: number) => {
    if (audioElement) {
      audioElement.volume = volume;
    }
    setPlayerState({
      ...playerState,
      volume
    });
  };

  // Toggle shuffle
  const toggleShuffle = () => {
    setPlayerState({
      ...playerState,
      shuffle: !playerState.shuffle
    });
    toast.info(playerState.shuffle ? 'Reproducción aleatoria desactivada' : 'Reproducción aleatoria activada');
  };

  // Toggle repeat mode
  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(playerState.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    setPlayerState({
      ...playerState,
      repeatMode: nextMode
    });
    
    let message = '';
    switch (nextMode) {
      case 'off': message = 'Repetición desactivada'; break;
      case 'all': message = 'Repetir todas las canciones'; break;
      case 'one': message = 'Repetir canción actual'; break;
    }
    
    toast.info(message);
  };

  // Create a new playlist
  const createPlaylist = (name: string, songIds: string[]) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      songs: songIds,
      coverImage: songIds.length > 0 
        ? songs.find(s => s.id === songIds[0])?.cover 
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPlaylists([...playlists, newPlaylist]);
    toast.success(`Lista "${name}" creada`);
  };

  // Add a song to a playlist
  const addToPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        // Avoid duplicates
        if (playlist.songs.includes(songId)) {
          toast.info('La canción ya está en la lista');
          return playlist;
        }
        
        const updatedSongs = [...playlist.songs, songId];
        toast.success('Canción añadida a la lista');
        
        return {
          ...playlist,
          songs: updatedSongs,
          updatedAt: new Date()
        };
      }
      return playlist;
    }));
  };

  // Remove a song from a playlist
  const removeFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        const updatedSongs = playlist.songs.filter(id => id !== songId);
        toast.success('Canción eliminada de la lista');
        
        return {
          ...playlist,
          songs: updatedSongs,
          updatedAt: new Date()
        };
      }
      return playlist;
    }));
  };

  // Delete a playlist
  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
    toast.success('Lista de reproducción eliminada');
  };

  // Create NFC tag for music playback (mock implementation)
  const createNfcTag = async (songId: string | null, playlistId: string | null) => {
    try {
      // This would be implemented with actual NFC APIs in a real app
      console.log('Creating NFC tag for:', songId || playlistId);
      toast.success('Etiqueta NFC creada exitosamente');
      return Promise.resolve(true);
    } catch (error) {
      console.error('Error creating NFC tag:', error);
      toast.error('Error al crear etiqueta NFC');
      return Promise.resolve(false);
    }
  };

  // The context value
  const contextValue: MusicContextType = {
    songs,
    playlists,
    playerState,
    loadSongs,
    playSong,
    playPlaylist,
    togglePlay,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    createNfcTag
  };

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
};

// Custom hook to use the music context
export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
};
