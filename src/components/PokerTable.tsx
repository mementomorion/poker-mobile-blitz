
import React from "react";
import GameInfo from "./poker/GameInfo";
import CommunityCards from "./poker/CommunityCards";
import PlayersLayout from "./poker/PlayersLayout";
import ActionButtons from "./ActionButtons";
import { usePokerTableState } from "@/hooks/usePokerTableState";

interface PokerTableProps {
  maxPlayers: number;
}

const PokerTable: React.FC<PokerTableProps> = ({ maxPlayers = 6 }) => {
  const {
    gameState,
    playerPositions,
    localPlayerId,
    visibleCommunityCards,
    localPlayer,
    isPlayerTurn,
    canCheck,
    callAmount,
    minBetAmount,
    timeLeftPercentage,
    handleAction
  } = usePokerTableState(maxPlayers);

  if (!gameState) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse text-poker-gold text-2xl">
          Connecting to game...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Game info bar */}
      <GameInfo 
        phase={gameState.phase}
        pot={gameState.pot}
        isPlayerTurn={isPlayerTurn}
        timeLeftPercentage={timeLeftPercentage}
      />

      {/* Main poker table */}
      <div className="flex-1 relative">
        {/* Circular table */}
        <div className="poker-table absolute inset-4 rounded-full flex items-center justify-center">
          {/* Community cards */}
          <div className="absolute flex space-x-1 mb-2">
            <CommunityCards 
              cards={visibleCommunityCards}
              phase={gameState.phase}
            />
          </div>

          {/* Pot display */}
          {gameState.pot > 0 && (
            <div className="absolute top-1/2 mt-8 chip bg-poker-gold text-poker-dark text-sm font-bold px-2 py-1 rounded-full">
              ${gameState.pot}
            </div>
          )}
        </div>

        {/* Player positions around the table */}
        <PlayersLayout 
          playerPositions={playerPositions}
          maxPlayers={maxPlayers}
          localPlayerId={localPlayerId}
          currentPlayer={gameState.currentPlayer}
          dealer={gameState.dealer}
          smallBlind={gameState.smallBlind}
          bigBlind={gameState.bigBlind}
        />
      </div>

      {/* Action buttons */}
      <div className="mt-auto p-2 bg-black/50">
        {isPlayerTurn && (
          <ActionButtons 
            canCheck={canCheck}
            callAmount={callAmount}
            minBetAmount={minBetAmount}
            currentBalance={localPlayer?.balance || 0}
            onAction={handleAction}
          />
        )}
      </div>
    </div>
  );
};

export default PokerTable;
