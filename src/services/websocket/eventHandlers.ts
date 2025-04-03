
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
import { logDebug, logInfo, logWarn, logError } from "./logging";

// Setup event handlers for the WebSocket connection
export const setupSocketEventHandlers = (
  socket: WebSocket,
  roomId: string,
  playerId: string,
  username: string
) => {
  // Handle socket open event
  socket.onopen = () => {
    logInfo("EventHandlers", "WebSocket connection established successfully");

    // Send join message
    if (socket.readyState === WebSocket.OPEN) {
      try {
        const joinMessage = {
          type: "join",
          playerId,
          username,
        };
        logInfo("EventHandlers", "Sending join message:", joinMessage);
        sendMessage(joinMessage);
        
        // Note: We'll wait for the server to confirm connection
        // rather than setting connected status here
      } catch (error) {
        logError("EventHandlers", "Error sending join message:", error);
        notifyErrorListeners("Failed to join the game room");
      }
    }
  };

  // Handle incoming messages
  socket.onmessage = (event) => {
    logDebug("EventHandlers", "Received message from server:", event.data);
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
          logWarn("EventHandlers", "Server unavailable, not attempting to reconnect");
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
          logInfo("EventHandlers", "Socket is closed or closing, reconnecting...");
          // We need to import this dynamically to avoid circular dependencies
          import('./operations').then(({ connectToRoom }) => {
            connectToRoom(roomId);
          });
        } else {
          logDebug("EventHandlers", `Socket is in state: ${currentSocket.readyState}, not reconnecting`);
        }
      });
    } else {
      logInfo("EventHandlers", "Intentional close, not reconnecting");
    }
  };

  // Handle socket error event
  socket.onerror = (error) => {
    logError("EventHandlers", "WebSocket error:", error);
    // Additional error information if available
    if (error instanceof ErrorEvent) {
      logError("EventHandlers", "Error message:", error.message);
    }
    notifyErrorListeners("Error connecting to the game server");

    // We'll check server health here but won't toast, as onclose will be called next
    checkServerHealth().then((isHealthy) => {
      if (!isHealthy) {
        logError("EventHandlers", "Server health check failed after WebSocket error");
      }
    });
  };
};
