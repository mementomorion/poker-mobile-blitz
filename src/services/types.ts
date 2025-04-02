
// Type definitions for the poker application

export interface Player {
  id: string;
  username: string;
  balance: number;
  position?: number;
  cards?: Card[];
  bet?: number;
  totalBet?: number;
  action?: string;
  folded?: boolean;
  isAllIn?: boolean;
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
  isCurrentPlayer?: boolean;
}

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string | number;
}

export interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  smallBlind: number;
  bigBlind: number;
  status: "waiting" | "playing" | "finished";
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentPlayer: string;
  dealer: string;
  smallBlind: string;
  bigBlind: string;
  phase: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown";
  minBet: number;
  lastRaise: number;
  timeLeft: number;
  winner?: Player;
}
