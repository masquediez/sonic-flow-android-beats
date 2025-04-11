
import React from 'react';
import { Song } from '@/types/music';
import { formatTime } from '@/utils/timeUtils';
import { MoreVertical, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMusicContext } from '@/context/MusicContext';

interface SongListProps {
  songs: Song[];
  onSongSelect: (songId: string) => void;
  currentSongId?: string | null;
}

const SongList: React.FC<SongListProps> = ({ 
  songs, 
  onSongSelect, 
  currentSongId 
}) => {
  const { playlists, addToPlaylist, createNfcTag } = useMusicContext();

  return (
    <div className="w-full">
      <div className="grid grid-cols-[1fr,auto,auto] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
        <div>Título</div>
        <div className="text-right">Duración</div>
        <div></div>
      </div>

      <div className="divide-y divide-gray-800">
        {songs.map((song) => (
          <div 
            key={song.id}
            className={cn(
              "grid grid-cols-[1fr,auto,auto] gap-4 px-4 py-3 hover:bg-white/5 cursor-pointer",
              currentSongId === song.id && "bg-white/10"
            )}
            onClick={() => onSongSelect(song.id)}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="relative group w-10 h-10 flex-shrink-0">
                <img 
                  src={song.cover} 
                  alt={song.title}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                  <Play size={20} className="text-white" />
                </div>
              </div>
              
              <div className="flex flex-col min-w-0">
                <h3 className="font-medium text-white truncate">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            </div>
            
            <div className="text-right self-center text-sm text-gray-400">
              {formatTime(song.duration)}
            </div>
            
            <div className="self-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
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
                      createNfcTag(song.id, null);
                    }}
                  >
                    Crear etiqueta NFC
                  </DropdownMenuItem>
                  
                  {playlists.length > 0 && (
                    <>
                      <DropdownMenuItem className="font-semibold opacity-70">
                        Añadir a lista de reproducción
                      </DropdownMenuItem>
                      
                      {playlists.map(playlist => (
                        <DropdownMenuItem 
                          key={playlist.id}
                          className="pl-6 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToPlaylist(playlist.id, song.id);
                          }}
                        >
                          {playlist.name}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongList;
