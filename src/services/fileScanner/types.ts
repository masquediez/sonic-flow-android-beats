
import { Song } from '../../types/music';

export interface FileScanResult {
  musicFiles: Song[];
  filesScanned: number;
  directoriesAccessed: number;
}

export interface DirectoryReadResult {
  files: FileEntry[];
  directoriesAccessed: number;
}

export interface FileEntry {
  name: string;
  type: string;
  uri?: string;
}

export interface IDirectoryReader {
  readDirectory(directoryType: string, path: string): Promise<DirectoryReadResult>;
  readSubdirectory(directoryType: string, path: string): Promise<DirectoryReadResult>;
}

export interface ISongMapper {
  mapFileToSong(file: FileEntry, path: string, albumName?: string): Song | null;
  isAudioFile(fileName: string): boolean;
}
