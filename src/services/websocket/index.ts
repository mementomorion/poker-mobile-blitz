
// Main WebSocket functionality for the poker application
import { toast } from "sonner";
import { 
  getWebSocketUrl, 
  createWebSocketConnection,
  clearReconnectTimer, 
  getSocket, 
  setSocket,
  getIsIntentionalClose,
  setIsIntentionalClose,
  getReconnectAttempts,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  scheduleReconnect
} from "./connection";
import { 
  addGameStateListener, 
  addConnectionStatusListener, 
  addErrorListener,
  notifyConnectionStatusListeners,
  notifyErrorListeners
} from "./listeners";
import { handleMessage, sendMessage, sendPlayerAction } from "./messages";

// Connect to a game room
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
  clearReconnectTimer();

  // Close existing connection if any
  const existingSocket = getSocket();
  if (existingSocket && existingSocket.readyState === WebSocket.OPEN) {
    setIsIntentionalClose(true);
    existingSocket.close();
  }

  setIsIntentionalClose(false);

  // Get WebSocket URL and create connection
  const wsUrl = getWebSocketUrl(roomId);
  console.log(`Attempting to connect to WebSocket at: ${wsUrl}`);
  
  try {
    const socket = createWebSocketConnection(wsUrl);
    setSocket(socket);

    socket.onopen = () => {
      console.log("WebSocket connection established successfully");
      
      // Send join message
      if (socket.readyState === WebSocket.OPEN) {
        try {
          sendMessage({
            type: "join",
            playerId,
            username,
          });
          
          // Notify listeners about connection status
          notifyConnectionStatusListeners(true);
          toast.success("Connected to Game Server", {
            description: "You are now connected to the poker table."
          });
        } catch (error) {
          console.error("Error sending join message:", error);
          notifyErrorListeners("Failed to join the game room");
        }
      }
    };

    socket.onmessage = handleMessage;

    socket.onclose = (event) => {
      console.log(`WebSocket connection closed with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
      
      // Notify listeners about connection status
      notifyConnectionStatusListeners(false);
      
      // Attempt to reconnect if the closure wasn't intentional
      if (!getIsIntentionalClose()) {
        incrementReconnectAttempts();
        scheduleReconnect(roomId, () => {
          const currentSocket = getSocket();
          if (!currentSocket || currentSocket.readyState === WebSocket.CLOSED) {
            connectToRoom(roomId);
          }
        });
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Additional error information if available
      if (error instanceof ErrorEvent) {
        console.error("Error message:", error.message);
      }
      notifyErrorListeners("Error connecting to the game server");
      // No need to show a toast here as the onclose handler will be called next
    };
  } catch (error) {
    console.error("Error creating WebSocket connection:", error);
    notifyErrorListeners("Failed to create WebSocket connection");
    toast.error("Connection Error", {
      description: "Failed to create WebSocket connection."
    });
  }
};

// Disconnect from a game room
export const disconnectFromRoom = () => {
  const playerId = localStorage.getItem("playerId");
  
  // Clear any reconnect timers
  clearReconnectTimer();
  
  // Reset reconnect attempts
  resetReconnectAttempts();
  
  const socket = getSocket();
  if (socket && socket.readyState === WebSocket.OPEN) {
    setIsIntentionalClose(true);
    
    // Send leave message
    try {
      sendMessage({
        type: "leave",
        playerId,
      });
    } catch (error) {
      console.error("Error sending leave message:", error);
    }
    
    socket.close();
  }
};

// Export all public methods and types
export {
  sendPlayerAction,
  addGameStateListener,
  addConnectionStatusListener,
  addErrorListener
};
