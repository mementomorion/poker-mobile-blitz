
import React from "react";
import { Clock, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

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
      case "waiting": return "Ожидание игроков";
      case "preflop": return "Пре-флоп";
      case "flop": return "Флоп";
      case "turn": return "Тёрн";
      case "river": return "Ривер";
      case "showdown": return "Вскрытие карт";
      default: return phase || "Неизвестно";
    }
  };

  return (
    <div className="flex justify-between items-center p-2 bg-black/70 text-white text-sm border-b border-poker-gold/20">
      <div className="flex items-center">
        <span className={cn(
          "px-2 py-1 rounded mr-2 font-bold text-xs",
          phase === "waiting" ? "bg-gray-600" :
          phase === "preflop" ? "bg-blue-600" :
          phase === "flop" ? "bg-green-600" :
          phase === "turn" ? "bg-yellow-600" :
          phase === "river" ? "bg-red-600" :
          phase === "showdown" ? "bg-purple-600" : "bg-poker-accent"
        )}>
          {getPhaseText()}
        </span>
        <span className="text-poker-gold flex items-center">
          <Coins size={14} className="mr-1" />
          <span className="font-bold">{pot}</span>
        </span>
      </div>
      {/* Timer if it's the current player's turn */}
      {isPlayerTurn && (
        <div className="flex items-center">
          <Clock size={14} className="mr-1 text-poker-gold" />
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-linear",
                timeLeftPercentage > 50 ? "bg-green-500" :
                timeLeftPercentage > 20 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${Math.max(0, Math.min(timeLeftPercentage, 100))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
