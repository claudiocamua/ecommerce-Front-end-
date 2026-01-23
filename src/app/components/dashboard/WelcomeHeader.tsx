"use client";

interface WelcomeHeaderProps {
  userName: string;
}

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const firstName = userName.split(' ')[0];
  
  return (
    <div className="bg-gradient-to-r from-primario to-primario-dark rounded-2xl shadow-xl p-8 mb-8 text-white">
      <h1 className="text-2xl md:text-3xl font-bold">
        Olá, {firstName}!
      </h1>
    </div>
  );
}