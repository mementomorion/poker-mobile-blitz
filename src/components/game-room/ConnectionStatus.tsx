
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ConnectionStatusProps {
  error: string | null;
  onRetry: () => void;
  onLeaveRoom: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  error,
  onRetry,
  onLeaveRoom,
}) => {
  if (!error) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center max-w-md p-6 bg-black/80 rounded-lg border border-poker-accent/30">
        <div className="text-poker-gold text-xl mb-4">
          Ошибка подключения
        </div>
        <div className="text-white/70 mb-6">
          {error}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onRetry} 
            variant="default" 
            className="bg-poker-accent hover:bg-poker-accent/80 text-white"
          >
            <RefreshCw size={16} className="mr-2" /> Повторить
          </Button>
          <Button 
            onClick={onLeaveRoom} 
            variant="outline" 
            className="border-poker-accent text-white"
          >
            Вернуться в лобби
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
