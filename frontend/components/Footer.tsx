"use client";

import { useEffect, useState } from "react";

interface CoinGeckoStatus {
  status: {
    description: string;
    status_code: number;
    error_code: number;
    error_message: string | null;
  };
}

export function Footer() {
  const [apiStatus, setApiStatus] = useState<CoinGeckoStatus | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/ping");
        const data = await response.json();
        setApiStatus(data);
        setLastChecked(new Date());
      } catch (error) {
        console.error("Failed to fetch CoinGecko status:", error);
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border py-2 px-4 z-50">
      <div className="container mx-auto flex items-center justify-end text-sm text-muted-foreground gap-2">
        <span>Source: </span>
        <a
          href="https://www.coingecko.com/api"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          CoinGecko API
          {apiStatus?.status?.error_message ? (
            <span className="w-2 h-2 rounded-full bg-destructive" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-success" />
          )}
        </a>
      </div>
    </footer>
  );
}
