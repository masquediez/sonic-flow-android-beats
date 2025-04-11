
import { Song, Playlist } from '../types/music';

export const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: 354,
    path: '/songs/bohemian_rhapsody.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_At_The_Opera.png',
    year: 1975,
    genre: 'Rock'
  },
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 203,
    path: '/songs/blinding_lights.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png',
    year: 2020,
    genre: 'Pop'
  },
  {
    id: '3',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    album: 'Vida',
    duration: 228,
    path: '/songs/despacito.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/c/c8/Luis_Fonsi_Feat._Daddy_Yankee_-_Despacito_%28Official_Single_Cover%29.png',
    year: 2017,
    genre: 'Reggaeton'
  },
  {
    id: '4',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233,
    path: '/songs/shape_of_you.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/4/45/Divide_cover.png',
    year: 2017,
    genre: 'Pop'
  },
  {
    id: '5',
    title: 'Bad Guy',
    artist: 'Billie Eilish',
    album: 'When We All Fall Asleep, Where Do We Go?',
    duration: 194,
    path: '/songs/bad_guy.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/3/38/When_We_All_Fall_Asleep%2C_Where_Do_We_Go%3F.png',
    year: 2019,
    genre: 'Electropop'
  },
  {
    id: '6',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    album: 'Uptown Special',
    duration: 270,
    path: '/songs/uptown_funk.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/7/7b/Mark_Ronson_-_Uptown_Funk_%28feat._Bruno_Mars%29.png',
    year: 2014,
    genre: 'Funk'
  },
  {
    id: '7',
    title: 'Old Town Road',
    artist: 'Lil Nas X ft. Billy Ray Cyrus',
    album: '7',
    duration: 157,
    path: '/songs/old_town_road.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Lil-nas-x-old-town-road.jpg',
    year: 2019,
    genre: 'Country Rap'
  },
  {
    id: '8',
    title: 'Someone Like You',
    artist: 'Adele',
    album: '21',
    duration: 285,
    path: '/songs/someone_like_you.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/1/1b/Adele_-_21.png',
    year: 2011,
    genre: 'Pop'
  }
];

export const mockPlaylists: Playlist[] = [
  {
    id: '1',
    name: 'Favorites',
    songs: ['1', '3', '5'],
    coverImage: mockSongs[0].cover,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-05')
  },
  {
    id: '2',
    name: 'Workout',
    songs: ['2', '4', '6'],
    coverImage: mockSongs[1].cover,
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-15')
  },
  {
    id: '3',
    name: 'Chill',
    songs: ['7', '8'],
    coverImage: mockSongs[7].cover,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-10')
  }
];
