
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMusicContext } from '@/context/MusicContext';

interface NewPlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewPlaylistDialog: React.FC<NewPlaylistDialogProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [playlistName, setPlaylistName] = useState('');
  const { createPlaylist } = useMusicContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (playlistName.trim()) {
      createPlaylist(playlistName.trim(), []);
      setPlaylistName('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Nueva lista de reproducción</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="playlist-name">Nombre</Label>
            <Input
              id="playlist-name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Mi lista de reproducción"
              className="mt-1 bg-gray-800 border-gray-700"
              autoFocus
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-player-primary hover:bg-opacity-90"
              disabled={!playlistName.trim()}
            >
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPlaylistDialog;
