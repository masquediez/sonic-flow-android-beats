
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  path: string;
  cover?: string;
  year?: number;
  genre?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: string[]; // Array of song IDs
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  volume: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  progress: number; // current playback position in seconds
}

export interface MusicContextType {
  songs: Song[];
  playlists: Playlist[];
  playerState: PlayerState;
  loadSongs: () => Promise<void>;
  playSong: (songId: string) => void;
  playPlaylist: (playlistId: string) => void;
  togglePlay: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  createPlaylist: (name: string, songIds: string[]) => void;
  addToPlaylist: (playlistId: string, songId: string) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  createNfcTag: (songId: string | null, playlistId: string | null) => Promise<boolean>;
}
