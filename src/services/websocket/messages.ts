
// WebSocket message handling
import { toast } from "sonner";
import { getSocket } from "./connection";
import { notifyGameStateListeners, notifyErrorListeners, notifyConnectionStatusListeners } from "./listeners";
import { resetReconnectAttempts } from "./connection";

// Send a message to the WebSocket server
export const sendMessage = (message: any): void => {
  const socket = getSocket();
  
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    toast.error("Connection Error", {
      description: "Not connected to the game server."
    });
    return;
  }

  try {
    socket.send(JSON.stringify(message));
  } catch (error) {
    console.error("Error sending message:", error);
    toast.error("Message Error", {
      description: "Failed to send your message to the server."
    });
  }
};

// Send a player action
export const sendPlayerAction = (action: string, amount?: number): void => {
  const playerId = localStorage.getItem("playerId");
  
  sendMessage({
    type: "action",
    action,
    playerId,
    ...(amount !== undefined && { amount }),
  });
};

// Handle an incoming message
export const handleMessage = (event: MessageEvent): void => {
  try {
    const message = JSON.parse(event.data);
    console.log('Message from server:', message);
    
    if (message.type === "game_state") {
      // Update game state listeners
      notifyGameStateListeners(message.state);
    } else if (message.type === "error") {
      // Handle error messages
      console.error("Server error:", message.message);
      notifyErrorListeners(message.message);
      toast.error("Game Error", {
        description: message.message
      });
    } else if (message.type === "join_success" || message.type === "connected") {
      // Reset reconnect attempts after successful join or connection
      resetReconnectAttempts();
      
      // Notify listeners that we're connected
      notifyConnectionStatusListeners(true);
      
      toast.success(message.type === "connected" ? "Connected to Game" : "Joined Game", {
        description: message.message || "Successfully connected to the game server."
      });
    }
  } catch (error) {
    console.error("Error parsing WebSocket message:", error);
  }
};
