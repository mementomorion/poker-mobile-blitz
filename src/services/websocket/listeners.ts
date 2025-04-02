
// WebSocket event listeners management
import { GameState } from "../types";

// Event listeners
let gameStateListeners: Array<(state: GameState) => void> = [];
let connectionStatusListeners: Array<(connected: boolean) => void> = [];
let errorListeners: Array<(message: string) => void> = [];

// Game state listeners
export const addGameStateListener = (listener: (state: GameState) => void) => {
  gameStateListeners.push(listener);
  return () => {
    gameStateListeners = gameStateListeners.filter(l => l !== listener);
  };
};

export const notifyGameStateListeners = (state: GameState): void => {
  gameStateListeners.forEach(listener => listener(state));
};

// Connection status listeners
export const addConnectionStatusListener = (listener: (connected: boolean) => void) => {
  connectionStatusListeners.push(listener);
  return () => {
    connectionStatusListeners = connectionStatusListeners.filter(l => l !== listener);
  };
};

export const notifyConnectionStatusListeners = (connected: boolean): void => {
  connectionStatusListeners.forEach(listener => listener(connected));
};

// Error listeners
export const addErrorListener = (listener: (message: string) => void) => {
  errorListeners.push(listener);
  return () => {
    errorListeners = errorListeners.filter(l => l !== listener);
  };
};

export const notifyErrorListeners = (message: string): void => {
  errorListeners.forEach(listener => listener(message));
};
