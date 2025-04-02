
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PokerTable from "@/components/PokerTable";
import { 
  connectToRoom, 
  disconnectFromRoom, 
  getCurrentUser, 
  isLoggedIn,
  addConnectionStatusListener,
  addErrorListener,
  Room,
  getRooms
} from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    const getRoomInfo = async () => {
      if (!roomId) return;
      
      try {
        setLoading(true);
        const rooms = await getRooms();
        const roomInfo = rooms.find(r => r.id === roomId);
        
        if (roomInfo) {
          setRoom(roomInfo);
        } else {
          toast({
            title: "Room Not Found",
            description: "The room you're trying to join doesn't exist.",
            variant: "destructive",
          });
          navigate("/lobby");
        }
      } catch (error) {
        console.error("Error fetching room info:", error);
      } finally {
        setLoading(false);
      }
    };

    getRoomInfo();

    // Connect to the room when component mounts
    if (roomId) {
      connectToRoom(roomId);
    }

    // Set up connection status listener
    const removeConnectionListener = addConnectionStatusListener(status => {
      setIsConnected(status);
      
      if (status) {
        toast({
          title: "Connected to Game",
          description: "You've successfully joined the poker table.",
        });
      } else {
        toast({
          title: "Disconnected",
          description: "You've been disconnected from the game.",
          variant: "destructive",
        });
      }
    });

    // Set up error listener
    const removeErrorListener = addErrorListener(message => {
      toast({
        title: "Game Error",
        description: message,
        variant: "destructive",
      });
    });

    // Disconnect from the room when component unmounts
    return () => {
      disconnectFromRoom();
      removeConnectionListener();
      removeErrorListener();
    };
  }, [roomId, navigate, toast]);

  const handleLeaveRoom = () => {
    disconnectFromRoom();
    navigate("/lobby");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-poker-dark">
        <div className="animate-pulse text-poker-gold text-2xl">
          Loading game...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-poker-dark">
      {/* Header */}
      <header className="bg-black p-2 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLeaveRoom} 
          className="text-white"
        >
          <ArrowLeft size={16} className="mr-1" /> Leave
        </Button>
        
        <div className="text-center">
          <h1 className="text-lg font-bold text-poker-gold">
            {room?.name || "Poker Table"}
          </h1>
          <div className="text-xs text-white/60">
            {room ? `Blinds: $${room.smallBlind}/$${room.bigBlind}` : ""}
          </div>
        </div>
        
        <div className="w-20 h-8">
          {/* Empty div for balanced layout */}
        </div>
      </header>

      {/* Main content - Poker table */}
      <div className="flex-1 relative overflow-hidden">
        {isConnected ? (
          <PokerTable maxPlayers={room?.maxPlayers || 6} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-poker-gold text-xl mb-4">Connecting to game...</div>
              <Button onClick={handleLeaveRoom} variant="outline" className="border-poker-accent text-white">
                Back to Lobby
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom;
