
import React from "react";
import { CircleDollarSign } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Загрузка игры..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-poker-dark">
      <div className="flex flex-col items-center">
        <div className="animate-spin mb-4">
          <CircleDollarSign size={40} className="text-poker-gold" />
        </div>
        <div className="text-poker-gold text-2xl">
          {message}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
