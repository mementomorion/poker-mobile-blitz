
import { GameState, Card } from "@/services/types";
import { useToast } from "@/hooks/use-toast";

export function useGamePhase() {
  const { toast } = useToast();

  // Function to handle phase transitions
  const handlePhaseTransitions = (newState: GameState, prevState: GameState | null) => {
    const phaseMessages: { [key: string]: string } = {
      preflop: "New hand started! Cards are dealt.",
      flop: "Flop cards are revealed.",
      turn: "Turn card is revealed.",
      river: "River card is revealed.",
      showdown: "Showdown! Let's see who wins.",
    };

    if (prevState && newState.phase !== prevState.phase && phaseMessages[newState.phase]) {
      toast({
        title: `${newState.phase.charAt(0).toUpperCase() + newState.phase.slice(1)}`,
        description: phaseMessages[newState.phase],
      });
    }
  };

  // Get community cards based on the game phase
  const getVisibleCommunityCards = (gameState: GameState | null): Card[] => {
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

  // Get time left as percentage
  const getTimeLeftPercentage = (gameState: GameState | null): number => {
    if (!gameState || !gameState.timeLeft) return 100;
    // Assuming max time is 30 seconds
    return (gameState.timeLeft / 30) * 100;
  };

  return {
    handlePhaseTransitions,
    getVisibleCommunityCards,
    getTimeLeftPercentage
  };
}
