
import React from "react";
import { useParams } from "react-router-dom";
import GameHeader from "@/components/game-room/GameHeader";
import GameTable from "@/components/game-room/GameTable";
import LoadingSpinner from "@/components/game-room/LoadingSpinner";
import { useRoomConnection } from "@/hooks/useRoomConnection";

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const {
    isConnected,
    isConnecting,
    room,
    loading,
    connectionError,
    handleLeaveRoom,
    handleRetryConnection
  } = useRoomConnection(roomId);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-poker-dark">
      <GameHeader 
        room={room} 
        onLeaveRoom={handleLeaveRoom} 
      />

      <GameTable 
        isConnected={isConnected}
        isConnecting={isConnecting}
        connectionError={connectionError}
        maxPlayers={room?.maxPlayers || 6}
        onRetry={handleRetryConnection}
        onLeaveRoom={handleLeaveRoom}
      />
    </div>
  );
};

export default GameRoom;
