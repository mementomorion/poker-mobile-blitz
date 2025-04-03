
import React from "react";
import PokerCard from "../PokerCard";
import { Card } from "@/services/api";
import { cn } from "@/lib/utils";

interface CommunityCardsProps {
  cards: Card[];
  phase: string;
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards, phase }) => {
  // Сообщения для разных фаз игры
  const getPhaseMessage = () => {
    switch (phase) {
      case "waiting": 
        return "Ожидание игроков...";
      case "preflop": 
        return "Ожидание ставок...";
      case "flop": 
        return "Флоп";
      case "turn": 
        return "Тёрн";
      case "river": 
        return "Ривер";
      case "showdown": 
        return "Вскрытие карт";
      default: 
        return "";
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-poker-gold text-sm font-bold bg-black/30 px-3 py-1 rounded-full">
        {getPhaseMessage()}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-white/70 mb-2 bg-black/30 px-2 py-0.5 rounded-full">
        {getPhaseMessage()}
      </div>
      <div className="flex space-x-1">
        {cards.map((card, index) => (
          <PokerCard 
            key={`${card.suit}-${card.value}-${index}`} 
            card={card}
            dealAnimation={phase === "flop" && index < 3 || 
                          phase === "turn" && index === 3 ||
                          phase === "river" && index === 4}
            dealDelay={index * 200}
            className={cn(
              "shadow-lg",
              phase === "showdown" && "ring-2 ring-poker-gold"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default CommunityCards;
