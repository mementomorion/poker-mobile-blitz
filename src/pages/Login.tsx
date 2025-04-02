
import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import { isLoggedIn } from "@/services/api";

const Login: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to lobby
    if (isLoggedIn()) {
      navigate("/lobby");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-poker-dark to-black">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-4xl font-bold text-poker-gold mb-2">
          Poker Mobile Blitz
        </h1>
        <p className="text-white/80">
          Enter your username to join the action
        </p>
      </div>
      
      <div className="w-full max-w-md">
        <div className="bg-black/30 border border-poker-accent/30 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Login
          </h2>
          <LoginForm />
        </div>
      </div>
      
      <div className="mt-8 text-white/60 text-sm text-center">
        <p>No registration required. Just enter a username to play!</p>
      </div>
    </div>
  );
};

export default Login;
