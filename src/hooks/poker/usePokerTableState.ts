
import { useState, useEffect } from "react";
import { GameState, addGameStateListener } from "@/services/api";
import { usePlayerPositions } from "./usePlayerPositions";
import { useGamePhase } from "./useGamePhase";
import { usePlayerActions } from "./usePlayerActions";

export function usePokerTableState(maxPlayers: number) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Use our modular hooks
  const { playerPositions, localPlayerId, organizePlayers } = usePlayerPositions(maxPlayers);
  const { handlePhaseTransitions, getVisibleCommunityCards, getTimeLeftPercentage } = useGamePhase();
  const playerActions = usePlayerActions(gameState, localPlayerId);

  // Listen for game state updates
  useEffect(() => {
    const removeListener = addGameStateListener((newState) => {
      // Store previous state for phase transition handling
      const prevState = gameState;
      
      // Update game state
      setGameState(newState);
      
      // Reorganize players around the table
      organizePlayers(newState.players);
      
      // Show phase transitions as toast notifications
      handlePhaseTransitions(newState, prevState);
    });

    return () => removeListener();
  }, [gameState]);

  return {
    gameState,
    playerPositions,
    localPlayerId,
    visibleCommunityCards: gameState ? getVisibleCommunityCards(gameState) : [],
    localPlayer: playerActions.getLocalPlayer(),
    isPlayerTurn: playerActions.isPlayerTurn(),
    canCheck: playerActions.canCheck(),
    callAmount: playerActions.getCallAmount(),
    minBetAmount: playerActions.getMinBetAmount(),
    timeLeftPercentage: getTimeLeftPercentage(gameState),
    handleAction: playerActions.handleAction
  };
}
