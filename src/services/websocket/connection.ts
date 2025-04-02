
// WebSocket connection management
import { toast } from "sonner";

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let isIntentionalClose = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Function to get WebSocket URL based on current environment
export const getWebSocketUrl = (roomId: string): string => {
  // Use secure WebSockets when on HTTPS
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // Always use localhost:3000 in development mode
  const host = import.meta.env.DEV ? 'localhost:3000' : window.location.host;
  
  return `${protocol}//${host}/game/${roomId}`;
};

// Create and return a new WebSocket connection
export const createWebSocketConnection = (url: string): WebSocket => {
  console.log(`Connecting to WebSocket at: ${url}`);
  return new WebSocket(url);
};

// Clear any active reconnect timers
export const clearReconnectTimer = (): void => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
};

// Get the current socket instance
export const getSocket = (): WebSocket | null => socket;

// Set the socket instance
export const setSocket = (newSocket: WebSocket | null): void => {
  socket = newSocket;
};

// Get/set intentional close flag
export const getIsIntentionalClose = (): boolean => isIntentionalClose;
export const setIsIntentionalClose = (value: boolean): void => {
  isIntentionalClose = value;
};

// Get/set/reset reconnect attempts
export const getReconnectAttempts = (): number => reconnectAttempts;
export const incrementReconnectAttempts = (): number => ++reconnectAttempts;
export const resetReconnectAttempts = (): void => {
  reconnectAttempts = 0;
};

// Schedule a reconnection attempt
export const scheduleReconnect = (roomId: string, callback: () => void): void => {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    const reconnectDelay = Math.min(3000 * reconnectAttempts, 15000); // Exponential backoff with max of 15 seconds
    
    toast.error("Connection Lost", {
      description: `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
    });
    
    // Try to reconnect after a delay
    reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      callback();
    }, reconnectDelay);
  } else {
    toast.error("Connection Failed", {
      description: "Maximum reconnection attempts reached. Please try again later."
    });
  }
};
