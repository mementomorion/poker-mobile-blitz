
// Authentication utility functions for the poker application

// Helper to check if user is logged in
export const isLoggedIn = (): boolean => {
  return localStorage.getItem("playerId") !== null;
};

// Helper to get current user info
export const getCurrentUser = (): { id: string; username: string } | null => {
  const id = localStorage.getItem("playerId");
  const username = localStorage.getItem("playerName");
  
  if (!id || !username) {
    return null;
  }
  
  return { id, username };
};

// Helper to logout user
export const logoutUser = () => {
  localStorage.removeItem("playerId");
  localStorage.removeItem("playerName");
};
