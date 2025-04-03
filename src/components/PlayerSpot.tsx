
import React from "react";
import { Player } from "@/services/api";
import PokerCard from "./PokerCard";
import { cn } from "@/lib/utils";
import { DollarSign, User } from "lucide-react";

interface PlayerSpotProps {
  player: Player;
  isLocalPlayer: boolean;
  isCurrentPlayer: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
}

const PlayerSpot: React.FC<PlayerSpotProps> = ({
  player,
  isLocalPlayer,
  isCurrentPlayer,
  isDealer,
  isSmallBlind,
  isBigBlind,
}) => {
  // Determine the player status text
  const getStatusText = () => {
    if (player.folded) return "Фолд";
    if (player.isAllIn) return "Олл-ин";
    if (player.action) {
      const actionMap: Record<string, string> = {
        "check": "Чек",
        "call": "Колл",
        "bet": "Бет",
        "fold": "Фолд",
        "raise": "Рейз",
        "all-in": "Олл-ин"
      };
      return actionMap[player.action] || player.action.charAt(0).toUpperCase() + player.action.slice(1);
    }
    return "";
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center",
        isCurrentPlayer && "animate-pulse"
      )}
    >
      {/* Bet amount */}
      {player.bet && player.bet > 0 && (
        <div className="mb-1 text-poker-gold text-xs chip bg-poker-dark/80 px-2 py-1 rounded-full animate-chip-bet shadow-glow">
          ${player.bet}
        </div>
      )}
      
      {/* Player cards */}
      {player.cards && (
        <div className={cn("flex -space-x-3 mb-1", isLocalPlayer ? "z-10" : "")}>
          {player.cards.map((card, index) => (
            <PokerCard 
              key={index} 
              card={isLocalPlayer ? card : undefined}
              hidden={!isLocalPlayer && !player.folded}
              dealAnimation={true}
              dealDelay={index * 150 + 300}
              className={cn(
                index === 0 && "rotate-[-5deg]",
                index === 1 && "rotate-[5deg]",
                player.folded && "opacity-50"
              )}
            />
          ))}
        </div>
      )}

      {/* Player info */}
      <div 
        className={cn(
          "flex flex-col items-center w-20 p-1 rounded-lg shadow-lg border",
          isLocalPlayer 
            ? "bg-poker-accent text-white border-poker-gold/50" 
            : isCurrentPlayer 
            ? "bg-poker-gold text-poker-dark border-white/50 pulse-glow"
            : "bg-black/60 text-white border-white/10"
        )}
      >
        {/* Username */}
        <div className="text-xs font-bold truncate w-full text-center">
          {player.username}
        </div>
        
        {/* Balance */}
        <div className="flex items-center justify-center text-xs">
          <DollarSign size={10} />
          <span>{player.balance}</span>
        </div>

        {/* Player status */}
        {getStatusText() && (
          <div className="text-[10px] mt-1 uppercase font-bold bg-black/30 px-2 py-0.5 rounded-full">
            {getStatusText()}
          </div>
        )}
      </div>

      {/* Position indicators */}
      <div className="flex mt-1 space-x-1">
        {isDealer && (
          <div className="text-[10px] bg-white text-poker-dark font-bold rounded-full px-2 py-0.5 shadow-glow animate-dealer-move">
            D
          </div>
        )}
        {isSmallBlind && (
          <div className="text-[10px] bg-blue-500 text-white font-bold rounded-full px-2 py-0.5 shadow-glow">
            SB
          </div>
        )}
        {isBigBlind && (
          <div className="text-[10px] bg-purple-500 text-white font-bold rounded-full px-2 py-0.5 shadow-glow">
            BB
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerSpot;
