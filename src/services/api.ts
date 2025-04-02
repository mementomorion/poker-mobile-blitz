
// API service for the poker application
import { toast } from "@/components/ui/use-toast";

const API_URL = "http://localhost:3000";

// Types
export interface Player {
  id: string;
  username: string;
  balance: number;
  position?: number;
  cards?: Card[];
  bet?: number;
  totalBet?: number;
  action?: string;
  folded?: boolean;
  isAllIn?: boolean;
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
  isCurrentPlayer?: boolean;
}

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string | number;
}

export interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  smallBlind: number;
  bigBlind: number;
  status: "waiting" | "playing" | "finished";
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentPlayer: string;
  dealer: string;
  smallBlind: string;
  bigBlind: string;
  phase: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown";
  minBet: number;
  lastRaise: number;
  timeLeft: number;
  winner?: Player;
}

// HTTP Requests
export const loginUser = async (username: string): Promise<Player> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    // Save the player ID to localStorage for future requests
    localStorage.setItem("playerId", data.id);
    localStorage.setItem("playerName", data.username);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    toast({
      title: "Login Failed",
      description: "Unable to login. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const getRooms = async (): Promise<Room[]> => {
  try {
    const playerId = localStorage.getItem("playerId");
    if (!playerId) {
      throw new Error("Not logged in");
    }

    const response = await fetch(`${API_URL}/rooms`, {
      headers: {
        Authorization: `Bearer ${playerId}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch rooms");
    }

    return await response.json();
  } catch (error) {
    console.error("Get rooms error:", error);
    toast({
      title: "Failed to Load Rooms",
      description: "Unable to fetch available rooms. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

// WebSocket Connection
let socket: WebSocket | null = null;
let gameStateListeners: Array<(state: GameState) => void> = [];
let connectionStatusListeners: Array<(connected: boolean) => void> = [];
let errorListeners: Array<(message: string) => void> = [];

export const connectToRoom = (roomId: string) => {
  const playerId = localStorage.getItem("playerId");
  const username = localStorage.getItem("playerName");
  
  if (!playerId || !username) {
    toast({
      title: "Authentication Error",
      description: "You must be logged in to join a room.",
      variant: "destructive",
    });
    return;
  }

  // Close existing connection if any
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }

  // Connect to the WebSocket server
  socket = new WebSocket(`ws://localhost:3000/game/${roomId}`);

  socket.onopen = () => {
    console.log("WebSocket connection established");
    // Send join message
    if (socket) {
      socket.send(JSON.stringify({
        type: "join",
        playerId,
        username,
      }));
    }
    // Notify listeners about connection status
    connectionStatusListeners.forEach(listener => listener(true));
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === "game_state") {
        // Update game state listeners
        gameStateListeners.forEach(listener => listener(message.state));
      } else if (message.type === "error") {
        // Handle error messages
        console.error("Server error:", message.message);
        errorListeners.forEach(listener => listener(message.message));
        toast({
          title: "Game Error",
          description: message.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
    // Notify listeners about connection status
    connectionStatusListeners.forEach(listener => listener(false));
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    toast({
      title: "Connection Error",
      description: "Failed to connect to the game server.",
      variant: "destructive",
    });
  };
};

export const disconnectFromRoom = () => {
  const playerId = localStorage.getItem("playerId");
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    // Send leave message
    socket.send(JSON.stringify({
      type: "leave",
      playerId,
    }));
    socket.close();
  }
};

export const sendPlayerAction = (action: string, amount?: number) => {
  const playerId = localStorage.getItem("playerId");
  
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    toast({
      title: "Connection Error",
      description: "Not connected to the game server.",
      variant: "destructive",
    });
    return;
  }

  socket.send(JSON.stringify({
    type: "action",
    action,
    playerId,
    ...(amount !== undefined && { amount }),
  }));
};

// Listeners for components
export const addGameStateListener = (listener: (state: GameState) => void) => {
  gameStateListeners.push(listener);
  return () => {
    gameStateListeners = gameStateListeners.filter(l => l !== listener);
  };
};

export const addConnectionStatusListener = (listener: (connected: boolean) => void) => {
  connectionStatusListeners.push(listener);
  return () => {
    connectionStatusListeners = connectionStatusListeners.filter(l => l !== listener);
  };
};

export const addErrorListener = (listener: (message: string) => void) => {
  errorListeners.push(listener);
  return () => {
    errorListeners = errorListeners.filter(l => l !== listener);
  };
};

// Helper to check if user is logged in
export const isLoggedIn = (): boolean => {
  return localStorage.getItem("playerId") !== null;
};

// Helper to get current user info
export const getCurrentUser = (): { id: string; username: string } | null => {
  const id = localStorage.getItem("playerId");
  const username = localStorage.getItem("playerName");
  
  if (!id || !username) {
    return null;
  }
  
  return { id, username };
};

// Helper to logout user
export const logoutUser = () => {
  localStorage.removeItem("playerId");
  localStorage.removeItem("playerName");
};
