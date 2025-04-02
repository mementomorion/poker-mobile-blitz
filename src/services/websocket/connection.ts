
// WebSocket connection management
import { toast } from "sonner";

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let isIntentionalClose = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Function to get WebSocket URL based on current environment
export const getWebSocketUrl = (roomId: string): string => {
  const isSecure = window.location.protocol === 'https:';
  
  // For development (when running on localhost or in Lovable preview)
  if (window.location.hostname.includes('lovableproject.com') || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    // Always use ws:// for localhost regardless of current page protocol
    // This is because many development setups don't have SSL for the WebSocket server
    return `ws://localhost:3000/game/${roomId}`;
  }
  
  // For production, derive the WebSocket URL from the current protocol and host
  const protocol = isSecure ? 'wss:' : 'ws:';
  const host = window.location.host;
  
  const url = `${protocol}//${host}/game/${roomId}`;
  console.log(`Generated WebSocket URL: ${url} (isSecure: ${isSecure})`);
  return url;
};

// Create and return a new WebSocket connection
export const createWebSocketConnection = (url: string): WebSocket => {
  console.log(`Creating WebSocket connection to: ${url}`);
  
  try {
    // Create the WebSocket
    const ws = new WebSocket(url);
    
    // Log initial state
    console.log(`WebSocket initial state: ${ws.readyState}`);
    
    return ws;
  } catch (error) {
    console.error("Error creating WebSocket:", error);
    throw error;
  }
};

// Clear any active reconnect timers
export const clearReconnectTimer = (): void => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
    console.log("Cleared reconnect timer");
  }
};

// Get the current socket instance
export const getSocket = (): WebSocket | null => socket;

// Set the socket instance
export const setSocket = (newSocket: WebSocket | null): void => {
  const oldState = socket ? socket.readyState : 'null';
  const newState = newSocket ? newSocket.readyState : 'null';
  console.log(`Updating socket: ${oldState} -> ${newState}`);
  socket = newSocket;
};

// Get/set intentional close flag
export const getIsIntentionalClose = (): boolean => isIntentionalClose;
export const setIsIntentionalClose = (value: boolean): void => {
  console.log(`Setting intentional close: ${value}`);
  isIntentionalClose = value;
};

// Get/set/reset reconnect attempts
export const getReconnectAttempts = (): number => reconnectAttempts;
export const incrementReconnectAttempts = (): number => {
  reconnectAttempts++;
  console.log(`Incremented reconnect attempts to: ${reconnectAttempts}`);
  return reconnectAttempts;
};
export const resetReconnectAttempts = (): void => {
  reconnectAttempts = 0;
  console.log("Reset reconnect attempts to 0");
};

// Handle connection errors appropriately based on error code
export const handleConnectionError = (code: number, reason: string): string => {
  let errorMessage = "Unknown connection error";
  
  switch (code) {
    case 1000:
      errorMessage = "Normal closure";
      break;
    case 1001:
      errorMessage = "Server going away";
      break;
    case 1002:
      errorMessage = "Protocol error";
      break;
    case 1003:
      errorMessage = "Unsupported data";
      break;
    case 1005:
      errorMessage = "No status received - This usually occurs when the server doesn't respond";
      break;
    case 1006:
      errorMessage = "Abnormal closure - Connection was dropped";
      break;
    case 1007:
      errorMessage = "Invalid frame payload data";
      break;
    case 1008:
      errorMessage = "Policy violation";
      break;
    case 1009:
      errorMessage = "Message too big";
      break;
    case 1010:
      errorMessage = "Missing extension";
      break;
    case 1011:
      errorMessage = "Internal server error";
      break;
    case 1015:
      errorMessage = "TLS handshake failed";
      break;
    default:
      errorMessage = `Connection closed with code: ${code}`;
  }
  
  console.error(`WebSocket closed: ${errorMessage} ${reason ? '- ' + reason : ''}`);
  return errorMessage;
};

// Schedule a reconnection attempt
export const scheduleReconnect = (roomId: string, callback: () => void): void => {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    const reconnectDelay = Math.min(3000 * Math.pow(1.5, reconnectAttempts), 15000); // Exponential backoff with max of 15 seconds
    
    toast.error("Connection Lost", {
      description: `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
    });
    
    console.log(`Scheduling reconnect in ${reconnectDelay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    
    // Try to reconnect after a delay
    reconnectTimeout = setTimeout(() => {
      console.log(`Executing reconnect callback (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      callback();
    }, reconnectDelay);
  } else {
    console.error("Maximum reconnection attempts reached");
    toast.error("Connection Failed", {
      description: "Maximum reconnection attempts reached. Please try again later or check if the server is running."
    });
  }
};

// Check server health using fetch API
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    console.log("Checking server health...");
    const response = await fetch(window.location.origin + '/api/health', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    const isHealthy = response.ok;
    console.log(`Server health check result: ${isHealthy ? 'healthy' : 'unhealthy'}`);
    return isHealthy;
  } catch (error) {
    console.error("Server health check failed:", error);
    return false;
  }
};
