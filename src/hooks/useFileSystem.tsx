
import { useCallback } from 'react';
import { Song } from '../types/music';
import { mockSongs } from '../data/mockData';
import { toast } from 'sonner';
import { Filesystem } from '@capacitor/filesystem';
import { NativeSettings } from 'capacitor-native-settings';

export enum Directory {
  Documents = 'DOCUMENTS',
  Data = 'DATA',
  Cache = 'CACHE',
  External = 'EXTERNAL',
  ExternalStorage = 'EXTERNAL_STORAGE'
}

export const useFileSystem = (
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>
) => {
  const scanMusicFiles = useCallback(async () => {
    try {
      // Open settings without the androidUseSystemDefault property
      await NativeSettings.open();

      const musicDirectories = [
        Directory.Documents,
        Directory.External,
        Directory.ExternalStorage
      ];

      const musicFiles: Song[] = [];

      for (const dir of musicDirectories) {
        try {
          const result = await Filesystem.readdir({
            path: '/',
            directory: dir as any
          });

          const audioFiles = result.files.filter(file => 
            file.name.endsWith('.mp3') || 
            file.name.endsWith('.wav') || 
            file.name.endsWith('.aac')
          );

          for (const audioFile of audioFiles) {
            musicFiles.push({
              id: audioFile.uri || '',
              title: audioFile.name,
              artist: 'Unknown Artist',
              album: 'Unknown Album',
              duration: 0,
              path: audioFile.uri || '',
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
  }, [setSongs]);

  const loadSongs = useCallback(async () => {
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
  }, [scanMusicFiles, setSongs]);

  return {
    scanMusicFiles,
    loadSongs
  };
};
