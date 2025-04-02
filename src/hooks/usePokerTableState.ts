
import { useState, useEffect } from "react";
import { GameState, Player, addGameStateListener, sendPlayerAction } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export function usePokerTableState(maxPlayers: number) {
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

  // Get time left as percentage
  const getTimeLeftPercentage = () => {
    if (!gameState || !gameState.timeLeft) return 100;
    // Assuming max time is 30 seconds
    return (gameState.timeLeft / 30) * 100;
  };

  return {
    gameState,
    playerPositions,
    localPlayerId,
    visibleCommunityCards: getVisibleCommunityCards(),
    localPlayer: getLocalPlayer(),
    isPlayerTurn: isPlayerTurn(),
    canCheck: canCheck(),
    callAmount: getCallAmount(),
    minBetAmount: getMinBetAmount(),
    timeLeftPercentage: getTimeLeftPercentage(),
    handleAction
  };
}
