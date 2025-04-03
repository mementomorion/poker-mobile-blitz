
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Users } from "lucide-react";
import { Room } from "@/services/api";

interface GameHeaderProps {
  room: Room | null;
  onLeaveRoom: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ room, onLeaveRoom }) => {
  return (
    <header className="bg-black p-2 flex justify-between items-center border-b border-poker-gold/20">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onLeaveRoom} 
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
  );
};

export default GameHeader;
