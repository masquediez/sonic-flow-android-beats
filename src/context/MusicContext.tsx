
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, Playlist, PlayerState, MusicContextType, RepeatMode } from '../types/music';
import { mockSongs, mockPlaylists } from '../data/mockData';
import { toast } from 'sonner';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { useFileSystem } from '../hooks/useFileSystem';
import { usePlaylistManager } from '../hooks/usePlaylistManager';
import { useNfcManager } from '../hooks/useNfcManager';

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

  // Hooks con la lógica extraída
  const { audioElement, handleTimeUpdate, handleSongEnd, seekTo, setVolume, togglePlay, nextSong, previousSong } = 
    useMusicPlayer(playerState, setPlayerState);
  
  const { scanMusicFiles, loadSongs } = useFileSystem(setSongs);
  
  const { createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist } = 
    usePlaylistManager(songs, playlists, setPlaylists);
  
  const { createNfcTag } = useNfcManager(songs, playlists);

  useEffect(() => {
    loadSongs();
  }, []);

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

  const toggleShuffle = () => {
    setPlayerState({
      ...playerState,
      shuffle: !playerState.shuffle
    });
    toast.info(playerState.shuffle ? 'Reproducción aleatoria desactivada' : 'Reproducción aleatoria activada');
  };

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

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
};
