"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";

import { getAuthErrorMessage } from "@/lib/auth/messages";
import { Button } from "@/components/ui/button";

export function AuthErrorBanner() {
  const [code, setCode] = React.useState<string | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(params.get("auth_error"));
  }, []);

  const message = getAuthErrorMessage(code);
  if (!message || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("auth_error");
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p className="flex-1">{message}</p>
      <Button
        variant="ghost"
        size="xs"
        onClick={dismiss}
        aria-label="Dismiss message"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
