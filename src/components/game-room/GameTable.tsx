
import React from "react";
import PokerTable from "@/components/PokerTable";
import ConnectionStatus from "./ConnectionStatus";

interface GameTableProps {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  maxPlayers: number;
  onRetry: () => void;
  onLeaveRoom: () => void;
}

const GameTable: React.FC<GameTableProps> = ({
  isConnected,
  isConnecting,
  connectionError,
  maxPlayers,
  onRetry,
  onLeaveRoom,
}) => {
  return (
    <div className="flex-1 relative overflow-hidden bg-poker-dark">
      <div className="absolute inset-0 bg-gradient-to-b from-poker-dark to-black/90"></div>
      <div className="absolute w-full h-full bg-[url('/card-pattern.png')] opacity-5 mix-blend-overlay"></div>
      
      <PokerTable maxPlayers={maxPlayers} />

      {!isConnected && !isConnecting && connectionError && (
        <ConnectionStatus 
          error={connectionError}
          onRetry={onRetry}
          onLeaveRoom={onLeaveRoom}
        />
      )}
    </div>
  );
};

export default GameTable;
