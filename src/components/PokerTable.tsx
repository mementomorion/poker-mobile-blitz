
import React from "react";
import GameInfo from "./poker/GameInfo";
import CommunityCards from "./poker/CommunityCards";
import PlayersLayout from "./poker/PlayersLayout";
import ActionButtons from "./ActionButtons";
import { usePokerTableState } from "@/hooks/usePokerTableState";
import { CircleDashed } from "lucide-react";

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

  // Отображаем стол даже при отсутствии gameState, но показываем сообщение о подключении
  const isConnecting = !gameState;

  return (
    <div className="flex flex-col h-full relative">
      {/* Полупрозрачный оверлей при подключении */}
      {isConnecting && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-poker-dark/70 backdrop-blur-sm">
          <CircleDashed size={40} className="text-poker-gold animate-spin mb-4" />
          <div className="text-poker-gold text-xl font-bold">
            Подключение к игре...
          </div>
          <div className="text-white/70 text-sm mt-2">
            Создание защищенного соединения
          </div>
        </div>
      )}

      {/* Game info bar */}
      <GameInfo 
        phase={gameState?.phase || "waiting"}
        pot={gameState?.pot || 0}
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
              phase={gameState?.phase || "waiting"}
            />
          </div>

          {/* Pot display */}
          {gameState?.pot > 0 && (
            <div className="absolute top-1/2 mt-8 chip bg-poker-gold text-poker-dark text-sm font-bold px-2 py-1 rounded-full shadow-glow">
              ${gameState.pot}
            </div>
          )}
          
          {/* Dealer chip */}
          {gameState?.dealer && (
            <div className="absolute bottom-[20%] left-[48%] w-6 h-6 bg-white rounded-full border-2 border-poker-accent flex items-center justify-center text-xs font-bold animate-dealer-move shadow-glow">
              D
            </div>
          )}
        </div>

        {/* Player positions around the table */}
        <PlayersLayout 
          playerPositions={playerPositions}
          maxPlayers={maxPlayers}
          localPlayerId={localPlayerId}
          currentPlayer={gameState?.currentPlayer || ""}
          dealer={gameState?.dealer || ""}
          smallBlind={gameState?.smallBlind || ""}
          bigBlind={gameState?.bigBlind || ""}
        />
      </div>

      {/* Action buttons */}
      <div className="mt-auto p-2 bg-black/70 border-t border-poker-gold/20">
        {isPlayerTurn ? (
          <ActionButtons 
            canCheck={canCheck}
            callAmount={callAmount}
            minBetAmount={minBetAmount}
            currentBalance={localPlayer?.balance || 0}
            onAction={handleAction}
          />
        ) : (
          <div className="flex justify-center items-center py-2 text-white/60 text-sm">
            {gameState?.phase === "waiting" 
              ? "Ожидание других игроков..."
              : gameState?.phase === "showdown"
              ? "Вскрытие карт..."
              : "Ожидание вашего хода..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default PokerTable;
