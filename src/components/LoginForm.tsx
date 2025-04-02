
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { loginUser } from "@/services/api";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to login.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await loginUser(username);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
      });
      navigate("/lobby");
    } catch (error) {
      // Error is already handled in the loginUser function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-black/20 border-poker-accent text-white placeholder:text-gray-400"
            autoComplete="username"
            required
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-poker-accent hover:bg-poker-accent/80 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Enter Game"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
