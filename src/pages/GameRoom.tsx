import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PokerTable from "@/components/PokerTable";
import { 
  connectToRoom, 
  disconnectFromRoom, 
  addConnectionStatusListener,
  addErrorListener,
  Room,
  getRooms
} from "@/services/api";
import { toast } from "sonner";
import { ArrowLeft, Chips, DollarSign, RefreshCw, Users } from "lucide-react";

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const playerId = localStorage.getItem("playerId");
    const playerName = localStorage.getItem("playerName");
    
    if (!playerId || !playerName) {
      toast.error("Authentication Error", {
        description: "You must be logged in to join a room."
      });
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
          setConnectionError("The room you're trying to join doesn't exist.");
          toast.error("Комната не найдена", {
            description: "Комната, в которую вы пытаетесь войти, не существует."
          });
        }
      } catch (error) {
        console.error("Error fetching room info:", error);
        setConnectionError("Failed to fetch room information. Please try again.");
        toast.error("Ошибка", {
          description: "Не удалось получить информацию о комнате."
        });
      } finally {
        setLoading(false);
      }
    };

    getRoomInfo();

    if (roomId) {
      setIsConnecting(true);
      setConnectionError(null);
      connectToRoom(roomId);
    }

    const removeConnectionListener = addConnectionStatusListener(status => {
      setIsConnected(status);
      setIsConnecting(false);
      
      if (status) {
        setConnectionError(null);
      } else {
        // Connection error message is shown by the toast in websocket.ts
      }
    });

    const removeErrorListener = addErrorListener(message => {
      setConnectionError(message);
      toast.error("Game Error", {
        description: message
      });
    });

    return () => {
      disconnectFromRoom();
      removeConnectionListener();
      removeErrorListener();
    };
  }, [roomId, navigate]);

  const handleLeaveRoom = () => {
    disconnectFromRoom();
    navigate("/lobby");
  };

  const handleRetryConnection = () => {
    if (roomId) {
      setIsConnecting(true);
      setConnectionError(null);
      connectToRoom(roomId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-poker-dark">
        <div className="flex flex-col items-center">
          <div className="animate-spin mb-4">
            <Chips size={40} className="text-poker-gold" />
          </div>
          <div className="text-poker-gold text-2xl">
            Загрузка игры...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-poker-dark">
      <header className="bg-black p-2 flex justify-between items-center border-b border-poker-gold/20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLeaveRoom} 
          className="text-white"
        >
          <ArrowLeft size={16} className="mr-1" /> Выйти
        </Button>
        
        <div className="text-center">
          <h1 className="text-lg font-bold text-poker-gold">
            {room?.name || "Покерный стол"}
          </h1>
          <div className="text-xs text-white/60 flex justify-center items-center gap-2">
            <span className="flex items-center">
              <DollarSign size={12} className="mr-0.5" /> 
              {room ? `${room.smallBlind}/${room.bigBlind}` : ""}
            </span>
            {room && (
              <span className="flex items-center">
                <Users size={12} className="mr-0.5" /> 
                {`Макс. ${room.maxPlayers}`}
              </span>
            )}
          </div>
        </div>
        
        <div className="w-20 h-8">
          {/* Empty div for balanced layout */}
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden bg-poker-dark">
        <div className="absolute inset-0 bg-gradient-to-b from-poker-dark to-black/90"></div>
        <div className="absolute w-full h-full bg-[url('/card-pattern.png')] opacity-5 mix-blend-overlay"></div>
        
        <PokerTable maxPlayers={room?.maxPlayers || 6} />

        {!isConnected && !isConnecting && connectionError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md p-6 bg-black/80 rounded-lg border border-poker-accent/30">
              <div className="text-poker-gold text-xl mb-4">
                Ошибка подключения
              </div>
              <div className="text-white/70 mb-6">
                {connectionError}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleRetryConnection} 
                  variant="default" 
                  className="bg-poker-accent hover:bg-poker-accent/80 text-white"
                >
                  <RefreshCw size={16} className="mr-2" /> Повторить
                </Button>
                <Button 
                  onClick={handleLeaveRoom} 
                  variant="outline" 
                  className="border-poker-accent text-white"
                >
                  Вернуться в лобби
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom;
