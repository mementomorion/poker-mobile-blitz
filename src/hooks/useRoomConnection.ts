
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  connectToRoom, 
  disconnectFromRoom, 
  addConnectionStatusListener,
  addErrorListener,
  Room,
  getRooms
} from "@/services/api";

export function useRoomConnection(roomId: string | undefined) {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load room information
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
      } 
      // Connection error message is shown by the toast in websocket.ts
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

  return {
    isConnected,
    isConnecting,
    room,
    loading,
    connectionError,
    handleLeaveRoom,
    handleRetryConnection
  };
}
