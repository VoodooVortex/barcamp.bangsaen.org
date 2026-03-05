"use client";

import { createClient } from "@/lib/supabase/client";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutButtonProps extends ButtonProps {
  redirectTo?: string;
}

export function LogoutButton({
  redirectTo = "/auth/login",
  children,
  disabled,
  onClick,
  ...buttonProps
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    const supabase = createClient();
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push(redirectTo);
  };

  return (
    <Button onClick={logout} disabled={disabled || isLoading} {...buttonProps}>
      {children ?? "Logout"}
    </Button>
  );
}
