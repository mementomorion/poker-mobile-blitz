
// WebSocket event listeners management
import { GameState } from "../types";
import { logDebug, logInfo } from "./logging";

// Event listeners
let gameStateListeners: Array<(state: GameState) => void> = [];
let connectionStatusListeners: Array<(connected: boolean) => void> = [];
let errorListeners: Array<(message: string) => void> = [];

// Game state listeners
export const addGameStateListener = (listener: (state: GameState) => void) => {
  gameStateListeners.push(listener);
  logDebug("Listeners", "Added game state listener, count:", gameStateListeners.length);
  return () => {
    gameStateListeners = gameStateListeners.filter(l => l !== listener);
    logDebug("Listeners", "Removed game state listener, count:", gameStateListeners.length);
  };
};

export const notifyGameStateListeners = (state: GameState): void => {
  logDebug("Listeners", "Notifying game state listeners, count:", gameStateListeners.length);
  gameStateListeners.forEach(listener => listener(state));
};

// Connection status listeners
export const addConnectionStatusListener = (listener: (connected: boolean) => void) => {
  connectionStatusListeners.push(listener);
  logDebug("Listeners", "Added connection status listener, count:", connectionStatusListeners.length);
  return () => {
    connectionStatusListeners = connectionStatusListeners.filter(l => l !== listener);
    logDebug("Listeners", "Removed connection status listener, count:", connectionStatusListeners.length);
  };
};

export const notifyConnectionStatusListeners = (connected: boolean): void => {
  logInfo("Listeners", `Notifying connection status listeners with state: ${connected ? 'connected' : 'disconnected'}`);
  connectionStatusListeners.forEach(listener => listener(connected));
};

// Error listeners
export const addErrorListener = (listener: (message: string) => void) => {
  errorListeners.push(listener);
  logDebug("Listeners", "Added error listener, count:", errorListeners.length);
  return () => {
    errorListeners = errorListeners.filter(l => l !== listener);
    logDebug("Listeners", "Removed error listener, count:", errorListeners.length);
  };
};

export const notifyErrorListeners = (message: string): void => {
  logInfo("Listeners", "Notifying error listeners with message:", message);
  errorListeners.forEach(listener => listener(message));
};
