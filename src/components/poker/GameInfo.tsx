
import React from "react";

interface GameInfoProps {
  phase: string;
  pot: number;
  isPlayerTurn: boolean;
  timeLeftPercentage: number;
}

const GameInfo: React.FC<GameInfoProps> = ({ 
  phase, 
  pot, 
  isPlayerTurn, 
  timeLeftPercentage 
}) => {
  // Get phase text
  const getPhaseText = () => {
    switch (phase) {
      case "waiting": return "Waiting for players...";
      case "preflop": return "Pre-flop";
      case "flop": return "Flop";
      case "turn": return "Turn";
      case "river": return "River";
      case "showdown": return "Showdown";
      default: return "";
    }
  };

  return (
    <div className="flex justify-between items-center p-2 bg-black/30 text-white text-sm">
      <div className="flex items-center">
        <span className="bg-poker-accent px-2 py-1 rounded mr-2">
          {getPhaseText()}
        </span>
        <span className="text-poker-gold">
          Pot: ${pot}
        </span>
      </div>
      {/* Timer if it's the current player's turn */}
      {isPlayerTurn && (
        <div className="w-1/3 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-poker-accent transition-all duration-1000 ease-linear" 
            style={{ width: `${timeLeftPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default GameInfo;
