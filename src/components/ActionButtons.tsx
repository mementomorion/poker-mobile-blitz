
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Ban, Check, ChevronsUp, DollarSign, HandCoins } from "lucide-react";

interface ActionButtonsProps {
  canCheck: boolean;
  callAmount: number;
  minBetAmount: number;
  currentBalance: number;
  onAction: (action: string, amount?: number) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  canCheck,
  callAmount,
  minBetAmount,
  currentBalance,
  onAction,
}) => {
  const [showBetSlider, setShowBetSlider] = useState(false);
  const [betAmount, setBetAmount] = useState(minBetAmount);
  
  const handleFold = () => {
    onAction("fold");
  };
  
  const handleCheck = () => {
    onAction("check");
  };
  
  const handleCall = () => {
    onAction("call");
  };
  
  const handleBet = () => {
    if (showBetSlider) {
      onAction("bet", betAmount);
      setShowBetSlider(false);
    } else {
      setShowBetSlider(true);
      setBetAmount(minBetAmount);
    }
  };
  
  const handleAllIn = () => {
    onAction("all-in");
  };
  
  const handleBetCancel = () => {
    setShowBetSlider(false);
  };
  
  return (
    <div className="w-full">
      {/* Bet slider */}
      {showBetSlider ? (
        <div className="mb-3 p-3 bg-black/80 rounded-lg border border-poker-gold/20">
          <div className="flex justify-between mb-2 text-white text-sm">
            <span className="flex items-center">
              <DollarSign size={14} className="text-poker-gold" />
              <span>{betAmount}</span>
            </span>
            <span className="text-poker-gold flex items-center">
              <span>Баланс:</span>
              <DollarSign size={14} />
              <span>{currentBalance}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-white text-xs">${minBetAmount}</span>
            <Slider
              value={[betAmount]}
              min={minBetAmount}
              max={currentBalance}
              step={Math.max(1, Math.floor(minBetAmount / 2))}
              onValueChange={(values) => setBetAmount(values[0])}
              className="flex-1"
            />
            <span className="text-white text-xs">${currentBalance}</span>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleBetCancel} variant="outline" className="flex-1 border-poker-accent text-poker-accent">
              Отмена
            </Button>
            <Button onClick={handleBet} className="flex-1 bg-poker-gold text-poker-dark hover:bg-poker-gold/80">
              Ставка ${betAmount}
            </Button>
          </div>
        </div>
      ) : (
        /* Action buttons */
        <div className="grid grid-cols-4 gap-2">
          <Button 
            onClick={handleFold} 
            className="bg-poker-dark hover:bg-poker-dark/80 border border-poker-accent text-white flex-col py-3"
          >
            <Ban size={20} className="mb-1" />
            <span className="text-xs">Фолд</span>
          </Button>
          
          <Button 
            onClick={canCheck ? handleCheck : handleCall} 
            className={cn(
              "text-white flex-col py-3",
              canCheck 
                ? "bg-green-600 hover:bg-green-600/80" 
                : "bg-blue-600 hover:bg-blue-600/80"
            )}
          >
            {canCheck ? (
              <>
                <Check size={20} className="mb-1" />
                <span className="text-xs">Чек</span>
              </>
            ) : (
              <>
                <HandCoins size={20} className="mb-1" />
                <span className="text-xs">Колл ${callAmount}</span>
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleBet} 
            className="bg-poker-gold text-poker-dark hover:bg-poker-gold/80 flex-col py-3"
            disabled={currentBalance < minBetAmount}
          >
            <DollarSign size={20} className="mb-1" />
            <span className="text-xs">Ставка</span>
          </Button>
          
          <Button 
            onClick={handleAllIn} 
            className="bg-poker-accent hover:bg-poker-accent/80 text-white flex-col py-3"
          >
            <ChevronsUp size={20} className="mb-1" />
            <span className="text-xs">Олл-ин</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
