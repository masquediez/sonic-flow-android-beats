
import { useCallback } from 'react';
import { Song } from '../types/music';
import { mockSongs } from '../data/mockData';
import { toast } from 'sonner';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';

export const useFileSystem = (
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>
) => {
  const scanMusicFiles = useCallback(async () => {
    try {
      // Try to open storage settings first
      try {
        await NativeSettings.open({
          optionAndroid: AndroidSettings.Storage,
          optionIOS: IOSSettings.WiFi
        });
      } catch (settingsError) {
        console.log('Settings open not available or not needed:', settingsError);
        // Continue with file scanning even if settings can't open
      }

      // These are the music file extensions we want to scan for
      const validAudioExtensions = ['.mp3', '.wav', '.aac', '.m3u', '.ogg', '.flac'];
      
      // Directories to scan
      const musicDirectories = [
        Directory.Documents,
        Directory.External,
        Directory.ExternalStorage
      ];

      const musicFiles: Song[] = [];
      let filesScanned = 0;

      // Try to scan each directory
      for (const dir of musicDirectories) {
        try {
          console.log(`Scanning directory: ${dir}`);
          
          // First, read the main directory
          const result = await Filesystem.readdir({
            path: '/',
            directory: dir
          });

          // Process the found files
          for (const file of result.files) {
            filesScanned++;
            
            // For directories, try to scan them recursively (one level deep)
            if (file.type === 'directory') {
              try {
                const subDirResult = await Filesystem.readdir({
                  path: file.uri || `/${file.name}`,
                  directory: dir
                });
                
                // Process files in subdirectory
                for (const subFile of subDirResult.files) {
                  filesScanned++;
                  if (isAudioFile(subFile.name, validAudioExtensions)) {
                    const songPath = subFile.uri || `/${file.name}/${subFile.name}`;
                    
                    // Add the song to our collection
                    musicFiles.push({
                      id: songPath,
                      title: getFileName(subFile.name),
                      artist: 'Unknown Artist',
                      album: file.name, // Use parent directory as album name
                      duration: 0,
                      path: songPath,
                      cover: undefined,
                      year: undefined,
                      genre: undefined
                    });
                  }
                }
              } catch (subDirError) {
                console.log(`Error scanning subdirectory ${file.name}:`, subDirError);
              }
            } 
            // For regular files, check if they're audio files
            else if (isAudioFile(file.name, validAudioExtensions)) {
              const songPath = file.uri || `/${file.name}`;
              
              // Add the song to our collection
              musicFiles.push({
                id: songPath,
                title: getFileName(file.name),
                artist: 'Unknown Artist',
                album: 'Unknown Album',
                duration: 0,
                path: songPath,
                cover: undefined,
                year: undefined,
                genre: undefined
              });
            }
          }
        } catch (dirError) {
          console.error(`Error scanning directory ${dir}:`, dirError);
        }
      }

      console.log(`Total files scanned: ${filesScanned}, Music files found: ${musicFiles.length}`);
      
      if (musicFiles.length > 0) {
        setSongs(musicFiles);
        toast.success(`Encontradas ${musicFiles.length} canciones`);
      } else {
        toast.error('No se encontraron archivos de música');
        setSongs(mockSongs);
      }
      
      return musicFiles;
    } catch (error) {
      console.error('Error scanning music files:', error);
      toast.error('No se pudieron escanear archivos de música');
      return [];
    }
  }, [setSongs]);

  // Helper function to check if a file is an audio file
  const isAudioFile = (fileName: string, validExtensions: string[]): boolean => {
    const lowerFileName = fileName.toLowerCase();
    return validExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  // Helper function to get clean file name without extension
  const getFileName = (fileName: string): string => {
    // Remove extension and replace underscores with spaces
    return fileName.split('.').slice(0, -1).join('.').replace(/_/g, ' ');
  };

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
