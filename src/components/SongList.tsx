
import React from 'react';
import { Song } from '@/types/music';
import { formatTime } from '@/utils/timeUtils';
import { MoreVertical, Play, Plus, Music, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useMusicContext } from '@/context/MusicContext';
import { toast } from 'sonner';

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

  // Helper to determine if a song is a playlist file (.m3u)
  const isPlaylistFile = (song: Song): boolean => {
    return song.path.toLowerCase().endsWith('.m3u');
  };

  // Get appropriate icon based on song type
  const getSongIcon = (song: Song) => {
    return isPlaylistFile(song) ? 
      <Music size={20} className="text-green-400" /> : 
      <Play size={20} className="text-white" />;
  };

  // Show a message when no songs are found
  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <FileWarning size={64} className="text-gray-500 mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No se encontraron archivos de música</h3>
        <p className="text-gray-400 max-w-md">
          No se encontraron archivos mp3 o m3u en tu dispositivo. Asegúrate de tener permisos de almacenamiento y archivos de música en tu dispositivo.
        </p>
      </div>
    );
  }

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
              currentSongId === song.id && "bg-white/10",
              isPlaylistFile(song) && "bg-gray-900/40"
            )}
            onClick={() => onSongSelect(song.id)}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="relative group w-10 h-10 flex-shrink-0">
                <img 
                  src={song.cover || '/placeholder.svg'} 
                  alt={song.title}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                  {getSongIcon(song)}
                </div>
              </div>
              
              <div className="flex flex-col min-w-0">
                <h3 className="font-medium text-white truncate">
                  {song.title}
                  {isPlaylistFile(song) && 
                    <span className="ml-2 text-xs text-gray-400 font-normal">(Lista M3U)</span>
                  }
                </h3>
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
                      toast.success(`Etiqueta NFC creada para "${song.title}"`);
                    }}
                  >
                    Crear etiqueta NFC
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-gray-800" />
                  
                  {playlists.length > 0 ? (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer">
                        <Plus size={16} className="mr-2" />
                        Añadir a lista de reproducción
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-gray-900 border-gray-800 text-white">
                        {playlists.map(playlist => (
                          <DropdownMenuItem 
                            key={playlist.id}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToPlaylist(playlist.id, song.id);
                              toast.success(`"${song.title}" añadida a "${playlist.name}"`);
                            }}
                          >
                            {playlist.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ) : (
                    <DropdownMenuItem 
                      className="cursor-pointer opacity-50"
                      disabled
                    >
                      <Plus size={16} className="mr-2" />
                      No hay listas disponibles
                    </DropdownMenuItem>
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
