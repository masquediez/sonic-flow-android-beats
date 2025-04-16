
import { useCallback, useState } from 'react';
import { Song } from '../types/music';
import { toast } from 'sonner';
import { FileScannerService } from '../services/fileScannerService';
import { PermissionsService } from '../services/permissionsService';
import { logScanResults } from '../utils/fileUtils';

export const useFileSystem = (
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>
) => {
  const fileScannerService = new FileScannerService();
  const permissionsService = new PermissionsService();
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  
  const scanMusicFiles = useCallback(async () => {
    if (isRequestingPermissions) {
      console.log('Already requesting permissions, skipping');
      return [];
    }
    
    try {
      // Always show a toast to indicate scanning has started
      toast.info('Buscando archivos de música...');
      
      // Request storage permissions for Android devices
      setIsRequestingPermissions(true);
      const permissionsGranted = await permissionsService.requestStoragePermissions();
      setIsRequestingPermissions(false);
      
      if (!permissionsGranted) {
        toast.error('Permisos de almacenamiento denegados. No se puede acceder a los archivos de música.');
        return [];
      }
      
      // Request NFC permissions while we're at it
      permissionsService.requestNfcPermissions();

      // Scan music files
      const { musicFiles, filesScanned, directoriesAccessed } = 
        await fileScannerService.scanAllMusicFiles();

      // Log scanning results
      const scanSuccessful = logScanResults(filesScanned, musicFiles, directoriesAccessed);
      
      // Always set whatever files were found, even if empty
      setSongs(musicFiles);
      
      return musicFiles;
    } catch (error) {
      console.error('Error scanning music files:', error);
      toast.error('No se pudieron escanear archivos de música. Verifica los permisos.');
      setIsRequestingPermissions(false);
      setSongs([]);
      return [];
    }
  }, [setSongs, fileScannerService, permissionsService, isRequestingPermissions]);

  const loadSongs = useCallback(async () => {
    try {
      const scannedSongs = await scanMusicFiles();
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading songs:', error);
      toast.error('Error al cargar música');
      return Promise.reject(error);
    }
  }, [scanMusicFiles]);

  return {
    scanMusicFiles,
    loadSongs,
    isRequestingPermissions
  };
};
