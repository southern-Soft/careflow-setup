"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Don't log errors to console in production
  if (process.env.NODE_ENV === "development") {
    console.error("Global Error:", error);
  }

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">System Error</h2>
                <p className="text-muted-foreground">
                  We&apos;re experiencing technical difficulties. Our team has been notified.
                  Please try again in a few moments.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-4">
                <Button onClick={() => reset()} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/login">
                    <Home className="mr-2 h-4 w-4" />
                    Return to Login
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Error Reference: {error.digest || "N/A"}
              </p>
            </div>
          </Card>
        </div>
      </body>
    </html>
  );
}

