// Core WebSocket functionality for connecting and disconnecting
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
  scheduleReconnect,
  handleConnectionError,
  checkServerHealth
} from "./connection";
import { 
  notifyConnectionStatusListeners, 
  notifyErrorListeners 
} from "./listeners";
import { handleMessage, sendMessage } from "./messages";

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
  if (existingSocket) {
    // Log the current state of the socket
    console.log(`Existing socket state: ${existingSocket.readyState}`);
    
    if (existingSocket.readyState === WebSocket.OPEN || 
        existingSocket.readyState === WebSocket.CONNECTING) {
      setIsIntentionalClose(true);
      existingSocket.close();
      console.log("Closed existing WebSocket connection");
    }
  }

  // Reset intentional close flag before new connection
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
          const joinMessage = {
            type: "join",
            playerId,
            username,
          };
          console.log("Sending join message:", joinMessage);
          sendMessage(joinMessage);
          
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

    socket.onmessage = (event) => {
      console.log("Received message from server:", event.data);
      handleMessage(event);
    };

    socket.onclose = async (event) => {
      const errorMessage = handleConnectionError(event.code, event.reason);
      
      // Notify listeners about connection status
      notifyConnectionStatusListeners(false);
      
      // Attempt to reconnect if the closure wasn't intentional
      if (!getIsIntentionalClose()) {
        // For code 1005 (No Status Received), check if server is available first
        if (event.code === 1005) {
          const isServerHealthy = await checkServerHealth();
          
          if (!isServerHealthy) {
            toast.error("Server Unavailable", {
              description: "The game server appears to be down. Please try again later."
            });
            return; // Don't attempt to reconnect if server is down
          }
        }
        
        incrementReconnectAttempts();
        scheduleReconnect(roomId, () => {
          const currentSocket = getSocket();
          if (!currentSocket || 
              currentSocket.readyState === WebSocket.CLOSED || 
              currentSocket.readyState === WebSocket.CLOSING) {
            console.log("Socket is closed or closing, reconnecting...");
            connectToRoom(roomId);
          } else {
            console.log(`Socket is in state: ${currentSocket.readyState}, not reconnecting`);
          }
        });
      } else {
        console.log("Intentional close, not reconnecting");
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Additional error information if available
      if (error instanceof ErrorEvent) {
        console.error("Error message:", error.message);
      }
      notifyErrorListeners("Error connecting to the game server");
      
      // We'll check server health here but won't toast, as onclose will be called next
      checkServerHealth().then(isHealthy => {
        if (!isHealthy) {
          console.error("Server health check failed after WebSocket error");
        }
      });
    };
  } catch (error) {
    console.error("Error creating WebSocket connection:", error);
    notifyErrorListeners("Failed to create WebSocket connection");
    toast.error("Connection Error", {
      description: "Failed to create WebSocket connection. Please check if the server is running."
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
  if (socket) {
    // Log the current state of the socket
    console.log(`Socket state before disconnect: ${socket.readyState}`);
    
    setIsIntentionalClose(true);
    
    // Send leave message if the socket is open
    if (socket.readyState === WebSocket.OPEN) {
      try {
        const leaveMessage = {
          type: "leave",
          playerId,
        };
        console.log("Sending leave message:", leaveMessage);
        sendMessage(leaveMessage);
      } catch (error) {
        console.error("Error sending leave message:", error);
      }
      
      // Close the socket
      socket.close();
      console.log("WebSocket connection closed intentionally");
    } else if (socket.readyState === WebSocket.CONNECTING) {
      // If the socket is still connecting, close it
      socket.close();
      console.log("Closed connecting WebSocket");
    }
    
    // Set socket to null to clean up
    setSocket(null);
  } else {
    console.log("No active socket to disconnect");
  }
};