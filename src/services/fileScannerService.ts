
import { Song } from '../types/music';
import { fileScanner } from './fileScanner';

/**
 * Service for scanning music files from storage
 * This is a facade for the more detailed file scanning services
 */
export class FileScannerService {
  /**
   * Scan all music files from storage
   */
  public async scanAllMusicFiles(): Promise<{
    musicFiles: Song[],
    filesScanned: number,
    directoriesAccessed: number
  }> {
    return fileScanner.scanAllMusicFiles();
  }
}
