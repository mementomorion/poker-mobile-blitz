
import React from "react";
import PokerCard from "../PokerCard";
import { Card } from "@/services/api";

interface CommunityCardsProps {
  cards: Card[];
  phase: string;
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards, phase }) => {
  if (cards.length === 0) {
    return (
      <div className="text-poker-gold text-sm">
        {phase === "waiting" 
          ? "Waiting for more players to join..." 
          : phase === "preflop" 
          ? "Waiting for preflop betting round..." 
          : ""}
      </div>
    );
  }

  return (
    <div className="flex space-x-1 mb-2">
      {cards.map((card, index) => (
        <PokerCard 
          key={`${card.suit}-${card.value}`} 
          card={card}
          dealAnimation={phase === "flop" && index < 3 || 
                        phase === "turn" && index === 3 ||
                        phase === "river" && index === 4}
          dealDelay={index * 200}
        />
      ))}
    </div>
  );
};

export default CommunityCards;
