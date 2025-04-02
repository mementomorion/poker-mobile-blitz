
import React, { useEffect, useState } from "react";
import { getRooms, Room } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, PlayCircle, PauseCircle } from "lucide-react";

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomData = await getRooms();
        setRooms(roomData);
      } catch (error) {
        // Error is already handled in the getRooms function
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
    
    // Refresh rooms every 30 seconds
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const getStatusIcon = (status: string) => {
    if (status === "playing") {
      return <PlayCircle className="text-green-500" size={18} />;
    } else if (status === "waiting") {
      return <PauseCircle className="text-amber-500" size={18} />;
    } else {
      return <PauseCircle className="text-gray-500" size={18} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-pulse text-poker-gold">Loading rooms...</div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-400">No rooms available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {rooms.map((room) => (
        <Card key={room.id} className="bg-poker-dark/80 border-poker-accent/20 hover:border-poker-accent/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-white flex justify-between items-center">
              <span>{room.name}</span>
              <div className="flex items-center space-x-1">
                {getStatusIcon(room.status)}
                <span className="text-sm font-normal capitalize text-gray-300">{room.status}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Users size={16} />
                <span>{room.playerCount}/{room.maxPlayers} players</span>
              </div>
              <div className="flex items-center space-x-2 text-poker-gold">
                <DollarSign size={16} />
                <span>{room.smallBlind}/{room.bigBlind}</span>
              </div>
            </div>
            <Button 
              onClick={() => handleJoinRoom(room.id)} 
              className="w-full bg-poker-accent hover:bg-poker-accent/80"
            >
              Join Table
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RoomList;
