
// WebSocket functionality for the poker application
import { toast } from "sonner";
import { GameState } from "./types";

let socket: WebSocket | null = null;
let gameStateListeners: Array<(state: GameState) => void> = [];
let connectionStatusListeners: Array<(connected: boolean) => void> = [];
let errorListeners: Array<(message: string) => void> = [];

// Function to get WebSocket URL based on current environment
const getWebSocketUrl = (roomId: string): string => {
  return `ws://localhost:3000/game/${roomId}`;
};

export const connectToRoom = (roomId: string) => {
  const playerId = localStorage.getItem("playerId");
  const username = localStorage.getItem("playerName");
  
  if (!playerId || !username) {
    toast.error("Authentication Error", {
      description: "You must be logged in to join a room."
    });
    return;
  }

  // Close existing connection if any
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }

  // Connect to the WebSocket server with dynamically determined URL
  const wsUrl = getWebSocketUrl(roomId);
  console.log(`Connecting to WebSocket at: ${wsUrl}`);
  socket = new WebSocket(wsUrl);

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
        toast.error("Game Error", {
          description: message.message
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
    toast.error("Connection Error", {
      description: "Failed to connect to the game server."
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
    toast.error("Connection Error", {
      description: "Not connected to the game server."
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
