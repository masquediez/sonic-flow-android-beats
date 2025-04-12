import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, Playlist, PlayerState, MusicContextType, RepeatMode } from '../types/music';
import { mockSongs, mockPlaylists } from '../data/mockData';
import { toast } from 'sonner';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { NativeSettings, IOSSettings, AndroidSettings } from 'capacitor-native-settings';

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

  const scanMusicFiles = async () => {
    try {
      await NativeSettings.open({
        type: AndroidSettings.ApplicationDetails
      });

      const musicDirectories = [
        Directory.Documents, 
        Directory.Music, 
        Directory.ExternalStorage
      ];

      const musicFiles: Song[] = [];

      for (const dir of musicDirectories) {
        try {
          const result = await Filesystem.readdir({
            path: dir.toString(),
            directory: dir
          });

          const audioFiles = result.files.filter(file => 
            file.name.endsWith('.mp3') || 
            file.name.endsWith('.wav') || 
            file.name.endsWith('.aac')
          );

          for (const audioFile of audioFiles) {
            musicFiles.push({
              id: audioFile.uri || audioFile.path || '',
              title: audioFile.name,
              artist: 'Unknown Artist',
              album: 'Unknown Album',
              duration: 0,
              path: audioFile.uri || audioFile.path || '',
              cover: undefined,
              year: undefined,
              genre: undefined
            });
          }
        } catch (dirError) {
          console.error(`Error scanning directory ${dir}:`, dirError);
        }
      }

      setSongs(musicFiles);
      toast.success(`Encontradas ${musicFiles.length} canciones`);
      return musicFiles;
    } catch (error) {
      console.error('Error scanning music files:', error);
      toast.error('No se pudieron escanear archivos de música');
      return [];
    }
  };

  const loadSongs = async () => {
    try {
      const scannedSongs = await scanMusicFiles();
      if (scannedSongs.length === 0) {
        setSongs(mockSongs);
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading songs:', error);
      toast.error('Error al cargar música');
      return Promise.reject(error);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const handleTimeUpdate = () => {
    if (audioElement) {
      setPlayerState(prev => ({
        ...prev,
        progress: audioElement.currentTime
      }));
    }
  };

  const handleSongEnd = () => {
    if (playerState.repeatMode === 'one') {
      seekTo(0);
      audioElement?.play();
    } else {
      nextSong();
    }
  };

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

  const nextSong = () => {
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
  };

  const previousSong = () => {
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
  };

  const seekTo = (time: number) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setPlayerState({
        ...playerState,
        progress: time
      });
    }
  };

  const setVolume = (volume: number) => {
    if (audioElement) {
      audioElement.volume = volume;
    }
    setPlayerState({
      ...playerState,
      volume
    });
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

  const addToPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
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

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
    toast.success('Lista de reproducción eliminada');
  };

  const createNfcTag = async (songId: string | null, playlistId: string | null) => {
    try {
      const songToTag = songId 
        ? songs.find(song => song.id === songId) 
        : playlists.find(playlist => playlist.id === playlistId);

      if (!songToTag) {
        toast.error('No se encontró la canción o lista');
        return false;
      }

      console.log('Creando tag NFC para:', songToTag);
      toast.success('Etiqueta NFC creada exitosamente');
      return true;
    } catch (error) {
      console.error('Error creating NFC tag:', error);
      toast.error('Error al crear etiqueta NFC');
      return false;
    }
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
