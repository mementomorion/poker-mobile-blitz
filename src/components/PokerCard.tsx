
import React from "react";
import { Card as CardType } from "@/services/api";
import { cn } from "@/lib/utils";

interface PokerCardProps {
  card?: CardType;
  hidden?: boolean;
  className?: string;
  dealAnimation?: boolean;
  dealDelay?: number;
}

const PokerCard: React.FC<PokerCardProps> = ({
  card,
  hidden = false,
  className,
  dealAnimation = false,
  dealDelay = 0,
}) => {
  const getCardColor = (suit?: string) => {
    if (!suit) return "text-black";
    return suit === "hearts" || suit === "diamonds"
      ? "text-poker-accent"
      : "text-black";
  };

  const getSuitSymbol = (suit?: string) => {
    if (!suit) return "";
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      default:
        return "";
    }
  };

  const getCardValue = (value?: string | number) => {
    if (!value) return "";
    if (value === 1 || value === "A") return "A";
    if (value === 11 || value === "J") return "J";
    if (value === 12 || value === "Q") return "Q";
    if (value === 13 || value === "K") return "K";
    return value.toString();
  };

  return (
    <div
      className={cn(
        "poker-card relative w-10 h-14 rounded-md flex items-center justify-center",
        dealAnimation && "opacity-0 animate-card-deal",
        hidden ? "card-back" : "bg-white",
        className
      )}
      style={{
        animationDelay: dealDelay ? `${dealDelay}ms` : "0ms",
      }}
    >
      {!hidden && card && (
        <>
          <div className={cn("absolute top-1 left-1 text-xs font-bold", getCardColor(card.suit))}>
            <div>{getCardValue(card.value)}</div>
            <div>{getSuitSymbol(card.suit)}</div>
          </div>
          <div className={cn("text-xl", getCardColor(card.suit))}>
            {getSuitSymbol(card.suit)}
          </div>
          <div className={cn("absolute bottom-1 right-1 text-xs font-bold rotate-180", getCardColor(card.suit))}>
            <div>{getCardValue(card.value)}</div>
            <div>{getSuitSymbol(card.suit)}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default PokerCard;
