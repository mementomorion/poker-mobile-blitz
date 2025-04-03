
import React, { useEffect, useState } from "react";
import { getRooms, Room } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, PlayCircle, PauseCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const RoomList: React.FC = () => {
  const navigate = useNavigate();

  // Use React Query for better caching and automatic refetching
  const { 
    data: rooms = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    // Refetch data every 10 seconds to ensure fresh data
    refetchInterval: 10000, 
    // Also refetch when window regains focus
    refetchOnWindowFocus: true,
  });

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleRefreshRooms = () => {
    refetch();
  };

  useEffect(() => {
    // Initial fetch
    refetch();
    
    // Set up an interval to refetch rooms
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [refetch]);

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

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-400">Error loading rooms. Please try again.</p>
        <Button onClick={handleRefreshRooms} className="mt-2">
          Retry
        </Button>
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
