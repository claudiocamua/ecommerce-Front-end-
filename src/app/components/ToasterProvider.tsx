"use client";

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f2937', // gray-800
          color: '#fff',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        success: {
          iconTheme: {
            primary: '#10b981', // green-500
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444', // red-500
            secondary: '#fff',
          },
        },
      }}
    />
  );
}