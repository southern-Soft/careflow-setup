"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
                <h2 className="text-2xl font-bold">Application Error</h2>
                <p className="text-muted-foreground">
                  An unexpected error occurred. Please refresh the page or contact support if the problem persists.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-4">
                <Button onClick={() => reset()} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Application
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </body>
    </html>
  );
}

