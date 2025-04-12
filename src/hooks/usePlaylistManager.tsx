
import { useCallback } from 'react';
import { Song, Playlist } from '../types/music';
import { toast } from 'sonner';

export const usePlaylistManager = (
  songs: Song[],
  playlists: Playlist[],
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>
) => {
  const createPlaylist = useCallback((name: string, songIds: string[]) => {
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
  }, [songs, playlists, setPlaylists]);

  const addToPlaylist = useCallback((playlistId: string, songId: string) => {
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
  }, [playlists, setPlaylists]);

  const removeFromPlaylist = useCallback((playlistId: string, songId: string) => {
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
  }, [playlists, setPlaylists]);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
    toast.success('Lista de reproducción eliminada');
  }, [playlists, setPlaylists]);

  return {
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist
  };
};
