
// WebSocket event handlers (onopen, onmessage, onclose, onerror)
import { toast } from "sonner";
import {
  getIsIntentionalClose,
  incrementReconnectAttempts,
  scheduleReconnect,
  handleConnectionError,
  checkServerHealth,
  getSocket,
} from "./connection";
import {
  notifyConnectionStatusListeners,
  notifyErrorListeners,
} from "./listeners";
import { handleMessage, sendMessage } from "./messages";

// Setup event handlers for the WebSocket connection
export const setupSocketEventHandlers = (
  socket: WebSocket,
  roomId: string,
  playerId: string,
  username: string
) => {
  // Handle socket open event
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
        
        // Note: We'll wait for the server to confirm connection
        // rather than setting connected status here
      } catch (error) {
        console.error("Error sending join message:", error);
        notifyErrorListeners("Failed to join the game room");
      }
    }
  };

  // Handle incoming messages
  socket.onmessage = (event) => {
    console.log("Received message from server:", event.data);
    handleMessage(event);
  };

  // Handle socket close event
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
            description: "The game server appears to be down. Please try again later.",
          });
          return; // Don't attempt to reconnect if server is down
        }
      }

      incrementReconnectAttempts();
      scheduleReconnect(roomId, () => {
        const currentSocket = getSocket();
        if (
          !currentSocket ||
          currentSocket.readyState === WebSocket.CLOSED ||
          currentSocket.readyState === WebSocket.CLOSING
        ) {
          console.log("Socket is closed or closing, reconnecting...");
          // We need to import this dynamically to avoid circular dependencies
          import('./operations').then(({ connectToRoom }) => {
            connectToRoom(roomId);
          });
        } else {
          console.log(`Socket is in state: ${currentSocket.readyState}, not reconnecting`);
        }
      });
    } else {
      console.log("Intentional close, not reconnecting");
    }
  };

  // Handle socket error event
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    // Additional error information if available
    if (error instanceof ErrorEvent) {
      console.error("Error message:", error.message);
    }
    notifyErrorListeners("Error connecting to the game server");

    // We'll check server health here but won't toast, as onclose will be called next
    checkServerHealth().then((isHealthy) => {
      if (!isHealthy) {
        console.error("Server health check failed after WebSocket error");
      }
    });
  };
};
