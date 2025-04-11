
import React from 'react';
import { Playlist } from '@/types/music';
import { MoreVertical, Play } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMusicContext } from '@/context/MusicContext';

interface PlaylistListProps {
  playlists: Playlist[];
  onPlaylistSelect: (playlistId: string) => void;
}

const PlaylistList: React.FC<PlaylistListProps> = ({ 
  playlists, 
  onPlaylistSelect 
}) => {
  const { deletePlaylist, createNfcTag, songs } = useMusicContext();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {playlists.map((playlist) => {
        const songCount = playlist.songs.length;
        const playlistDuration = playlist.songs.reduce((total, songId) => {
          const song = songs.find(s => s.id === songId);
          return total + (song?.duration || 0);
        }, 0);
        
        const formatDuration = (seconds: number) => {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          
          return hours > 0 
            ? `${hours} h ${minutes} min` 
            : `${minutes} min`;
        };
        
        return (
          <div 
            key={playlist.id}
            className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:transform hover:scale-105 cursor-pointer group"
          >
            <div 
              className="relative aspect-square"
              onClick={() => onPlaylistSelect(playlist.id)}
            >
              <img 
                src={playlist.coverImage} 
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button className="bg-player-primary text-white rounded-full p-3">
                  <Play size={24} fill="white" />
                </button>
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white truncate">{playlist.name}</h3>
                  <p className="text-xs text-gray-400">
                    {songCount} {songCount === 1 ? 'canción' : 'canciones'} • {formatDuration(playlistDuration)}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[200px] bg-gray-900 border-gray-800 text-white">
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        createNfcTag(null, playlist.id);
                      }}
                    >
                      Crear etiqueta NFC
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(playlist.id);
                      }}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlaylistList;
