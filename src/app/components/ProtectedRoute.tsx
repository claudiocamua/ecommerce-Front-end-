"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    if (requireAdmin && !user?.is_admin) {
      router.push("/dashboard");
      return;
    }
  }, [token, user, requireAdmin, router]);

  if (!token) return null;
  if (requireAdmin && !user?.is_admin) return null;

  return <>{children}</>;
}