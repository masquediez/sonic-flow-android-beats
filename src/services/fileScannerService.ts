
import { Filesystem, Directory, ReaddirOptions } from '@capacitor/filesystem';
import { Song } from '../types/music';
import { isAudioFile, getFileName, getValidAudioExtensions, getMusicDirectories, getAndroidMusicPaths } from '../utils/fileUtils';
import { Capacitor } from '@capacitor/core';

/**
 * Service for scanning music files from storage
 */
export class FileScannerService {
  private isAndroid = Capacitor.getPlatform() === 'android';
  private validAudioExtensions = getValidAudioExtensions();
  private musicDirectories = getMusicDirectories();
  private androidMusicPaths = getAndroidMusicPaths();
  
  /**
   * Scan a directory for music files
   */
  private async scanDirectory(
    directoryType: string, 
    path: string = '/',
    musicFiles: Song[] = [],
    filesScanned: number = 0,
    directoriesAccessed: number = 0
  ): Promise<{musicFiles: Song[], filesScanned: number, directoriesAccessed: number}> {
    try {
      console.log(`Scanning directory: ${directoryType} at path: ${path}`);
      
      const options: ReaddirOptions = {
        path: path,
        directory: directoryType as Directory
      };
      
      // Read the directory
      const result = await Filesystem.readdir(options);
      directoriesAccessed++;

      // Process the found files
      for (const file of result.files) {
        filesScanned++;
        
        // For directories, try to scan them recursively (one level deep)
        if (file.type === 'directory') {
          try {
            const subDirPath = file.uri || `${path === '/' ? '' : path}/${file.name}`;
            console.log(`Scanning subdirectory: ${subDirPath}`);
            
            const subDirResult = await Filesystem.readdir({
              path: subDirPath,
              directory: directoryType as Directory
            });
            
            // Process files in subdirectory
            for (const subFile of subDirResult.files) {
              filesScanned++;
              if (isAudioFile(subFile.name, this.validAudioExtensions)) {
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
        else if (isAudioFile(file.name, this.validAudioExtensions)) {
          const songPath = file.uri || `${path === '/' ? '' : path}/${file.name}`;
          
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
  ): Promise<{musicFiles: Song[], filesScanned: number, directoriesAccessed: number}> {
    if (!this.isAndroid) {
      return { musicFiles, filesScanned, directoriesAccessed };
    }
    
    for (const path of this.androidMusicPaths) {
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
                if (isAudioFile(subFile.name, this.validAudioExtensions)) {
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
          else if (isAudioFile(file.name, this.validAudioExtensions)) {
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
    
    return { musicFiles, filesScanned, directoriesAccessed };
  }

  /**
   * Scan all music files from storage
   */
  public async scanAllMusicFiles(): Promise<{
    musicFiles: Song[], 
    filesScanned: number, 
    directoriesAccessed: number
  }> {
    const musicFiles: Song[] = [];
    let filesScanned = 0;
    let directoriesAccessed = 0;

    // Scan standard directories first
    for (const dir of this.musicDirectories) {
      const result = await this.scanDirectory(
        Directory[dir as keyof typeof Directory], 
        '/',
        musicFiles,
        filesScanned,
        directoriesAccessed
      );
      
      musicFiles.push(...result.musicFiles);
      filesScanned = result.filesScanned;
      directoriesAccessed = result.directoriesAccessed;
    }

    // For Android, also try specific music folder paths
    if (this.isAndroid) {
      const androidResult = await this.scanAndroidPaths(
        musicFiles,
        filesScanned,
        directoriesAccessed
      );
      
      filesScanned = androidResult.filesScanned;
      directoriesAccessed = androidResult.directoriesAccessed;
    }

    return {
      musicFiles,
      filesScanned,
      directoriesAccessed
    };
  }
}
