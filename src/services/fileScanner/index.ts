
import { FileScanner } from './FileScanner';
import { DirectoryReader } from './DirectoryReader';
import { SongMapper } from './SongMapper';

export { FileScanner, DirectoryReader, SongMapper };
export * from './types';

// Create and export a singleton instance of the FileScanner
export const fileScanner = new FileScanner(
  new DirectoryReader(),
  new SongMapper()
);
