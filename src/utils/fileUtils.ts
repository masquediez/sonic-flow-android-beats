
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

/**
 * Checks if a file is an audio file based on its extension
 */
export const isAudioFile = (fileName: string, validExtensions: string[]): boolean => {
  if (!fileName) return false;
  const lowerFileName = fileName.toLowerCase();
  return validExtensions.some(ext => lowerFileName.endsWith(ext));
};

/**
 * Gets clean file name without extension
 */
export const getFileName = (fileName: string): string => {
  // Remove extension and replace underscores with spaces
  return fileName.split('.').slice(0, -1).join('.').replace(/_/g, ' ');
};

/**
 * Get the supported audio extensions
 */
export const getValidAudioExtensions = (): string[] => {
  return ['.mp3', '.wav', '.aac', '.m3u', '.ogg', '.flac', '.m4a', '.wma'];
};

/**
 * Get directories to scan based on platform
 */
export const getMusicDirectories = () => {
  const isAndroid = Capacitor.getPlatform() === 'android';
  
  // Directories to scan - prioritize external storage on Android
  return isAndroid 
    ? ['ExternalStorage', 'External', 'Documents']
    : ['Documents', 'External', 'ExternalStorage'];
};

/**
 * Get Android-specific music paths to scan
 */
export const getAndroidMusicPaths = (): string[] => {
  return [
    // Primary external storage
    '/storage/emulated/0/Music',
    '/storage/emulated/0/Download',
    '/storage/emulated/0/DCIM',
    '/storage/self/primary/Music',
    '/storage/self/primary/Download',
    '/storage/self/primary/DCIM',
    
    // SD Card paths
    '/storage/sdcard0/Music',
    '/storage/sdcard0/Download',
    '/storage/sdcard1/Music',
    '/storage/sdcard1/Download',
    
    // Common Android paths
    '/sdcard/Music',
    '/sdcard/Download',
    '/sdcard/DCIM',
    
    // Root directories to scan 
    '/storage/emulated/0',
    '/storage/self/primary',
    '/sdcard',
    '/storage/sdcard0',
    '/storage/sdcard1'
  ];
};

/**
 * Format a path for Android devices if needed
 */
export const formatPathForAndroid = (path: string): string => {
  const isAndroid = Capacitor.getPlatform() === 'android';
  
  if (isAndroid && path && !path.startsWith('file://') && !path.startsWith('http')) {
    return `file://${path}`;
  }
  
  return path;
};

/**
 * Log scanning results
 */
export const logScanResults = (filesScanned: number, musicFiles: any[], directoriesAccessed: number) => {
  console.log(`Total files scanned: ${filesScanned}, Music files found: ${musicFiles.length}, Directories accessed: ${directoriesAccessed}`);
  
  if (musicFiles.length > 0) {
    toast.success(`Encontradas ${musicFiles.length} canciones`);
    return true;
  } else {
    if (directoriesAccessed === 0) {
      toast.error('No se pudo acceder a ningún directorio. Verifica los permisos de almacenamiento.');
    } else {
      toast.error('No se encontraron archivos de música');
    }
    return false;
  }
};
