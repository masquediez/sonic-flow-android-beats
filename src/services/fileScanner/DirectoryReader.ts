
import { Filesystem, Directory, ReaddirOptions } from '@capacitor/filesystem';
import { IDirectoryReader, DirectoryReadResult, FileEntry } from './types';

/**
 * Service for reading directories from filesystem
 */
export class DirectoryReader implements IDirectoryReader {
  /**
   * Read a directory from the filesystem
   */
  public async readDirectory(
    directoryType: string, 
    path: string
  ): Promise<DirectoryReadResult> {
    try {
      console.log(`Attempting to read directory ${directoryType} at path ${path}`);
      
      const options: ReaddirOptions = {
        path: path,
        directory: directoryType as Directory
      };
      
      // Read the directory
      const result = await Filesystem.readdir(options);
      console.log(`Successfully read directory with ${result.files.length} files`);
      
      return {
        files: result.files,
        directoriesAccessed: 1
      };
    } catch (err) {
      console.error(`Error reading directory ${directoryType} at path ${path}:`, err);
      
      // Return an empty result but don't throw to allow scanning to continue
      return {
        files: [],
        directoriesAccessed: 0
      };
    }
  }

  /**
   * Read a subdirectory from the filesystem
   */
  public async readSubdirectory(
    directoryType: string, 
    path: string
  ): Promise<DirectoryReadResult> {
    try {
      console.log(`Attempting to read subdirectory at path ${path}`);
      
      // Read the subdirectory
      const result = await Filesystem.readdir({
        path: path,
        directory: directoryType as Directory
      });
      
      console.log(`Successfully read subdirectory with ${result.files.length} files`);
      
      return {
        files: result.files,
        directoriesAccessed: 1
      };
    } catch (err) {
      console.error(`Error reading subdirectory at path ${path}:`, err);
      
      // Return an empty result but don't throw to allow scanning to continue
      return {
        files: [],
        directoriesAccessed: 0
      };
    }
  }
}
