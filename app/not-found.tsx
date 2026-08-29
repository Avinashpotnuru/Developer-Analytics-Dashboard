import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <p className="font-heading text-6xl font-semibold tracking-tight text-gradient">
            404
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground">
            The page you’re looking for doesn’t exist or may have been moved.
          </p>
        </div>
        <Link href="/dashboard" className={cn(buttonVariants())}>
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
