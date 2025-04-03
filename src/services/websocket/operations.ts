
// Core WebSocket operations for connecting and disconnecting
import { toast } from "sonner";
import {
  getWebSocketUrl,
  createWebSocketConnection,
  clearReconnectTimer,
  getSocket,
  setSocket,
  getIsIntentionalClose,
  setIsIntentionalClose,
  resetReconnectAttempts,
} from "./connection";
import {
  notifyConnectionStatusListeners,
  notifyErrorListeners,
} from "./listeners";
import { handleMessage, sendMessage } from "./messages";
import { setupSocketEventHandlers } from "./eventHandlers";

// Connect to a game room
export const connectToRoom = (roomId: string) => {
  const playerId = localStorage.getItem("playerId");
  const username = localStorage.getItem("playerName");

  if (!playerId || !username) {
    toast.error("Authentication Error", {
      description: "You must be logged in to join a room.",
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

    if (
      existingSocket.readyState === WebSocket.OPEN ||
      existingSocket.readyState === WebSocket.CONNECTING
    ) {
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
    
    // Setup socket event handlers (onopen, onmessage, onclose, onerror)
    setupSocketEventHandlers(socket, roomId, playerId, username);
    
  } catch (error) {
    console.error("Error creating WebSocket connection:", error);
    notifyErrorListeners("Failed to create WebSocket connection");
    toast.error("Connection Error", {
      description: "Failed to create WebSocket connection. Please check if the server is running.",
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
