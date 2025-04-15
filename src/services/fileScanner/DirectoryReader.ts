
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
      const options: ReaddirOptions = {
        path: path,
        directory: directoryType as Directory
      };
      
      // Read the directory
      const result = await Filesystem.readdir(options);
      
      return {
        files: result.files,
        directoriesAccessed: 1
      };
    } catch (err) {
      console.error(`Error reading directory ${directoryType} at path ${path}:`, err);
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
      // Read the subdirectory
      const result = await Filesystem.readdir({
        path: path,
        directory: directoryType as Directory
      });
      
      return {
        files: result.files,
        directoriesAccessed: 1
      };
    } catch (err) {
      console.error(`Error reading subdirectory at path ${path}:`, err);
      return {
        files: [],
        directoriesAccessed: 0
      };
    }
  }
}
