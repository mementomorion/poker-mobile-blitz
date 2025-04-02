
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

    socket.onclose = (event) => {
      console.log(`WebSocket connection closed with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
      
      // Interpret close codes
      let closeReason = "Unknown reason";
      switch (event.code) {
        case 1000:
          closeReason = "Normal closure";
          break;
        case 1001:
          closeReason = "Going away";
          break;
        case 1002:
          closeReason = "Protocol error";
          break;
        case 1003:
          closeReason = "Unsupported data";
          break;
        case 1005:
          closeReason = "No status received";
          break;
        case 1006:
          closeReason = "Abnormal closure";
          break;
        case 1007:
          closeReason = "Invalid frame payload data";
          break;
        case 1008:
          closeReason = "Policy violation";
          break;
        case 1009:
          closeReason = "Message too big";
          break;
        case 1010:
          closeReason = "Mandatory extension";
          break;
        case 1011:
          closeReason = "Internal server error";
          break;
        case 1015:
          closeReason = "TLS handshake";
          break;
      }
      console.log(`Close reason: ${closeReason}`);
      
      // Notify listeners about connection status
      notifyConnectionStatusListeners(false);
      
      // Attempt to reconnect if the closure wasn't intentional
      if (!getIsIntentionalClose()) {
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
      
      // Check if server is available at all
      fetch(window.location.origin + '/api/health')
        .then(response => {
          if (!response.ok) {
            console.error("API server is not responding correctly");
            toast.error("Server Error", {
              description: "The game server is not responding correctly. Please try again later."
            });
          }
        })
        .catch(error => {
          console.error("Failed to check API health:", error);
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

// Export all public methods and types
export {
  sendPlayerAction,
  addGameStateListener,
  addConnectionStatusListener,
  addErrorListener
};
