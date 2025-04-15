
import React, { useState } from 'react';
import { MusicProvider, useMusicContext } from '@/context/MusicContext';
import SongList from '@/components/SongList';
import PlaylistList from '@/components/PlaylistList';
import MiniPlayer from '@/components/MiniPlayer';
import FullPlayer from '@/components/FullPlayer';
import NewPlaylistDialog from '@/components/NewPlaylistDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { ListMusic, Library, Plus, RefreshCw, Zap, HardDrive, FileQuestion } from 'lucide-react';

const MusicApp: React.FC = () => {
  const { 
    songs, 
    playlists, 
    playerState, 
    playSong, 
    playPlaylist,
    loadSongs,
    createNfcTag
  } = useMusicContext();
  
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [isNewPlaylistDialogOpen, setIsNewPlaylistDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSongSelect = (songId: string) => {
    playSong(songId);
  };

  const handlePlaylistSelect = (playlistId: string) => {
    playPlaylist(playlistId);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await loadSongs();
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagNFC = () => {
    // Create an NFC tag for whatever is currently playing
    if (playerState.currentSong) {
      createNfcTag(playerState.currentSong.id, null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white flex items-center">
          <Zap size={24} className="mr-2 text-player-accent" />
          SonicFlow
        </h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-transparent border-gray-700 text-white hover:bg-gray-800 flex items-center"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw size={16} className="mr-2 animate-spin" />
            ) : (
              <HardDrive size={16} className="mr-2" />
            )}
            {isLoading ? 'Buscando...' : 'Buscar Música'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
            onClick={handleTagNFC}
            disabled={!playerState.currentSong}
          >
            <Zap size={16} className="mr-2" />
            Crear NFC
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto pb-24">
        <Tabs defaultValue="songs" className="w-full">
          <div className="sticky top-0 bg-player-background z-10 border-b border-gray-800">
            <TabsList className="w-full bg-transparent border-b border-gray-800 rounded-none h-auto p-0">
              <TabsTrigger 
                value="songs" 
                className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-player-primary py-4"
              >
                <ListMusic size={16} className="mr-2" />
                Canciones
              </TabsTrigger>
              <TabsTrigger 
                value="playlists" 
                className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-player-primary py-4"
              >
                <Library size={16} className="mr-2" />
                Listas
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="songs" className="mt-0">
            {songs.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <FileQuestion size={48} className="text-gray-500 mb-3" />
                <p className="text-gray-400 mb-4">
                  Presiona "Buscar Música" para escanear los archivos de tu dispositivo
                </p>
                <Button
                  onClick={handleRefresh}
                  className="bg-player-primary hover:bg-opacity-90"
                >
                  <HardDrive size={16} className="mr-2" />
                  Buscar archivos de música
                </Button>
              </div>
            )}
            <SongList 
              songs={songs}
              onSongSelect={handleSongSelect}
              currentSongId={playerState.currentSong?.id}
            />
          </TabsContent>
          
          <TabsContent value="playlists" className="mt-0">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Mis listas de reproducción</h2>
              <Button 
                onClick={() => setIsNewPlaylistDialogOpen(true)}
                className="bg-player-primary hover:bg-opacity-90"
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Nueva lista
              </Button>
            </div>
            
            <PlaylistList 
              playlists={playlists}
              onPlaylistSelect={handlePlaylistSelect}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      {playerState.currentSong && !isFullPlayerVisible && (
        <MiniPlayer onExpandPlayer={() => setIsFullPlayerVisible(true)} />
      )}
      
      {playerState.currentSong && isFullPlayerVisible && (
        <FullPlayer onMinimizePlayer={() => setIsFullPlayerVisible(false)} />
      )}
      
      <NewPlaylistDialog 
        isOpen={isNewPlaylistDialogOpen}
        onClose={() => setIsNewPlaylistDialogOpen(false)}
      />
    </div>
  );
};

const Index = () => {
  return (
    <MusicProvider>
      <MusicApp />
    </MusicProvider>
  );
};

export default Index;
