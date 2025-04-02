
import React from "react";
import PlayerSpot from "../PlayerSpot";
import { Player } from "@/services/api";

interface PlayersLayoutProps {
  playerPositions: (Player | null)[];
  maxPlayers: number;
  localPlayerId: string | null;
  currentPlayer: string;
  dealer: string;
  smallBlind: string;
  bigBlind: string;
}

const PlayersLayout: React.FC<PlayersLayoutProps> = ({
  playerPositions,
  maxPlayers,
  localPlayerId,
  currentPlayer,
  dealer,
  smallBlind,
  bigBlind,
}) => {
  return (
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
              isCurrentPlayer={player.id === currentPlayer}
              isDealer={player.id === dealer}
              isSmallBlind={player.id === smallBlind}
              isBigBlind={player.id === bigBlind}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PlayersLayout;
