
// HTTP request functions for the poker application
import { toast } from "@/components/ui/use-toast";
import { Player, Room } from "./types";

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
      throw new Error("Login failed");
    }

    const data = await response.json();
    // Save the player ID to localStorage for future requests
    localStorage.setItem("playerId", data.id);
    localStorage.setItem("playerName", data.username);
    return data;
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

    // Send the playerId in the Authorization header
    // The backend extracts it from req.user.playerId
    const response = await fetch(`${API_URL}/rooms`, {
      headers: {
        "Authorization": `Bearer ${playerId}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Room fetch error:", errorData);
      
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
      
      throw new Error(errorData.error || "Failed to fetch rooms");
    }

    return await response.json();
  } catch (error) {
    console.error("Get rooms error:", error);
    throw error;
  }
};
