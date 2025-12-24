"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  isExpanded?: boolean;
}

export function LogoutButton({ isExpanded = true }: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      id="logout-button"
      className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
      onClick={logout}
      size={isExpanded ? "default" : "icon"}
      title={!isExpanded ? "Cerrar Sesión" : undefined}
    >
      {isExpanded ? (
        "Cerrar Sesión"
      ) : (
        <LogOut size={20} />
      )}
    </Button>
  );
}
