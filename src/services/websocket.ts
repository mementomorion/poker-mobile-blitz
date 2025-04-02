
// WebSocket functionality for the poker application
import { toast } from "sonner";
import { GameState } from "./types";

let socket: WebSocket | null = null;
let gameStateListeners: Array<(state: GameState) => void> = [];
let connectionStatusListeners: Array<(connected: boolean) => void> = [];
let errorListeners: Array<(message: string) => void> = [];
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let isIntentionalClose = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

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

  // Clear any reconnect timers
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Close existing connection if any
  if (socket && socket.readyState === WebSocket.OPEN) {
    isIntentionalClose = true;
    socket.close();
  }

  isIntentionalClose = false;

  // Connect to the WebSocket server with dynamically determined URL
  const wsUrl = getWebSocketUrl(roomId);
  console.log(`Connecting to WebSocket at: ${wsUrl}`);
  
  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connection established");
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Send join message
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify({
            type: "join",
            playerId,
            username,
          }));
          
          // Notify listeners about connection status
          connectionStatusListeners.forEach(listener => listener(true));
        } catch (error) {
          console.error("Error sending join message:", error);
        }
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Message from server:', message);
        
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

    socket.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      
      // Notify listeners about connection status
      connectionStatusListeners.forEach(listener => listener(false));
      
      // Attempt to reconnect if the closure wasn't intentional
      if (!isIntentionalClose && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const reconnectDelay = Math.min(3000 * reconnectAttempts, 15000); // Exponential backoff with max of 15 seconds
        
        toast.error("Connection Lost", {
          description: `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
        });
        
        // Try to reconnect after a delay
        reconnectTimeout = setTimeout(() => {
          if (socket?.readyState === WebSocket.CLOSED) {
            console.log(`Attempting to reconnect (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            connectToRoom(roomId);
          }
        }, reconnectDelay);
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && !isIntentionalClose) {
        toast.error("Connection Failed", {
          description: "Maximum reconnection attempts reached. Please try again later."
        });
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection Error", {
        description: "Error connecting to the game server. Will try to reconnect automatically."
      });
      
      // Let onclose handle the reconnection
    };
  } catch (error) {
    console.error("Error creating WebSocket connection:", error);
    toast.error("Connection Error", {
      description: "Failed to create WebSocket connection."
    });
  }
};

export const disconnectFromRoom = () => {
  const playerId = localStorage.getItem("playerId");
  
  // Clear any reconnect timers
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  // Reset reconnect attempts
  reconnectAttempts = 0;
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    isIntentionalClose = true;
    
    // Send leave message
    try {
      socket.send(JSON.stringify({
        type: "leave",
        playerId,
      }));
    } catch (error) {
      console.error("Error sending leave message:", error);
    }
    
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

  try {
    socket.send(JSON.stringify({
      type: "action",
      action,
      playerId,
      ...(amount !== undefined && { amount }),
    }));
  } catch (error) {
    console.error("Error sending player action:", error);
    toast.error("Action Error", {
      description: "Failed to send your action to the server."
    });
  }
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
