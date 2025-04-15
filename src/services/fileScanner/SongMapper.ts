
import { Song } from '../../types/music';
import { getFileName, getValidAudioExtensions } from '../../utils/fileUtils';
import { ISongMapper, FileEntry } from './types';

/**
 * Service for mapping file entries to songs
 */
export class SongMapper implements ISongMapper {
  private validAudioExtensions = getValidAudioExtensions();

  /**
   * Check if a file is an audio file
   */
  public isAudioFile(fileName: string): boolean {
    if (!fileName) return false;
    const lowerFileName = fileName.toLowerCase();
    return this.validAudioExtensions.some(ext => lowerFileName.endsWith(ext));
  }

  /**
   * Map a file entry to a song
   */
  public mapFileToSong(
    file: FileEntry, 
    path: string,
    albumName?: string
  ): Song | null {
    // Check if the file is an audio file
    if (!this.isAudioFile(file.name)) {
      return null;
    }

    // Create the song path
    const songPath = file.uri || `${path === '/' ? '' : path}/${file.name}`;
    
    // Create and return the song
    return {
      id: songPath,
      title: getFileName(file.name),
      artist: 'Unknown Artist',
      album: albumName || 'Unknown Album',
      duration: 0,
      path: songPath,
      cover: undefined,
      year: undefined,
      genre: undefined
    };
  }
}
