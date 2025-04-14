
import { useCallback } from 'react';
import { Song } from '../types/music';
import { mockSongs } from '../data/mockData';
import { toast } from 'sonner';
import { Filesystem, Directory, ReadFileOptions, ReaddirOptions } from '@capacitor/filesystem';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { Capacitor } from '@capacitor/core';

export const useFileSystem = (
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>
) => {
  const isAndroid = Capacitor.getPlatform() === 'android';
  
  const scanMusicFiles = useCallback(async () => {
    try {
      // Always show a toast to indicate scanning has started
      toast.info('Buscando archivos de música...');
      
      // Try to open storage settings on Android devices
      if (isAndroid) {
        try {
          await NativeSettings.open({
            optionAndroid: AndroidSettings.ApplicationDetails
          });
          
          // Give user a moment to grant permissions if needed
          toast.info('Por favor, concede permisos de almacenamiento si se solicitan');
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (settingsError) {
          console.log('Settings open not available or not needed:', settingsError);
        }
      }

      // These are the music file extensions we want to scan for
      const validAudioExtensions = ['.mp3', '.wav', '.aac', '.m3u', '.ogg', '.flac'];
      
      // Directories to scan - prioritize external storage on Android
      const musicDirectories = isAndroid 
        ? [Directory.ExternalStorage, Directory.External, Directory.Documents]
        : [Directory.Documents, Directory.External, Directory.ExternalStorage];
      
      // Add commonly used music folders on Android
      const androidMusicPaths = [
        '/storage/emulated/0/Music',
        '/storage/emulated/0/Download',
        '/sdcard/Music',
        '/sdcard/Download',
        '/storage/emulated/0',
        '/sdcard'
      ];

      const musicFiles: Song[] = [];
      let filesScanned = 0;
      let directoriesAccessed = 0;

      // Attempt to scan standard directories first
      for (const dir of musicDirectories) {
        try {
          console.log(`Scanning directory: ${dir}`);
          
          const options: ReaddirOptions = {
            path: '/',
            directory: dir
          };
          
          // First, read the main directory
          const result = await Filesystem.readdir(options);
          directoriesAccessed++;

          // Process the found files
          for (const file of result.files) {
            filesScanned++;
            
            // For directories, try to scan them recursively (one level deep)
            if (file.type === 'directory') {
              try {
                const subDirPath = file.uri || `/${file.name}`;
                console.log(`Scanning subdirectory: ${subDirPath}`);
                
                const subDirResult = await Filesystem.readdir({
                  path: subDirPath,
                  directory: dir
                });
                
                // Process files in subdirectory
                for (const subFile of subDirResult.files) {
                  filesScanned++;
                  if (isAudioFile(subFile.name, validAudioExtensions)) {
                    const songPath = subFile.uri || `${subDirPath}/${subFile.name}`;
                    
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

      // For Android, also try specific music folder paths
      if (isAndroid) {
        for (const path of androidMusicPaths) {
          try {
            console.log(`Scanning specific Android path: ${path}`);
            
            const result = await Filesystem.readdir({
              path: path,
              // Use ExternalStorage for absolute paths
              directory: Directory.ExternalStorage
            });
            
            directoriesAccessed++;
            
            // Process files
            for (const file of result.files) {
              filesScanned++;
              
              if (file.type === 'directory') {
                // Scan one level of subdirectories
                try {
                  const subPath = `${path}/${file.name}`;
                  const subResult = await Filesystem.readdir({
                    path: subPath,
                    directory: Directory.ExternalStorage
                  });
                  
                  for (const subFile of subResult.files) {
                    filesScanned++;
                    if (isAudioFile(subFile.name, validAudioExtensions)) {
                      const songPath = subFile.uri || `${subPath}/${subFile.name}`;
                      
                      musicFiles.push({
                        id: songPath,
                        title: getFileName(subFile.name),
                        artist: 'Unknown Artist',
                        album: file.name,
                        duration: 0,
                        path: songPath,
                        cover: undefined,
                        year: undefined,
                        genre: undefined
                      });
                    }
                  }
                } catch (subDirError) {
                  console.log(`Error scanning Android subdirectory ${path}/${file.name}:`, subDirError);
                }
              } 
              else if (isAudioFile(file.name, validAudioExtensions)) {
                const songPath = file.uri || `${path}/${file.name}`;
                
                musicFiles.push({
                  id: songPath,
                  title: getFileName(file.name),
                  artist: 'Unknown Artist',
                  album: path.split('/').pop() || 'Unknown Album',
                  duration: 0,
                  path: songPath,
                  cover: undefined,
                  year: undefined,
                  genre: undefined
                });
              }
            }
          } catch (pathError) {
            console.log(`Error scanning specific Android path ${path}:`, pathError);
          }
        }
      }

      // Log scanning results
      console.log(`Total files scanned: ${filesScanned}, Music files found: ${musicFiles.length}, Directories accessed: ${directoriesAccessed}`);
      
      if (musicFiles.length > 0) {
        setSongs(musicFiles);
        toast.success(`Encontradas ${musicFiles.length} canciones`);
      } else {
        if (directoriesAccessed === 0) {
          toast.error('No se pudo acceder a ningún directorio. Verifica los permisos de almacenamiento.');
        } else {
          toast.error('No se encontraron archivos de música');
        }
        setSongs(mockSongs);
      }
      
      return musicFiles;
    } catch (error) {
      console.error('Error scanning music files:', error);
      toast.error('No se pudieron escanear archivos de música. Verifica los permisos.');
      setSongs(mockSongs);
      return [];
    }
  }, [setSongs, isAndroid]);

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
