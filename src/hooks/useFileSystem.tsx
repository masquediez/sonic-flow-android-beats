
import { useCallback } from 'react';
import { Song } from '../types/music';
import { mockSongs } from '../data/mockData';
import { toast } from 'sonner';
import { FileScannerService } from '../services/fileScannerService';
import { PermissionsService } from '../services/permissionsService';
import { logScanResults } from '../utils/fileUtils';

export const useFileSystem = (
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>
) => {
  const fileScannerService = new FileScannerService();
  const permissionsService = new PermissionsService();
  
  const scanMusicFiles = useCallback(async () => {
    try {
      // Always show a toast to indicate scanning has started
      toast.info('Buscando archivos de música...');
      
      // Request storage permissions for Android devices
      await permissionsService.requestStoragePermissions();

      // Scan music files
      const { musicFiles, filesScanned, directoriesAccessed } = 
        await fileScannerService.scanAllMusicFiles();

      // Log scanning results
      const scanSuccessful = logScanResults(filesScanned, musicFiles, directoriesAccessed);
      
      if (scanSuccessful) {
        setSongs(musicFiles);
      } else {
        setSongs(mockSongs);
      }
      
      return musicFiles;
    } catch (error) {
      console.error('Error scanning music files:', error);
      toast.error('No se pudieron escanear archivos de música. Verifica los permisos.');
      setSongs(mockSongs);
      return [];
    }
  }, [setSongs, fileScannerService, permissionsService]);

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
