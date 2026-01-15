"use client";

import { ReactNode } from "react";
import { useBackground } from "@/app/hooks/useBackground";

interface BackgroundWrapperProps {
  pageName: string;
  children: ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
}

export default function BackgroundWrapper({
  pageName,
  children,
  overlay = true,
  overlayOpacity = 40,
}: BackgroundWrapperProps) {
  const { backgroundUrl, loading } = useBackground(pageName);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
      }}
    >
      {overlay && (
        <div
          className="min-h-screen backdrop-blur-sm"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})`,
          }}
        >
          {children}
        </div>
      )}
      {!overlay && children}
    </div>
  );
}