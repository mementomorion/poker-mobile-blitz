
// HTTP request functions for the poker application
import { toast } from "@/components/ui/use-toast";
import { Player, Room } from "./types";

// Set API URL back to localhost without the /api prefix
const API_URL = "http://localhost:3000";

export const loginUser = async (username: string): Promise<Player> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login response:", errorText);
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    // Try to parse response as JSON
    try {
      const data = await response.json();
      // Save the player ID to localStorage for future requests
      localStorage.setItem("playerId", data.id);
      localStorage.setItem("playerName", data.username);
      return data;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Login error:", error);
    toast({
      title: "Login Failed",
      description: "Unable to login. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const getRooms = async (): Promise<Room[]> => {
  try {
    const playerId = localStorage.getItem("playerId");
    if (!playerId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view available rooms.",
        variant: "destructive",
      });
      throw new Error("Not logged in");
    }

    // Add cache-busting parameter to prevent browser caching
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_URL}/rooms?playerId=${playerId}&_t=${timestamp}`);

    if (!response.ok) {
      // Try to parse error response as JSON, but fall back to text if it fails
      let errorMessage = "Failed to fetch rooms";
      try {
        const errorData = await response.json();
        console.error("Room fetch error:", errorData);
        errorMessage = errorData.error || errorMessage;
        
        // Handle user authentication errors specifically
        if (errorData.error === "User not found") {
          toast({
            title: "Authentication Failed",
            description: "Your login session may have expired. Please log in again.",
            variant: "destructive",
          });
          // Clear invalid credentials from localStorage
          localStorage.removeItem("playerId");
          localStorage.removeItem("playerName");
        } else {
          toast({
            title: "Failed to Load Rooms",
            description: errorData.error || "Unable to fetch available rooms. Please try again.",
            variant: "destructive",
          });
        }
      } catch (parseError) {
        // If we can't parse as JSON, get the response as text
        const errorText = await response.text();
        console.error("Failed to parse error response:", errorText);
        toast({
          title: "Failed to Load Rooms",
          description: "Unable to fetch available rooms. Please try again.",
          variant: "destructive",
        });
      }
      
      throw new Error(errorMessage);
    }

    // Try to parse room data
    try {
      const data = await response.json();
      console.log("Fetched rooms data:", data);
      // Map the snake_case API response to camelCase properties expected by our Room interface
      return data.map((room: any) => ({
        id: room.id,
        name: room.name,
        playerCount: room.player_count,
        maxPlayers: room.max_players,
        smallBlind: room.small_blind,
        bigBlind: room.big_blind,
        status: room.status
      }));
    } catch (parseError) {
      console.error("Failed to parse room data:", parseError);
      toast({
        title: "Data Error",
        description: "Invalid data format received from server.",
        variant: "destructive",
      });
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Get rooms error:", error);
    throw error;
  }
};
