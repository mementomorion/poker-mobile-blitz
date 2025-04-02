
import { GameState } from "@/services/types";
import { sendPlayerAction } from "@/services/websocket";

export function usePlayerActions(gameState: GameState | null, localPlayerId: string | null) {
  // Handle player actions
  const handleAction = (action: string, amount?: number) => {
    sendPlayerAction(action, amount);
  };

  // Check if it's the local player's turn
  const isPlayerTurn = (): boolean => {
    if (!gameState || !localPlayerId) return false;
    return gameState.currentPlayer === localPlayerId;
  };

  // Get current minimum bet amount
  const getMinBetAmount = (): number => {
    if (!gameState) return 0;
    return gameState.minBet;
  };

  // Determine if player can check
  const canCheck = (): boolean => {
    if (!gameState || !localPlayerId) return false;
    
    // Find the local player
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return false;
    
    // Check if the player's current bet matches the current highest bet
    const highestBet = Math.max(...gameState.players.map(p => p.totalBet || 0));
    return (player.totalBet || 0) >= highestBet;
  };

  // Get amount needed to call
  const getCallAmount = (): number => {
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

  return {
    handleAction,
    isPlayerTurn,
    getMinBetAmount,
    canCheck,
    getCallAmount,
    getLocalPlayer
  };
}
