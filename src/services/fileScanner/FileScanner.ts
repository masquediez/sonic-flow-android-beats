
import { Capacitor } from '@capacitor/core';
import { Song } from '../../types/music';
import { getMusicDirectories, getAndroidMusicPaths } from '../../utils/fileUtils';
import { IDirectoryReader, ISongMapper, FileScanResult } from './types';

/**
 * Service for scanning music files from storage
 */
export class FileScanner {
  private isAndroid = Capacitor.getPlatform() === 'android';
  private musicDirectories = getMusicDirectories();
  private androidMusicPaths = getAndroidMusicPaths();
  
  constructor(
    private readonly directoryReader: IDirectoryReader,
    private readonly songMapper: ISongMapper
  ) {}

  /**
   * Scan all music files from storage
   */
  public async scanAllMusicFiles(): Promise<FileScanResult> {
    const musicFiles: Song[] = [];
    let filesScanned = 0;
    let directoriesAccessed = 0;

    console.log('Starting music scan...');
    
    // For Android, first try common music folder paths
    if (this.isAndroid) {
      console.log('Scanning Android paths first...');
      const androidResult = await this.scanAndroidPaths(
        musicFiles,
        filesScanned,
        directoriesAccessed
      );
      
      filesScanned = androidResult.filesScanned;
      directoriesAccessed = androidResult.directoriesAccessed;
      
      console.log(`After Android paths: ${musicFiles.length} music files found`);
    }

    // Then try standard directories
    for (const dir of this.musicDirectories) {
      console.log(`Scanning standard directory: ${dir}`);
      const result = await this.scanDirectory(
        dir, 
        '/',
        musicFiles,
        filesScanned,
        directoriesAccessed
      );
      
      filesScanned = result.filesScanned;
      directoriesAccessed = result.directoriesAccessed;
      
      console.log(`After ${dir}: ${musicFiles.length} music files found`);
    }

    console.log('Music scan complete.');
    return {
      musicFiles,
      filesScanned,
      directoriesAccessed
    };
  }

  /**
   * Scan a directory for music files
   */
  private async scanDirectory(
    directoryType: string, 
    path: string = '/',
    musicFiles: Song[] = [],
    filesScanned: number = 0,
    directoriesAccessed: number = 0
  ): Promise<FileScanResult> {
    try {
      console.log(`Scanning directory: ${directoryType} at path: ${path}`);
      
      const result = await this.directoryReader.readDirectory(directoryType, path);
      directoriesAccessed += result.directoriesAccessed;

      if (result.directoriesAccessed === 0) {
        console.log(`Could not access directory: ${directoryType} at path: ${path}`);
        return { musicFiles, filesScanned, directoriesAccessed };
      }

      // Process the found files
      for (const file of result.files) {
        filesScanned++;
        
        // For directories, try to scan them recursively (up to 3 levels deep)
        if (file.type === 'directory') {
          try {
            const subDirPath = file.uri || `${path === '/' ? '' : path}/${file.name}`;
            console.log(`Scanning subdirectory: ${subDirPath}`);
            
            const subDirResult = await this.directoryReader.readSubdirectory(directoryType, subDirPath);
            directoriesAccessed += subDirResult.directoriesAccessed;
            
            // Process files in subdirectory
            for (const subFile of subDirResult.files) {
              filesScanned++;
              
              // Handle nested directories (one more level)
              if (subFile.type === 'directory') {
                try {
                  const nestedPath = `${subDirPath}/${subFile.name}`;
                  console.log(`Scanning nested directory: ${nestedPath}`);
                  
                  const nestedResult = await this.directoryReader.readSubdirectory(directoryType, nestedPath);
                  directoriesAccessed += nestedResult.directoriesAccessed;
                  
                  // Process files in nested directory
                  for (const nestedFile of nestedResult.files) {
                    filesScanned++;
                    const song = this.songMapper.mapFileToSong(nestedFile, nestedPath, subFile.name);
                    if (song) {
                      musicFiles.push(song);
                    }
                  }
                } catch (nestedDirError) {
                  console.log(`Error scanning nested directory ${subFile.name}:`, nestedDirError);
                }
              } else {
                const song = this.songMapper.mapFileToSong(subFile, subDirPath, file.name);
                if (song) {
                  musicFiles.push(song);
                }
              }
            }
          } catch (subDirError) {
            console.log(`Error scanning subdirectory ${file.name}:`, subDirError);
          }
        } 
        // For regular files, check if they're audio files
        else {
          const song = this.songMapper.mapFileToSong(file, path);
          if (song) {
            musicFiles.push(song);
          }
        }
      }
      
      return { musicFiles, filesScanned, directoriesAccessed };
    } catch (err) {
      console.error(`Error scanning directory ${directoryType} at path ${path}:`, err);
      return { musicFiles, filesScanned, directoriesAccessed };
    }
  }

  /**
   * Scan Android-specific paths for music files
   */
  private async scanAndroidPaths(
    musicFiles: Song[], 
    filesScanned: number, 
    directoriesAccessed: number
  ): Promise<FileScanResult> {
    if (!this.isAndroid) {
      return { musicFiles, filesScanned, directoriesAccessed };
    }
    
    for (const path of this.androidMusicPaths) {
      try {
        console.log(`Scanning specific Android path: ${path}`);
        
        const result = await this.directoryReader.readDirectory('ExternalStorage', path);
        directoriesAccessed += result.directoriesAccessed;
        
        if (result.directoriesAccessed === 0) {
          console.log(`Could not access Android path: ${path}`);
          continue;
        }
        
        // Process files
        for (const file of result.files) {
          filesScanned++;
          
          if (file.type === 'directory') {
            // Scan one level of subdirectories
            try {
              const subPath = `${path}/${file.name}`;
              console.log(`Scanning Android subdirectory: ${subPath}`);
              
              const subResult = await this.directoryReader.readSubdirectory('ExternalStorage', subPath);
              directoriesAccessed += subResult.directoriesAccessed;
              
              if (subResult.directoriesAccessed === 0) {
                console.log(`Could not access Android subdirectory: ${subPath}`);
                continue;
              }
              
              for (const subFile of subResult.files) {
                filesScanned++;
                
                // Handle nested directories
                if (subFile.type === 'directory') {
                  try {
                    const nestedPath = `${subPath}/${subFile.name}`;
                    console.log(`Scanning Android nested directory: ${nestedPath}`);
                    
                    const nestedResult = await this.directoryReader.readSubdirectory('ExternalStorage', nestedPath);
                    directoriesAccessed += nestedResult.directoriesAccessed;
                    
                    for (const nestedFile of nestedResult.files) {
                      filesScanned++;
                      const song = this.songMapper.mapFileToSong(nestedFile, nestedPath, subFile.name);
                      if (song) {
                        musicFiles.push(song);
                      }
                    }
                  } catch (nestedError) {
                    console.log(`Error scanning Android nested directory ${subFile.name}:`, nestedError);
                  }
                } else {
                  const song = this.songMapper.mapFileToSong(subFile, subPath, file.name);
                  if (song) {
                    musicFiles.push(song);
                  }
                }
              }
            } catch (subDirError) {
              console.log(`Error scanning Android subdirectory ${path}/${file.name}:`, subDirError);
            }
          } 
          else {
            const song = this.songMapper.mapFileToSong(file, path, path.split('/').pop() || 'Unknown Album');
            if (song) {
              musicFiles.push(song);
            }
          }
        }
      } catch (pathError) {
        console.log(`Error scanning specific Android path ${path}:`, pathError);
      }
    }
    
    return { musicFiles, filesScanned, directoriesAccessed };
  }
}
