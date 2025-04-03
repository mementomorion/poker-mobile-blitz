
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RoomList from "@/components/RoomList";
import { 
  getCurrentUser, 
  isLoggedIn, 
  logoutUser 
} from "@/services/api";
import { LogOut, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{ username: string; id: string } | null>(null);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    const userInfo = getCurrentUser();
    setUser(userInfo);
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleRefresh = () => {
    // Invalidate and refetch rooms query
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-dark to-black text-white">
      {/* Header */}
      <header className="p-4 border-b border-poker-accent/20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-poker-gold">Poker Lobby</h1>
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="text-white hover:bg-poker-dark"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </header>

      {/* Welcome message and balance */}
      <div className="container mx-auto py-6 px-4">
        <div className="bg-black/30 border border-poker-accent/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                Welcome, <span className="text-poker-gold">{user.username}</span>!
              </h2>
              <p className="text-white/60 text-sm">
                Choose a table below to start playing
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="border-poker-accent/50 text-poker-gold hover:bg-poker-accent/10"
            >
              <RefreshCw size={16} className="mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {/* Room list */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Available Tables</h3>
          </div>
          <RoomList />
        </div>
      </div>
    </div>
  );
};

export default Lobby;
