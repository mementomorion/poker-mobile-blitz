
import { useState, useEffect } from "react";
import { Player, GameState } from "@/services/types";

export function usePlayerPositions(maxPlayers: number) {
  const [playerPositions, setPlayerPositions] = useState<(Player | null)[]>([]);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);

  // Initialize player positions based on maxPlayers
  useEffect(() => {
    setLocalPlayerId(localStorage.getItem("playerId"));
    setPlayerPositions(Array(maxPlayers).fill(null));
  }, [maxPlayers]);

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

  return {
    playerPositions,
    localPlayerId,
    organizePlayers
  };
}
