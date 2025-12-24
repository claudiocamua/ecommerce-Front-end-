"use client";

import { cn } from "../../../lib/utils";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ 
  label, 
  error, 
  icon, 
  className, 
  ...props 
}: InputProps) {

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex items-center gap-2 border rounded-md px-3 h-10 bg-background transition-all",
          "focus-within:ring-2 focus-within:ring-primary",
          error ? "border-destructive" : "border-input",
          className
        )}
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}

        <input
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          {...props}
        />
      </div>

      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}
