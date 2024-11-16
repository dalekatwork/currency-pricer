"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-background/80 backdrop-blur-sm border-t border-border p-4">
      <div className="container mx-auto flex items-center justify-center text-sm text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Info className="h-4 w-4" />
                Data Source Information
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Price data is simulated for demonstration purposes. In production, data would be fetched from CoinGecko API.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}