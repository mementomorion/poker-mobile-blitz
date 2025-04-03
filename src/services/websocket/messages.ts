
// WebSocket message handling
import { toast } from "sonner";
import { getSocket } from "./connection";
import { notifyGameStateListeners, notifyErrorListeners, notifyConnectionStatusListeners } from "./listeners";
import { resetReconnectAttempts } from "./connection";
import { logDebug, logInfo, logWarn, logError, logSuccessWithToast, logErrorWithToast } from "./logging";

// Send a message to the WebSocket server
export const sendMessage = (message: any): void => {
  const socket = getSocket();
  
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    logErrorWithToast(
      "Messages", 
      "Connection Error", 
      "Not connected to the game server."
    );
    return;
  }
  
  try {
    logDebug("Messages", "Sending message to server:", message);
    socket.send(JSON.stringify(message));
  } catch (error) {
    logError("Messages", "Error sending message:", error);
    logErrorWithToast(
      "Messages", 
      "Message Error", 
      "Failed to send your message to the server."
    );
  }
};

// Send a player action
export const sendPlayerAction = (action: string, amount?: number): void => {
  const playerId = localStorage.getItem("playerId");
  
  const actionMessage = {
    type: "action",
    action,
    playerId,
    ...(amount !== undefined && { amount }),
  };
  
  logInfo("Messages", `Player ${playerId} sending action: ${action}${amount !== undefined ? ` with amount ${amount}` : ''}`);
  sendMessage(actionMessage);
};

// Handle an incoming message
export const handleMessage = (event: MessageEvent): void => {
  try {
    const message = JSON.parse(event.data);
    logDebug('Messages', 'Message from server:', message);
    
    if (message.type === "game_state") {
      // Update game state listeners
      logDebug("Messages", "Received game state update");
      notifyGameStateListeners(message.state);
    } else if (message.type === "error") {
      // Handle error messages
      logError("Messages", "Server error:", message.message);
      notifyErrorListeners(message.message);
      logErrorWithToast(
        "Messages",
        "Game Error",
        message.message
      );
    } else if (message.type === "join_success" || message.type === "connected") {
      // Reset reconnect attempts after successful join or connection
      resetReconnectAttempts();
      
      // Notify listeners that we're connected
      notifyConnectionStatusListeners(true);
      
      // Отображаем сообщение об успешном подключении
      logInfo("Messages", message.message || "Welcome to the game!");
      
      logSuccessWithToast(
        "Messages",
        message.type === "connected" ? "Connected to Game" : "Joined Game",
        message.message || "Successfully connected to the game server."
      );
    }
  } catch (error) {
    logError("Messages", "Error parsing WebSocket message:", error);
  }
};
