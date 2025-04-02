
import React, { useState, useEffect } from "react";
import { 
  GameState, 
  Player, 
  Card, 
  addGameStateListener, 
  sendPlayerAction
} from "@/services/api";
import PokerCard from "./PokerCard";
import PlayerSpot from "./PlayerSpot";
import ActionButtons from "./ActionButtons";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface PokerTableProps {
  maxPlayers: number;
}

const PokerTable: React.FC<PokerTableProps> = ({ maxPlayers = 6 }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerPositions, setPlayerPositions] = useState<(Player | null)[]>([]);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize player positions based on maxPlayers
  useEffect(() => {
    setLocalPlayerId(localStorage.getItem("playerId"));
    setPlayerPositions(Array(maxPlayers).fill(null));
  }, [maxPlayers]);

  // Listen for game state updates
  useEffect(() => {
    const removeListener = addGameStateListener((newState) => {
      setGameState(newState);
      
      // Reorganize players around the table
      organizePlayers(newState.players);
      
      // Show phase transitions as toast notifications
      handlePhaseTransitions(newState);
    });

    return () => removeListener();
  }, []);

  // Function to handle phase transitions
  const handlePhaseTransitions = (newState: GameState) => {
    const phaseMessages: { [key: string]: string } = {
      preflop: "New hand started! Cards are dealt.",
      flop: "Flop cards are revealed.",
      turn: "Turn card is revealed.",
      river: "River card is revealed.",
      showdown: "Showdown! Let's see who wins.",
    };

    if (gameState && newState.phase !== gameState.phase && phaseMessages[newState.phase]) {
      toast({
        title: `${newState.phase.charAt(0).toUpperCase() + newState.phase.slice(1)}`,
        description: phaseMessages[newState.phase],
      });
    }
  };

  // Organize players around the table based on the local player
  const organizePlayers = (players: Player[]) => {
    const playerId = localStorage.getItem("playerId");
    if (!playerId) return;

    const positions = Array(maxPlayers).fill(null);
    
    // Find the local player
    const localPlayerIndex = players.findIndex(p => p.id === playerId);
    if (localPlayerIndex === -1) return;
    
    // Set the local player at the bottom position
    const bottomPosition = Math.floor(maxPlayers / 2);
    positions[bottomPosition] = players[localPlayerIndex];
    
    // Arrange other players clockwise
    let positionIndex = (bottomPosition + 1) % maxPlayers;
    for (let i = 1; i < players.length; i++) {
      const playerIndex = (localPlayerIndex + i) % players.length;
      positions[positionIndex] = players[playerIndex];
      positionIndex = (positionIndex + 1) % maxPlayers;
    }
    
    setPlayerPositions(positions);
  };

  // Get community cards based on the game phase
  const getVisibleCommunityCards = () => {
    if (!gameState || !gameState.communityCards) return [];
    
    switch (gameState.phase) {
      case "flop":
        return gameState.communityCards.slice(0, 3);
      case "turn":
        return gameState.communityCards.slice(0, 4);
      case "river":
      case "showdown":
        return gameState.communityCards;
      default:
        return [];
    }
  };

  const handleAction = (action: string, amount?: number) => {
    sendPlayerAction(action, amount);
  };

  // Check if it's the local player's turn
  const isPlayerTurn = () => {
    if (!gameState || !localPlayerId) return false;
    return gameState.currentPlayer === localPlayerId;
  };

  // Get current minimum bet amount
  const getMinBetAmount = () => {
    if (!gameState) return 0;
    return gameState.minBet;
  };

  // Determine if player can check
  const canCheck = () => {
    if (!gameState || !localPlayerId) return false;
    
    // Find the local player
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return false;
    
    // Check if the player's current bet matches the current highest bet
    const highestBet = Math.max(...gameState.players.map(p => p.totalBet || 0));
    return (player.totalBet || 0) >= highestBet;
  };

  // Get amount needed to call
  const getCallAmount = () => {
    if (!gameState || !localPlayerId) return 0;
    
    // Find the local player
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return 0;
    
    // Calculate the difference between highest bet and player's current bet
    const highestBet = Math.max(...gameState.players.map(p => p.totalBet || 0));
    return highestBet - (player.totalBet || 0);
  };

  // Find the local player
  const getLocalPlayer = () => {
    if (!gameState || !localPlayerId) return null;
    return gameState.players.find(p => p.id === localPlayerId);
  };

  // Get phase text
  const getPhaseText = () => {
    if (!gameState) return "Waiting for game to start";
    
    switch (gameState.phase) {
      case "waiting": return "Waiting for players...";
      case "preflop": return "Pre-flop";
      case "flop": return "Flop";
      case "turn": return "Turn";
      case "river": return "River";
      case "showdown": return "Showdown";
      default: return "";
    }
  };

  // Get time left as percentage
  const getTimeLeftPercentage = () => {
    if (!gameState || !gameState.timeLeft) return 100;
    // Assuming max time is 30 seconds
    return (gameState.timeLeft / 30) * 100;
  };

  if (!gameState) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse text-poker-gold text-2xl">
          Connecting to game...
        </div>
      </div>
    );
  }

  const visibleCommunityCards = getVisibleCommunityCards();
  const localPlayer = getLocalPlayer();

  return (
    <div className="flex flex-col h-full">
      {/* Game info bar */}
      <div className="flex justify-between items-center p-2 bg-black/30 text-white text-sm">
        <div className="flex items-center">
          <span className="bg-poker-accent px-2 py-1 rounded mr-2">
            {getPhaseText()}
          </span>
          <span className="text-poker-gold">
            Pot: ${gameState.pot}
          </span>
        </div>
        {/* Timer if it's the current player's turn */}
        {isPlayerTurn() && (
          <div className="w-1/3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-poker-accent transition-all duration-1000 ease-linear" 
              style={{ width: `${getTimeLeftPercentage()}%` }}
            />
          </div>
        )}
      </div>

      {/* Main poker table */}
      <div className="flex-1 relative">
        {/* Circular table */}
        <div className="poker-table absolute inset-4 rounded-full flex items-center justify-center">
          {/* Community cards */}
          <div className="absolute flex space-x-1 mb-2">
            {visibleCommunityCards.length > 0 ? (
              visibleCommunityCards.map((card, index) => (
                <PokerCard 
                  key={`${card.suit}-${card.value}`} 
                  card={card}
                  dealAnimation={gameState.phase === "flop" && index < 3 || 
                                gameState.phase === "turn" && index === 3 ||
                                gameState.phase === "river" && index === 4}
                  dealDelay={index * 200}
                />
              ))
            ) : (
              <div className="text-poker-gold text-sm">
                {gameState.phase === "waiting" 
                  ? "Waiting for more players to join..." 
                  : gameState.phase === "preflop" 
                  ? "Waiting for preflop betting round..." 
                  : ""}
              </div>
            )}
          </div>

          {/* Pot display */}
          {gameState.pot > 0 && (
            <div className="absolute top-1/2 mt-8 chip bg-poker-gold text-poker-dark text-sm font-bold px-2 py-1 rounded-full">
              ${gameState.pot}
            </div>
          )}
        </div>

        {/* Player positions around the table */}
        <div className="absolute inset-0">
          {playerPositions.map((player, index) => {
            if (!player) return null;

            // Calculate position around the table
            const angle = ((index / maxPlayers) * 2 * Math.PI);
            const radius = 45; // % of container
            const top = 50 - Math.cos(angle) * radius;
            const left = 50 + Math.sin(angle) * radius;

            return (
              <div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                }}
              >
                <PlayerSpot 
                  player={player} 
                  isLocalPlayer={player.id === localPlayerId}
                  isCurrentPlayer={player.id === gameState.currentPlayer}
                  isDealer={player.id === gameState.dealer}
                  isSmallBlind={player.id === gameState.smallBlind}
                  isBigBlind={player.id === gameState.bigBlind}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-auto p-2 bg-black/50">
        {isPlayerTurn() && (
          <ActionButtons 
            canCheck={canCheck()}
            callAmount={getCallAmount()}
            minBetAmount={getMinBetAmount()}
            currentBalance={localPlayer?.balance || 0}
            onAction={handleAction}
          />
        )}
      </div>
    </div>
  );
};

export default PokerTable;
