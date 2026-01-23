"use client";

interface WelcomeHeaderProps {
  userName: string;
}

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primario to-primario-dark rounded-2xl shadow-xl p-8 mb-8 text-">
      <h1 className="text-1xl md:text-1xl font-bold mb-2">
        Olá, {userName}! 
      </h1>
    </div>
  );
}