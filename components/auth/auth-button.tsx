"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogIn, UserPlus } from "lucide-react";

interface AuthButtonProps {
  isExpanded?: boolean;
}

export function AuthButton({ isExpanded = true }: AuthButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return <div className="h-9 w-32 animate-pulse bg-muted rounded" />;
  }

  return user ? (
    <div className="flex items-center w-full flex-col">
      <LogoutButton isExpanded={isExpanded} />
    </div>
  ) : (
    <div className={`flex ${isExpanded ? 'gap-2' : 'flex-col gap-2'}`}>
      <Button
        asChild
        size={isExpanded ? "sm" : "icon"}
        variant={"outline"}
        className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-white"
        title={!isExpanded ? "Iniciar Sesión" : undefined}
      >
        <Link href="/auth/login">
          {isExpanded ? "Iniciar Sesión" : <LogIn size={20} />}
        </Link>
      </Button>
      <Button
        asChild
        size={isExpanded ? "sm" : "icon"}
        className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
        title={!isExpanded ? "Registrarse" : undefined}
      >
        <Link href="/auth/sign-up">
          {isExpanded ? "Registrarse" : <UserPlus size={20} />}
        </Link>
      </Button>
    </div>
  );
}
