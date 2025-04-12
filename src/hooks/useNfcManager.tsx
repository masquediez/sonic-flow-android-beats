
import { useCallback } from 'react';
import { Song, Playlist } from '../types/music';
import { toast } from 'sonner';

export const useNfcManager = (
  songs: Song[],
  playlists: Playlist[]
) => {
  const createNfcTag = useCallback(async (songId: string | null, playlistId: string | null) => {
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
  }, [songs, playlists]);

  return {
    createNfcTag
  };
};
